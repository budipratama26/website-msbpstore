import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
    const cats = await prisma.category.findMany({ select: { name: true, slug: true, image: true } })
    console.log('--- DATABASE DATA ---')
    console.log(JSON.stringify(cats, null, 2))
}

main().catch(console.error).finally(() => prisma.$disconnect())
