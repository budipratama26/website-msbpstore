import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { stringifyBigInt } from "@/lib/utils";

async function checkAdmin() {
    const session = await auth();
    if (!session?.user?.email) return null;
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user || user.role !== "admin") return null;
    return user;
}

export async function PUT(req: Request) {
    try {
        const admin = await checkAdmin();
        if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id, role } = await req.json();
        if (!id || !role) return NextResponse.json({ error: "ID dan role wajib." }, { status: 400 });

        const validRoles = ["admin", "customer"];
        if (!validRoles.includes(role)) {
            return NextResponse.json({ error: "Role tidak valid." }, { status: 400 });
        }

        if (BigInt(id) === admin.id) {
            return NextResponse.json({ error: "Anda tidak bisa mengubah role sendiri." }, { status: 403 });
        }

        const user = await prisma.user.update({
            where: { id: BigInt(id) },
            data: { role },
        });

        return NextResponse.json(stringifyBigInt({ success: true, user }));
    } catch (error) {
        console.error("User Role Update Error:", error);
        return NextResponse.json({ error: "Terjadi kesalahan pada server." }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const admin = await checkAdmin();
        if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");
        if (!id) return NextResponse.json({ error: "ID wajib." }, { status: 400 });

        if (BigInt(id) === admin.id) {
            return NextResponse.json({ error: "Anda tidak bisa menghapus akun sendiri." }, { status: 403 });
        }

        // Notifications auto-cascade via onDelete: Cascade in Prisma schema
        await prisma.user.delete({ where: { id: BigInt(id) } });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("User Delete Error:", error);
        return NextResponse.json({ error: "Terjadi kesalahan pada server." }, { status: 500 });
    }
}
