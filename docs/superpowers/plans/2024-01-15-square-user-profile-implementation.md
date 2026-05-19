# 广场页与用户信息页实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现广场页展示所有人的养护记录、用户信息页展示用户详情，以及重构Home.vue页面

**Architecture:** 后端使用Node.js + Express + SQLite提供API，前端使用Vue 3 + TypeScript + Vant UI组件库，通过Pinia管理状态，Vue Router实现路由。提取RecordCard和PlantCard公共组件，实现页面复用。

**Tech Stack:** Vue 3, TypeScript, Vant UI, Pinia, Node.js, Express, SQLite

---

## 文件结构

### 后端文件
- `server/src/repositories/record.repository.ts` - 新增获取所有用户记录的方法
- `server/src/repositories/plant.repository.ts` - 新增获取用户植物列表的方法
- `server/src/repositories/user.repository.ts` - 新增用户信息和统计数据的方法
- `server/src/controllers/record.controller.ts` - 新增获取所有记录的API
- `server/src/controllers/plant.controller.ts` - 新增获取用户植物列表的API
- `server/src/controllers/user.controller.ts` - 新增用户信息和统计数据的API
- `server/src/routes/index.ts` - 新增路由配置

### 前端文件
- `client/src/types/index.ts` - 新增类型定义
- `client/src/components/RecordCard.vue` - 新增记录卡片组件
- `client/src/components/PlantCard.vue` - 新增植物卡片组件
- `client/src/views/Square.vue` - 新增广场页
- `client/src/views/PlantDetail.vue` - 新增植物详情页
- `client/src/views/UserProfile.vue` - 新增用户信息页
- `client/src/views/UserPlants.vue` - 新增用户植物列表页
- `client/src/views/UserRecords.vue` - 新增用户养护记录页
- `client/src/views/Stats.vue` - 改造统计页
- `client/src/views/Home.vue` - 重构首页
- `client/src/router/index.ts` - 新增路由配置
- `client/src/components/TabBar.vue` - 新增TabBar

---

## 任务分解

### 任务1: 后端API - 记录仓库新增方法

**Files:**
- Modify: `server/src/repositories/record.repository.ts`

- [ ] **Step 1: 新增获取所有用户养护记录的方法**

```typescript
// 新增方法
findAllWithImages(limit = 15, offset = 0): Promise<CareRecord[]> {
  return new Promise((resolve, reject) => {
    const params: any[] = [limit, offset]
    
    db.all(`
      SELECT cr.*, p.name as plant_name, p.image as plant_image,
             u.username as username, u.avatar as user_avatar,
             ri.id as image_id, ri.image_path
      FROM care_records cr
      LEFT JOIN plants p ON cr.plant_id = p.id
      LEFT JOIN users u ON cr.user_id = u.id
      LEFT JOIN record_images ri ON cr.id = ri.record_id
      ORDER BY cr.created_at DESC
      LIMIT ? OFFSET ?
    `, params, (err, rows: any) => {
      if (err) {
        console.error('SQL error:', err)
        reject(err)
      } else {
        console.log('SQL rows:', rows.length)
        resolve(groupRecordsWithImages(rows))
      }
    })
  })
}

// 新增方法
findByUserIdWithImagesPagination(userId: number, limit = 15, offset = 0): Promise<CareRecord[]> {
  return new Promise((resolve, reject) => {
    const params: any[] = [userId, limit, offset]
    
    db.all(`
      SELECT cr.*, p.name as plant_name, p.image as plant_image,
             u.username as username, u.avatar as user_avatar,
             ri.id as image_id, ri.image_path
      FROM care_records cr
      LEFT JOIN plants p ON cr.plant_id = p.id
      LEFT JOIN users u ON cr.user_id = u.id
      LEFT JOIN record_images ri ON cr.id = ri.record_id
      WHERE cr.user_id = ?
      ORDER BY cr.created_at DESC
      LIMIT ? OFFSET ?
    `, params, (err, rows: any) => {
      if (err) {
        console.error('SQL error:', err)
        reject(err)
      } else {
        console.log('SQL rows:', rows.length)
        resolve(groupRecordsWithImages(rows))
      }
    })
  })
}
```

- [ ] **Step 2: 更新CareRecord接口**

```typescript
export interface CareRecord {
  id: number
  user_id: number
  plant_id: number
  plant_name?: string
  plant_image?: string
  type: 'water' | 'fertilize'
  description?: string
  image?: string
  images?: RecordImage[]
  created_at: string
  username?: string  // 新增
  user_avatar?: string  // 新增
}
```

- [ ] **Step 3: 提交**

```bash
cd server
git add src/repositories/record.repository.ts
git commit -m "feat: 新增获取所有用户记录和分页获取用户记录的方法"
```

---

### 任务2: 后端API - 植物仓库新增方法

**Files:**
- Modify: `server/src/repositories/plant.repository.ts`

- [ ] **Step 1: 新增获取用户植物列表的方法**

