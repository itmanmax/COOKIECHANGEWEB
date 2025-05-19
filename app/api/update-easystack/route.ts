import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // 读取配置文件
    const configPath = path.join(process.cwd(), 'config.json');
    const configData = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    const apiUrls = configData.updateAPI.test;
    
    // 检查是否存在URL
    if (!apiUrls || apiUrls.length === 0) {
      throw new Error('未找到测试更新API的URL配置');
    }
    
    const results = [];
    
    // 调用所有API端点
    for (const apiUrl of apiUrls) {
      try {
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        const data = await response.json();
        results.push({
          url: apiUrl,
          success: true,
          data: data
        });
      } catch (error: any) {
        console.error(`调用测试 API ${apiUrl} 出错:`, error);
        results.push({
          url: apiUrl,
          success: false,
          error: error.message || '未知错误'
        });
      }
    }
    
    // 返回所有结果
    return NextResponse.json({
      success: results.some(r => r.success),
      results: results
    });
  } catch (error: any) {
    console.error('更新测试数据时出错:', error);
    return NextResponse.json(
      { success: false, message: '更新失败，请稍后重试', error: error.message || '未知错误' },
      { status: 500 }
    );
  }
} 