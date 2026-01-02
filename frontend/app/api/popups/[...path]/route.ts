import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';

// #region agent log
fetch('http://localhost:7242/ingest/d396a845-f4b4-46fd-b2a8-1cd806b7ccf6',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/api/popups/[...path]/route.ts:5',message:'Popup image API route hit',data:{timestamp:Date.now()},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
// #endregion

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const pathParams = await params;
    const pathSegments = pathParams.path || [];
    
    // #region agent log
    fetch('http://localhost:7242/ingest/d396a845-f4b4-46fd-b2a8-1cd806b7ccf6',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/api/popups/[...path]/route.ts:17',message:'Path segments received',data:{segments:pathSegments,url:req.url},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    
    if (pathSegments.length === 0) {
      return new NextResponse('Not found', { status: 404 });
    }

    // Construct file path: public/{projectId}/{date-time-folder}/{filename}
    const filePath = path.join(
      process.cwd(),
      'public',
      ...pathSegments
    );

    // #region agent log
    fetch('http://localhost:7242/ingest/d396a845-f4b4-46fd-b2a8-1cd806b7ccf6',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/api/popups/[...path]/route.ts:33',message:'File path constructed',data:{filePath},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion

    // Security: Prevent directory traversal
    const resolvedPath = path.resolve(filePath);
    const publicPath = path.resolve(process.cwd(), 'public');
    if (!resolvedPath.startsWith(publicPath)) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    // Check if file exists
    let fileExists = false;
    try {
      await fs.access(filePath);
      fileExists = true;
    } catch (error) {
      // #region agent log
      fetch('http://localhost:7242/ingest/d396a845-f4b4-46fd-b2a8-1cd806b7ccf6',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/api/popups/[...path]/route.ts:47',message:'File access check failed',data:{filePath,error:String(error)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
      return new NextResponse('File not found', { status: 404 });
    }

    // #region agent log
    fetch('http://localhost:7242/ingest/d396a845-f4b4-46fd-b2a8-1cd806b7ccf6',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/api/popups/[...path]/route.ts:52',message:'File exists, reading',data:{filePath,exists:fileExists},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion

    // Read file
    const fileBuffer = await fs.readFile(filePath);
    
    // #region agent log
    fetch('http://localhost:7242/ingest/d396a845-f4b4-46fd-b2a8-1cd806b7ccf6',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/api/popups/[...path]/route.ts:58',message:'File read successfully',data:{size:fileBuffer.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion

    // Determine content type
    const ext = path.extname(filePath).toLowerCase();
    const contentTypeMap: Record<string, string> = {
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.svg': 'image/svg+xml',
    };
    const contentType = contentTypeMap[ext] || 'application/octet-stream';

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=2592000, immutable',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error: any) {
    // #region agent log
    fetch('http://localhost:7242/ingest/d396a845-f4b4-46fd-b2a8-1cd806b7ccf6',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/api/popups/[...path]/route.ts:80',message:'Error in popup image route',data:{error:String(error)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    console.error('Error serving popup image:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}

