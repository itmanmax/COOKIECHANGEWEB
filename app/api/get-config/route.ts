import { NextResponse } from 'next/server';
import appConfigData from '../../../app.config.json'; // 导入根目录的配置文件

// 默认通知配置，当 app.config.json 中缺少相关部分时使用
const defaultNotificationConfig = {
  enabled: true,
  noticeDays: 14,
  qmsgKey: '',
  qqNumber: ''
};

export async function GET() {
  try {
    const notificationConfig = {
      ...defaultNotificationConfig,
      ...(appConfigData.notification || {})
    };

    // 返回一个安全的配置版本，仅包含通知相关的配置
    const safeConfig = {
      notification: {
        enabled: notificationConfig.enabled,
        noticeDays: notificationConfig.noticeDays,
        // 只返回QQ号码的部分字符，保护隐私
        qqNumber: notificationConfig.qqNumber ? 
          (notificationConfig.qqNumber.length > 8 ? 
          notificationConfig.qqNumber.substring(0, 3) + '****' + 
          notificationConfig.qqNumber.substring(notificationConfig.qqNumber.length - 2) : 
          '未设置') : '未设置',
        // 只返回是否已设置密钥，不返回具体值
        qmsgKeySet: notificationConfig.qmsgKey ? '已设置' : '未设置'
      },
      _source: 'app.config.json' // 调试信息：配置来源
    };
    
    return NextResponse.json(safeConfig);
  } catch (error: any) {
    console.error('获取配置信息时出错:', error);
    // 在出错时返回基本的默认通知配置
    return NextResponse.json({
      notification: {
        enabled: defaultNotificationConfig.enabled,
        noticeDays: defaultNotificationConfig.noticeDays,
        qqNumber: '未设置',
        qmsgKeySet: '未设置'
      },
      _source: 'error_fallback'
    });
  }
} 