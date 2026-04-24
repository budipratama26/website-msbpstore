import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/admin/', '/api/', '/profile/', '/history/', '/notifications/'],
        },
        sitemap: 'https://msbpstore.my.id/sitemap.xml',
    }
}
