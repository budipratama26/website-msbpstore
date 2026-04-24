import { MetadataRoute } from 'next'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://msbpstore.my.id'

    // Fetch all categories for dynamic routes
    const categories = await prisma.category.findMany({
        where: { active: true },
        select: { slug: true, updatedAt: true },
    })

    const categoryUrls = categories.map((cat) => ({
        url: `${baseUrl}/category/${cat.slug}`,
        lastModified: cat.updatedAt,
        changeFrequency: 'weekly' as const,
        priority: 0.8,
    }))

    return [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
        ...categoryUrls,
    ]
}
