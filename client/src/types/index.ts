export interface User {
  id: number
  username: string
  email: string
  avatar?: string
  created_at: string
}

export interface Plant {
  id: number
  user_id: number
  name: string
  type: PlantType
  image?: string
  notes?: string
  created_at: string
}

export type PlantType = 'succulent' | 'fern' | 'flower' | 'foliage' | 'herb' | 'orchid' | 'other'

export const PlantTypeLabels: Record<PlantType, string> = {
  succulent: '多肉',
  fern: '蕨类',
  flower: '开花植物',
  foliage: '观叶植物',
  herb: '草本植物',
  orchid: '兰花',
  other: '其他'
}

export interface RecordImage {
  id: number
  record_id: number
  image_path: string
  created_at: string
}

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
}

export interface StatsSummary {
  totalRecords: number
  waterCount: number
  fertilizeCount: number
  plantCount: number
  weeklyAvg: number
}

export interface TrendData {
  date: string
  water: number
  fertilize: number
}

export interface CalendarData {
  date: string
  hasWater: boolean
  hasFertilize: boolean
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

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
