/**
 * 通知服务模块 - 用于发送数据更新提醒
 */

// 声明一个获取配置的接口类型
interface NotificationConfig {
  enabled: boolean;
  noticeDays: number;
  qmsgKey: string;
  qqNumber: string;
}

// 默认配置
const defaultConfig: NotificationConfig = {
  enabled: true,
  noticeDays: 14,
  qmsgKey: '',
  qqNumber: ''
};

// 客户端配置缓存
let clientConfigCache: NotificationConfig | null = null;

// 读取配置文件 - 区分服务器端和客户端
async function getConfig(): Promise<NotificationConfig> {
  // 检查是否在浏览器环境中运行
  const isBrowser = typeof window !== 'undefined';
  
  // 客户端环境处理
  if (isBrowser) {
    // 如果有缓存配置，直接返回
    if (clientConfigCache) {
      return clientConfigCache;
    }
    
    try {
      // 从API获取配置
      const response = await fetch('/api/get-config');
      if (!response.ok) {
        throw new Error('获取配置失败');
      }
      
      const data = await response.json();
      // 提取通知配置信息
      const config: NotificationConfig = {
        enabled: data.notification?.enabled ?? defaultConfig.enabled,
        noticeDays: data.notification?.noticeDays ?? defaultConfig.noticeDays,
        qmsgKey: data.notification?.qmsgKey ?? defaultConfig.qmsgKey,
        qqNumber: data.notification?.qqNumber ?? defaultConfig.qqNumber
      };
      
      // 缓存配置
      clientConfigCache = config;
      return config;
    } catch (error) {
      console.error('获取配置信息失败:', error);
      return defaultConfig;
    }
  } 
  // 服务器端环境处理
  else {
    try {
      // 在服务器端也从 API 获取配置，避免使用 fs
      const baseUrl = process.env.VERCEL_URL 
        ? `https://${process.env.VERCEL_URL}` 
        : process.env.NEXT_PUBLIC_VERCEL_URL
          ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
          : 'http://localhost:3000';

      try {
        const configResponse = await fetch(`${baseUrl}/api/get-config`);
        
        if (configResponse.ok) {
          const data = await configResponse.json();
          return {
            enabled: data.notification?.enabled ?? defaultConfig.enabled,
            noticeDays: data.notification?.noticeDays ?? defaultConfig.noticeDays,
            qmsgKey: data.notification?.qmsgKey ?? defaultConfig.qmsgKey,
            qqNumber: data.notification?.qqNumber ?? defaultConfig.qqNumber
          };
        }
      } catch (fetchError) {
        console.error('服务器端获取配置失败:', fetchError);
      }
      
      // 如果从 API 获取失败，返回默认配置
      return defaultConfig;
    } catch (error) {
      console.error('读取配置文件失败:', error);
      return defaultConfig;
    }
  }
}

// 计算两个日期之间的天数差异
export function daysBetween(date1: string | Date, date2: string | Date = new Date()): number {
  const d1 = typeof date1 === 'string' ? new Date(date1) : date1;
  const d2 = typeof date2 === 'string' ? new Date(date2) : date2;
  
  // 转换为UTC时间戳，消除时区差异
  const utc1 = Date.UTC(d1.getFullYear(), d1.getMonth(), d1.getDate());
  const utc2 = Date.UTC(d2.getFullYear(), d2.getMonth(), d2.getDate());
  
  // 计算天数差异 (毫秒转天)
  const MS_PER_DAY = 1000 * 60 * 60 * 24;
  return Math.floor((utc2 - utc1) / MS_PER_DAY);
}

// 检查是否需要发送通知
export async function shouldSendNotice(lastUpdatedDate: string): Promise<boolean> {
  const config = await getConfig();
  
  // 如果通知功能未启用，返回false
  if (!config.enabled) {
    return false;
  }
  
  const daysSinceUpdate = daysBetween(lastUpdatedDate);
  return daysSinceUpdate >= config.noticeDays;
}

// 发送QMsg通知
export async function sendQMsgNotice(dataId: string, daysSinceUpdate: number): Promise<boolean> {
  const config = await getConfig();
  
  // 如果通知功能未启用或配置不完整，返回false
  if (!config.enabled || !config.qmsgKey || !config.qqNumber) {
    console.error('通知功能未启用或配置不完整');
    return false;
  }

  try {
    // 使用内部 API 代理来解决 CORS 问题
    const message = encodeURIComponent(`数据提醒：ID为 ${dataId} 的数据已有 ${daysSinceUpdate} 天未更新，请检查！`);
    
    // 使用我们自己的代理 API
    const response = await fetch(`/api/http-proxy?url=https://home.maxtral.fun/qmasgnotice/notice.php&qmsg_key=${config.qmsgKey}&qq_number=${config.qqNumber}&send_qmsg=${message}`);
    
    if (!response.ok) {
      throw new Error(`通知发送失败: ${response.statusText}`);
    }
    
    const result = await response.json();
    console.log('通知发送结果:', result);
    return true;
  } catch (error) {
    console.error('发送通知时出错:', error);
    return false;
  }
}

// 检查并发送数据更新提醒
export async function checkAndSendUpdateNotice(dataId: string, createdAt: string, updatedAt?: string): Promise<void> {
  const config = await getConfig();
  
  // 如果通知功能未启用，直接返回
  if (!config.enabled) {
    return;
  }
  
  const now = new Date();
  const lastUpdateDate = updatedAt ? new Date(updatedAt) : new Date(createdAt);
  const daysSinceUpdate = daysBetween(lastUpdateDate, now);
  
  // 只要数据超过指定天数未更新，每次检查都会发送通知
  if (daysSinceUpdate >= config.noticeDays) {
    console.log(`数据 ${dataId} 已有 ${daysSinceUpdate} 天未更新，发送提醒...`);
    await sendQMsgNotice(dataId, daysSinceUpdate);
  }
} 