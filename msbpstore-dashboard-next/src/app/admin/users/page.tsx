import prisma from "@/lib/prisma";
import UsersClient from "./UsersClient";

export const dynamic = "force-dynamic";

export default async function UsersAdminPage() {
    const webUsers = await prisma.user.findMany({
        orderBy: { createdAt: 'desc' }
    });

    const telegramUsers = await prisma.telegramUser.findMany({
        orderBy: { createdAt: 'desc' }
    });

    const serializedWeb = webUsers.map(u => ({
        id: u.id.toString(),
        name: u.name,
        email: u.email,
        role: u.role,
        avatar: u.avatar,
        points: Number((u as any).points || 0),
        createdAt: u.createdAt.toISOString(),
    }));

    const serializedTelegram = telegramUsers.map(t => ({
        id: t.id.toString(),
        telegramId: t.telegramId.toString(),
        username: t.username,
        firstName: t.firstName,
        lastName: t.lastName,
        createdAt: t.createdAt.toISOString(),
    }));

    return <UsersClient initialWebUsers={serializedWeb} initialTelegramUsers={serializedTelegram} />;
}
