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
  // 如果在浏览器环境中运行
  if (typeof window !== 'undefined') {
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
  // 服务器端环境
  else {
    try {
      // 服务器端动态导入fs和path模块
      const { readFileSync } = await import('fs');
      const { join } = await import('path');
      
      const configPath = join(process.cwd(), 'config.json');
      const configData = JSON.parse(readFileSync(configPath, 'utf8'));
      
      return {
        enabled: configData.notification.enabled ?? defaultConfig.enabled,
        noticeDays: configData.notification.noticeDays ?? defaultConfig.noticeDays,
        qmsgKey: configData.notification.qmsgKey ?? defaultConfig.qmsgKey,
        qqNumber: configData.notification.qqNumber ?? defaultConfig.qqNumber
      };
    } catch (error) {
      console.error('读取配置文件失败:', error);
      return defaultConfig;
    }
  }
}

// 计算日期差异（天数）
export function daysBetween(date1: Date, date2: Date): number {
  const oneDay = 24 * 60 * 60 * 1000; // 一天的毫秒数
  const diffTime = Math.abs(date2.getTime() - date1.getTime());
  return Math.floor(diffTime / oneDay);
}

// 检查数据是否需要发送更新提醒
export async function shouldSendNotice(createdAt: string, updatedAt?: string): Promise<boolean> {
  const config = await getConfig();
  
  // 如果通知功能未启用，直接返回false
  if (!config.enabled) {
    return false;
  }
  
  const now = new Date();
  const lastUpdateDate = updatedAt ? new Date(updatedAt) : new Date(createdAt);
  const daysSinceLastUpdate = daysBetween(lastUpdateDate, now);
  
  return daysSinceLastUpdate >= config.noticeDays;
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
    const message = encodeURIComponent(`数据提醒：ID为 ${dataId} 的数据已有 ${daysSinceUpdate} 天未更新，请检查！`);
    const url = `https://home.maxtral.fun/qmasgnotice/notice.php?qmsg_key=${config.qmsgKey}&qq_number=${config.qqNumber}&send_qmsg=${message}`;
    
    const response = await fetch(url);
    
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