import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 转换预约数据格式，将多个星期的预约分割成单独的预约项
 * 
 * 输入格式：
 * [
 *   {
 *     username: "user1",
 *     password: "pass1",
 *     time: ["09:00", "22:00"],
 *     roomid: "101",
 *     seatid: ["001", "002"],
 *     daysofweek: ["Monday", "Tuesday", "Wednesday"]
 *   }
 * ]
 * 
 * 输出格式：
 * [
 *   {
 *     username: "user1",
 *     password: "pass1",
 *     time: ["09:00", "22:00"],
 *     roomid: "101",
 *     seatid: ["001", "002"],
 *     daysofweek: ["Monday"]
 *   },
 *   {
 *     username: "user1",
 *     password: "pass1",
 *     time: ["09:00", "22:00"],
 *     roomid: "101",
 *     seatid: ["001", "002"],
 *     daysofweek: ["Tuesday"]
 *   },
 *   ...
 * ]
 */
export function transformReservationFormat(reservations: any[]): any[] {
  // 如果没有预约，直接返回空数组
  if (!reservations || !reservations.length) {
    return [];
  }

  // 处理结果数组
  const result: any[] = [];

  // 遍历所有预约
  reservations.forEach(reservation => {
    // 如果没有daysofweek或为空数组，创建一个没有daysofweek的预约项
    if (!reservation.daysofweek || !reservation.daysofweek.length) {
      result.push({
        ...reservation,
        daysofweek: []
      });
      return;
    }

    // 拆分成每个星期一条记录
    reservation.daysofweek.forEach((day: string) => {
      result.push({
        ...reservation,
        daysofweek: [day] // 每个条目只包含一个星期几
      });
    });
  });

  return result;
}
