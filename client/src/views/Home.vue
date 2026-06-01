<template>
  <div class="page-container home-page">
    <div class="page-header">
      <div class="header-top">
        <div class="user-info" @click="goToMyProfile">
          <div class="avatar">
            {{ authStore.user?.username?.charAt(0) || '?' }}
          </div>
          <div class="user-text">
            <h1 class="page-title">你好，{{ authStore.user?.username || '朋友' }} 👋</h1>
            <p class="page-subtitle">今天也要好好照顾植物哦</p>
          </div>
        </div>
        <div class="header-actions">
          <van-button size="small" type="default" @click="showAddPlant = true" color="#8FA98F">
            <template #icon>
              <van-icon name="plus" />
            </template>
            添加植物
          </van-button>
          <van-button size="small" type="default" @click="logout" color="#C9A9A6" style="margin-left: 8px">
            <template #icon>
              <van-icon name="log-out" />
            </template>
            退出
          </van-button>
        </div>
      </div>
    </div>

    <div class="plants-section" v-if="plantStore.plants.length > 0">
      <div class="section-header">
        <h3>选择植物</h3>
        <span v-if="selectedPlant" class="unselect-tip" @click="unselectPlant">取消选择</span>
      </div>
      <div class="plants-scroll">
        <div
          v-for="plant in plantStore.plants"
          :key="plant.id"
          class="plant-card"
          :class="{ active: selectedPlant?.id === plant.id }"
          @click="selectPlant(plant)"
        >
          <div class="plant-image-wrapper">
            <img :src="plant.image || defaultPlantImage" class="plant-image" />
            <div v-if="selectedPlant?.id === plant.id" class="check-badge">
              <van-icon name="success" size="14" color="#8FA98F" />
            </div>
          </div>
          <div class="plant-name">{{ plant.name }}</div>
          <div class="plant-type">{{ PlantTypeLabels[plant.type] }}</div>
          <div class="edit-btn" @click.stop="openEditPlant(plant)">
            <van-icon name="edit" size="14" color="#9E9E9E" />
          </div>
        </div>
      </div>
    </div>

    <div class="empty-plants" v-else>
      <div class="empty-icon">🌱</div>
      <p>还没有添加植物</p>
      <van-button type="primary" color="#8FA98F" @click="showAddPlant = true">
        添加我的第一盆植物
      </van-button>
    </div>

    <div class="action-section" v-if="selectedPlant">
      <div class="action-buttons">
        <button class="action-btn water" @click="openCareModal('water')">
          <div class="action-icon">💧</div>
          <span>浇水</span>
        </button>
        <button class="action-btn fertilize" @click="openCareModal('fertilize')">
          <div class="action-icon">🧪</div>
          <span>施肥</span>
        </button>
      </div>
    </div>

    <div class="records-section">
      <div class="section-header" style="padding-left: 2px">
        <h3 v-if="selectedPlant">{{ selectedPlant.name }} 的养护记录</h3>
        <h3 v-else>全部养护记录</h3>
      </div>
      <div class="records-list" v-if="plantRecords.length > 0">
        <div v-for="record in plantRecords" :key="record.id" class="record-card">
          <div class="record-header">
            <div class="record-icon-wrapper" :class="record.type">
              <span class="record-icon">{{ record.type === 'water' ? '💧' : '🧪' }}</span>
            </div>
            <div class="record-badge" :class="record.type">
              {{ record.type === 'water' ? '浇水' : '施肥' }}
            </div>
            <span v-if="!selectedPlant" class="plant-name-tag">{{ record.plant_name }}</span>
            <div class="record-actions">
              <van-icon name="edit" size="20" color="#8FA98F" @click="openEditRecord(record)" />
            </div>
          </div>
          <div class="record-body">
            <p class="record-desc" v-if="record.description">{{ record.description }}</p>
            <div class="record-time">{{ formatTime(record.created_at) }}</div>
          </div>
          <div class="record-images-grid" v-if="record.images && record.images.length > 0">
            <div
              v-for="(img, index) in record.images.slice(0, 4)"
              :key="img.id"
              class="record-image-wrapper"
              :class="{ 'image-more': index === 3 && record.images.length > 4 }"
              @click="previewMedia(record.images!, index)"
            >
              <img v-if="img.file_type !== 'video'" :src="img.image_path" class="record-image" />
              <div v-else class="video-wrapper">
                <video :src="img.image_path" class="record-image video-thumbnail" poster="" muted loop playsinline></video>
                <div class="video-play-icon">▶</div>
              </div>
              <span v-if="index === 3 && record.images.length > 4" class="image-count">
                +{{ record.images.length - 3 }}
              </span>
            </div>
          </div>
        </div>
      </div>
      <div class="empty-records" v-else>
        <div class="empty-icon">🌱</div>
        <p>{{ selectedPlant ? '还没有养护记录' : '暂无养护记录' }}</p>
        <p class="empty-hint">记录每一次浇水施肥，见证植物成长</p>
      </div>
    </div>

    <van-popup v-model:show="showCareModal" position="bottom" round :style="{ height: '80%' }">
      <div class="care-modal">
        <div class="modal-header">
          <h3>{{ editingRecord ? '✏️ 编辑记录' : (careType === 'water' ? '💧 记录浇水' : '🧪 记录施肥') }}</h3>
          <van-icon name="cross" @click="closeCareModal" />
        </div>
        <div class="modal-content">
          <van-field
            v-model="careForm.description"
            name="description"
            label="状态描述"
            type="textarea"
            rows="3"
            placeholder="记录一下植物的状态（可选）"
          />
          <div class="image-section">
            <div class="section-label">
              <span class="label-text">上传照片</span>
              <span class="label-count">{{ careForm.images.length }}/9</span>
            </div>
            <div class="image-grid-container">
              <div class="image-grid">
                <div
                  v-for="(img, index) in careForm.images"
                  :key="index"
                  class="image-grid-item"
                  @click="img.file_type === 'video' ? previewCareMedia(index) : previewImages(careForm.images.filter(i => i.file_type !== 'video').map(i => i.url), careForm.images.filter(i => i.file_type !== 'video').findIndex(i => i === img))"
                >
                  <img v-if="img.file_type !== 'video'" :src="img.url" class="grid-image" />
                  <div v-else class="video-preview-wrapper">
                    <video :src="img.url" class="grid-image video-preview" muted playsinline></video>
                    <div class="video-play-icon-overlay">▶</div>
                  </div>
                  <div class="image-overlay">
                    <van-icon name="cross" class="remove-btn" @click.stop="removeImage(index)" />
                  </div>
                </div>
                <div
                  v-if="careForm.images.length < 9"
                  class="image-grid-item upload-item"
                  @click="triggerFileInput"
                >
                  <div class="upload-icon-wrapper">
                    <van-icon name="plus" size="28" color="#8FA98F" />
                  </div>
                  <span class="upload-text">添加</span>
                </div>
              </div>
            </div>
            <p class="image-tip">点击图片/视频可查看，最多上传9张，支持10MB以内的视频</p>
          </div>
          <input
            ref="fileInputRef"
            type="file"
            accept="image/*,video/*"
            multiple
            style="display: none"
            @change="handleFileChange"
          />
        </div>
        <div class="modal-footer">
          <van-button round block type="primary" color="#8FA98F" native-type="submit" :loading="submitting" @click="submitCare">
            {{ editingRecord ? '更新记录' : '保存记录' }}
          </van-button>
        </div>
      </div>
    </van-popup>

    <van-popup v-model:show="showAddPlant" position="bottom" round :style="{ height: '85%' }" @close="resetAddPlantForm">
      <div class="add-plant-modal">
        <div class="modal-header">
          <div class="header-decoration">
            <span class="leaf-icon">🌿</span>
            <span class="header-title">添加新植物</span>
            <span class="leaf-icon">🌿</span>
          </div>
          <van-icon name="cross" class="close-btn" @click="closeAddPlantModal" />
        </div>
        
        <van-form @submit="addPlant" class="plant-form">
          <div class="form-section">
            <div class="section-label">
              <span class="label-icon">🌷</span>
              <span>植物名称</span>
            </div>
            <div class="input-wrapper">
              <van-field
                v-model="newPlantForm.name"
                name="name"
                placeholder="给你的植物起个可爱的名字"
                :rules="[{ required: true, message: '请填写植物名称' }]"
                class="custom-field"
              />
            </div>
          </div>

          <div class="form-section">
            <div class="section-label">
              <span class="label-icon">🏷️</span>
              <span>植物类型</span>
              <span class="optional-badge">可选</span>
            </div>
            <div class="type-picker-wrapper" @click="showTypePicker = true">
              <div class="type-display">
                <van-icon name="chevron-right" size="18" color="#8FA98F" />
                <span v-if="newPlantForm.type">{{ PlantTypeLabels[newPlantForm.type] }}</span>
                <span v-else class="placeholder-text">选择植物类型</span>
              </div>
              <van-icon v-if="newPlantForm.type" name="cross" size="18" color="#9E9E9E" @click.stop="clearPlantType" />
            </div>
          </div>

          <div class="form-section">
            <div class="section-label">
              <span class="label-icon">📸</span>
              <span>植物照片</span>
              <span class="optional-badge">可选</span>
            </div>
            <div class="image-upload-area">
              <div class="upload-box" @click="newPlantForm.previewImage ? previewImages([newPlantForm.previewImage], 0) : triggerPlantFileInput()">
                <img v-if="newPlantForm.previewImage" :src="newPlantForm.previewImage" class="plant-preview" />
                <div v-else class="upload-placeholder">
                  <van-icon name="plus" size="32" color="#8FA98F" />
                  <span>点击上传照片</span>
                </div>
                <van-icon v-if="newPlantForm.previewImage" name="cross" class="plant-remove-btn" @click.stop="clearPlantImage" />
              </div>
            </div>
          </div>

          <div class="form-section">
            <div class="section-label">
              <span class="label-icon">📝</span>
              <span>植物介绍</span>
              <span class="optional-badge">可选</span>
            </div>
            <div class="input-wrapper">
              <van-field
                v-model="newPlantForm.notes"
                name="notes"
                type="textarea"
                rows="3"
                placeholder="告诉我们关于这株植物的故事吧..."
                class="custom-field"
              />
            </div>
          </div>

          <input
            ref="plantFileInputRef"
            type="file"
            accept="image/*"
            style="display: none"
            @change="handlePlantFileChange"
          />

          <div class="form-actions">
            <van-button round block type="primary" color="#5B8C5A" native-type="submit" :loading="submitting" class="submit-btn">
              <span class="btn-icon">🌱</span>
              <span>添加到我的花园</span>
            </van-button>
          </div>
        </van-form>

        <div class="modal-footer">
          <p>🌿 用心呵护，静待花开</p>
        </div>
      </div>
    </van-popup>

    <van-popup v-model:show="showTypePicker" position="bottom">
      <van-picker
        :columns="plantTypeOptions"
        @confirm="onTypeConfirm"
        @cancel="showTypePicker = false"
      />
    </van-popup>

    <van-popup v-model:show="showEditPlant" position="bottom" round :style="{ height: '85%' }">
      <div class="add-plant-modal">
        <div class="modal-header">
          <div class="header-decoration">
            <span class="leaf-icon">✏️</span>
            <span class="header-title">编辑植物信息</span>
            <span class="leaf-icon">🌿</span>
          </div>
          <div class="header-actions">
            <div class="delete-plant-btn" @click="handleDeletePlant" title="删除植物">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              </svg>
            </div>
            <van-icon name="cross" class="close-btn" @click="showEditPlant = false" />
          </div>
        </div>
        
        <van-form @submit="updatePlant" class="plant-form">
          <div class="form-section">
            <div class="section-label">
              <span class="label-icon">🌷</span>
              <span>植物名称</span>
            </div>
            <div class="input-wrapper">
              <van-field
                v-model="editPlantForm.name"
                name="name"
                placeholder="给你的植物起个可爱的名字"
                :rules="[{ required: true, message: '请填写植物名称' }]"
                class="custom-field"
              />
            </div>
          </div>

          <div class="form-section">
            <div class="section-label">
              <span class="label-icon">🏷️</span>
              <span>植物类型</span>
            </div>
            <div class="type-picker-wrapper" @click="showEditTypePicker = true">
              <div class="type-display">
                <van-icon name="chevron-right" size="18" color="#8FA98F" />
                <span v-if="editPlantForm.type">{{ PlantTypeLabels[editPlantForm.type] }}</span>
                <span v-else class="placeholder-text">选择植物类型</span>
              </div>
            </div>
          </div>

          <div class="form-section">
            <div class="section-label">
              <span class="label-icon">📸</span>
              <span>植物照片</span>
            </div>
            <div class="image-upload-area">
              <div class="upload-box" @click="editPlantForm.previewImage ? previewImages([editPlantForm.previewImage], 0) : triggerEditPlantFileInput()">
                <img v-if="editPlantForm.previewImage" :src="editPlantForm.previewImage" class="plant-preview" />
                <div v-else class="upload-placeholder">
                  <van-icon name="plus" size="32" color="#8FA98F" />
                  <span>点击上传照片</span>
                </div>
                <van-icon v-if="editPlantForm.previewImage" name="cross" class="plant-remove-btn" @click.stop="clearEditPlantImage" />
              </div>
            </div>
          </div>

          <div class="form-section">
            <div class="section-label">
              <span class="label-icon">📝</span>
              <span>植物介绍</span>
              <span class="optional-badge">可选</span>
            </div>
            <div class="input-wrapper">
              <van-field
                v-model="editPlantForm.notes"
                name="notes"
                type="textarea"
                rows="3"
                placeholder="告诉我们关于这株植物的故事吧..."
                class="custom-field textarea-field"
              />
            </div>
          </div>

          <input
            ref="editFileInputRef"
            type="file"
            accept="image/*"
            style="display: none"
            @change="handleEditPlantFileChange"
          />

          <div class="form-actions">
            <van-button round block type="primary" color="#5B8C5A" native-type="submit" :loading="submitting" class="submit-btn">
              <span class="btn-icon">💾</span>
              <span>保存修改</span>
            </van-button>
          </div>
        </van-form>

        <div class="modal-footer">
          <p>🌿 用心呵护，静待花开</p>
        </div>
      </div>
    </van-popup>

    <van-popup v-model:show="showEditTypePicker" position="bottom">
      <van-picker
        :columns="plantTypeOptions"
        @confirm="onEditTypeConfirm"
        @cancel="showEditTypePicker = false"
      />
    </van-popup>

    <van-image-preview v-model:show="showImagePreview" :images="currentPreviewImages" :start-position="currentPreviewIndex" />
    
    <MediaPreview v-model:show="showMediaPreview" :media="currentPreviewMedia" :start-index="currentPreviewIndex" :key="`${currentPreviewMedia.length}-${currentPreviewIndex}`" />

    <TabBar />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { usePlantStore } from '@/stores/plant'
