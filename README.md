# 🌱 花草养护记录应用

一款清新的移动端花草养护记录 H5 应用，帮您轻松记录植物的每一次浇水施肥。

## ✨ 功能特点

- 🔐 用户注册/登录 - JWT 认证
- 🌿 植物管理 - 添加、管理您的绿植
- 💧 浇水记录 - 自动记录时间，可选描述和照片
- 🧪 施肥记录 - 同上
- 📅 日历视图 - 查看每日养护记录
- 📊 数据统计 - 趋势图、分布图
- 🎨 莫兰迪配色 - 清新自然的界面设计

## 🚀 快速开始

### 本地开发

```bash
# 安装依赖
npm install

# 启动前后端
npm run dev
```

访问 http://localhost:3000

### Vercel 一键部署

[![Deploy with Vercel](https://vercel.com/button)

**部署步骤详见 [DEPLOY.md](./DEPLOY.md)

## 🛠 技术栈

| 前端 | 后端 |
|------|------|
| Vue 3 + TypeScript | Express |
| Pinia | Node.js |
| Vant UI | SQLite / Vercel Serverless |
| Vite | JWT |
| ECharts | Multer |
| Day.js | |

## 📱 演示账号

| 邮箱 | 密码 |
|------|------|
| demo@example.com | demo123456 |

## 📁 项目结构

```
.
├── api/                  # Vercel Serverless Functions
│   ├── auth.ts          # 认证接口
│   ├── plants.ts      # 植物接口
│   ├── records.ts   # 记录接口
│   └── stats.ts    # 统计接口
├── client/           # 前端 Vue
│   ├── src/
│   └── views/     # 页面组件
│   └── stores/    # Pinia 状态管理
│   └── styles/   # 全局样式
├── server/         # 本地 Express 服务
├── vercel.json    # Vercel 配置
└── DEPLOY.md     # 部署指南
```

## 🎨 设计理念

- **莫兰迪配色** - 柔和不刺眼，绿色系为主
- **动效自然** - 卡片悬浮、页面切换丝滑过渡
- **操作直观** - 大按钮、直观操作，手机友好

## 📄 License

MIT
