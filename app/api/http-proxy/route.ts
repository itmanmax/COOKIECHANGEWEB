import { NextRequest, NextResponse } from 'next/server';

/**
 * 通用 HTTP/HTTPS 代理 API
 * 用于解决前端 CORS 问题，将请求代理转发到其他域名
 * 支持代理 HTTP 和 HTTPS URL
 */
export async function GET(request: NextRequest) {
  try {
    // 提取查询参数
    const { searchParams } = new URL(request.url);
    
    // 获取目标 URL
    const targetUrl = searchParams.get('url');
    
    if (!targetUrl) {
      return NextResponse.json({ error: '缺少 url 参数' }, { status: 400 });
    }

    // 构建完整的目标 URL，包括所有查询参数（排除 url 参数本身）
    const urlObj = new URL(targetUrl);
    
    // 将其他所有参数添加到目标 URL 上
    searchParams.forEach((value, key) => {
      if (key !== 'url') {
        urlObj.searchParams.append(key, value);
      }
    });
    
    // 发送请求到目标地址
    console.log(`代理请求到: ${urlObj.toString()}`);
    const response = await fetch(urlObj.toString(), {
      method: 'GET',
      headers: {
        'User-Agent': 'data-management-proxy',
        'Accept': 'application/json',
      },
    });

    // 获取响应数据
    const data = await response.json();
    
    // 返回响应数据
    return NextResponse.json(data);
  } catch (error) {
    console.error('代理请求失败:', error);
    return NextResponse.json(
      { error: '代理请求失败', message: (error as Error).message },
      { status: 500 }
    );
  }
}

// 也支持 POST 请求
export async function POST(request: NextRequest) {
  try {
    // 提取查询参数
    const { searchParams } = new URL(request.url);
    
    // 获取目标 URL
    const targetUrl = searchParams.get('url');
    
    if (!targetUrl) {
      return NextResponse.json({ error: '缺少 url 参数' }, { status: 400 });
    }

    // 获取请求体
    const body = await request.json().catch(() => ({}));
    
    // 构建完整的目标 URL
    const urlObj = new URL(targetUrl);
    
    // 将查询参数添加到目标 URL 上
    searchParams.forEach((value, key) => {
      if (key !== 'url') {
        urlObj.searchParams.append(key, value);
      }
    });
    
    // 发送请求到目标地址
    console.log(`代理 POST 请求到: ${urlObj.toString()}`);
    const response = await fetch(urlObj.toString(), {
      method: 'POST',
      headers: {
        'User-Agent': 'data-management-proxy',
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(body),
    });

    // 获取响应数据
    const data = await response.json();
    
    // 返回响应数据
    return NextResponse.json(data);
  } catch (error) {
    console.error('代理 POST 请求失败:', error);
    return NextResponse.json(
      { error: '代理请求失败', message: (error as Error).message },
      { status: 500 }
    );
  }
} 