import { PlantTypeLabels, type Plant, type CareRecord, type PlantType, type RecordImage } from '@/types'
import request from '@/utils/request'
import dayjs from 'dayjs'
import TabBar from '@/components/TabBar.vue'
import MediaPreview from '@/components/MediaPreview.vue'
import { showConfirmDialog, showToast } from 'vant'
import { normalizeImageFile } from '@/utils/image'

const router = useRouter()
const authStore = useAuthStore()
const plantStore = usePlantStore()

const selectedPlant = ref<Plant | null>(null)
const plantRecords = ref<CareRecord[]>([])
const showCareModal = ref(false)
const careType = ref<'water' | 'fertilize'>('water')
const submitting = ref(false)
const showAddPlant = ref(false)
const showEditPlant = ref(false)
const showTypePicker = ref(false)
const showEditTypePicker = ref(false)
const showImagePreview = ref(false)
const showMediaPreview = ref(false)
const currentPreviewImages = ref<string[]>([])
const currentPreviewMedia = ref<RecordImage[]>([])
const currentPreviewIndex = ref(0)
const fileInputRef = ref<HTMLInputElement | null>(null)
const plantFileInputRef = ref<HTMLInputElement | null>(null)
const editFileInputRef = ref<HTMLInputElement | null>(null)

