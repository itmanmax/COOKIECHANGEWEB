import { NextResponse, NextRequest } from 'next/server';
import appConfigData from '../../../../../app.config.json';

// Helper to get URL from app.config.json
function getTargetUrl(type: string, idx: number): string | undefined {
  if (!appConfigData.updateAPI || typeof appConfigData.updateAPI !== 'object') {
    console.error('[Proxy] app.config.json does not contain updateAPI object.');
    return undefined;
  }
  const apiGroup = appConfigData.updateAPI[type as keyof typeof appConfigData.updateAPI];

  if (Array.isArray(apiGroup) && idx >= 0 && idx < apiGroup.length) {
    const url = apiGroup[idx];
    // This proxy is specifically for HTTP URLs that cause mixed content issues.
    if (typeof url === 'string' && url.startsWith('http://')) {
      return url;
    }
    if (typeof url === 'string' && url.startsWith('https://')) {
      console.warn(`[Proxy] Attempted to proxy an HTTPS URL through type '${type}', index '${idx}'. This should be called directly.`);
      return undefined; // HTTPS should be called directly by the client if possible
    }
    console.warn(`[Proxy] URL for type '${type}', index '${idx}' is not a valid HTTP string:`, url);
  } else {
    console.warn(`[Proxy] No API group or index out of bounds for type '${type}', index '${idx}'.`);
  }
  return undefined;
}

// Shared logic for handling the proxy request
async function handleProxyRequest(
  req: NextRequest,
  context: { params: { type: string; index: string } }
) {
  const { type, index: indexStr } = context.params;
  const index = parseInt(indexStr, 10);

  if (isNaN(index)) {
    return NextResponse.json({ error: 'Invalid index parameter' }, { status: 400 });
  }

  const targetUrl = getTargetUrl(type, index);

  if (!targetUrl) {
    return NextResponse.json({ error: `Target HTTP URL not found in config for type '${type}' index '${index}', or it is not an HTTP URL suitable for proxying.` }, { status: 404 });
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30-second timeout

    // Clone headers, removing Next.js/Vercel specific ones or host
    const newHeaders = new Headers(req.headers);
    newHeaders.delete('host');
    newHeaders.delete('x-vercel-id');
    newHeaders.delete('x-vercel-deployment-url');
    newHeaders.delete('x-vercel-ip-city');
    // ... any other headers to strip

    const response = await fetch(targetUrl, {
      method: req.method,
      headers: newHeaders,
      body: (req.method !== 'GET' && req.method !== 'HEAD') ? req.body : undefined,
      signal: controller.signal,
      cache: 'no-store', // Ensure fresh data from the target
    });

    clearTimeout(timeoutId);

    // Forward the response from the target URL
    const responseHeaders = new Headers(response.headers);
    // Clean up any problematic headers from the target if necessary
    // e.g., responseHeaders.delete('some-internal-header');

    return new NextResponse(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });

  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.error(`[Proxy] Request to ${targetUrl} timed out:`, error);
      return NextResponse.json({ error: 'Proxy request timed out', details: error.message }, { status: 504 }); // Gateway Timeout
    }
    console.error(`[Proxy] Error proxying to ${targetUrl} (for /api/proxy/${type}/${index}):`, error);
    return NextResponse.json({ error: 'Proxy request failed', details: error.message }, { status: 502 }); // Bad Gateway
  }
}

// Explicit HTTP method exports
export async function GET(request: NextRequest, context: { params: { type: string; index: string } }) {
  return handleProxyRequest(request, context);
}

export async function POST(request: NextRequest, context: { params: { type: string; index: string } }) {
  return handleProxyRequest(request, context);
}

export async function PUT(request: NextRequest, context: { params: { type: string; index: string } }) {
  return handleProxyRequest(request, context);
}

export async function DELETE(request: NextRequest, context: { params: { type: string; index: string } }) {
  return handleProxyRequest(request, context);
}

export async function PATCH(request: NextRequest, context: { params: { type: string; index: string } }) {
  return handleProxyRequest(request, context);
}

export async function OPTIONS(request: NextRequest, context: { params: { type: string; index: string } }) {
  // For OPTIONS, we might want to return a simple 204 No Content or specific CORS headers
  // if the proxied service doesn't handle OPTIONS well or if we want to control CORS at the proxy level.
  // However, for now, let's try forwarding it. If issues arise, this can be adjusted.
  return handleProxyRequest(request, context);
}

export async function HEAD(request: NextRequest, context: { params: { type: string; index: string } }) {
  return handleProxyRequest(request, context);
} 