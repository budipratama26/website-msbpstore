import crypto from 'crypto';

const SECRET = process.env.NEXTAUTH_SECRET;

if (!SECRET) {
    console.warn("WARNING: NEXTAUTH_SECRET is not set in environment variables.");
}
export function signPendingToken(payload: any) {
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
    // Add expiration to payload (15 minutes)
    const bodyPayload = {
        ...payload,
        exp: Math.floor(Date.now() / 1000) + (15 * 60)
    };
    const body = Buffer.from(JSON.stringify(bodyPayload)).toString('base64url');
    if (!SECRET) throw new Error("Missing SECRET for token generation");
    const signature = crypto.createHmac('sha256', SECRET).update(`${header}.${body}`).digest('base64url');
    return `${header}.${body}.${signature}`;
}

export function verifyPendingToken(token: string) {
    try {
        const [header, body, signature] = token.split('.');
        if (!header || !body || !signature) return null;

        if (!SECRET) {
            console.error("Token verification failed: Missing SECRET");
            return null;
        }
        const expectedSignature = crypto.createHmac('sha256', SECRET).update(`${header}.${body}`).digest('base64url');

        if (signature !== expectedSignature) {
            console.error("Token verification failed: Signature mismatch");
            return null;
        }

        const decodedBody = JSON.parse(Buffer.from(body, 'base64url').toString());

        // Check expiration
        if (decodedBody.exp && Date.now() / 1000 > decodedBody.exp) {
            console.error("Token verification failed: Token expired");
            return null;
        }

        return decodedBody;
    } catch (error) {
        console.error("Token verification error:", error);
        return null;
    }
}
