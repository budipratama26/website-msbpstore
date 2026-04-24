import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getOnlineUsers, getDailyStats } from "@/lib/activity";

export const dynamic = "force-dynamic";

export async function GET() {
    const session = await auth();
    if (!session || (session.user as any)?.role !== "admin") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const [onlineUsers, stats] = await Promise.all([
            getOnlineUsers(),
            getDailyStats(),
        ]);

        return NextResponse.json({
            onlineUsers,
            stats,
        });
    } catch (error) {
        console.error("[Monitoring API] Error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
