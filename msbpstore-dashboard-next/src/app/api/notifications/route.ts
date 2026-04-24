import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { z } from "zod";

// Input Validation Schema
const patchSchema = z.object({
    id: z.string().optional(),
    all: z.boolean().optional(),
});

// GET: Fetch notifications for the logged-in user
export async function GET() {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const notifications = await prisma.notification.findMany({
            where: { userId: BigInt(session.user.id) },
            orderBy: { createdAt: "desc" },
            take: 20,
        });

        // 11. Data Exposure: Filter fields and convert BigInt
        const formattedNotifications = notifications.map((notif: any) => ({
            id: notif.id.toString(),
            title: notif.title,
            message: notif.message,
            isRead: notif.isRead,
            createdAt: notif.createdAt,
        }));

        return NextResponse.json(formattedNotifications);
    } catch (error) {
        console.error("Fetch Notifications Error:", error);
        return NextResponse.json({ error: "Server Error" }, { status: 500 });
    }
}

// PATCH: Mark notification(s) as read
export async function PATCH(req: Request) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const validation = patchSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json({ error: "Invalid input" }, { status: 400 });
        }

        const { id, all } = validation.data;

        if (all) {
            await prisma.notification.updateMany({
                where: { userId: BigInt(session.user.id), isRead: false },
                data: { isRead: true },
            });
        } else if (id) {
            // 7. IDOR: Ensure the notification belongs to the user
            await prisma.notification.update({
                where: { 
                    id: BigInt(id), 
                    userId: BigInt(session.user.id) 
                },
                data: { isRead: true },
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Update Notification Error:", error);
        return NextResponse.json({ error: "Server Error" }, { status: 500 });
    }
}