```typescript
// 新增方法
findByUserId(userId: number): Promise<Plant[]> {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM plants WHERE user_id = ? ORDER BY created_at DESC', [userId], (err, rows: any) => {
      if (err) reject(err)
      else resolve(rows as Plant[])
    })
  })
}

// 新增方法
findByIdWithUser(id: number): Promise<Plant | undefined> {
  return new Promise((resolve, reject) => {
    db.get(`
      SELECT p.*, u.username as username, u.avatar as user_avatar
      FROM plants p
      LEFT JOIN users u ON p.user_id = u.id
      WHERE p.id = ?
    `, [id], (err, row: any) => {
      if (err) reject(err)
      else resolve(row as Plant | undefined)
    })
  })
}
```

- [ ] **Step 2: 提交**

```bash
cd server
git add src/repositories/plant.repository.ts
git commit -m "feat: 新增获取用户植物列表和带用户信息的植物详情方法"
```

---

### 任务3: 后端API - 用户仓库新增方法

**Files:**
- Create: `server/src/repositories/user.repository.ts`

- [ ] **Step 1: 创建用户仓库文件**

```typescript
import db from '../config/database'

export interface User {
  id: number
  username: string
  avatar?: string
  created_at: string
}

export interface UserStats {
  plant_count: number
  total_records: number
  water_count: number
  fertilize_count: number
}

export class UserRepository {
  findById(id: number): Promise<User | undefined> {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE id = ?', [id], (err, row: any) => {
        if (err) reject(err)
        else resolve(row as User | undefined)
      })
    })
  }

  getStats(userId: number): Promise<UserStats> {
    return new Promise((resolve, reject) => {
      db.get('SELECT COUNT(*) as plant_count FROM plants WHERE user_id = ?', [userId], (err, plantRow: any) => {
        if (err) { reject(err); return }
        db.get('SELECT COUNT(*) as total_records FROM care_records WHERE user_id = ?', [userId], (err, totalRow: any) => {
          if (err) { reject(err); return }
          db.get('SELECT COUNT(*) as water_count FROM care_records WHERE user_id = ? AND type = ?', [userId, 'water'], (err, waterRow: any) => {
            if (err) { reject(err); return }
            db.get('SELECT COUNT(*) as fertilize_count FROM care_records WHERE user_id = ? AND type = ?', [userId, 'fertilize'], (err, fertilizeRow: any) => {
              if (err) { reject(err); return }
              resolve({
                plant_count: plantRow.plant_count,
                total_records: totalRow.total_records,
                water_count: waterRow.water_count,
                fertilize_count: fertilizeRow.fertilize_count
              })
            })
          })
        })
      })
    })
  }
}

export default new UserRepository()
```

- [ ] **Step 2: 提交**

```bash
cd server
git add src/repositories/user.repository.ts
git commit -m "feat: 创建用户仓库，新增获取用户信息和统计数据的方法"
```

---

### 任务4: 后端API - 记录控制器新增方法

**Files:**
- Modify: `server/src/controllers/record.controller.ts`

- [ ] **Step 1: 新增获取所有用户养护记录的API**

```typescript
async getAllRecords(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: '未登录' })
    }

    const limit = req.query.limit ? parseInt(req.query.limit as string) : 15
    const offset = req.query.offset ? parseInt(req.query.offset as string) : 0
    const records = await recordRepository.findAllWithImages(limit, offset)

    res.json({
      success: true,
      data: records
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
}

// 新增方法
async getRecordsByUserId(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: '未登录' })
    }

    const userId = parseInt(req.params.userId)
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 15
    const offset = req.query.offset ? parseInt(req.query.offset as string) : 0
    const records = await recordRepository.findByUserIdWithImagesPagination(userId, limit, offset)

    res.json({
      success: true,
      data: records
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
}
```

- [ ] **Step 2: 提交**

```bash
cd server
git add src/controllers/record.controller.ts
git commit -m "feat: 新增获取所有用户记录和用户养护记录的API"
```

---

### 任务5: 后端API - 植物控制器新增方法

**Files:**
- Modify: `server/src/controllers/plant.controller.ts`

- [ ] **Step 1: 新增获取用户植物列表和植物详情的API**

```typescript
async getPlantsByUserId(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: '未登录' })
    }

    const userId = parseInt(req.params.userId)
    const plants = await plantRepository.findByUserId(userId)

    res.json({
      success: true,
      data: plants
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
}

// 新增方法
async getPlantDetail(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: '未登录' })
    }

    const plant = await plantRepository.findByIdWithUser(parseInt(req.params.id))
    if (!plant) {
      return res.status(404).json({
        success: false,
        error: '植物不存在'
      })
    }

    res.json({
      success: true,
      data: plant
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
}
```

- [ ] **Step 2: 提交**

```bash
cd server
git add src/controllers/plant.controller.ts
git commit -m "feat: 新增获取用户植物列表和植物详情的API"
```

---

### 任务6: 后端API - 用户控制器新增方法

**Files:**
- Create: `server/src/controllers/user.controller.ts`

- [ ] **Step 1: 创建用户控制器文件**

