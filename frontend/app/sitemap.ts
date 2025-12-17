import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  // Get base URL from environment variable
  // For production, ensure NEXT_PUBLIC_APP_URL is set to https://przio.com
  // If not set, default to production URL (not localhost)
  let baseUrl = process.env.NEXT_PUBLIC_APP_URL
  
  // If no URL is set or it's localhost, use production URL
  if (!baseUrl || baseUrl.includes('localhost')) {
    baseUrl = 'https://przio.com'
  }
  
  // Ensure URL doesn't have trailing slash
  const cleanBaseUrl = baseUrl.replace(/\/$/, '')
  
  return [
    {
      url: cleanBaseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${cleanBaseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${cleanBaseUrl}/how-it-works`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${cleanBaseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${cleanBaseUrl}/signup`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ]
}

