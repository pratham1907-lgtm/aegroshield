import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://aegroshield.vercel.app';
  const lastModified = new Date();

  const routes = [
    { url: '', priority: 1.0, changeFrequency: 'daily' as const },
    { url: '/store', priority: 0.9, changeFrequency: 'daily' as const },
    { url: '/market', priority: 0.9, changeFrequency: 'hourly' as const },
    { url: '/machinery', priority: 0.8, changeFrequency: 'weekly' as const },
    { url: '/labour', priority: 0.8, changeFrequency: 'weekly' as const },
    { url: '/calculator', priority: 0.7, changeFrequency: 'monthly' as const },
    { url: '/advisory', priority: 0.8, changeFrequency: 'weekly' as const },
    { url: '/dealer', priority: 0.7, changeFrequency: 'monthly' as const },
    { url: '/contact', priority: 0.6, changeFrequency: 'monthly' as const },
    { url: '/orders', priority: 0.5, changeFrequency: 'daily' as const },
    { url: '/bookings', priority: 0.5, changeFrequency: 'daily' as const },
    { url: '/farmer/home', priority: 0.8, changeFrequency: 'daily' as const },
  ];

  return routes.map(route => ({
    url: `${baseUrl}${route.url}`,
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
