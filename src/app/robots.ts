import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://aegroshield.vercel.app';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/admin/', '/seller/dashboard/orders/internal'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
