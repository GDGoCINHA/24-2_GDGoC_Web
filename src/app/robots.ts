export const dynamic = 'force-static';


export default function robots() {
    return {
        rules: [
            {
                userAgent: '*',
                allow: [
                    '/',
                    '/recruit',
                    '/recruit/core',
                    '/images/',
                    '/fonts/',
                    '/static/',
                ],
                disallow: [
                    '/api/',
                    '/_next/',
                    '/auth/',
                    '/context/',
                    '/study/',
                    '/main/',
                    '/signup/',
                    '/private/',
                    '/admin/',
                    '/hooks/',
                    '/mock/',
                    '/utils/',
                    '/recruit/member/'
                ],
                crawlDelay: 5,
            },
            {
                userAgent: 'GPTBot',
                disallow: ['/'],
            },
            {
                userAgent: 'CCBot',
                disallow: ['/'],
            },
            {
                userAgent: 'Google-Extended',
                disallow: ['/'],
            },
            {
                userAgent: 'anthropic-ai',
                disallow: ['/'],
            },
        ],
        sitemap: 'https://gdgocinha.com/sitemap.xml',
        host: 'https://gdgocinha.com',
    }
}