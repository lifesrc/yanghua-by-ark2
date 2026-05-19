<template>
  <div class="page-container user-plants-page">
    <van-nav-bar :title="`${username}的植物`" left-arrow @click-left="handleBack" />

    <div class="plants-section">
      <div class="plants-grid" v-if="plants.length > 0">
        <PlantCard
          v-for="plant in plants"
          :key="plant.id"
          :plant="plant"
          mode="detail"
          :show-edit="false"
        />
      </div>

      <div class="empty-state" v-else>
        <div class="empty-icon">🌱</div>
        <p>{{ username }}还没有添加植物</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast } from 'vant'
import { api } from '@/api'
import PlantCard from '@/components/PlantCard.vue'
import type { Plant } from '@/types'

const route = useRoute()
const router = useRouter()

const plants = ref<Plant[]>([])
const username = ref('')

const handleBack = () => {
  router.back()
}

const getPlants = async () => {
  try {
    const response = await api.get(`/users/${route.params.id}/plants`)
    if (response.data.success && response.data.data) {
      plants.value = response.data.data
    }
  } catch (error) {
    console.error('获取植物列表失败:', error)
    showToast('获取植物列表失败')
  }
}

const getUsername = async () => {
  try {
    const response = await api.get(`/users/${route.params.id}`)
    if (response.data.success && response.data.data) {
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

<style scoped lang="scss">
.user-plants-page {
  min-height: 100vh;
  background-color: #f8f9fa;
  padding-bottom: 60px;
}

.plants-section {
  padding: 16px;
}

.plants-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-state p {
  color: #999;
}
</style>
