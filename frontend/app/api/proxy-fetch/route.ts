import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const url = searchParams.get('url');

    if (!url) {
      return NextResponse.json(
        { error: 'URL parameter is required' },
        { status: 400 }
      );
    }

    // Validate URL
    let targetUrl: string;
    try {
      const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
      targetUrl = urlObj.toString();
    } catch (e) {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    // Fetch the website HTML
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
      // Add timeout
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch: ${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }

    const html = await response.text();

    // Process HTML to make it work in our context
    // Remove any existing PRZIO SDK scripts
    let processedHtml = html
      .replace(/<script[^>]*src=["'][^"']*sdk\.js[^"']*["'][^>]*>.*?<\/script>/gi, '')
      .replace(/<script[^>]*src=["'][^"']*przio[^"']*["'][^>]*>.*?<\/script>/gi, '')
      .replace(/window\.przio\s*=\s*\{[^}]*\}/g, '')
      .replace(/przio\.init\([^)]*\)/g, '');

    // Add base tag to resolve relative URLs
    if (!processedHtml.includes('<base')) {
      processedHtml = processedHtml.replace(
        /<head[^>]*>/i,
        `$&<base href="${targetUrl}">`
      );
    }

    return NextResponse.json({ html: processedHtml, url: targetUrl });
  } catch (error: any) {
    console.error('Proxy fetch error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch website' },
      { status: 500 }
    );
  }
}