const defaultPlantImage = 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=plant%20pot%20simple%20morandi%20color&image_size=square_hd'

const editingRecord = ref<CareRecord | null>(null)
const careForm = ref({
  description: '',
  images: [] as { url: string; file?: File; id?: number; file_type?: string }[]
})

const newPlantForm = ref({
  name: '',
  type: '' as PlantType,
  previewImage: '',
  file: null as File | null,
  notes: ''
})

const editPlantForm = ref({
  id: 0,
  name: '',
  type: '' as PlantType,
  previewImage: '',
  file: null as File | null,
  originalImage: '',
  notes: ''
})

const plantTypeOptions = Object.entries(PlantTypeLabels).map(([value, text]) => ({ text, value }))

const selectPlant = (plant: Plant) => {
  if (selectedPlant.value?.id === plant.id) {
    selectedPlant.value = null
    fetchAllRecords()
  } else {
    selectedPlant.value = plant
    fetchPlantRecords(plant.id)
  }
}

const unselectPlant = () => {
  selectedPlant.value = null
  fetchAllRecords()
}

const fetchAllRecords = async () => {
  try {
    const res = await request.get('/records')
    const plants = plantStore.plants
    plantRecords.value = res.data
      .slice(0, 50)
      .map((r: CareRecord) => {
        const plant = plants.find(p => p.id === r.plant_id)
        return {
          ...r,
          plant_name: plant?.name || '未知植物'
        }
      })
  } catch (error) {
    console.error('获取记录失败', error)
  }
}

