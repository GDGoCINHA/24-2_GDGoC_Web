export default function sitemap() {
    const baseUrl = 'https://gdgocinha.com';
    const currentDate = new Date().toISOString();

    const routes = [
        {
            url: baseUrl,
            lastModified: currentDate,
            changeFrequency: 'daily',
            priority: 1,
        },
        {
            url: `${baseUrl}/recruit`,
            lastModified: currentDate,
            changeFrequency: 'weekly',
            priority: 0.8,
        }
    ];

    return routes;
} 