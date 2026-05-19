<template>
  <div class="page-container user-records-page">
    <van-nav-bar :title="`${username}的养护记录`" left-arrow @click-left="handleBack" />

    <div class="records-section">
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
          :show-plant="true"
          layout="timeline"
        />
      </van-list>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast } from 'vant'
import { api } from '@/api'
import RecordCard from '@/components/RecordCard.vue'
import type { SquareRecord } from '@/types'

const route = useRoute()
const router = useRouter()

const records = ref<SquareRecord[]>([])
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
    if (response.data.success && response.data.data) {
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
  getUsername()
  onLoad()
})
</script>

<style scoped lang="scss">
.user-records-page {
  min-height: 100vh;
  background-color: #f8f9fa;
  padding-bottom: 60px;
}

.records-section {
  padding: 12px 16px;
}
</style>