const fetchPlantRecords = async (plantId: number) => {
  try {
    const res = await request.get('/records', { params: { plantId, limit: 20 } })
    plantRecords.value = res.data
  } catch (error) {
    console.error('获取记录失败', error)
  }
}

const openCareModal = (type: 'water' | 'fertilize') => {
  careType.value = type
  editingRecord.value = null
  careForm.value = { description: '', images: [] }
  showCareModal.value = true
}

const openEditRecord = (record: CareRecord) => {
  editingRecord.value = record
  careType.value = record.type
  careForm.value = {
    description: record.description || '',
    images: record.images?.map(img => ({ id: img.id, url: img.image_path, file_type: img.file_type || 'image' })) || []
  }
  showCareModal.value = true
}

const closeCareModal = () => {
  showCareModal.value = false
  editingRecord.value = null
  careForm.value = { description: '', images: [] }
}

const removeImage = (index: number) => {
  careForm.value.images.splice(index, 1)
}

const triggerFileInput = () => {
  const maxImages = 9
  if (careForm.value.images.length >= maxImages) {
    showToast(`最多只能上传${maxImages}张图片`)
    return
  }
  fileInputRef.value?.click()
}

const triggerPlantFileInput = () => {
  plantFileInputRef.value?.click()
}

const clearPlantType = () => {
  newPlantForm.value.type = '' as PlantType
}

const clearPlantImage = () => {
  newPlantForm.value.previewImage = ''
  newPlantForm.value.file = null
  if (plantFileInputRef.value) {
    plantFileInputRef.value.value = ''
  }
}

const clearEditPlantImage = () => {
  editPlantForm.value.previewImage = ''
  editPlantForm.value.file = null
  if (editFileInputRef.value) {
    editFileInputRef.value.value = ''
  }
}

const closeAddPlantModal = () => {
  showAddPlant.value = false
  resetAddPlantForm()
}

const resetAddPlantForm = () => {
  newPlantForm.value = {
    name: '',
    type: '' as PlantType,
    previewImage: '',
    file: null,
    notes: ''
  }
}

const triggerEditPlantFileInput = () => {
  editFileInputRef.value?.click()
}

const openEditPlant = (plant: Plant) => {
  editPlantForm.value = {
    id: plant.id,
    name: plant.name,
    type: plant.type,
    previewImage: plant.image || '',
    file: null,
    originalImage: plant.image || '',
    notes: plant.notes || ''
  }
  showEditPlant.value = true
}

const handleFileChange = async (e: Event) => {
  const input = e.target as HTMLInputElement
  const files = Array.from(input.files || [])
  if (files.length === 0) return

  const maxFiles = 9
  const currentCount = careForm.value.images.length
  const remainingSlots = maxFiles - currentCount

  if (remainingSlots <= 0) {
    showToast(`最多只能上传${maxFiles}个文件`)
    input.value = ''
    return
  }

  const filesToProcess = files.slice(0, remainingSlots)
  const skippedCount = files.length - filesToProcess.length

  try {
    for (const raw of filesToProcess) {
      const file = await normalizeImageFile(raw)
      const isVideo = raw.type.startsWith('video/')
      careForm.value.images.push({
        url: URL.createObjectURL(file),
        file,
        file_type: isVideo ? 'video' : 'image'
      })
    }
    if (skippedCount > 0) {
      showToast(`已选择前${filesToProcess.length}个文件，最多${maxFiles}个`)
    }
  } catch (err) {
    console.error('文件处理失败', err)
    showToast('文件处理失败，请换一个')
  } finally {
    input.value = ''
  }
}

const handlePlantFileChange = async (e: Event) => {
  const input = e.target as HTMLInputElement
  const raw = input.files?.[0]
  if (!raw) return
  try {
    const file = await normalizeImageFile(raw)
    newPlantForm.value.file = file
    newPlantForm.value.previewImage = URL.createObjectURL(file)
  } catch (err) {
    console.error('图片处理失败', err)
    showToast('图片处理失败，请换一张')
  } finally {
    input.value = ''
  }
}

const submitCare = async () => {
  if (!editingRecord.value && !selectedPlant.value) return
  submitting.value = true
  try {
    const formData = new FormData()
    if (!editingRecord.value && selectedPlant.value) {
      formData.append('plantId', selectedPlant.value.id.toString())
    }
    formData.append('type', careType.value)
    if (careForm.value.description) {
      formData.append('description', careForm.value.description)
    }

    const existingImageIds = editingRecord.value?.images?.map(img => img.id) || []
    const currentImageIds = careForm.value.images.filter(img => img.id).map(img => img.id!)
    const removedIds = existingImageIds.filter(id => !currentImageIds.includes(id))
    if (removedIds.length > 0) {
      formData.append('removedImages', JSON.stringify(removedIds))
    }

    careForm.value.images.forEach(img => {
      if (img.file) {
        formData.append('images', img.file)
      }
    })

    if (editingRecord.value) {
      await request.put(`/records/${editingRecord.value.id}`, formData)
    } else {
      await request.post('/records', formData)
    }

    showCareModal.value = false
    if (selectedPlant.value) {
      fetchPlantRecords(selectedPlant.value.id)
    } else if (editingRecord.value) {
      fetchPlantRecords(editingRecord.value.plant_id)
    } else {
      fetchAllRecords()
    }
  } catch (error) {
    console.error('提交失败', error)
  } finally {
    submitting.value = false
  }
}

