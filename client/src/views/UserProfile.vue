<template>
  <div class="page-container user-profile-page">
    <van-nav-bar title="个人主页" left-arrow @click-left="handleBack" />

    <div class="user-info-section" v-if="user">
      <div class="avatar-wrapper">
        <img :src="user.avatar || defaultAvatar" class="avatar" />
      </div>

      <div class="user-details">
        <h2 class="username">{{ user.username }}</h2>
        <p class="join-time">注册时间：{{ formatDate(user.created_at) }}</p>
      </div>
    </div>

    <div class="nav-cards">
      <div
        class="nav-card"
        @click="navigateToStats"
      >
        <div class="nav-item">
          <span class="nav-icon">📊</span>
          <span class="nav-text">ta 的统计</span>
          <span class="nav-arrow">→</span>
        </div>
      </div>

      <div
        class="nav-card"
        @click="navigateToPlants"
      >
        <div class="nav-item">
          <span class="nav-icon">🌱</span>
          <span class="nav-text">ta 的植物</span>
          <span class="nav-arrow">→</span>
        </div>
      </div>

      <div
        class="nav-card"
        @click="navigateToRecords"
      >
        <div class="nav-item">
          <span class="nav-icon">📝</span>
          <span class="nav-text">ta 的记录</span>
          <span class="nav-arrow">→</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast } from 'vant'
import request from '@/utils/request'
import type { User } from '@/types'

const route = useRoute()
const router = useRouter()

const user = ref<User | null>(null)
const defaultAvatar = 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=200&h=200&fit=crop'

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

const handleBack = () => {
  router.back()
}

const navigateToStats = () => {
  if (user.value?.id) {
    router.push(`/user/${user.value.id}/stats`)
  }
}

const navigateToPlants = () => {
  if (user.value?.id) {
    router.push(`/user/${user.value.id}/plants`)
  }
}

const navigateToRecords = () => {
  if (user.value?.id) {
    router.push(`/user/${user.value.id}/records`)
  }
}

const getUserInfo = async () => {
  try {
    if (route.params.id) {
      const res = await request.get(`/users/${route.params.id}`) as any
      if (res.success && res.data) {
        user.value = res.data
      }
    } else {
      showToast('无法获取用户信息')
    }
  } catch (error) {
    console.error('获取用户信息失败:', error)
    showToast('获取用户信息失败')
  }
}

onMounted(() => {
  getUserInfo()
})
</script>

<style scoped lang="scss">
.user-profile-page {
  min-height: 100vh;
  background-color: #f8f9fa;
  padding-bottom: 60px;
}

.user-info-section {
  background: white;
  padding: 24px 16px;
  margin-bottom: 16px;
  text-align: center;
}

.avatar-wrapper {
  margin-bottom: 16px;
}

.avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
}

.user-details {
  margin-bottom: 16px;
}

.username {
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin-bottom: 8px;
}

.join-time {
  color: #999;
  font-size: 14px;
}

.nav-cards {
  padding: 0 16px;
}

.nav-card {
  margin-bottom: 12px;
  border-radius: 12px;
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
  font-size: 18px;
}
</style>
