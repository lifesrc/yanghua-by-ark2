<template>
  <div class="page-container home-page">
    <div class="page-header">
      <div class="header-top">
        <div class="user-info">
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

    <div class="records-section" v-if="selectedPlant">
      <div class="section-header">
        <h3>养护记录</h3>
      </div>
      <div class="records-list" v-if="plantRecords.length > 0">
        <div v-for="record in plantRecords" :key="record.id" class="record-item">
          <div class="record-icon" :class="record.type">
            {{ record.type === 'water' ? '💧' : '🧪' }}
          </div>
          <div class="record-content">
            <div class="record-title">
              {{ record.type === 'water' ? '浇水' : '施肥' }}
            </div>
            <div class="record-desc" v-if="record.description">{{ record.description }}</div>
            <div class="record-time">{{ formatTime(record.created_at) }}</div>
          </div>
          <img v-if="record.image" :src="record.image" class="record-image" @click="previewImage(record.image)" />
        </div>
      </div>
      <div class="empty-records" v-else>
        <p>还没有养护记录</p>
      </div>
    </div>

    <div class="empty-state" v-if="!selectedPlant && plantStore.plants.length > 0">
      <div class="empty-icon">👆</div>
      <p>请在上方选择一盆植物</p>
    </div>

    <van-popup v-model:show="showCareModal" position="bottom" round>
      <div class="care-modal">
        <div class="modal-header">
          <h3>{{ careType === 'water' ? '💧 记录浇水' : '🧪 记录施肥' }}</h3>
          <van-icon name="cross" @click="showCareModal = false" />
        </div>
        <van-form @submit="submitCare">
          <van-field
            v-model="careForm.description"
            name="description"
            label="状态描述"
            type="textarea"
            rows="3"
            placeholder="记录一下植物的状态（可选）"
          />
          <van-field name="image" label="上传照片">
            <template #input>
              <div class="image-upload" @click="triggerFileInput">
                <img v-if="careForm.previewImage" :src="careForm.previewImage" class="preview-image" />
                <van-icon v-else name="plus" size="24" color="#9E9E9E" />
              </div>
            </template>
          </van-field>
          <input
            ref="fileInputRef"
            type="file"
            accept="image/*"
            style="display: none"
            @change="handleFileChange"
          />
          <div style="padding: 20px">
            <van-button round block type="primary" color="#8FA98F" native-type="submit" :loading="submitting">
              保存记录
            </van-button>
          </div>
        </van-form>
      </div>
    </van-popup>

    <van-popup v-model:show="showAddPlant" position="bottom" round>
      <div class="care-modal">
        <div class="modal-header">
          <h3>🌱 添加植物</h3>
          <van-icon name="cross" @click="showAddPlant = false" />
        </div>
        <van-form @submit="addPlant">
          <van-field
            v-model="newPlantForm.name"
            name="name"
            label="植物名称"
            placeholder="给你的植物起个名字"
            :rules="[{ required: true, message: '请填写植物名称' }]"
          />
          <van-field
            v-model="newPlantForm.type"
            name="type"
            label="植物类型"
            is-link
            readonly
            placeholder="选择植物类型"
            @click="showTypePicker = true"
          />
          <van-field name="image" label="植物照片">
            <template #input>
              <div class="image-upload" @click="triggerPlantFileInput">
                <img v-if="newPlantForm.previewImage" :src="newPlantForm.previewImage" class="preview-image" />
                <van-icon v-else name="plus" size="24" color="#9E9E9E" />
              </div>
            </template>
          </van-field>
          <input
            ref="plantFileInputRef"
            type="file"
            accept="image/*"
            style="display: none"
            @change="handlePlantFileChange"
          />
          <div style="padding: 20px">
            <van-button round block type="primary" color="#8FA98F" native-type="submit" :loading="submitting">
              添加植物
            </van-button>
          </div>
        </van-form>
      </div>
    </van-popup>

    <van-popup v-model:show="showTypePicker" position="bottom">
      <van-picker
        :columns="plantTypeOptions"
        @confirm="onTypeConfirm"
        @cancel="showTypePicker = false"
      />
    </van-popup>

    <van-image-preview v-model:show="showImagePreview" :images="[currentPreviewImage]" />

    <TabBar />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { usePlantStore } from '@/stores/plant'
import { PlantTypeLabels, type Plant, type CareRecord, type PlantType } from '@/types'
import request from '@/utils/request'
import dayjs from 'dayjs'
import TabBar from '@/components/TabBar.vue'
import { showConfirmDialog } from 'vant'

const router = useRouter()
const authStore = useAuthStore()
const plantStore = usePlantStore()

const selectedPlant = ref<Plant | null>(null)
const plantRecords = ref<CareRecord[]>([])
const showCareModal = ref(false)
const careType = ref<'water' | 'fertilize'>('water')
const submitting = ref(false)
const showAddPlant = ref(false)
const showTypePicker = ref(false)
const showImagePreview = ref(false)
const currentPreviewImage = ref('')
const fileInputRef = ref<HTMLInputElement | null>(null)
const plantFileInputRef = ref<HTMLInputElement | null>(null)

