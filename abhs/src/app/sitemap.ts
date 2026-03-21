import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://allbeautyhairstudio.com';
  const lastModified = new Date();

  return [
    { url: baseUrl, lastModified, changeFrequency: 'monthly', priority: 1 },
    { url: `${baseUrl}/gallery`, lastModified, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/faq`, lastModified, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/philosophy`, lastModified, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/newclientform`, lastModified, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${baseUrl}/book`, lastModified, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${baseUrl}/legal/privacy`, lastModified, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${baseUrl}/legal/terms`, lastModified, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${baseUrl}/legal/ai-disclosure`, lastModified, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${baseUrl}/legal/retention`, lastModified, changeFrequency: 'yearly', priority: 0.3 },
  ];
}
