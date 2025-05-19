/**
 * 通知服务模块 - 用于发送数据更新提醒
 */
import fs from 'fs';
import path from 'path';

// 读取配置文件
function getConfig() {
  try {
    // 确保在服务器端执行
    if (typeof window === 'undefined') {
      const configPath = path.join(process.cwd(), 'config.json');
      const configData = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      return configData.notification;
    } else {
      // 如果在客户端，可以通过API获取配置
      // 简单起见这里返回默认值，实际项目中可以实现一个API接口获取配置
      return {
        enabled: true,
        noticeDays: 14,
        qmsgKey: '',
        qqNumber: ''
      };
    }
  } catch (error) {
    console.error('读取配置文件失败:', error);
    return {
      enabled: false,
      noticeDays: 14,
      qmsgKey: '',
      qqNumber: ''
    };
  }
}

// 计算日期差异（天数）
export function daysBetween(date1: Date, date2: Date): number {
  const oneDay = 24 * 60 * 60 * 1000; // 一天的毫秒数
  const diffTime = Math.abs(date2.getTime() - date1.getTime());
  return Math.floor(diffTime / oneDay);
}

// 检查数据是否需要发送更新提醒
export function shouldSendNotice(createdAt: string, updatedAt?: string): boolean {
  const config = getConfig();
  
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
  const config = getConfig();
  
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
  const config = getConfig();
  
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