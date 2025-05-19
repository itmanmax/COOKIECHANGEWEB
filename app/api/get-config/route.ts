import { NextResponse } from 'next/server';

// 默认配置，当无法读取配置文件时使用
const defaultConfig = {
  notification: {
    enabled: true,
    noticeDays: 14,
    qmsgKey: '',
    qqNumber: ''
  },
  updateAPI: {
    max: [
      "https://home.maxtral.fun/plugin/updatadate/api.php"
    ],
    zzw: [
      "http://homezzw.maxtral.fun/updatadata/api.php"
    ],
    test: [
      "https://api.example.com/easystack/update"
    ]
  },
  updateMode: "max"
};

export async function GET() {
  try {
    let configData;
    let configSource = 'default';
    
    // 1. 首先尝试从public目录获取配置文件 (Vercel环境优先使用)
    try {
      const baseUrl = process.env.VERCEL_URL 
        ? `https://${process.env.VERCEL_URL}` 
        : process.env.NEXT_PUBLIC_VERCEL_URL
          ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
          : 'http://localhost:3000';
          
      const configResponse = await fetch(new URL('/vercel.config.json', baseUrl), {
        cache: 'no-store' // 禁用缓存，确保每次获取最新配置
      });
      
      if (configResponse.ok) {
        configData = await configResponse.json();
        configSource = 'public';
        console.log('从public目录成功读取配置');
      } else {
        throw new Error('公共目录配置不可用');
      }
    } catch (publicError) {
      console.log('从public目录读取配置失败:', publicError);
      
      // 2. 如果无法从public目录获取，尝试使用fs读取（仅在开发环境）
      if (typeof window === 'undefined' && process.env.NODE_ENV !== 'production') {
        try {
          const fs = await import('fs');
          const path = await import('path');
          const configPath = path.join(process.cwd(), 'config.json');
          configData = JSON.parse(fs.readFileSync(configPath, 'utf8'));
          configSource = 'filesystem';
          console.log('从文件系统成功读取配置');
        } catch (fsError) {
          console.error('读取本地配置文件失败:', fsError);
          configData = defaultConfig;
        }
      } else {
        // 3. 在其他环境使用默认配置
        configData = defaultConfig;
      }
    }
    
    // 确保配置对象具有所有必要的属性
    configData = {
      notification: {
        ...defaultConfig.notification,
        ...(configData?.notification || {})
      },
      updateAPI: {
        ...defaultConfig.updateAPI,
        ...(configData?.updateAPI || {})
      },
      updateMode: configData?.updateMode || defaultConfig.updateMode
    };
    
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
      updateTypes: Object.keys(configData.updateAPI),
      updateMode: configData.updateMode,
      _source: configSource // 调试信息：配置来源
    };
    
    return NextResponse.json(safeConfig);
  } catch (error: any) {
    console.error('获取配置信息时出错:', error);
    // 在出错时返回基本的默认配置，确保前端能正常运行
    return NextResponse.json({
      notification: {
        enabled: defaultConfig.notification.enabled,
        noticeDays: defaultConfig.notification.noticeDays,
        qqNumber: '未设置',
        qmsgKeySet: '未设置'
      },
      updateTypes: Object.keys(defaultConfig.updateAPI),
      updateMode: defaultConfig.updateMode,
      _source: 'error_fallback'
    });
  }
} 