import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const token = searchParams.get("token");

        if (!token) {
            return NextResponse.json({ valid: false }, { status: 400 });
        }

        const user = await prisma.user.findFirst({
            where: {
                reset_password_token: token,
                reset_password_expires: {
                    gt: new Date(),
                },
            },
        });

        if (!user) {
            return NextResponse.json({ valid: false }, { status: 200 });
        }

        return NextResponse.json({ valid: true }, { status: 200 });
    } catch (error) {
        console.error("Verify Token Error:", error);
        return NextResponse.json({ valid: false }, { status: 500 });
    }
}