const addPlant = async () => {
  if (!newPlantForm.value.name) return
  submitting.value = true
  try {
    const formData = new FormData()
    formData.append('name', newPlantForm.value.name)
    if (newPlantForm.value.type) {
      formData.append('type', newPlantForm.value.type)
    }
    if (newPlantForm.value.notes) {
      formData.append('notes', newPlantForm.value.notes)
    }
    const fileInput = plantFileInputRef.value
    if (newPlantForm.value.file) {
      formData.append('image', newPlantForm.value.file)
    } else if (fileInput?.files?.[0]) {
      formData.append('image', fileInput.files[0])
    }
    await plantStore.createPlant(formData)
    showAddPlant.value = false
    resetAddPlantForm()
  } catch (error) {
    console.error('添加失败', error)
  } finally {
    submitting.value = false
  }
}

const onTypeConfirm = ({ selectedOptions }: any) => {
  newPlantForm.value.type = selectedOptions[0].value as PlantType
  showTypePicker.value = false
}

const onEditTypeConfirm = ({ selectedOptions }: any) => {
  editPlantForm.value.type = selectedOptions[0].value as PlantType
  showEditTypePicker.value = false
}

const handleEditPlantFileChange = async (e: Event) => {
  const input = e.target as HTMLInputElement
  const raw = input.files?.[0]
  if (!raw) return
  try {
    const file = await normalizeImageFile(raw)
    editPlantForm.value.file = file
    editPlantForm.value.previewImage = URL.createObjectURL(file)
  } catch (err) {
    console.error('图片处理失败', err)
    showToast('图片处理失败，请换一张')
  } finally {
    input.value = ''
  }
}

const updatePlant = async () => {
  if (!editPlantForm.value.name) return
  submitting.value = true
  try {
    const formData = new FormData()
    formData.append('name', editPlantForm.value.name)
    if (editPlantForm.value.type) {
      formData.append('type', editPlantForm.value.type)
    }
    if (editPlantForm.value.notes) {
      formData.append('notes', editPlantForm.value.notes)
    }
    if (editPlantForm.value.file) {
      formData.append('image', editPlantForm.value.file)
    }
    if (!editPlantForm.value.previewImage && !editPlantForm.value.file) {
      formData.append('removeImage', 'true')
    }
    await plantStore.updatePlant(editPlantForm.value.id, formData)
    showEditPlant.value = false
    showToast('修改成功')
  } catch (error) {
    console.error('修改失败', error)
  } finally {
    submitting.value = false
  }
}

const handleDeletePlant = async () => {
  try {
    await showConfirmDialog({
      title: '🌱 确认删除植物',
      message: '删除「' + editPlantForm.value.name + '」后，该植物的所有养护记录也会被永久清除，确定要删除吗？',
      confirmButtonText: '确认删除',
      confirmButtonColor: '#E57373',
      cancelButtonText: '取消'
    })
    await plantStore.deletePlant(editPlantForm.value.id)
    showEditPlant.value = false
    if (selectedPlant.value?.id === editPlantForm.value.id) {
      selectedPlant.value = null
      fetchAllRecords()
    } else if (!selectedPlant.value) {
      fetchAllRecords()
    }
    showToast('删除成功')
  } catch (error) {
    // 用户取消
  }
}

const previewImages = (images: string[], index: number = 0) => {
  currentPreviewImages.value = images
  currentPreviewIndex.value = index
  showImagePreview.value = true
}

const previewCareMedia = (index: number) => {
  currentPreviewMedia.value = careForm.value.images.map(img => ({
    id: img.id || 0,
    record_id: 0,
    image_path: img.url,
    file_type: img.file_type || 'image',
    created_at: ''
  }))
  currentPreviewIndex.value = index
  showMediaPreview.value = true
}

const previewMedia = (media: RecordImage[], index: number = 0) => {
  const hasVideo = media.some(item => item.file_type === 'video')
  if (hasVideo) {
    currentPreviewMedia.value = media
    currentPreviewIndex.value = index
    nextTick(() => {
      showMediaPreview.value = true
    })
  } else {
    currentPreviewImages.value = media.map(item => item.image_path)
    currentPreviewIndex.value = index
    showImagePreview.value = true
  }
}

const getVideoThumbnail = (videoPath: string) => {
  return videoPath
}

const goToMyProfile = () => {
  if (authStore.user?.id) {
    router.push(`/user/${authStore.user.id}`)
  }
}

const logout = async () => {
  try {
    await showConfirmDialog({
      title: '确认退出',
      message: '确定要退出登录吗？',
      confirmButtonText: '退出',
      confirmButtonColor: '#C9A9A6'
    })
    authStore.logout()
    router.push('/login')
  } catch (error) {
    // 用户取消
  }
}

const formatTime = (time: string) => {
  return dayjs(time).format('MM-DD HH:mm')
}

onMounted(async () => {
  await plantStore.fetchPlants()
  fetchAllRecords()
})
</script>

