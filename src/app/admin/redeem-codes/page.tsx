import prisma from "@/lib/prisma";
import RedeemCodesClient from "./RedeemCodesClient";

export const dynamic = "force-dynamic";

export default async function RedeemCodesPage() {
    const codes = await prisma.redeemCode.findMany({
        include: { product: true },
        orderBy: { id: 'desc' }
    });

    const serialized = codes.map(c => ({
        id: c.id.toString(),
        code: c.code,
        reward: c.reward,
        used: c.used,
        productName: c.product?.name || null,
    }));

    return <RedeemCodesClient initialCodes={serialized} />;
}
