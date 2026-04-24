import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { cleanupOldLogs } from "@/lib/activity";

export const dynamic = "force-dynamic";

// POST /api/admin/monitoring/cleanup — Delete logs older than 30 days
export async function POST() {
    const session = await auth();
    if (!session || (session.user as any)?.role !== "admin") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const deleted = await cleanupOldLogs();
        return NextResponse.json({ success: true, deleted });
    } catch (error) {
        console.error("[Cleanup API] Error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
