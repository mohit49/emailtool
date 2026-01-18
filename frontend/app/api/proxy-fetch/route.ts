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

    // Fetch the website HTML (follow redirects)
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
      redirect: 'follow', // Follow redirects
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

    // Remove X-Frame-Options meta tags and HTTP headers (for iframe embedding)
    processedHtml = processedHtml
      .replace(/<meta[^>]*http-equiv=["']X-Frame-Options["'][^>]*>.*?<\/meta>/gi, '')
      .replace(/<meta[^>]*http-equiv=["']x-frame-options["'][^>]*>.*?<\/meta>/gi, '')
      .replace(/<meta[^>]*http-equiv=["']X-Frame-Options["'][^>]*\/?>/gi, '')
      .replace(/<meta[^>]*http-equiv=["']x-frame-options["'][^>]*\/?>/gi, '');

    // Remove Content-Security-Policy that might block iframe embedding
    processedHtml = processedHtml
      .replace(/<meta[^>]*http-equiv=["']Content-Security-Policy["'][^>]*>.*?<\/meta>/gi, '')
      .replace(/<meta[^>]*http-equiv=["']content-security-policy["'][^>]*>.*?<\/meta>/gi, '')
      .replace(/<meta[^>]*http-equiv=["']Content-Security-Policy["'][^>]*\/?>/gi, '')
      .replace(/<meta[^>]*http-equiv=["']content-security-policy["'][^>]*\/?>/gi, '');

    // Remove frame-ancestors from CSP if present in meta tags
    processedHtml = processedHtml.replace(
      /frame-ancestors[^;'"]*/gi,
      'frame-ancestors *'
    );

    // Remove scripts that check for top/frame context (common anti-iframe scripts)
    processedHtml = processedHtml
      .replace(/if\s*\(top\s*!==\s*self\)/gi, 'if(false)')
      .replace(/if\s*\(window\.top\s*!==\s*window\.self\)/gi, 'if(false)')
      .replace(/if\s*\(window\.frameElement\)/gi, 'if(false)')
      .replace(/if\s*\(self\s*!==\s*top\)/gi, 'if(false)')
      .replace(/top\.location\s*=/gi, '// top.location =')
      .replace(/window\.top\.location\s*=/gi, '// window.top.location =')
      .replace(/parent\.location\s*=/gi, '// parent.location =')
      .replace(/window\.location\.replace\(/gi, '// window.location.replace(')
      .replace(/window\.location\.href\s*=/gi, '// window.location.href =')
      .replace(/location\.href\s*=/gi, '// location.href =')
      .replace(/location\.replace\(/gi, '// location.replace(');

    // Remove meta refresh redirects
    processedHtml = processedHtml
      .replace(/<meta[^>]*http-equiv=["']refresh["'][^>]*>.*?<\/meta>/gi, '')
      .replace(/<meta[^>]*http-equiv=["']Refresh["'][^>]*>.*?<\/meta>/gi, '')
      .replace(/<meta[^>]*http-equiv=["']refresh["'][^>]*\/?>/gi, '')
      .replace(/<meta[^>]*http-equiv=["']Refresh["'][^>]*\/?>/gi, '');

    // Add base tag to resolve relative URLs
    if (!processedHtml.includes('<base')) {
      processedHtml = processedHtml.replace(
        /<head[^>]*>/i,
        `$&<base href="${targetUrl}">`
      );
    }

    // Inject script to prevent frame-busting and navigation attempts
    const antiFrameBustingScript = `
      <script>
        (function() {
          // Prevent attempts to break out of iframe
          try {
            if (window.top !== window.self) {
              // Override top.location assignments
              const originalTop = window.top;
              Object.defineProperty(window, 'top', {
                get: function() { return window; },
                configurable: true
              });
            }
          } catch(e) {}
          
          // Prevent parent navigation
          try {
            Object.defineProperty(window, 'parent', {
              get: function() { return window; },
              configurable: true
            });
          } catch(e) {}
          
          // Override location.href and location.replace to prevent navigation
          const originalLocation = window.location;
          const originalHref = Object.getOwnPropertyDescriptor(window.location, 'href') || 
                               Object.getOwnPropertyDescriptor(Object.getPrototypeOf(window.location), 'href');
          
          try {
            Object.defineProperty(window.location, 'href', {
              get: function() {
                return originalHref ? originalHref.get.call(this) : originalLocation.href;
              },
              set: function(url) {
                console.log('Navigation blocked in iframe:', url);
                return false;
              },
              configurable: true
            });
            
            window.location.replace = function(url) {
              console.log('location.replace() blocked in iframe:', url);
              return false;
            };
          } catch(e) {
            console.warn('Could not override location:', e);
          }
        })();
      </script>
    `;

    // Inject the script right after <head> or at the beginning of <body>
    if (processedHtml.includes('</head>')) {
      processedHtml = processedHtml.replace('</head>', `${antiFrameBustingScript}</head>`);
    } else if (processedHtml.includes('<body')) {
      processedHtml = processedHtml.replace(/<body[^>]*>/i, `$&${antiFrameBustingScript}`);
    } else {
      // If no head or body, inject at the beginning
      processedHtml = antiFrameBustingScript + processedHtml;
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
