import { NextResponse } from 'next/server';

// 默认配置，当无法读取配置文件时使用
const defaultConfig = {
  updateAPI: {
    max: [
      "https://home.maxtral.fun/plugin/updatadate/api.php"
    ],
    zzw: [
      "http://homezzw.maxtral.fun/updatadata/api.php"
    ]
  },
  updateMode: "max"
};

// 辅助函数：获取配置数据
async function getConfigData() {
  try {
    // 1. 首先尝试从public目录获取配置文件
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : process.env.NEXT_PUBLIC_VERCEL_URL
        ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
        : 'http://localhost:3000';
        
    const configResponse = await fetch(new URL('/vercel.config.json', baseUrl), {
      cache: 'no-store' // 禁用缓存，确保每次获取最新配置
    });
    
    if (configResponse.ok) {
      const data = await configResponse.json();
      console.log('从public目录成功读取配置');
      return data;
    }
  } catch (error) {
    console.error('从public目录获取配置失败:', error);
  }
  
  // 2. 如果无法从public目录获取，尝试使用fs读取（仅在非生产环境）
  if (typeof window === 'undefined' && process.env.NODE_ENV !== 'production') {
    try {
      // 动态导入fs和path模块
      const fs = await import('fs');
      const path = await import('path');
      
      const configPath = path.join(process.cwd(), 'config.json');
      const configData = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      console.log('从文件系统成功读取配置');
      return configData;
    } catch (fsError) {
      console.error('读取本地配置文件失败:', fsError);
    }
  }
  
  // 3. 都失败则返回默认配置
  console.log('使用默认配置');
  return defaultConfig;
}

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

    // 获取配置数据
    const configData = await getConfigData();
    
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
          next: { revalidate: 0 } // 禁用缓存，确保获取最新数据
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
    // 获取配置数据
    const configData = await getConfigData();
    
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