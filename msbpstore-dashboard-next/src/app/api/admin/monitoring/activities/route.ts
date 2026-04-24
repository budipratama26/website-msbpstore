import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getActivityLogs } from "@/lib/activity";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
    const session = await auth();
    if (!session || (session.user as any)?.role !== "admin") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { searchParams } = req.nextUrl;
        const page = parseInt(searchParams.get("page") || "1");
        const action = searchParams.get("action") || "ALL";
        const userId = searchParams.get("userId") || undefined;

        const result = await getActivityLogs({ page, limit: 50, action, userId });

        return NextResponse.json(result);
    } catch (error) {
        console.error("[Activity Logs API] Error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
