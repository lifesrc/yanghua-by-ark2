# 花草养护应用 - Vercel 一键部署指南

## 🚀 方式一：Vercel 一键部署（推荐）

### 步骤 1: 准备工作
1. 确保代码已提交到 GitHub / GitLab / Bitbucket
2. 拥有 Vercel 账号（https://vercel.com）

### 步骤 2: 导入项目到 Vercel
1. 访问 https://vercel.com/new
2. 选择你的代码仓库
3. 点击 "Import" 导入项目

### 步骤 3: 配置项目
Vercel 会自动识别你的 Vite 项目！

**配置项：**
- Project Name: `plant-care-app`
- Framework Preset: `Vite`
- Root Directory: `./`（保持默认）
- Build Command: `npm run vercel-build`（已自动配置）
- Output Directory: `dist`（已自动配置）

### 步骤 4: 设置环境变量（可选）
在 Vercel 项目设置中添加：
```
JWT_SECRET=your-very-secret-jwt-key-here-change-in-production
```

### 步骤 5: 点击部署！
点击 **Deploy** 按钮，等待约 2 分钟

---

## 📁 项目文件结构说明

```
养花-by-ark2/
├── api/                      # Vercel Serverless Functions
│   ├── auth.ts              # 登录/注册接口
│   ├── plants.ts            # 植物管理接口
│   ├── records.ts           # 养护记录接口
│   └── stats.ts             # 统计数据接口
├── client/src/               # 前端 Vue 代码
├── server/                   # 本地开发用的 Express 服务
├── vercel.json              # Vercel 配置文件
├── vite.config.ts           # Vite 配置
└── package.json             # 依赖配置
```

---

## 🔌 API 接口说明

部署后可访问的接口：

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/auth?action=login` | 登录 |
| POST | `/api/auth?action=register` | 注册 |
| GET | `/api/plants` | 获取植物列表 |
| POST | `/api/plants` | 添加植物 |
| GET | `/api/records` | 获取养护记录 |
| GET | `/api/records?date=2026-05-12` | 获取指定日期记录 |
| POST | `/api/records` | 添加记录 |
| GET | `/api/stats?type=summary` | 获取统计概览 |
| GET | `/api/stats?type=trend` | 获取趋势数据 |

**演示账号：**
- 邮箱: `demo@example.com`
- 密码: `demo123456`

---

## ⚠️ 关于数据持久化

### 当前状态：内存存储
- **当前实现**：API 数据存储在内存中
- **限制**：每次冷启动或重新部署后数据会重置
- **适用**：演示、预览、临时使用

### 生产环境方案（三选一）

**方案 A：Turso（推荐，SQLite 兼容）**
```bash
# 安装 Turso CLI
curl -sSfL https://get.tur.so/install.sh | bash

# 登录并创建数据库
turso auth login
turso db create plant-care
turso db show plant-care --url

# 在 Vercel 环境变量中添加
TURSO_DATABASE_URL=libsql://xxx.turso.io
TURSO_AUTH_TOKEN=...
```

**方案 B：PostgreSQL（Vercel Postgres）**
1. 在 Vercel 项目中选择 Storage → Create Database
2. 选择 PostgreSQL，创建数据库
3. Vercel 自动配置环境变量

**方案 C：Upstash Redis**
适合简单数据存储，免费额度充足

---

## 🎯 部署后优化建议

### 1. 添加自定义域名
- Vercel Dashboard → Settings → Domains
- 添加你的域名，如 `plant-care.yourname.com`
- Vercel 自动配置 SSL

### 2. 开启 Password Protection（可选）
- Settings → General → Protection
- 开启密码保护，防止公开访问

### 3. 分析功能
- Vercel Analytics：查看访问量、性能数据
- Web Vitals：前端性能指标

---

## 🐛 部署故障排查

### 问题 1: 构建失败
**解决方案：**
```bash
# 本地先测试构建
npm run build
```
确保本地构建成功再部署

### 问题 2: API 接口 404
**检查：**
- `api/` 目录是否在项目根目录
- 文件名是否正确（小写，无特殊字符）
- vercel.json 中的 routes 配置

### 问题 3: 跨域错误
**已解决：** API 文件中已添加：
```javascript
res.setHeader('Access-Control-Allow-Origin', '*')
```

---

## 📱 移动端访问

部署成功后，你可以：
- ✅ 手机浏览器直接访问
- ✅ 添加到主屏（PWA 体验）
- ✅ 分享给朋友使用

---

## 🔄 自动部署

每次推送到 GitHub 的 main/master 分支：
- Vercel 自动触发构建
- 自动部署到生产环境
- 无需手动操作

---

## 📊 部署成功后验证

访问你的 Vercel 域名：
```
1. 打开首页，看到登录页
2. 用 demo@example.com / demo123456 登录
3. 选择植物，测试浇水/施肥功能
4. 切换到日历和统计页面查看
```

---

**部署遇到问题？** 查看 Vercel 部署日志获取详细错误信息！
