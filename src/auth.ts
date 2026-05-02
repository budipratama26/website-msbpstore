import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { setGlobalDispatcher, Agent } from "undici";
import { logActivity } from "@/lib/activity";
import redis from "@/lib/redis";

// FIX OAUTH DELAY: Force Next.js Undici fetch to timeout fast on broken IPv6 routes
// 5s is enough for normal APIs (Pakasir, etc) but still bypasses 30s IPv6 blackhole on VPS
setGlobalDispatcher(new Agent({ connect: { timeout: 5000 } }));

export const { handlers, auth, signIn, signOut } = NextAuth({
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
            authorization: {
                params: {
                    response_type: "code",
                    redirect_uri: `${process.env.AUTH_URL || process.env.NEXTAUTH_URL}/api/auth/callback/google`
                }
            }
        }),
        Credentials({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    console.log("Auth: Missing credentials");
                    return null;
                }

                if (typeof credentials.password !== "string" || credentials.password.length > 100) {
                    console.log("Auth Failed: Invalid password format or excessively long string");
                    return null;
                }

                try {
                    const email = (credentials.email as string).toLowerCase().trim();
                    console.log(`Auth Attempt: ${email}`);

                    // 🛡️ SECURITY: Brute Force Protection (Account Lockout)
                    const failedKey = `login_fail:${email}`;
                    const failedCount = await redis.get(failedKey);
                    
                    if (failedCount && parseInt(failedCount) >= 5) {
                        console.warn(`[AUTH BRUTE FORCE] Blocked login attempts for ${email}`);
                        // Returning null will generic "AccessDenied", throwing an error will pass the message
                        throw new Error("Akun dikunci sementara karena terlalu banyak percobaan gagal. Tunggu 10 menit.");
                    }

                    const user = await prisma.user.findUnique({
                        where: { email },
                    });

                    if (!user) {
                        console.log(`Auth Failed: User not found for ${email}`);
                        return null;
                    }

                    if (!user.password) {
                        console.log(`Auth Failed: No password set for ${email} (Possible OAuth account)`);
                        throw new Error("OAuthOnly");
                    }

                    const isPasswordCorrect = await bcrypt.compare(
                        credentials.password as string,
                        user.password
                    );

                    if (!isPasswordCorrect) {
                        console.log(`Auth Failed: Password mismatch for ${email}`);
                        // Increment failed login attempt
                        await redis.incr(failedKey);
                        await redis.expire(failedKey, 600); // 10 mins penalty
                        return null;
                    }

                    // Reset failed counter on successful login
                    await redis.del(failedKey);

                    console.log(`Auth Success: ${email} (Role: ${user.role})`);
                    
                    // Log credentials login
                    logActivity("LOGIN", "Login via Password", user.id.toString());
                    
                    return {
                        id: user.id.toString(),
                        name: user.name,
                        email: user.email,
                        role: user.role,
                    };
                } catch (error) {
                    console.error("Auth System Error:", error);
                    return null;
                }
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user, account, trigger, session }) {
            // Handle profile updates from client side
            if (trigger === "update") {
                if (session?.name) token.name = session.name;
                if (session?.hasPassword !== undefined) token.hasPassword = session.hasPassword;
            }

            // Initial sign in logic
            if (user) {
                try {
                    const email = (user.email as string).toLowerCase().trim();
                    let dbUser = await prisma.user.findUnique({
                        where: { email }
                    });

                    if (account?.provider === "google") {
                        if (!dbUser && user.email) {
                            // ══════════════════════════════════════════════════════
                            // NEW USER: First time Google sign-in — create account
                            // ══════════════════════════════════════════════════════
                            dbUser = await prisma.user.create({
                                data: {
                                    email: email,
                                    name: user.name || "User",
                                    password: "", // Empty password for OAuth-only accounts
                                    role: "customer",
                                    email_verified_at: new Date(),
                                    google_id: account.providerAccountId, // Link Google ID immediately
                                }
                            });
                            console.log(`[OAuth] New user created via Google: ${email} (ID: ${dbUser.id})`);
                        } else if (dbUser) {
                            // ══════════════════════════════════════════════════════
                            // EXISTING USER: Google sign-in for already-registered email
                            // This covers BOTH scenarios:
                            //   - User clicks "Daftar dengan Google" but email already exists
                            //   - User clicks "Lanjutkan dengan Google" on login page
                            // SAFE: We DO NOT reset any data. Only update verification + link Google ID.
                            // Points, orders, name — ALL PRESERVED.
                            // ══════════════════════════════════════════════════════
                            const updates: Record<string, any> = {};

                            // Link Google ID if not yet linked
                            if (!dbUser.google_id) {
                                updates.google_id = account.providerAccountId;
                                console.log(`[OAuth] Linked Google ID to existing account: ${email} (ID: ${dbUser.id})`);
                            }

                            // Mark email as verified if not yet
                            if (!dbUser.email_verified_at) {
                                updates.email_verified_at = new Date();
                                console.log(`[OAuth] Verified email for existing account: ${email}`);
                            }

                            // Security check: if google_id exists but doesn't match, log warning
                            if (dbUser.google_id && dbUser.google_id !== account.providerAccountId) {
                                console.warn(`[OAuth SECURITY] Google ID mismatch for ${email}: DB=${dbUser.google_id}, OAuth=${account.providerAccountId}`);
                                // Still allow login — google_id might have been set by a different Google account
                                // The email is the authoritative identifier via Google OAuth
                            }

                            if (Object.keys(updates).length > 0) {
                                await prisma.user.update({
                                    where: { id: dbUser.id },
                                    data: updates
                                });
                            }

                            console.log(`[OAuth] Existing user logged in via Google: ${email} (ID: ${dbUser.id}, Points: ${(dbUser as any).points ?? "N/A"})`);
                        }
                        
                        // Log activity (only happens on initial sign-in when account is present)
                        if (dbUser) {
                            logActivity("OAUTH_LOGIN", "Login via Google", dbUser.id.toString());
                        }
                    } else if (!dbUser && user.email) {
                        // Credentials provider — user should already exist (created via register flow)
                        // This is a fallback that shouldn't normally trigger
                        console.warn(`[Auth] Credentials login for non-existent user: ${email}`);
                    }

                    if (dbUser) {
                        token.role = dbUser.role;
                        token.id = dbUser.id.toString();
                        token.hasPassword = !!dbUser.password;
                        token.isGoogle = account?.provider === "google";
                        token.name = dbUser.name; // Ensure DB name overrides Google OAuth name
                    }
                } catch (error) {
                    console.error("JWT Callback DB Error:", error);
                }
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                (session.user as any).role = token.role;
                (session.user as any).id = token.id;
                (session.user as any).hasPassword = token.hasPassword;
                (session.user as any).isGoogle = token.isGoogle;
                session.user.name = token.name as string;
            }
            return session;
        },
        async redirect({ url, baseUrl }) {
            // Allows relative callback URLs
            if (url.startsWith("/")) {
                return `${baseUrl}${url}`;
            }
            // Allows callback URLs on the same origin
            else if (new URL(url).origin === baseUrl) {
                return url;
            }
            return baseUrl;
        },
    },
    pages: {
        signIn: "/login",
    },
    theme: {
        colorScheme: "light",
    },
    session: {
        strategy: "jwt",
        maxAge: 2 * 60 * 60,   // 2 Hours session validity (Strict)
        updateAge: 15 * 60,    // Refresh session every 15 minutes if active
    },
    cookies: {
        sessionToken: {
            name: process.env.NODE_ENV === 'production' ? '__Secure-next-auth.session-token' : 'next-auth.session-token',
            options: {
                httpOnly: true,
                sameSite: 'lax',
                path: '/',
                secure: true,
            }
        }
    },
    secret: process.env.NEXTAUTH_SECRET,
    trustHost: true,
});