const defaultPlantImage = 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=plant%20pot%20simple%20morandi%20color&image_size=square_hd'

const careForm = ref({
  description: '',
  previewImage: ''
})

const newPlantForm = ref({
  name: '',
  type: '' as PlantType,
  previewImage: ''
})

const plantTypeOptions = Object.entries(PlantTypeLabels).map(([value, text]) => ({ text, value }))

const selectPlant = (plant: Plant) => {
  if (selectedPlant.value?.id === plant.id) {
    selectedPlant.value = null
    plantRecords.value = []
  } else {
    selectedPlant.value = plant
    fetchPlantRecords(plant.id)
  }
}

const unselectPlant = () => {
  selectedPlant.value = null
  plantRecords.value = []
}

const fetchPlantRecords = async (plantId: number) => {
  try {
    const res = await request.get('/records')
    plantRecords.value = res.data
      .filter((r: CareRecord) => r.plant_id === plantId)
      .slice(0, 10)
  } catch (error) {
    console.error('获取记录失败', error)
  }
}

const openCareModal = (type: 'water' | 'fertilize') => {
  careType.value = type
  careForm.value = { description: '', previewImage: '' }
  showCareModal.value = true
}

const triggerFileInput = () => {
  fileInputRef.value?.click()
}

const triggerPlantFileInput = () => {
  plantFileInputRef.value?.click()
}

const handleFileChange = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (event) => {
      careForm.value.previewImage = event.target?.result as string
    }
    reader.readAsDataURL(file)
  }
}

const handlePlantFileChange = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (event) => {
      newPlantForm.value.previewImage = event.target?.result as string
    }
    reader.readAsDataURL(file)
  }
}

const submitCare = async () => {
  if (!selectedPlant.value) return
  submitting.value = true
  try {
    const formData = new FormData()
    formData.append('plantId', selectedPlant.value.id.toString())
    formData.append('type', careType.value)
    if (careForm.value.description) {
      formData.append('description', careForm.value.description)
    }
    const fileInput = fileInputRef.value
    if (fileInput?.files?.[0]) {
      formData.append('image', fileInput.files[0])
    }
    await request.post('/records', formData)
    showCareModal.value = false
    fetchPlantRecords(selectedPlant.value.id)
  } catch (error) {
    console.error('提交失败', error)
  } finally {
    submitting.value = false
  }
}

const addPlant = async () => {
  if (!newPlantForm.value.name || !newPlantForm.value.type) return
  submitting.value = true
  try {
    const formData = new FormData()
    formData.append('name', newPlantForm.value.name)
    formData.append('type', newPlantForm.value.type)
    const fileInput = plantFileInputRef.value
    if (fileInput?.files?.[0]) {
      formData.append('image', fileInput.files[0])
    }
    await plantStore.createPlant(formData)
    showAddPlant.value = false
    newPlantForm.value = { name: '', type: 'succulent', previewImage: '' }
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

const previewImage = (url: string) => {
  currentPreviewImage.value = url
  showImagePreview.value = true
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
  // 默认不选中任何植物
})
</script>

<style scoped lang="scss">
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
          top: -6px;
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
    margin-top: 24px;

    .records-list {
      padding: 0 16px;
    }

    .record-item {
      display: flex;
      align-items: center;
      padding: 16px;
      background: white;
      border-radius: 12px;
      margin-bottom: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);

      .record-icon {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
        margin-right: 12px;
        flex-shrink: 0;

        &.water {
          background: #E3F2FD;
        }

        &.fertilize {
          background: #FFF3E0;
        }
      }

      .record-content {
        flex: 1;

        .record-title {
          font-size: 14px;
          font-weight: 600;
          color: #4A4A4A;
          margin-bottom: 4px;
        }

        .record-desc {
          font-size: 13px;
          color: #767676;
          margin-bottom: 4px;
        }

        .record-time {
          font-size: 12px;
          color: #9E9E9E;
        }
      }

      .record-image {
        width: 48px;
        height: 48px;
        border-radius: 8px;
        object-fit: cover;
        margin-left: 12px;
        flex-shrink: 0;
      }
    }

    .empty-records {
      text-align: center;
      padding: 40px;
      color: #9E9E9E;
      font-size: 14px;
    }
  }

  .care-modal {
    padding: 20px 0;

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 20px 20px;
      border-bottom: 1px solid #F0F0F0;

      h3 {
        font-size: 18px;
        font-weight: 600;
        color: #4A4A4A;
        margin: 0;
      }
    }

    .image-upload {
      width: 80px;
      height: 80px;
      border-radius: 12px;
      border: 2px dashed #E0E0E0;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;

      .preview-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }
  }
}
</style>
