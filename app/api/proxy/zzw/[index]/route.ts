import { NextResponse } from 'next/server';
import appConfigData from '../../../../../app.config.json';

const API_CATEGORY = 'zzw'; // 特定于此文件的API类别

type RouteParams = {
  index: string;
};

// Helper to get URL from app.config.json for the specific category
function getTargetUrl(idx: number): string | undefined {
  if (!appConfigData.updateAPI || typeof appConfigData.updateAPI !== 'object') {
    console.error(`[Proxy-${API_CATEGORY}] app.config.json does not contain updateAPI object.`);
    return undefined;
  }
  const apiGroup = appConfigData.updateAPI[API_CATEGORY as keyof typeof appConfigData.updateAPI];

  if (Array.isArray(apiGroup) && idx >= 0 && idx < apiGroup.length) {
    const url = apiGroup[idx];
    // This proxy is specifically for HTTP URLs that cause mixed content issues.
    if (typeof url === 'string' && url.startsWith('http://')) {
      return url;
    }
    if (typeof url === 'string' && url.startsWith('https://')) {
      console.warn(`[Proxy-${API_CATEGORY}] Attempted to proxy an HTTPS URL at index '${idx}'. This should be called directly.`);
      return undefined; // HTTPS should be called directly
    }
    console.warn(`[Proxy-${API_CATEGORY}] URL at index '${idx}' is not a valid HTTP string:`, url);
  } else {
    console.warn(`[Proxy-${API_CATEGORY}] No API group or index out of bounds for index '${idx}'.`);
  }
  return undefined;
}

// Shared logic for handling the proxy request
async function handleProxyRequest(
  req: Request,
  { params }: { params: RouteParams }
) {
  const { index: indexStr } = params;
  const index = parseInt(indexStr, 10);

  if (isNaN(index)) {
    return NextResponse.json({ error: 'Invalid index parameter' }, { status: 400 });
  }

  const targetUrl = getTargetUrl(index);

  if (!targetUrl) {
    return NextResponse.json({ error: `Target HTTP URL not found in config for category '${API_CATEGORY}' index '${index}', or it is not an HTTP URL suitable for proxying.` }, { status: 404 });
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30-second timeout

    const newHeaders = new Headers(req.headers);
    newHeaders.delete('host');
    newHeaders.delete('x-vercel-id');
    newHeaders.delete('x-vercel-deployment-url');
    newHeaders.delete('x-vercel-ip-city');
    // Consider X-Forwarded-For, X-Forwarded-Host, X-Forwarded-Proto if target needs them

    const response = await fetch(targetUrl, {
      method: req.method,
      headers: newHeaders,
      body: (req.method !== 'GET' && req.method !== 'HEAD') ? req.body : undefined,
      signal: controller.signal,
      cache: 'no-store',
    });

    clearTimeout(timeoutId);

    const responseHeaders = new Headers(response.headers);
    // Clean up headers if necessary

    return new NextResponse(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });

  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.error(`[Proxy-${API_CATEGORY}] Request to ${targetUrl} timed out:`, error);
      return NextResponse.json({ error: 'Proxy request timed out', details: error.message }, { status: 504 });
    }
    console.error(`[Proxy-${API_CATEGORY}] Error proxying to ${targetUrl} (for /api/proxy/${API_CATEGORY}/${index}):`, error);
    return NextResponse.json({ error: 'Proxy request failed', details: error.message }, { status: 502 });
  }
}

// Explicit HTTP method exports
export async function GET(request: Request, { params }: { params: RouteParams }) {
  return handleProxyRequest(request, { params });
}
export async function POST(request: Request, { params }: { params: RouteParams }) {
  return handleProxyRequest(request, { params });
}
export async function PUT(request: Request, { params }: { params: RouteParams }) {
  return handleProxyRequest(request, { params });
}
export async function DELETE(request: Request, { params }: { params: RouteParams }) {
  return handleProxyRequest(request, { params });
}
export async function PATCH(request: Request, { params }: { params: RouteParams }) {
  return handleProxyRequest(request, { params });
}
export async function OPTIONS(request: Request, { params }: { params: RouteParams }) {
  return handleProxyRequest(request, { params });
}
export async function HEAD(request: Request, { params }: { params: RouteParams }) {
  return handleProxyRequest(request, { params });
} 