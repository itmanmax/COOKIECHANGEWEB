/**
 * 通知服务模块 - 用于发送数据更新提醒
 */

// 获取环境变量，使用默认值作为备选
const NOTICE_DAYS = typeof window !== 'undefined' 
  ? process.env.NEXT_PUBLIC_NOTICE_DAYS || '14'
  : process.env.NOTICE_DAYS || '14';
  
const QMSG_KEY = typeof window !== 'undefined'
  ? process.env.NEXT_PUBLIC_QMSG_KEY || ''
  : process.env.QMSG_KEY || '';
  
const QQ_NUMBER = typeof window !== 'undefined'
  ? process.env.NEXT_PUBLIC_QQ_NUMBER || ''
  : process.env.QQ_NUMBER || '';

// 计算日期差异（天数）
export function daysBetween(date1: Date, date2: Date): number {
  const oneDay = 24 * 60 * 60 * 1000; // 一天的毫秒数
  const diffTime = Math.abs(date2.getTime() - date1.getTime());
  return Math.floor(diffTime / oneDay);
}

// 检查数据是否需要发送更新提醒
export function shouldSendNotice(createdAt: string, updatedAt?: string): boolean {
  const now = new Date();
  const lastUpdateDate = updatedAt ? new Date(updatedAt) : new Date(createdAt);
  const daysSinceLastUpdate = daysBetween(lastUpdateDate, now);
  
  return daysSinceLastUpdate >= parseInt(NOTICE_DAYS, 10);
}

// 发送QMsg通知
export async function sendQMsgNotice(dataId: string, daysSinceUpdate: number): Promise<boolean> {
  if (!QMSG_KEY || !QQ_NUMBER) {
    console.error('环境变量未配置: QMSG_KEY 或 QQ_NUMBER');
    return false;
  }

  try {
    const message = encodeURIComponent(`数据提醒：ID为 ${dataId} 的数据已有 ${daysSinceUpdate} 天未更新，请检查！`);
    const url = `https://home.maxtral.fun/qmasgnotice/notice.php?qmsg_key=${QMSG_KEY}&qq_number=${QQ_NUMBER}&send_qmsg=${message}`;
    
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
  const now = new Date();
  const lastUpdateDate = updatedAt ? new Date(updatedAt) : new Date(createdAt);
  const daysSinceUpdate = daysBetween(lastUpdateDate, now);
  
  // 修改逻辑：只要数据超过指定天数（默认14天）未更新，每次检查都会发送通知
  if (daysSinceUpdate >= parseInt(NOTICE_DAYS, 10)) {
    console.log(`数据 ${dataId} 已有 ${daysSinceUpdate} 天未更新，发送提醒...`);
    await sendQMsgNotice(dataId, daysSinceUpdate);
  }
} 