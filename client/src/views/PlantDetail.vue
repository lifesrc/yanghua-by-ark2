<template>
  <div class="page-container plant-detail-page">
    <van-nav-bar title="植物详情" left-arrow @click-left="handleBack" />

    <div class="plant-info-section" v-if="plant">
      <div class="plant-image-wrapper">
        <img :src="plant.image || defaultPlantImage" class="plant-image" />
      </div>

      <div class="plant-details">
        <h2 class="plant-name">{{ plant.name }}</h2>
        <p class="plant-type">{{ PlantTypeLabels[plant.type] }}</p>
        <p class="plant-notes" v-if="plant.notes">{{ plant.notes }}</p>

        <div class="plant-owner" v-if="plant.username">
          <span class="label">所属用户：</span>
          <span class="username" @click="goToUserProfile">{{ plant.username }}</span>
        </div>
      </div>
    </div>

    <div class="records-section">
      <div class="section-header">
        <h3>养护记录</h3>
      </div>

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
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast } from 'vant'
import { api } from '@/api'
import RecordCard from '@/components/RecordCard.vue'
import type { PlantDetail, SquareRecord } from '@/types'
import { PlantTypeLabels } from '@/types'

const route = useRoute()
const router = useRouter()

const plant = ref<PlantDetail | null>(null)
const records = ref<SquareRecord[]>([])
const loading = ref(false)
const finished = ref(false)
const offset = ref(0)
const limit = 15

const defaultPlantImage = 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=200&h=200&fit=crop'

const handleBack = () => {
  router.back()
}

const goToUserProfile = () => {
  if (plant.value?.user_id) {
    router.push(`/user/${plant.value.user_id}`)
  }
}

const getPlantDetail = async () => {
  try {
    const response = await api.get(`/plants/${route.params.id}/detail`)
    if (response.data.success && response.data.data) {
      plant.value = response.data.data
    }
  } catch (error) {
    console.error('获取植物详情失败:', error)
    showToast('获取植物详情失败')
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

    if (response.data.success && response.data.data) {
      const newRecords = response.data.data
      records.value.push(...newRecords)
      offset.value += limit

      if (newRecords.length < limit) {
        finished.value = true
      }
    }
  } catch (error) {
    console.error('获取记录失败:', error)
    showToast('获取记录失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  getPlantDetail()
  onLoad()
})
</script>

<style scoped lang="scss">
.plant-detail-page {
  min-height: 100vh;
  background-color: #f8f9fa;
  padding-bottom: 60px;
}

.plant-info-section {
  background: white;
  margin-bottom: 16px;
}

.plant-image-wrapper {
  width: 100%;
  height: 200px;
  overflow: hidden;
}

.plant-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.plant-details {
  padding: 16px;
}

.plant-name {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 8px;
  color: #333;
}

.plant-type {
  color: #8FA98F;
  margin-bottom: 8px;
}

.plant-notes {
  color: #666;
  line-height: 1.5;
  margin-bottom: 12px;
}

.plant-owner {
  display: flex;
  align-items: center;
  color: #999;

  .label {
    font-size: 14px;
  }

  .username {
    color: #8FA98F;
    cursor: pointer;
    margin-left: 4px;

    &:hover {
      text-decoration: underline;
    }
  }
}

.records-section {
  padding: 0 16px;
}

.section-header {
  margin-bottom: 16px;
  h3 {
    font-size: 18px;
    font-weight: bold;
    color: #333;
    padding-bottom: 8px;
    border-bottom: 1px solid #f0f0f0;
  }
}
</style>
