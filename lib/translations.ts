// 定义翻译键的类型
export type TranslationKey = 
  | "data-management" | "data-entries" | "refresh" | "create-new" | "create-new-entry"
  | "welcome" | "enter-password" | "password" | "login" | "incorrect-password"
  | "created" | "updated" | "json-data" | "cookie-data" | "edit-data" | "view-full"
  | "create-data" | "data-id" | "enter-id" | "visual-editor" | "raw-json" | "cancel" 
  | "creating" | "updating" | "update-data" | "are-you-sure" | "delete-confirm"
  | "cannot-undo" | "delete" | "deleting" | "reservation-data" | "other-properties"
  | "reservation-schedule" | "add-reservation" | "no-reservations" | "add-first"
  | "reservation" | "username" | "password" | "room-id" | "time-range" | "seat-ids" 
  | "add-seat" | "days-of-week" | "new-property-key" | "value" | "drag-drop" | "or"
  | "choose-file" | "cookie-placeholder" | "no-data" | "create-first" | "light-mode"
  | "dark-mode" | "create-data-description" | "edit-data-description" | "view-json-desc"
  | "view-cookie-desc" | "english" | "chinese" | "select-user" | "select-user-description"
  | "no-users-found" | "back-to-users" | "user-dashboard" | "logout" | "reservations"
  | "no-reservations-for-day" | "add-reservation-for-day" | "select-day-to-view"
  | "user-has-no-data" | "no-data-available" | "error-loading-data" | "could-not-fetch-user-data"
  | "success" | "error" | "reservation-data-updated" | "reservation-added" | "reservation-updated"
  | "reservation-removed" | "property-added" | "property-updated" | "property-removed"
  | "failed-to-add-property" | "failed-to-update-property" | "notification" | "loading-notice-error";

// 定义翻译记录的类型，包含索引签名
export type TranslationRecord = Record<TranslationKey, string> & {
  [key: string]: string;
};

// 导出翻译对象类型，支持字符串索引
export interface TranslationsType {
  [language: string]: {
    [key: string]: string;
  };
}

