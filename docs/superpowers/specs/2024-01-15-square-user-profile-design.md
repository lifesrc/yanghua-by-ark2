# 广场页与用户信息页设计文档

## 概述
本次设计实现两个核心功能：
1. **广场页**：展示所有人的养护记录，支持无限滚动加载
2. **用户信息页**：点击用户头像/用户名进入，展示用户的基本信息、植物列表、养护记录、统计数据

## 一、后端API设计

### 1.1 获取所有人的养护记录（分页）
```
GET /api/records/all
```

**Query参数：**
| 参数 | 类型 | 必填 | 默认 | 说明 |
|------|------|------|------|------|
| limit | number | 否 | 15 | 每页数量 |
| offset | number | 否 | 0 | 偏移量 |

**响应示例：**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "user_id": 2,
      "username": "张三",
      "user_avatar": null,
      "plant_id": 3,
      "plant_name": "绿萝",
      "type": "water",
      "description": "今天阳光不错，给绿萝浇点水",
      "created_at": "2024-01-15 10:30:00",
      "images": [
        {
          "id": 1,
          "image_path": "/uploads/xxx.jpg"
        }
      ]
    }
  ]
}
```

---

### 1.2 获取用户公开信息
```
GET /api/users/:id
```

**响应示例：**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "username": "张三",
    "avatar": null,
    "created_at": "2024-01-01 12:00:00"
  }
}
```

---

### 1.3 获取用户的植物列表
```
GET /api/users/:id/plants
```

**响应示例：**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "绿萝",
      "type": "foliage",
      "image": "/uploads/xxx.jpg",
      "notes": "放在客厅的绿萝"
    }
  ]
}
```

---

### 1.4 获取用户的养护记录（分页）
```
GET /api/users/:id/records
```

**Query参数：** 同 1.1

**响应示例：** 同 1.1

---

### 1.5 获取用户统计数据
```
GET /api/users/:id/stats
```

**响应示例：**
```json
{
  "success": true,
  "data": {
    "plant_count": 5,
    "total_records": 100,
    "water_count": 60,
    "fertilize_count": 40
  }
}
```

---

### 1.6 获取单个植物详情
```
GET /api/plants/:id/detail
```

**响应示例：**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "user_id": 2,
    "username": "张三",
    "user_avatar": null,
    "name": "绿萝",
    "type": "foliage",
    "image": "/uploads/xxx.jpg",
    "notes": "放在客厅的绿萝",
    "created_at": "2024-01-01"
  }
}
```

---

### 1.7 获取单个植物的养护记录（分页）
```
GET /api/plants/:id/records
```

**Query参数：** 同 1.1

**响应示例：** 同 1.1

---

## 二、前端公共组件设计

### 2.1 RecordCard.vue - 记录卡片组件

**Props：**
| 参数 | 类型 | 必填 | 默认 | 说明 |
|------|------|------|------|------|
| record | CareRecord | 是 | - | 记录数据 |
| showUser | boolean | 否 | true | 是否显示用户信息 |
| showPlant | boolean | 否 | true | 是否显示植物名称 |
| layout | 'timeline' | 'social' | 否 | 'social' | 布局样式 |

**交互：**
- 点击头像/用户名 → 跳转到 `/user/:userId`
- 点击植物名称 → 跳转到 `/plant/:plantId`
- 点击图片 → 图片预览

**布局（social样式 - 广场页用）：**
```
┌─────────────────────────────────┐
│ [头像]                         │
│ 用户名                    2小时前 │
├─────────────────────────────────┤
│ 💧 给「绿萝」浇水了          │
│                                 │
│ 今天阳光不错，给绿萝浇点水...   │
│                                 │
│ [图片1][图片2][图片3]         │
└─────────────────────────────────┘
```

**布局（timeline样式 - 其他页面用）：**
```
┌─────────────────────────────────┐
│ [头像] 用户名 养护了 「绿萝」   │
│ 💧 浇水                      │
│ 今天阳光不错，给绿萝浇点水...   │
│ [图片1][图片2][图片3]         │
│                          2小时前 │
└─────────────────────────────────┘
```

---

### 2.2 PlantCard.vue - 植物卡片组件

**Props：**
| 参数 | 类型 | 必填 | 默认 | 说明 |
|------|------|------|------|------|
| plant | Plant | 是 | - | 植物数据 |
| mode | 'select' | 'detail' | 否 | 'detail' | 点击模式 |
| selected | boolean | 否 | false | 是否选中（select模式） |
| showEdit | boolean | 否 | false | 是否显示编辑按钮 |