```typescript
import { Response } from 'express'
import { AuthRequest } from '../middleware/auth'
import userRepository from '../repositories/user.repository'

export class UserController {
  async getUserInfo(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: '未登录' })
      }

      const user = await userRepository.findById(parseInt(req.params.id))
      if (!user) {
        return res.status(404).json({
          success: false,
          error: '用户不存在'
        })
      }

      res.json({
        success: true,
        data: user
      })
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      })
    }
  }

  async getUserStats(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: '未登录' })
      }

      const stats = await userRepository.getStats(parseInt(req.params.id))

      res.json({
        success: true,
        data: stats
      })
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      })
    }
  }
}

export default new UserController()
```

- [ ] **Step 2: 提交**

```bash
cd server
git add src/controllers/user.controller.ts
git commit -m "feat: 创建用户控制器，新增获取用户信息和统计数据的API"
```

---

### 任务7: 后端API - 新增路由配置

**Files:**
- Modify: `server/src/routes/index.ts`

- [ ] **Step 1: 新增路由**

```typescript
import express from 'express'
import recordController from '../controllers/record.controller'
import plantController from '../controllers/plant.controller'
import userController from '../controllers/user.controller'
import authMiddleware from '../middleware/auth'

const router = express.Router()

// 新增记录相关路由
router.get('/records/all', authMiddleware, recordController.getAllRecords)
router.get('/users/:userId/records', authMiddleware, recordController.getRecordsByUserId)

// 新增植物相关路由
router.get('/users/:userId/plants', authMiddleware, plantController.getPlantsByUserId)
router.get('/plants/:id/detail', authMiddleware, plantController.getPlantDetail)

// 新增用户相关路由
router.get('/users/:id', authMiddleware, userController.getUserInfo)
router.get('/users/:id/stats', authMiddleware, userController.getUserStats)

export default router
```

- [ ] **Step 2: 提交**

```bash
cd server
git add src/routes/index.ts
git commit -m "feat: 新增广场页和用户信息页相关路由"
```

---

### 任务8: 前端类型定义

**Files:**
- Modify: `client/src/types/index.ts`

- [ ] **Step 1: 新增类型定义**

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

// 用户信息
export interface User {
  id: number
  username: string
  avatar?: string
  created_at: string
}
```

- [ ] **Step 2: 提交**

```bash
cd client
git add src/types/index.ts
git commit -m "feat: 新增广场页和用户信息页相关类型定义"
```

---

### 任务9: 前端公共组件 - RecordCard

**Files:**
- Create: `client/src/components/RecordCard.vue`

- [ ] **Step 1: 创建记录卡片组件**

```vue
<template>
  <van-card
    class="record-card"
    :border="false"
    :class="`layout-${layout}`"
  >
    <!-- 社交布局 -->
    <template v-if="layout === 'social'">
      <div class="record-header">
        <van-image
          v-if="showUser && record.user_avatar"
          :src="record.user_avatar"
          class="avatar"
          round
        />
        <div v-else-if="showUser" class="avatar placeholder">
          {{ getAvatarPlaceholder(record.username) }}
        </div>
        <div v-if="showUser" class="user-info">
          <span class="username">{{ record.username }}</span>
          <span class="time">{{ formatTime(record.created_at) }}</span>
        </div>
      </div>
      <div class="record-content">
        <div class="action-text">
          <span class="action-icon">{{ getActionIcon(record.type) }}</span>
          <span v-if="showPlant">给「{{ record.plant_name }}」{{ getActionText(record.type) }}了</span>
          <span v-else>{{ getActionText(record.type) }}</span>
        </div>
        <div v-if="record.description" class="description">
          {{ record.description }}
        </div>
        <div v-if="record.images && record.images.length > 0" class="image-grid">
          <van-image
            v-for="(image, index) in record.images"
            :key="index"
            :src="image.image_path"
            class="record-image"
            fit="cover"
          />
        </div>
      </div>
    </template>

    <!-- 时间轴布局 -->
    <template v-else-if="layout === 'timeline'">
      <div class="record-header">
        <van-image
          v-if="showUser && record.user_avatar"
          :src="record.user_avatar"
          class="avatar"
          round
        />
        <div v-else-if="showUser" class="avatar placeholder">
          {{ getAvatarPlaceholder(record.username) }}
        </div>
        <div v-if="showUser" class="user-info">
          <span class="username">{{ record.username }}</span>
          <span class="action-text">养护了</span>
          <span v-if="showPlant" class="plant-name">{{ record.plant_name }}</span>
        </div>
      </div>
      <div class="record-content">
        <div class="action-tag">{{ getActionText(record.type) }}</div>
        <div v-if="record.description" class="description">
          {{ record.description }}
        </div>
        <div v-if="record.images && record.images.length > 0" class="image-grid">
          <van-image
            v-for="(image, index) in record.images"
            :key="index"
            :src="image.image_path"
            class="record-image"
            fit="cover"
          />
        </div>
        <div class="time">{{ formatTime(record.created_at) }}</div>
      </div>
    </template>
  </van-card>
</template>