// 导出翻译对象
export const translations: TranslationsType = {
  en: {
    // Header
    "data-management": "Data Management",
    "data-entries": "Data Entries",
    refresh: "Refresh",
    "create-new": "Create New",
    "create-new-entry": "Create New Entry",

    // Login
    welcome: "Welcome",
    "enter-password": "Please enter password to continue",
    password: "Password",
    login: "Login",
    "incorrect-password": "Incorrect password. Please try again.",

    // Data Items
    created: "Created",
    updated: "Updated",
    "json-data": "JSON Data",
    "cookie-data": "Cookie Data",
    "edit-data-btn": "Edit Data",
    "view-full": "View Full",

    // Modals
    "create-data": "Create New Data",
    "edit-data-title": "Edit Data",
    "data-id": "Data ID",
    "enter-id": "Enter a unique identifier",
    "visual-editor": "Visual Editor",
    "raw-json": "Raw JSON",
    cancel: "Cancel",
    creating: "Creating...",
    updating: "Updating...",
    "update-data": "Update Data",

    // Delete
    "are-you-sure": "Are you sure?",
    "delete-confirm": "This will permanently delete the data with ID",
    "cannot-undo": "This action cannot be undone.",
    delete: "Delete",
    deleting: "Deleting...",

    // JSON Editor
    "reservation-data": "Reservation Data",
    "other-properties": "Other Properties",
    "reservation-schedule": "Reservation Schedule",
    "add-reservation": "Add Reservation",
    "no-reservations": "No reservations added yet",
    "add-first-reservation": "Add your first reservation",
    reservation: "Reservation",
    username: "Username",
    "password-field": "Password",
    "room-id": "Room ID",
    "time-range": "Time Range",
    "seat-ids": "Seat IDs",
    "add-seat": "Add Seat",
    "days-of-week": "Days of Week",
    "new-property-key": "New Property Key",
    value: "Value",

    // Cookie Editor
    "drag-drop": "Drag and drop a text file here",
    or: "or",
    "choose-file": "Choose File",
    "cookie-placeholder": "Enter cookie data or upload a text file",

    // Empty States
    "no-data": "No data entries found",
    "create-first-data": "Create your first data entry to get started.",

    // Theme
    "light-mode": "Light Mode",
    "dark-mode": "Dark Mode",

    // Dialog descriptions
    "create-data-description": "Fill in the details to create a new data entry",
    "edit-data-description": "Modify the JSON and Cookie data for this entry",
    "view-json-desc": "View the complete JSON data structure",
    "view-cookie-desc": "View the complete Cookie data content",

    // Language
    english: "English",
    chinese: "中文",
    
    // User Selection
    "select-user": "Select User",
    "select-user-description": "Choose a user to manage their data",
    "no-users-found": "No users found",
    "back-to-users": "Back to Users",
    "user-dashboard": "User Dashboard",
    "logout": "Logout",
    
    // 新增的预约分组翻译
    "reservations": "Reservations",
    "no-reservations-for-day": "No reservations for {day}",
    "add-reservation-for-day": "Add reservation for {day}",
    "select-day-to-view": "Select a day to view or edit reservations",
    "user-has-no-data": "This user has no data records",
    "no-data-available": "No Data Available",
    "error-loading-data": "Error Loading Data",
    "could-not-fetch-user-data": "Could not fetch user data",
    
    // Toast消息
    "success": "Success",
    "error": "Error",
    "reservation-data-updated": "Reservation data has been updated successfully",
    "reservation-added": "New reservation has been added",
    "reservation-updated": "Reservation has been updated",
    "reservation-removed": "Reservation has been removed",
    "property-added": "Property has been added",
    "property-updated": "Property has been updated",
    "property-removed": "Property has been removed",
    "failed-to-add-property": "Failed to add property",
    "failed-to-update-property": "Failed to update property",
    
    // 通知横幅
    "notification": "Notification",
    "loading-notice-error": "Error loading notification content"
  },
  zh: {
    // 页眉
    "data-management": "数据管理",
    "data-entries": "数据条目",
    refresh: "刷新",
    "create-new": "新建",
    "create-new-entry": "新建数据条目",

    // 登录
    welcome: "欢迎",
    "enter-password": "请输入密码继续",
    password: "密码",
    login: "登录",
    "incorrect-password": "密码错误，请重试。",

    // 数据项
    created: "创建于",
    updated: "更新于",
    "json-data": "JSON 数据",
    "cookie-data": "Cookie 数据",
    "edit-data-btn": "编辑数据",
    "view-full": "查看全部",

    // 模态框
    "create-data": "创建新数据",
    "edit-data-title": "编辑数据",
    "data-id": "数据 ID",
    "enter-id": "输入唯一标识符",
    "visual-editor": "可视化编辑器",
    "raw-json": "原始 JSON",
    cancel: "取消",
    creating: "创建中...",
    updating: "更新中...",
    "update-data": "更新数据",

    // 删除
    "are-you-sure": "确定吗？",
    "delete-confirm": "这将永久删除 ID 为",
    "cannot-undo": "的数据。此操作无法撤销。",
    delete: "删除",
    deleting: "删除中...",

    // JSON 编辑器
    "reservation-data": "预约数据",
    "other-properties": "其他属性",
    "reservation-schedule": "预约计划",
    "add-reservation": "添加预约",
    "no-reservations": "暂无预约",
    "add-first-reservation": "添加您的第一个预约",
    reservation: "预约",
    username: "用户名",
    "password-field": "密码",
    "room-id": "房间 ID",
    "time-range": "时间范围",
    "seat-ids": "座位 ID",
    "add-seat": "添加座位",
    "days-of-week": "星期",
    "new-property-key": "新属性键",
    value: "值",

    // Cookie 编辑器
    "drag-drop": "拖放文本文件到这里",
    or: "或",
    "choose-file": "选择文件",
    "cookie-placeholder": "输入 cookie 数据或上传文本文件",

    // 空状态
    "no-data": "未找到数据条目",
    "create-first-data": "创建您的第一个数据条目以开始。",

    // 主题
    "light-mode": "浅色模式",
    "dark-mode": "深色模式",

    // Dialog descriptions
    "create-data-description": "填写详细信息以创建新的数据条目",
    "edit-data-description": "修改此条目的 JSON 和 Cookie 数据",
    "view-json-desc": "查看完整的 JSON 数据结构",
    "view-cookie-desc": "查看完整的 Cookie 数据内容",

    // Language
    english: "English",
    chinese: "中文",
    
    // 用户选择
    "select-user": "选择用户",
    "select-user-description": "选择要管理的用户数据",
    "no-users-found": "未找到用户",
    "back-to-users": "返回用户列表",
    "user-dashboard": "用户仪表盘",
    "logout": "退出登录",
    
    // 新增的预约分组翻译
    "reservations": "预约记录",
    "no-reservations-for-day": "{day}没有预约记录",
    "add-reservation-for-day": "添加{day}的预约",
    "select-day-to-view": "选择一天查看或编辑预约",
    "user-has-no-data": "该用户没有数据记录",
    "no-data-available": "没有可用数据",
    "error-loading-data": "加载数据出错",
    "could-not-fetch-user-data": "无法获取用户数据",
    
    // Toast消息
    "success": "成功",
    "error": "错误",
    "reservation-data-updated": "预约数据已成功更新",
    "reservation-added": "已添加新预约",
    "reservation-updated": "预约已更新",
    "reservation-removed": "预约已移除",
    "property-added": "属性已添加",
    "property-updated": "属性已更新",
    "property-removed": "属性已移除",
    "failed-to-add-property": "添加属性失败",
    "failed-to-update-property": "更新属性失败",
    
    // 通知横幅
    "notification": "通知",
    "loading-notice-error": "加载通知内容出错"
  },
}