**交互：**
- `mode='select'`：点击 → 触发 select 事件（首页用）
- `mode='detail'`：点击 → 跳转到 `/plant/:plantId`
- 点击编辑按钮 → 触发 edit 事件

**布局：**
```
┌─────────────┐
│ [植物图片]  │
│ 绿萝      ✏︎│ ← 编辑按钮（showEdit=true时）
│ 观叶植物   │
└─────────────┘
```

---

## 三、页面设计

### 3.1 Square.vue - 广场页

**路由：** `/square`

**页面结构：**
```
┌─────────────────────────┐
│          广场            │ ← 页面标题
├─────────────────────────┤
│                         │
│  <van-list>             │ ← Vant列表组件，无限滚动
│    <RecordCard />       │ ← showUser=true, showPlant=true, layout='social'
│    <RecordCard />       │
│    ...                 │
│  </van-list>            │
│                         │
│  正在加载... / 没有更多了  │
└─────────────────────────┘
```

**交互逻辑：**
1. 页面加载时获取第一页数据（limit=15, offset=0）
2. 使用 `<van-list>` 组件监听滚动到底部事件
3. 滚动到底部时自动加载下一页（offset += 15）
4. 如果返回数据 < 15 条，显示"没有更多了"

---

### 3.2 PlantDetail.vue - 植物详情页

**路由：** `/plant/:id`

**页面结构：**
```
┌─────────────────────────────────┐
│  ←         植物详情            │ ← 导航栏
├─────────────────────────────────┤
│                                 │
│  ┌───────────────────────┐    │
│  │     [植物大图]        │    │
│  │                       │    │
│  │  绿萝                 │    │
│  │  观叶植物             │    │
│  │                       │    │
│  │  [所属用户：张三 →]   │    │ ← 如果是别人的植物
│  │                       │    │
│  │  [浇水] [施肥] [编辑] │    │ ← 如果是自己的植物
│  └───────────────────────┘    │
│                                 │
│  ┌───────────────────────┐    │
│  │  养护记录             │    │
│  │  <RecordCard />       │    │ ← showUser=false, showPlant=false
│  │  ...                 │    │
│  └───────────────────────┘    │
└─────────────────────────────────┘
```

**混合模式逻辑：**
```javascript
const isOwner = plant.user_id === currentUser.id

if (isOwner) {
  // 显示：浇水按钮、施肥按钮、编辑按钮
  // 可以进行所有操作
} else {
  // 显示：查看TA的主页按钮（跳转到用户信息页）
  // 只读模式
}
```

---

### 3.3 UserProfile.vue - 用户信息页

**路由：** `/user/:id`

**页面结构：**
```
┌─────────────────────────────────┐
│  ←        个人主页            │ ← 导航栏
├─────────────────────────────────┤
│                                 │
│      ┌─────────────┐          │
│      │   [头像]    │          │
│      │             │          │
│      │    张三     │          │
│      └─────────────┘          │
│                                 │
│  ┌─────────────────────────┐  │
│  │  注册时间：2024-01-01  │  │ ← 直接显示
│  └─────────────────────────┘  │
│                                 │
│  ┌─────────────────────────┐  │
│  │  📊 我的统计         → │  │ ← 点击跳转 /user/:id/stats
│  └─────────────────────────┘  │
│                                 │
│  ┌─────────────────────────┐  │
│  │  🌱 我的植物         → │  │ ← 点击跳转 /user/:id/plants
│  └─────────────────────────┘  │
│                                 │
│  ┌─────────────────────────┐  │
│  │  📝 养护记录         → │  │ ← 点击跳转 /user/:id/records
│  └─────────────────────────┘  │
└─────────────────────────────────┘
```

---

### 3.4 UserPlants.vue - 用户植物列表页

**路由：** `/user/:id/plants`

**页面结构：**
```
┌─────────────────────────────────┐
│  ←      xxx的植物             │
├─────────────────────────────────┤
│                                 │
│  <PlantCard mode="detail" />   │
│  <PlantCard mode="detail" />   │ ← showEdit=false
│  ...                           │
│                                 │
└─────────────────────────────────┘
```

---

### 3.5 UserRecords.vue - 用户养护记录页

