import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // 动态导入fs和path模块
    const fs = await import('fs');
    const path = await import('path');
    
    // 读取配置文件
    const configPath = path.join(process.cwd(), 'config.json');
    const configData = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    
    // 返回一个安全的配置版本，包含部分敏感信息但进行了处理
    const safeConfig = {
      notification: {
        enabled: configData.notification.enabled,
        noticeDays: configData.notification.noticeDays,
        // 只返回QQ号码的部分字符，保护隐私
        qqNumber: configData.notification.qqNumber ? 
          (configData.notification.qqNumber.length > 8 ? 
          configData.notification.qqNumber.substring(0, 3) + '****' + 
          configData.notification.qqNumber.substring(configData.notification.qqNumber.length - 2) : 
          '未设置') : '未设置',
        // 只返回是否已设置密钥，不返回具体值
        qmsgKeySet: configData.notification.qmsgKey ? '已设置' : '未设置'
      },
      updateTypes: configData.updateAPI ? Object.keys(configData.updateAPI) : [],
      updateMode: configData.updateMode
    };
    
    return NextResponse.json(safeConfig);
  } catch (error: any) {
    console.error('获取配置信息时出错:', error);
    return NextResponse.json(
      { success: false, message: '无法获取配置信息', error: error.message || '未知错误' },
      { status: 500 }
    );
  }
} 