<style scoped lang="scss">
@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.home-page {
  .header-top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
  }

  .user-info {
    display: flex;
    align-items: center;
    gap: 12px;

    .avatar {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: linear-gradient(135deg, #8FA98F 0%, #A5C4A5 100%);
      color: white;
      font-size: 18px;
      font-weight: 600;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .user-text {
      .page-title {
        font-size: 18px;
        margin-bottom: 2px;
      }

      .page-subtitle {
        font-size: 12px;
        opacity: 0.9;
      }
    }
  }

  .header-actions {
    display: flex;
    align-items: center;
  }

  .section-header {
    padding: 0 16px;
    margin-bottom: 12px;
    display: flex;
    justify-content: space-between;
    align-items: center;

    h3 {
      font-size: 18px;
      font-weight: 600;
      color: #4A4A4A;
      margin: 0;
    }

    .unselect-tip {
      font-size: 13px;
      color: #8FA98F;
      cursor: pointer;
    }
  }

  .plants-section {
    margin-top: 20px;
    padding-top: 8px;

    .plants-scroll {
      display: flex;
      gap: 12px;
      padding: 8px 16px 16px;
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;

      &::-webkit-scrollbar {
        display: none;
      }
    }

    .plant-card {
      flex-shrink: 0;
      width: 120px;
      background: white;
      border-radius: 16px;
      padding: 12px;
      text-align: center;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
      transition: all 0.3s ease;
      position: relative;
      border: 2px solid transparent;

      &.active {
        border-color: #8FA98F;
        background: linear-gradient(135deg, #F0F8F0 0%, #F8FFF8 100%);
        box-shadow: 0 4px 16px rgba(143, 169, 143, 0.3);
        transform: scale(1.02);

        .plant-name {
          color: #8FA98F;
          font-weight: 700;
        }
      }

      .plant-image-wrapper {
        position: relative;
        width: 80px;
        height: 80px;
        margin: 0 auto 8px;

        .plant-image {
          width: 80px;
          height: 80px;
          border-radius: 12px;
          object-fit: cover;
        }

        .check-badge {
          position: absolute;
          bottom: -6px;
          right: -6px;
          width: 24px;
          height: 24px;
          background: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 6px rgba(143, 169, 143, 0.4);
          border: 2px solid #8FA98F;
        }
      }

      .plant-name {
        font-size: 14px;
        font-weight: 600;
        color: #4A4A4A;
        margin-bottom: 4px;
        transition: all 0.3s ease;
      }

      .plant-type {
        font-size: 12px;
        color: #9E9E9E;
      }

      .edit-btn {
        position: absolute;
        top: 8px;
        right: 8px;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.9);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
        opacity: 1;
        transition: opacity 0.2s ease;

        &:active {
          background: #F5F5F5;
        }
      }

      &:hover .edit-btn {
        opacity: 1;
      }
    }
  }

  .empty-plants {
    text-align: center;
    padding: 60px 20px;

    .empty-icon {
      font-size: 64px;
      margin-bottom: 16px;
    }

    p {
      color: #9E9E9E;
      margin-bottom: 20px;
    }
  }

  .empty-state {
    text-align: center;
    padding: 60px 20px;

    .empty-icon {
      font-size: 48px;
      margin-bottom: 12px;
    }

    p {
      color: #9E9E9E;
      font-size: 14px;
    }
  }

  .action-section {
    margin-top: 24px;
    padding: 0 16px;

    .action-buttons {
      display: flex;
      gap: 16px;

      .action-btn {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 24px;
        border-radius: 16px;
        border: none;
        background: white;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
        transition: all 0.3s ease;

        &:active {
          transform: scale(0.96);
        }

        &.water {
          background: linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%);

          .action-icon {
            background: linear-gradient(135deg, #64B5F6 0%, #42A5F5 100%);
          }
        }

        &.fertilize {
          background: linear-gradient(135deg, #FFF3E0 0%, #FFE0B2 100%);

          .action-icon {
            background: linear-gradient(135deg, #FFB74D 0%, #FF9800 100%);
          }
        }

        .action-icon {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          margin-bottom: 8px;
        }

        span {
          font-size: 14px;
          font-weight: 600;
          color: #4A4A4A;
        }
      }
    }
  }

  .records-section {
    margin-top: 28px;
    padding: 0 16px;

    .section-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 20px;

      .section-icon {
        font-size: 20px;
      }

      h3 {
        font-size: 18px;
        font-weight: 600;
        color: #3D5A3D;
        margin: 0;
      }
    }

    .records-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .record-card {
      background: linear-gradient(145deg, #FFFFFF 0%, #F8FAF8 100%);
      border-radius: 20px;
      padding: 20px;
      box-shadow: 
        0 4px 20px rgba(143, 169, 143, 0.1),
        0 1px 3px rgba(0, 0, 0, 0.05);
      border: 1px solid rgba(143, 169, 143, 0.15);
      transition: all 0.3s ease;

      &:active {
        transform: scale(0.98);
        box-shadow: 0 2px 10px rgba(143, 169, 143, 0.15);
      }

      .record-header {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 14px;
        flex-wrap: wrap;
      }

      .record-icon-wrapper {
        width: 44px;
        height: 44px;
        border-radius: 14px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        transition: transform 0.2s ease;

        &.water {
          background: linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%);
          box-shadow: 0 4px 12px rgba(66, 165, 245, 0.3);
        }

        &.fertilize {
          background: linear-gradient(135deg, #FFF3E0 0%, #FFE0B2 100%);
          box-shadow: 0 4px 12px rgba(255, 152, 0, 0.3);
        }

        .record-icon {
          font-size: 22px;
        }
      }

      .record-badge {
        padding: 4px 12px;
        border-radius: 20px;
        font-size: 13px;
        font-weight: 600;
        flex-shrink: 0;

        &.water {
          background: rgba(66, 165, 245, 0.1);
          color: #1976D2;
        }

        &.fertilize {
          background: rgba(255, 152, 0, 0.1);
          color: #F57C00;
        }
      }

      .plant-name-tag {
        background: linear-gradient(135deg, #8FA98F 0%, #A5C4A5 100%);
        color: white;
        padding: 4px 12px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 500;
        flex-shrink: 0;
        box-shadow: 0 2px 8px rgba(143, 169, 143, 0.3);
      }

      .record-actions {
        margin-left: auto;
        padding: 6px;
        border-radius: 50%;
        transition: background 0.2s ease;

        &:active {
          background: rgba(143, 169, 143, 0.1);
        }
      }

      .record-body {
        margin-bottom: 16px;

        .record-desc {
          font-size: 14px;
          color: #5A6E5A;
          line-height: 1.6;
          margin: 0 0 8px 0;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .record-time {
          font-size: 12px;
          color: #9E9E9E;
          font-weight: 500;
        }
      }

      .record-images-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 8px;
        max-width: 100%;

        .record-image-wrapper {
          aspect-ratio: 1;
          border-radius: 12px;
          overflow: hidden;
          position: relative;
          background: #F5F5F5;
          cursor: pointer;
          transition: transform 0.2s ease, box-shadow 0.2s ease;

          &:active {
            transform: scale(0.95);
          }

          &.image-more {
            border: 2px dashed rgba(143, 169, 143, 0.4);

            .record-image {
              filter: brightness(0.7);
            }
          }

          .record-image {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          .video-wrapper {
            position: relative;
            width: 100%;
            height: 100%;
          }

          .video-thumbnail {
            width: 100%;
            height: 100%;
            object-fit: cover;
            filter: brightness(0.8);
          }

          .video-play-icon {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 32px;
            height: 32px;
            background: rgba(255, 255, 255, 0.9);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            color: #8FA98F;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
          }

          .image-count {
            position: absolute;
            inset: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(0, 0, 0, 0.5);
            color: white;
            font-size: 16px;
            font-weight: 700;
            backdrop-filter: blur(2px);
          }
        }
      }
    }

    .empty-records {
      text-align: center;
      padding: 60px 20px;
      background: linear-gradient(145deg, #FAFBFA 0%, #F0F4F0 100%);
      border-radius: 24px;
      margin-top: 20px;

      .empty-icon {
        font-size: 56px;
        margin-bottom: 16px;
        animation: bounce 2s ease-in-out infinite;
      }

      p {
        color: #767676;
        font-size: 15px;
        margin: 0 0 8px 0;
      }

      .empty-hint {
        font-size: 13px;
        color: #9E9E9E;
        margin: 0;
      }
    }
  }

  .care-modal {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: #FAFBFA;
    border-radius: 24px 24px 0 0;
    overflow: hidden;

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 24px 24px 16px;
      background: white;
      border-bottom: 1px solid #F0F0F0;

      h3 {
        font-size: 18px;
        font-weight: 600;
        color: #4A4A4A;
        margin: 0;
      }

      .van-icon {
        font-size: 24px;
        color: #9E9E9E;
        padding: 8px;
        border-radius: 50%;
        transition: all 0.2s ease;

        &:active {
          background: #F5F5F5;
        }
      }
    }

    .modal-content {
      flex: 1;
      padding: 20px 24px;
      overflow-y: auto;
      background: #FAFBFA;
    }

    .modal-footer {
      padding: 16px 24px 24px;
      background: white;
      border-top: 1px solid #F0F0F0;
      position: sticky;
      bottom: 0;

      .van-button {
        height: 48px;
        font-size: 16px;
        font-weight: 600;
      }
    }

    .image-section {
      margin-top: 8px;

      .section-label {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
        padding: 0 4px;

        .label-text {
          font-size: 15px;
          font-weight: 600;
          color: #4A4A4A;
        }

        .label-count {
          font-size: 13px;
          color: #8FA98F;
          font-weight: 600;
          background: rgba(143, 169, 143, 0.1);
          padding: 4px 12px;
          border-radius: 20px;
        }
      }

      .image-grid-container {
        background: white;
        border-radius: 16px;
        padding: 16px;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
      }

      .image-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 12px;
        grid-auto-rows: 1fr;
      }

      .image-grid-item {
        position: relative;
        aspect-ratio: 1;
        border-radius: 12px;
        overflow: hidden;
        background: #F5F5F5;
        cursor: pointer;
        transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        animation: fadeInUp 0.3s ease forwards;

        &:active {
          transform: scale(0.96);
        }

        &.upload-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #F8FFF8 0%, #F0F8F0 100%);
          border: 2px dashed rgba(143, 169, 143, 0.4);
          border-radius: 12px;
          transition: all 0.25s ease;

          &:active {
            background: linear-gradient(135deg, #F0F8F0 0%, #E8F0E8 100%);
            border-color: rgba(143, 169, 143, 0.6);
          }

          .upload-icon-wrapper {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: rgba(143, 169, 143, 0.1);
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 6px;
            transition: all 0.25s ease;
          }

          .upload-text {
            font-size: 12px;
            color: #8FA98F;
            font-weight: 500;
          }
        }

        .grid-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .video-preview-wrapper {
          position: relative;
          width: 100%;
          height: 100%;

          .video-preview {
            width: 100%;
            height: 100%;
            object-fit: cover;
            filter: brightness(0.8);
          }

          .video-play-icon-overlay {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 36px;
            height: 36px;
            background: rgba(255, 255, 255, 0.9);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            color: #8FA98F;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
          }
        }

        .remove-btn {
          position: absolute;
          top: 4px;
          right: 4px;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: rgba(0, 0, 0, 0.7);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          transition: all 0.25s ease;
          z-index: 10;
          opacity: 1;
          transform: scale(1);

          &:active {
            background: rgba(0, 0, 0, 0.9);
            transform: scale(0.95);
          }
        }

        &:hover .remove-btn {
          background: rgba(0, 0, 0, 0.9);
        }
      }

      .image-tip {
        text-align: center;
        font-size: 12px;
        color: #9E9E9E;
        margin: 12px 0 0;
        padding: 0 4px;
      }
    }

    .image-upload-single {
      width: 80px;
      height: 80px;
      border-radius: 12px;
      border: 2px dashed #E0E0E0;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      background: #FAFAFA;
      transition: all 0.2s ease;

      &:active {
        background: #F0F0F0;
        border-color: #8FA98F;
      }

      .preview-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }
  }

  .add-plant-modal {
    height: 100%;
    display: flex;
    flex-direction: column;
    background: linear-gradient(180deg, #FAFFF8 0%, #FFFFFF 30%);
  }

  .add-plant-modal .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 24px;
    border-bottom: 1px solid #E8F0E8;
    background: rgba(91, 140, 90, 0.05);
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .delete-plant-btn {
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background: rgba(229, 115, 115, 0.1);
    color: #E57373;
    transition: all 0.2s ease;
    cursor: pointer;

    svg {
      width: 18px;
      height: 18px;
    }

    &:active {
      background: rgba(229, 115, 115, 0.2);
      transform: scale(0.95);
    }
  }

  .header-decoration {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .leaf-icon {
    font-size: 20px;
    animation: sway 3s ease-in-out infinite;
  }

  .header-title {
    font-size: 20px;
    font-weight: 700;
    color: #3D5A3D;
    letter-spacing: 1px;
  }

  .close-btn {
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.05);
    color: #666;
    transition: all 0.2s ease;

    &:active {
      background: rgba(0, 0, 0, 0.1);
      transform: scale(0.95);
    }
  }

  .plant-form {
    flex: 1;
    padding: 20px 24px;
    overflow-y: auto;
  }

  .form-section {
    margin-bottom: 24px;
  }

  .section-label {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;
  }

  .label-icon {
    font-size: 18px;
  }

  .section-label span:nth-child(2) {
    font-size: 15px;
    font-weight: 600;
    color: #4A5D4A;
  }

  .optional-badge {
    font-size: 11px;
    color: #8FA98F;
    background: rgba(143, 169, 143, 0.1);
    padding: 2px 8px;
    border-radius: 10px;
    margin-left: auto;
  }

  .input-wrapper {
    background: white;
    border-radius: 16px;
    padding: 4px;
    box-shadow: 0 2px 8px rgba(143, 169, 143, 0.08);
  }

  .custom-field {
    --van-field-label-width: 0;
    --van-field-label-color: transparent;
    --van-field-error-message-color: #E57373;
    border: none;

    :deep(.van-field__control) {
      font-size: 15px;
      color: #3D5A3D;
    }

    :deep(.van-field__placeholder) {
      color: #B0B0B0;
    }
  }

  .type-picker-wrapper {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: white;
    border-radius: 16px;
    padding: 14px 16px;
    box-shadow: 0 2px 8px rgba(143, 169, 143, 0.08);
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 15px;
    color: #3D5A3D;

    &:active {
      transform: scale(0.98);
      box-shadow: 0 1px 4px rgba(143, 169, 143, 0.1);
    }
  }

  .type-display {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .placeholder-text {
    font-size: 15px;
    color: #B0B0B0;
  }

  .image-upload-area {
    position: relative;
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .upload-box {
    width: 100px;
    height: 100px;
    border-radius: 20px;
    border: 2px dashed #C8D6C8;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: visible;
    background: rgba(143, 169, 143, 0.05);
    cursor: pointer;
    transition: all 0.3s ease;
    position: relative;

    &:hover {
      border-color: #8FA98F;
      background: rgba(143, 169, 143, 0.1);
    }

    &:active {
      transform: scale(0.98);
    }
  }

  .upload-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    color: #8FA98F;
    font-size: 13px;
  }

  .plant-preview {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 20px;
  }

  .plant-remove-btn {
    position: absolute;
    top: -8px;
    right: -8px;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.7);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    transition: all 0.25s ease;
    z-index: 10;
    opacity: 1;
    transform: scale(1);

    &:active {
      background: rgba(0, 0, 0, 0.9);
      transform: scale(0.95);
    }
  }

  .remove-image-btn {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.5);
    color: white;
    cursor: pointer;
    transition: all 0.2s ease;

    &:active {
      background: rgba(0, 0, 0, 0.7);
      transform: scale(0.95);
    }
  }

  .form-actions {
    padding: 16px 0 24px;
  }

  .submit-btn {
    height: 52px;
    font-size: 16px;
    font-weight: 600;
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    box-shadow: 0 4px 16px rgba(91, 140, 90, 0.25);
    transition: all 0.2s ease;

    &:active {
      transform: scale(0.98);
      box-shadow: 0 2px 8px rgba(91, 140, 90, 0.3);
    }
  }

  .btn-icon {
    font-size: 20px;
  }

  .add-plant-modal .modal-footer {
    padding: 16px 24px;
    text-align: center;
    background: transparent;
    border-top: none;
  }

  .add-plant-modal .modal-footer p {
    font-size: 13px;
    color: #8FA98F;
    margin: 0;
    font-style: italic;
  }

  .textarea-field {
    :deep(.van-field__control) {
      min-height: 80px;
      line-height: 1.6;
    }
  }

  @keyframes sway {
    0%, 100% {
      transform: rotate(-5deg);
    }
    50% {
      transform: rotate(5deg);
    }
  }
}
</style>