**路由：** `/user/:id/records`

**页面结构：**
```
┌─────────────────────────────────┐
│  ←      xxx的养护记录         │
├─────────────────────────────────┤
│                                 │
│  <van-list>                     │
│    <RecordCard                  │
│      showUser=false             │
│      showPlant=true             │
│      layout="timeline"          │
│    />                           │
│    ...                         │
│  </van-list>                    │
└─────────────────────────────────┘
```

---

### 3.6 Stats.vue - 统计页面（复用，支持参数）

**路由：** 
- `/stats` - 我的统计
- `/user/:id/stats` - 某用户的统计

**修改点：**
1. 读取路由参数 `userId`
2. 如果有 `userId`，调用 `/api/users/:id/stats`
3. 如果没有 `userId`，调用原有的 `/api/stats`
4. 标题改为：`userId ? 'xxx的统计' : '我的统计'`

---

### 3.7 Home.vue - 首页（重构，改用组件）

**修改点：**
1. 植物列表改用 `<PlantCard mode="select" showEdit=true />`
2. 记录列表改用 `<RecordCard showUser=false showPlant=!selectedPlant layout="timeline" />`
3. 功能保持不变：点击植物 → 选中 → 显示浇水/施肥按钮

---

## 四、路由配置

新增路由：
```javascript
{
  path: '/square',
  name: 'Square',
  component: () => import('@/views/Square.vue'),
  meta: { requiresAuth: true }
},
{
  path: '/plant/:id',
  name: 'PlantDetail',
  component: () => import('@/views/PlantDetail.vue'),
  meta: { requiresAuth: true }
},
{
  path: '/user/:id',
  name: 'UserProfile',
  component: () => import('@/views/UserProfile.vue'),
  meta: { requiresAuth: true }
},
{
  path: '/user/:id/plants',
  name: 'UserPlants',
  component: () => import('@/views/UserPlants.vue'),
  meta: { requiresAuth: true }
},
{
  path: '/user/:id/records',
  name: 'UserRecords',
  component: () => import('@/views/UserRecords.vue'),
  meta: { requiresAuth: true }
}
```

修改路由：
```javascript
{
  path: '/stats',
  name: 'Stats',
  component: () => import('@/views/Stats.vue'),
  meta: { requiresAuth: true }
},
{
  path: '/user/:id/stats',
  name: 'UserStats',
  component: () => import('@/views/Stats.vue'),
  meta: { requiresAuth: true }
}
```

---

## 五、TabBar 修改

```vue
<van-tabbar v-model="active" route active-color="#8FA98F">
  <van-tabbar-item icon="home-o" to="/home">首页</van-tabbar-item>
  <van-tabbar-item icon="cluster-o" to="/square">广场</van-tabbar-item>  <!-- 新增 -->
  <van-tabbar-item icon="calendar-o" to="/calendar">日历</van-tabbar-item>
  <van-tabbar-item icon="chart-trending-o" to="/stats">统计</van-tabbar-item>
</van-tabbar>
```

---

## 六、数据类型定义

新增/更新 types/index.ts：

```typescript
// 广场页记录（带用户信息）
export interface SquareRecord extends CareRecord {
  username: string
  user_avatar?: string
}

// 植物详情
export interface PlantDetail extends Plant {
  username: string
  user_avatar?: string
}

// 用户统计
export interface UserStats {
  plant_count: number
  total_records: number
  water_count: number
  fertilize_count: number
}
```

---

## 七、开发顺序

1. **后端API优先**：先开发所有后端接口
2. **公共组件**：RecordCard.vue、PlantCard.vue
3. **广场页**：Square.vue
4. **植物详情页**：PlantDetail.vue
5. **用户信息页**：UserProfile.vue
6. **用户植物列表**：UserPlants.vue
7. **用户养护记录**：UserRecords.vue
8. **统计页改造**：Stats.vue 支持 userId 参数
9. **首页重构**：Home.vue 改用公共组件
10. **路由和TabBar**：最后整合

---

## 八、注意事项

1. **权限控制**：所有API都需要登录，但获取别人的数据是公开的
2. **分页统一**：所有列表页统一使用 limit + offset 分页机制
3. **图片处理**：统一使用现有的图片上传和预览逻辑
4. **类型一致性**：确保前后端数据类型一致
5. **错误处理**：统一处理API错误，使用Toast提示用户
