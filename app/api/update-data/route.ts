import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// 更新指定类型的数据
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const type = url.searchParams.get('type');
    
    if (!type) {
      return NextResponse.json(
        { success: false, message: '缺少更新类型参数' },
        { status: 400 }
      );
    }

    // 读取配置文件
    const configPath = path.join(process.cwd(), 'config.json');
    const configData = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    
    // 检查是否存在指定类型的更新配置
    if (!configData.updateAPI || !configData.updateAPI[type]) {
      return NextResponse.json(
        { success: false, message: `未找到类型 ${type} 的更新配置` },
        { status: 404 }
      );
    }
    
    const apiUrls = configData.updateAPI[type];
    
    // 检查URL列表
    if (!Array.isArray(apiUrls) || apiUrls.length === 0) {
      return NextResponse.json(
        { success: false, message: `类型 ${type} 的更新API列表为空` },
        { status: 404 }
      );
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
        console.error(`调用 ${type} API ${apiUrl} 出错:`, error);
        results.push({
          url: apiUrl,
          success: false,
          error: error.message || '未知错误'
        });
      }
    }
    
    // 返回所有结果
    return NextResponse.json({
      type: type,
      success: results.some(r => r.success),
      results: results
    });
  } catch (error: any) {
    console.error('更新数据时出错:', error);
    return NextResponse.json(
      { success: false, message: '更新失败，请稍后重试', error: error.message || '未知错误' },
      { status: 500 }
    );
  }
}

// 获取所有可用的更新类型
export async function POST() {
  try {
    // 读取配置文件
    const configPath = path.join(process.cwd(), 'config.json');
    const configData = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    
    // 如果没有更新API配置，返回空数组
    if (!configData.updateAPI) {
      return NextResponse.json({ types: [] });
    }
    
    // 获取所有更新类型
    const updateTypes = Object.keys(configData.updateAPI).filter(key => 
      Array.isArray(configData.updateAPI[key]) && configData.updateAPI[key].length > 0
    );
    
    return NextResponse.json({ 
      types: updateTypes,
      defaultType: configData.updateMode || (updateTypes.length > 0 ? updateTypes[0] : null)
    });
  } catch (error: any) {
    console.error('获取更新类型时出错:', error);
    return NextResponse.json(
      { success: false, message: '获取更新类型失败', error: error.message || '未知错误' },
      { status: 500 }
    );
  }
} 