<script setup lang="ts">
import { formatTime } from '@/utils/date'

interface Props {
  record: any
  showUser?: boolean
  showPlant?: boolean
  layout?: 'social' | 'timeline'
}

const props = withDefaults(defineProps<Props>(), {
  showUser: true,
  showPlant: true,
  layout: 'social'
})

const getActionIcon = (type: string) => {
  return type === 'water' ? '💧' : '🧪'
}

const getActionText = (type: string) => {
  return type === 'water' ? '浇水' : '施肥'
}

const getAvatarPlaceholder = (username: string) => {
  return username ? username.charAt(0) : '?'
}
</script>

<style scoped>
.record-card {
  margin-bottom: 12px;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: white;
}

.avatar.placeholder {
  background: linear-gradient(135deg, #8FA98F, #a5d6a7);
}

.record-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.user-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.username {
  font-weight: 600;
  color: #333;
  font-size: 14px;
}

.time {
  font-size: 12px;
  color: #999;
}

.record-content {
  padding: 0 8px;
}

.action-text {
  color: #666;
  font-size: 14px;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.action-icon {
  font-size: 16px;
}

.plant-name {
  color: #8FA98F;
  font-weight: 500;
}

.description {
  font-size: 14px;
  color: #555;
  margin-bottom: 12px;
  line-height: 1.5;
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
}

.record-image {
  aspect-ratio: 1;
  border-radius: 8px;
}

.action-tag {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  margin-bottom: 8px;
}

.layout-timeline .action-tag {
  background: #e3f2fd;
  color: #1976d2;
}

.layout-social .action-tag {
  background: #fff3e0;
  color: #f57c00;
}
</style>
```

- [ ] **Step 2: 提交**

```bash
cd client
git add src/components/RecordCard.vue
git commit -m "feat: 创建记录卡片组件RecordCard"
```

---

### 任务10: 前端公共组件 - PlantCard

**Files:**
- Create: `client/src/components/PlantCard.vue`

- [ ] **Step 1: 创建植物卡片组件**

```vue
<template>
  <van-card
    class="plant-card"
    :border="false"
    @click="handleClick"
  >
    <template #thumb>
      <van-image
        v-if="plant.image"
        :src="plant.image"
        class="plant-image"
        fit="cover"
      />
      <div v-else class="plant-image placeholder">
        🌱
      </div>
    </template>
    <div class="plant-info">
      <h3 class="plant-name">{{ plant.name }}</h3>
      <p class="plant-type">{{ getPlantTypeText(plant.type) }}</p>
      <p v-if="plant.notes" class="plant-notes">{{ plant.notes }}</p>
    </div>
    <template v-if="showEdit" #footer>
      <van-button size="small" type="primary" plain @click.stop="handleEdit">
        编辑
      </van-button>
    </template>
  </van-card>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

interface Props {
  plant: Plant
  mode?: 'select' | 'detail'
  selected?: boolean
  showEdit?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'detail',
  selected: false,
  showEdit: false
})

const emit = defineEmits<{
  select: [plant: Plant]
  edit: [plant: Plant]
}>()

const router = useRouter()

const getPlantTypeText = (type: string) => {
  const typeMap: Record<string, string> = {
    foliage: '观叶植物',
    flower: '观花植物',
    succulent: '多肉植物',
    fruit: '果类植物',
    vegetable: '蔬菜植物'
  }
  return typeMap[type] || '其他植物'
}

const handleClick = () => {
  if (props.mode === 'select') {
    emit('select', props.plant)
  } else {
    router.push(`/plant/${props.plant.id}`)
  }
}

const handleEdit = () => {
  emit('edit', props.plant)
}
</script>

<style scoped>
.plant-card {
  margin-bottom: 12px;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.plant-image {
  width: 100%;
  height: 120px;
  border-radius: 12px 12px 0 0;
}

.plant-image.placeholder {
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
}

.plant-info {
  padding: 12px;
}

.plant-name {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.plant-type {
  font-size: 12px;
  color: #8FA98F;
  margin-bottom: 4px;
}

.plant-notes {
  font-size: 12px;
  color: #666;
  line-height: 1.4;
}

:deep(.van-card__thumb) {
  margin: 0;
}

:deep(.van-card__body) {
  padding: 0;
}
</style>
```

- [ ] **Step 2: 提交**

```bash
cd client
git add src/components/PlantCard.vue
git commit -m "feat: 创建植物卡片组件PlantCard"
```

---

### 任务11: 前端页面 - 广场页

**Files:**
- Create: `client/src/views/Square.vue`

- [ ] **Step 1: 创建广场页**

```vue
<template>
  <div class="square">
    <van-nav-bar title="广场" fixed />
    <van-list
      v-model:loading="loading"
      :finished="finished"
      finished-text="没有更多了"
      @load="onLoad"
      class="record-list"
    >
      <RecordCard
        v-for="record in records"
        :key="record.id"
        :record="record"
        show-user
        show-plant
        layout="social"
      />
    </van-list>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import RecordCard from '@/components/RecordCard.vue'
import { api } from '@/api'

const records = ref<any[]>([])
const loading = ref(false)
const finished = ref(false)
const offset = ref(0)
const limit = 15

const onLoad = async () => {
  try {
    const response = await api.get('/records/all', {
      params: {
        limit,
        offset: offset.value
      }
    })
    
    if (response.data.success) {
      const newRecords = response.data.data
      records.value.push(...newRecords)
      offset.value += limit
      
      if (newRecords.length < limit) {
        finished.value = true
      }
    }
  } catch (error) {
    console.error('获取记录失败:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  onLoad()
})
</script>

<style scoped>
.square {
  min-height: 100vh;
  background: #f8f9fa;
  padding-bottom: 60px;
}

.record-list {
  padding: 0 12px;
  padding-top: 60px;
}
</style>
```

- [ ] **Step 2: 提交**

```bash
cd client
git add src/views/Square.vue
git commit -m "feat: 创建广场页Square.vue"
```

---

### 任务12: 前端页面 - 植物详情页

**Files:**
- Create: `client/src/views/PlantDetail.vue`

- [ ] **Step 1: 创建植物详情页**

```vue
<template>
  <div class="plant-detail">
    <van-nav-bar title="植物详情" fixed left-arrow @click-left="handleBack" />
    <div class="content">
      <!-- 植物信息 -->
      <van-card
        class="plant-info"
        :border="false"
      >
        <template #thumb>
          <van-image
            v-if="plant.image"
            :src="plant.image"
            class="plant-image"
            fit="cover"
          />
          <div v-else class="plant-image placeholder">
            🌱
          </div>
        </template>
        <div class="info-content">
          <h2 class="plant-name">{{ plant.name }}</h2>
          <p class="plant-type">{{ getPlantTypeText(plant.type) }}</p>
          <p v-if="plant.notes" class="plant-notes">{{ plant.notes }}</p>
          <p class="plant-owner">
            所属用户: {{ plant.username }}
          </p>
        </div>
      </van-card>

      <!-- 养护记录 -->
      <van-card
        class="records-section"
        :border="false"
        title="养护记录"
      >
        <van-list
          v-model:loading="loading"
          :finished="finished"
          finished-text="没有更多了"
          @load="onLoad"
        >
          <RecordCard
            v-for="record in records"
            :key="record.id"
            :record="record"
            :show-user="false"
            :show-plant="false"
            layout="timeline"
          />
        </van-list>
      </van-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import RecordCard from '@/components/RecordCard.vue'
import { api } from '@/api'

const route = useRoute()
const router = useRouter()
const plant = ref<any>({})
const records = ref<any[]>([])
const loading = ref(false)
const finished = ref(false)
const offset = ref(0)
const limit = 15

const getPlantDetail = async () => {
  try {
    const response = await api.get(`/plants/${route.params.id}/detail`)
    if (response.data.success) {
      plant.value = response.data.data
    }
  } catch (error) {
    console.error('获取植物详情失败:', error)
  }
}

const onLoad = async () => {
  try {
    const response = await api.get(`/plants/${route.params.id}/records`, {
      params: {
        limit,
        offset: offset.value
      }
    })
    
    if (response.data.success) {
      const newRecords = response.data.data
      records.value.push(...newRecords)
      offset.value += limit
      
      if (newRecords.length < limit) {
        finished.value = true
      }
    }
  } catch (error) {
    console.error('获取记录失败:', error)
  } finally {
    loading.value = false
  }
}

const handleBack = () => {
  router.back()
}

const getPlantTypeText = (type: string) => {
  const typeMap: Record<string, string> = {
    foliage: '观叶植物',
    flower: '观花植物',
    succulent: '多肉植物',
    fruit: '果类植物',
    vegetable: '蔬菜植物'
  }
  return typeMap[type] || '其他植物'
}

onMounted(() => {
  getPlantDetail()
  onLoad()
})
</script>

<style scoped>
.plant-detail {
  min-height: 100vh;
  background: #f8f9fa;
}

.content {
  padding: 12px;
  padding-top: 60px;
}

.plant-info {
  margin-bottom: 16px;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.plant-image {
  width: 120px;
  height: 120px;
  border-radius: 12px;
}

.plant-image.placeholder {
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
}

.info-content {
  padding: 0 12px;
}

.plant-name {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.plant-type {
  font-size: 14px;
  color: #8FA98F;
  margin-bottom: 8px;
}

.plant-notes {
  font-size: 14px;
  color: #555;
  margin-bottom: 8px;
  line-height: 1.5;
}

.plant-owner {
  font-size: 12px;
  color: #999;
}

.records-section {
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

:deep(.van-card__title) {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}
</style>
```

- [ ] **Step 2: 提交**

```bash
cd client
git add src/views/PlantDetail.vue
git commit -m "feat: 创建植物详情页PlantDetail.vue"
```

---

### 任务12: 前端页面 - 用户信息页

**Files:**
- Create: `client/src/views/UserProfile.vue`

- [ ] **Step 1: 创建用户信息页**

```vue
<template>
  <div class="user-profile">
    <van-nav-bar title="个人主页" fixed left-arrow @click-left="handleBack" />
    <div class="content">
      <!-- 用户信息 -->
      <van-card
        class="user-info"
        :border="false"
      >
        <div class="avatar-section">
          <van-image
            v-if="user.avatar"
            :src="user.avatar"
            class="avatar"
            round
          />
          <div v-else class="avatar placeholder">
            {{ getAvatarPlaceholder(user.username) }}
          </div>
          <h2 class="username">{{ user.username }}</h2>
        </div>
        <p class="join-time">注册时间: {{ formatDate(user.created_at) }}</p>
      </van-card>

      <!-- 导航卡片 -->
      <van-card
        class="nav-card"
        :border="false"
        @click="navigateTo('/user/' + user.id + '/stats')"
      >
        <div class="nav-item">
          <span class="nav-icon">📊</span>
          <span class="nav-text">我的统计</span>
          <van-icon name="arrow" class="nav-arrow" />
        </div>
      </van-card>

      <van-card
        class="nav-card"
        :border="false"
        @click="navigateTo('/user/' + user.id + '/plants')"
      >
        <div class="nav-item">
          <span class="nav-icon">🌱</span>
          <span class="nav-text">我的植物</span>
          <van-icon name="arrow" class="nav-arrow" />
        </div>
      </van-card>

      <van-card
        class="nav-card"
        :border="false"
        @click="navigateTo('/user/' + user.id + '/records')"
      >
        <div class="nav-item">
          <span class="nav-icon">📝</span>
          <span class="nav-text">养护记录</span>
          <van-icon name="arrow" class="nav-arrow" />
        </div>
      </van-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api } from '@/api'

const route = useRoute()
const router = useRouter()
const user = ref<any>({})

const handleBack = () => {
  router.back()
}

const navigateTo = (path: string) => {
  router.push(path)
}

const getAvatarPlaceholder = (username: string) => {
  return username ? username.charAt(0) : '?'
}

const formatDate = (dateString: string) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString()
}

const getUserInfo = async () => {
  try {
    const response = await api.get(`/users/${route.params.id}`)
    if (response.data.success) {
      user.value = response.data.data
    }
  } catch (error) {
    console.error('获取用户信息失败:', error)
  }
}

onMounted(() => {
  getUserInfo()
})
</script>

<style scoped>
.user-profile {
  min-height: 100vh;
  background: #f8f9fa;
  padding-bottom: 60px;
}

.content {
  padding: 0 12px;
  padding-top: 60px;
}

.user-info {
  margin-bottom: 16px;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  padding: 24px;
  text-align: center;
}

.avatar-section {
  margin-bottom: 16px;
}

.avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  margin-bottom: 12px;
}

.avatar.placeholder {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #8FA98F, #a5d6a7);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  font-weight: 600;
  color: white;
  margin-bottom: 12px;
}

.username {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.join-time {
  font-size: 14px;
  color: #999;
}

.nav-card {
  margin-bottom: 12px;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
}

.nav-icon {
  font-size: 24px;
}

.nav-text {
  flex: 1;
  font-size: 16px;
  font-weight: 500;
  color: #333;
}

.nav-arrow {
  color: #999;
}
</style>
```

- [ ] **Step 2: 提交**

```bash
cd client
git add src/views/UserProfile.vue
git commit -m "feat: 创建用户信息页UserProfile.vue"
```

---

### 任务13: 前端页面 - 用户植物列表页

**Files:**
- Create: `client/src/views/UserPlants.vue`

- [ ] **Step 1: 创建用户植物列表页**

```vue
<template>
  <div class="user-plants">
    <van-nav-bar :title="username + '的植物'" fixed left-arrow @click-left="handleBack" />
    <div class="content">
      <PlantCard
        v-for="plant in plants"
        :key="plant.id"
        :plant="plant"
        mode="detail"
        :show-edit="false"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PlantCard from '@/components/PlantCard.vue'
import { api } from '@/api'

const route = useRoute()
const router = useRouter()
const plants = ref<any[]>([])
const username = ref('')

const handleBack = () => {
  router.back()
}

const getPlants = async () => {
  try {
    const response = await api.get(`/users/${route.params.id}/plants`)
    if (response.data.success) {
      plants.value = response.data.data
    }
  } catch (error) {
    console.error('获取植物列表失败:', error)
  }
}

const getUsername = async () => {
  try {
    const response = await api.get(`/users/${route.params.id}`)
    if (response.data.success) {
      username.value = response.data.data.username
    }
  } catch (error) {
    console.error('获取用户信息失败:', error)
  }
}

onMounted(() => {
  getPlants()
  getUsername()
})
</script>

<style scoped>
.user-plants {
  min-height: 100vh;
  background: #f8f9fa;
  padding-bottom: 60px;
}

.content {
  padding: 0 12px;
  padding-top: 60px;
}
</style>
```

- [ ] **Step 2: 提交**

```bash
cd client
git add src/views/UserPlants.vue
git commit -m "feat: 创建用户植物列表页UserPlants.vue"
```

---

### 任务14: 前端页面 - 用户养护记录页

**Files:**
- Create: `client/src/views/UserRecords.vue`

- [ ] **Step 1: 创建用户养护记录页**

```vue
<template>
  <div class="user-records">
    <van-nav-bar :title="username + '的养护记录'" fixed left-arrow @click-left="handleBack" />
    <van-list
      v-model:loading="loading"
      :finished="finished"
      finished-text="没有更多了"
      @load="onLoad"
      class="record-list"
    >
      <RecordCard
        v-for="record in records"
        :key="record.id"
        :record="record"
        :show-user="false"
        :show-plant="true"
        layout="timeline"
      />
    </van-list>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import RecordCard from '@/components/RecordCard.vue'
import { api } from '@/api'

const route = useRoute()
const router = useRouter()
const records = ref<any[]>([])
const loading = ref(false)
const finished = ref(false)
const offset = ref(0)
const limit = 15
const username = ref('')

const handleBack = () => {
  router.back()
}

const getUsername = async () => {
  try {
    const response = await api.get(`/users/${route.params.id}`)
    if (response.data.success) {
      username.value = response.data.data.username
    }
  } catch (error) {
    console.error('获取用户信息失败:', error)
  }
}

const onLoad = async () => {
  try {
    const response = await api.get(`/users/${route.params.id}/records`, {
      params: {
        limit,
        offset: offset.value
      }
    })
    
    if (response.data.success) {
      const newRecords = response.data.data
      records.value.push(...newRecords)
      offset.value += limit
      
      if (newRecords.length < limit) {
        finished.value = true
      }
    }
  } catch (error) {
    console.error('获取记录失败:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  getUsername()
  onLoad()
})
</script>

<style scoped>
.user-records {
  min-height: 100vh;
  background: #f8f9fa;
  padding-bottom: 60px;
}

.record-list {
  padding: 0 12px;
  padding-top: 60px;
}
</style>
```

- [ ] **Step 2: 提交**

```bash
cd client
git add src/views/UserRecords.vue
git commit -m "feat: 创建用户养护记录页UserRecords.vue"
```

---

### 任务15: 前端页面 - 统计页改造

**Files:**
- Modify: `client/src/views/Stats.vue`

- [ ] **Step 1: 改造统计页**

```vue
<template>
  <div class="stats">
    <van-nav-bar :title="userId ? `${username}'s 统计` : '我的统计'" fixed left-arrow @click-left="handleBack" />
    <!-- 统计内容... -->
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api } from '@/api'

const route = useRoute()
const router = useRouter()
const userId = ref<number | undefined>(undefined)
const username = ref('')

const handleBack = () => {
  router.back()
}

const initData = async () => {
  // 获取路由参数
  const idParam = route.params.id
  if (idParam) {
    userId.value = parseInt(idParam as string)
    // 获取用户信息
    try {
      const response = await api.get(`/users/${userId.value}`)
      if (response.data.success) {
        username.value = response.data.data.username
      }
    } catch (error) {
      console.error('获取用户信息失败:', error)
    }
  }
  
  // 获取统计数据
  await fetchStats()
}

const fetchStats = async () => {
  try {
    let response
    if (userId.value) {
      response = await api.get(`/users/${userId.value}/stats`)
    } else {
      response = await api.get('/stats')
    }
    
    if (response.data.success) {
      // 处理统计数据
    }
  } catch (error) {
    console.error('获取统计数据失败:', error)
  }
}

onMounted(() => {
  initData()
})
</script>
```

- [ ] **Step 2: 提交**

```bash
cd client
git add src/views/Stats.vue
git commit -m "feat: 改造统计页支持用户统计"
```

---

### 任务16: 前端页面 - 首页重构

**Files:**
- Modify: `client/src/views/Home.vue`

- [ ] **Step 1: 重构首页**

```vue
<template>
  <div class="home">
    <van-nav-bar title="首页" fixed />
    <div class="content">
      <!-- 植物列表 -->
      <van-card
        class="plant-section"
        :border="false"
        title="我的植物"
      >
        <div class="plant-grid">
          <PlantCard
            v-for="plant in plants"
            :key="plant.id"
            :plant="plant"
            mode="select"
            :selected="selectedPlant?.id === plant.id"
            :show-edit="true"
            @select="handlePlantSelect"
            @edit="handlePlantEdit"
          />
        </div>
      </van-card>

      <!-- 记录列表 -->
      <van-card
        class="record-section"
        :border="false"
        title="养护记录"
      >
        <van-list
          v-model:loading="loading"
          :finished="finished"
          finished-text="没有更多了"
          @load="onLoad"
        >
          <RecordCard
            v-for="record in records"
            :key="record.id"
            :record="record"
            :show-user="false"
            :show-plant="!selectedPlant"
            layout="timeline"
          />
        </van-list>
      </van-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import PlantCard from '@/components/PlantCard.vue'
import RecordCard from '@/components/RecordCard.vue'
import { api } from '@/api'

const plants = ref<any[]>([])
const records = ref<any[]>([])
const selectedPlant = ref<any>(null)
const loading = ref(false)
const finished = ref(false)
const offset = ref(0)
const limit = 15

const getPlants = async () => {
  try {
    const response = await api.get('/plants')
    if (response.data.success) {
      plants.value = response.data.data
    }
  } catch (error) {
    console.error('获取植物列表失败:', error)
  }
}

const onLoad = async () => {
  try {
    const params: any = { limit, offset: offset.value }
    if (selectedPlant.value) {
      params.plantId = selectedPlant.value.id
    }
    
    const response = await api.get('/records', { params })
    if (response.data.success) {
      const newRecords = response.data.data
      records.value.push(...newRecords)
      offset.value += limit
      
      if (newRecords.length < limit) {
        finished.value = true
      }
    }
  } catch (error) {
    console.error('获取记录失败:', error)
  } finally {
    loading.value = false
  }
}

const handlePlantSelect = (plant: any) => {
  selectedPlant.value = plant
  records.value = []
  offset.value = 0
  finished.value = false
  onLoad()
}

const handlePlantEdit = (plant: any) => {
  // 编辑植物逻辑
}

onMounted(() => {
  getPlants()
  onLoad()
})
</script>

<style scoped>
.home {
  min-height: 100vh;
  background: #f8f9fa;
  padding-bottom: 60px;
}

.content {
  padding: 0 12px;
  padding-top: 60px;
}

.plant-section,
.record-section {
  margin-bottom: 16px;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.plant-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

:deep(.van-card__title) {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}
</style>
```

- [ ] **Step 2: 提交**

```bash
cd client
git add src/views/Home.vue
git commit -m "feat: 重构首页Home.vue"
```

---

### 任务17: 前端路由配置

**Files:**
- Modify: `client/src/router/index.ts`

- [ ] **Step 1: 新增路由配置**

```typescript
import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Calendar from '../views/Calendar.vue'
import Stats from '../views/Stats.vue'
import Square from '../views/Square.vue'
import PlantDetail from '../views/PlantDetail.vue'
import UserProfile from '../views/UserProfile.vue'
import UserPlants from '../views/UserPlants.vue'
import UserRecords from '../views/UserRecords.vue'

const routes = [
  {
    path: '/home',
    name: 'Home',
    component: Home,
    meta: { requiresAuth: true }
  },
  {
    path: '/square',
    name: 'Square',
    component: Square,
    meta: { requiresAuth: true }
  },
  {
    path: '/calendar',
    name: 'Calendar',
    component: Calendar,
    meta: { requiresAuth: true }
  },
  {
    path: '/stats',
    name: 'Stats',
    component: Stats,
    meta: { requiresAuth: true }
  },
  {
    path: '/plant/:id',
    name: 'PlantDetail',
    component: PlantDetail,
    meta: { requiresAuth: true }
  },
  {
    path: '/user/:id',
    name: 'UserProfile',
    component: UserProfile,
    meta: { requiresAuth: true }
  },
  {
    path: '/user/:id/plants',
    name: 'UserPlants',
    component: UserPlants,
    meta: { requiresAuth: true }
  },
  {
    path: '/user/:id/records',
    name: 'UserRecords',
    component: UserRecords,
    meta: { requiresAuth: true }
  },
  {
    path: '/user/:id/stats',
    name: 'UserStats',
    component: Stats,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
```

- [ ] **Step 2: 提交**

```bash
cd client
git add src/router/index.ts
git commit -m "feat: 新增广场页和用户信息页相关路由"
```

---

### 任务18: 前端TabBar修改

**Files:**
- Modify: `client/src/components/TabBar.vue`

- [ ] **Step 1: 修改TabBar**

```vue
<template>
  <van-tabbar v-model="active" route active-color="#8FA98F">
    <van-tabbar-item icon="home-o" to="/home">首页</van-tabbar-item>
    <van-tabbar-item icon="cluster-o" to="/square">广场</van-tabbar-item>
    <van-tabbar-item icon="calendar-o" to="/calendar">日历</van-tabbar-item>
    <van-tabbar-item icon="chart-trending-o" to="/stats">统计</van-tabbar-item>
  </van-tabbar>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const active = ref(0)
</script>

<style scoped>
/* 样式保持不变 */
</style>
```

- [ ] **Step 2: 提交**

```bash
cd client
git add src/components/TabBar.vue
git commit -m "feat: 新增广场页TabBar项"
```

---

## 执行说明

### 前置条件

1. 确保已安装所有依赖
2. 确保后端服务器已启动
3. 确保数据库连接正常

### 执行顺序

按照任务顺序依次执行，每个任务完成后进行提交。

### 测试说明

1. 每个API接口完成后，使用Postman或浏览器进行测试
2. 每个页面完成后，在浏览器中进行测试
3. 测试广场页的无限滚动功能
4. 测试用户信息页的各个模块
5. 测试植物详情页的查看功能

---

**Plan complete and saved to `docs/superpowers/plans/2024-01-15-square-user-profile-implementation.md`. Two execution options:**

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**
