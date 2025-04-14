# 数据管理系统

一个基于Next.js和React开发的现代化数据管理系统，用于管理和监控数据更新状态，并在数据长时间未更新时发送通知提醒。

## 功能特点

- ✨ 简洁现代的用户界面，支持深色/浅色模式
- 📊 直观的数据列表和详情展示
- 🔄 实时数据更新状态监控
- 🔔 自动检测数据更新状态，长时间未更新自动发送通知
- 🌐 多语言支持（中文、英文）
- 📱 响应式设计，支持各种设备尺寸

## 技术栈

- **前端框架**: Next.js 14 + React 18
- **UI组件**: Shadcn UI + Tailwind CSS
- **状态管理**: React Hooks
- **数据请求**: Fetch API
- **动画效果**: Framer Motion
- **日期处理**: date-fns
- **表单处理**: React Hook Form
- **图标**: Lucide React

## 安装指南

### 前提条件

- Node.js 18.x 或更高版本
- npm 或 yarn 或 pnpm

### 安装步骤

1. 克隆仓库

```bash
git clone https://github.com/your-username/data-management.git
cd data-management
```

2. 安装依赖

```bash
npm install
# 或使用 yarn
yarn install
# 或使用 pnpm
pnpm install
```

3. 配置环境变量

创建`.env.local`文件，添加以下配置：

```
# 通知相关配置
NOTICE_DAYS=14
QMSG_KEY=your_qmsg_key_here
QQ_NUMBER=your_qq_number_here

# 客户端可访问的环境变量
NEXT_PUBLIC_NOTICE_DAYS=14
NEXT_PUBLIC_QMSG_KEY=your_qmsg_key_here
NEXT_PUBLIC_QQ_NUMBER=your_qq_number_here
```

4. 启动开发服务器

```bash
npm run dev
# 或使用 yarn
yarn dev
# 或使用 pnpm
pnpm dev
```

5. 访问开发服务器

打开浏览器访问 http://localhost:3000

## 环境变量说明

| 变量名 | 描述 | 默认值 | 是否必需 |
|--------|------|--------|---------|
| NOTICE_DAYS | 数据未更新多少天后发送通知 | 14 | 否 |
| QMSG_KEY | QQ消息通知API密钥 | - | 是 |
| QQ_NUMBER | 接收通知的QQ号码 | - | 是 |
| NEXT_PUBLIC_NOTICE_DAYS | 客户端可访问的通知天数 | 14 | 否 |
| NEXT_PUBLIC_QMSG_KEY | 客户端可访问的QQ消息API密钥 | - | 是 |
| NEXT_PUBLIC_QQ_NUMBER | 客户端可访问的QQ号码 | - | 是 |

## 部署指南

### Vercel 部署

1. 在 Vercel 上创建新项目并导入您的 Git 仓库
2. 添加环境变量（参考上面的环境变量说明）
3. 部署项目

所有环境变量都需要在 Vercel 项目设置中配置。

### 自托管部署

1. 构建生产版本

```bash
npm run build
# 或使用 yarn
yarn build
# 或使用 pnpm
pnpm build
```

2. 启动生产服务器

```bash
npm start
# 或使用 yarn
yarn start
# 或使用 pnpm
pnpm start
```

## 通知机制

系统会自动检测数据的最后更新时间：

1. 当数据加载时会检查每条数据的更新状态
2. 每24小时自动检查一次所有数据
3. 数据未更新天数超过配置的阈值（默认14天）会自动发送QQ通知
4. 一旦超过阈值，会每天持续发送通知直到数据被更新

## 更新API

系统支持两个外部更新API：

- MAX更新API: 
- ZZW更新API: 

这些API通过Next.js API路由代理调用，以避免浏览器的CORS限制。

## 页面和组件说明

- **数据仪表盘**: 显示所有数据条目的列表
- **数据项**: 展示单个数据条目的详细信息
- **创建/编辑模态框**: 用于添加新数据或编辑现有数据
- **删除确认对话框**: 删除数据前的确认提示
- **通知设置**: 显示当前配置的QQ通知信息

## 贡献指南

欢迎贡献代码、提出问题或建议。请遵循以下步骤：

1. Fork 仓库
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建Pull Request

## 许可证

MIT License

## 联系方式

如有任何问题或建议，请通过以下方式联系我们：

- 邮箱: [your-email@example.com](mailto:your-email@example.com)
- GitHub Issues: [https://github.com/your-username/data-management/issues](https://github.com/your-username/data-management/issues) 