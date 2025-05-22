import { NextResponse } from 'next/server';

// 处理所有HTTP方法的通用代理处理函数
async function proxyRequest(request) {
  // 获取URL查询参数
  const { searchParams } = new URL(request.url);
  const targetUrl = searchParams.get('url');
  
  if (!targetUrl) {
    return NextResponse.json({ error: '缺少目标URL参数' }, { status: 400 });
  }

  if (!targetUrl.startsWith('http://')) {
    return NextResponse.json({ error: '仅支持代理HTTP URL，HTTPS URL应该直接请求' }, { status: 400 });
  }

  try {
    console.log(`[简单代理] 正在代理${request.method}请求到: ${targetUrl}`);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30秒超时
    
    // 复制请求头
    const headers = new Headers();
    for (const [key, value] of request.headers.entries()) {
      if (!['host', 'x-vercel-id', 'x-vercel-deployment-url', 'x-vercel-ip-city'].includes(key.toLowerCase())) {
        headers.set(key, value);
      }
    }
    
    // 读取请求体（如果有）
    let body = undefined;
    if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
      try {
        // 尝试读取JSON请求体
        const contentType = request.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          body = JSON.stringify(await request.json());
        } else {
          // 如果不是JSON，按原样传递请求体
          body = await request.text();
        }
      } catch (e) {
        console.warn(`[简单代理] 无法读取请求体: ${e.message}`);
      }
    }
    
    // 发送代理请求
    const response = await fetch(targetUrl, {
      method: request.method,
      headers: headers,
      body: body,
      signal: controller.signal,
      cache: 'no-store'
    });
    
    clearTimeout(timeoutId);
    
    // 准备响应
    let responseData;
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      // 如果是JSON响应
      responseData = await response.json();
      return NextResponse.json(responseData, {
        status: response.status,
        statusText: response.statusText
      });
    } else {
      // 如果不是JSON，按原样返回响应
      const responseText = await response.text();
      return new NextResponse(responseText, {
        status: response.status,
        statusText: response.statusText,
        headers: {
          'Content-Type': contentType || 'text/plain'
        }
      });
    }
    
  } catch (error) {
    console.error(`[简单代理] 代理请求失败: ${error.message}`);
    return NextResponse.json({ 
      error: '代理请求失败', 
      details: error.message,
      targetUrl: targetUrl
    }, { status: 502 });
  }
}

// 导出所有HTTP方法处理函数
export async function GET(request) {
  return proxyRequest(request);
}

export async function POST(request) {
  return proxyRequest(request);
}

export async function PUT(request) {
  return proxyRequest(request);
}

export async function DELETE(request) {
  return proxyRequest(request);
}

export async function PATCH(request) {
  return proxyRequest(request);
}

export async function OPTIONS(request) {
  return proxyRequest(request);
}

export async function HEAD(request) {
  return proxyRequest(request);
} 