import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // 从服务器端发起请求不受CORS限制
    const response = await fetch('https://home.maxtral.fun/plugin/updatadate/api.php', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // 获取响应数据
    const data = await response.json();

    // 返回成功响应
    return NextResponse.json(data);
  } catch (error) {
    console.error('更新MAX数据时出错:', error);
    return NextResponse.json(
      { success: false, message: '更新失败，请稍后重试' },
      { status: 500 }
    );
  }
} 