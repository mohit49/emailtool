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
  
  const now = new Date()
  
  return [
    // Home page - highest priority
    {
      url: cleanBaseUrl,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    // Main product/info pages
    {
      url: `${cleanBaseUrl}/about`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${cleanBaseUrl}/how-it-works`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    // Tutorial pages
    {
      url: `${cleanBaseUrl}/form-tutorial`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${cleanBaseUrl}/popup-tutorial`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    // Integration page
    {
      url: `${cleanBaseUrl}/third-party-integration`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    // Authentication pages
    {
      url: `${cleanBaseUrl}/signup`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${cleanBaseUrl}/login`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${cleanBaseUrl}/forgot-password`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ]
}

