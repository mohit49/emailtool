/**
 * Get the correct image path based on environment
 * In production, uses /static/assets/templet/
 * In development, uses /templates/ or relative paths
 */
export function getImagePath(filename: string): string {
  const isProduction = process.env.NODE_ENV === 'production';
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || '';
  
  if (isProduction && baseUrl) {
    // In production, use static/assets/templet/ path
    return `${baseUrl}/static/assets/templet/${filename}`;
  }
  
  // In development or if no base URL, use relative path
  return `/static/assets/templet/${filename}`;
}

/**
 * Get the full URL for an image
 */
export function getImageUrl(filename: string): string {
  const isProduction = process.env.NODE_ENV === 'production';
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || '';
  
  if (isProduction && baseUrl) {
    // Remove trailing slash if present
    const cleanBaseUrl = baseUrl.replace(/\/$/, '');
    return `${cleanBaseUrl}/static/assets/templet/${filename}`;
  }
  
  // In development, use relative path
  return `/static/assets/templet/${filename}`;
}

/**
 * Check if an image path should use static/assets/templet/
 */
export function shouldUseStaticAssets(path: string): boolean {
  const isProduction = process.env.NODE_ENV === 'production';
  // Use static assets for template images in production
  return isProduction && !path.startsWith('http') && !path.startsWith('//');
}

