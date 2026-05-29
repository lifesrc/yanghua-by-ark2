<template>
  <div class="page-container user-records-page">
    <van-nav-bar :title="`${username}的养护记录`" left-arrow @click-left="handleBack" />
    <MediaPreview v-model:show="showMediaPreview" :media="currentPreviewMedia" :start-index="currentPreviewIndex" :key="`${currentPreviewMedia.length}-${currentPreviewIndex}`" />
    <van-image-preview v-model:show="showImagePreview" :images="currentPreviewImages" :start-position="currentPreviewIndex" />

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
          @preview-image="previewMedia"
        />
      </van-list>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast } from 'vant'
import request from '@/utils/request'
import RecordCard from '@/components/RecordCard.vue'
import MediaPreview from '@/components/MediaPreview.vue'
import type { SquareRecord, RecordImage } from '@/types'

const route = useRoute()
const router = useRouter()

const records = ref<SquareRecord[]>([])
const loading = ref(false)
const finished = ref(false)
const offset = ref(0)
const limit = 15
const username = ref('')

const showMediaPreview = ref(false)
const showImagePreview = ref(false)
const currentPreviewMedia = ref<RecordImage[]>([])
const currentPreviewImages = ref<string[]>([])
const currentPreviewIndex = ref(0)

const handleBack = () => {
  router.back()
}

const getUsername = async () => {
  try {
    const response = await request.get(`/users/${route.params.id}`)
    if (response.success && response.data) {
      username.value = response.data.username
    }
  } catch (error) {
    console.error('获取用户信息失败:', error)
  }
}

const previewMedia = (media: RecordImage[], index: number = 0) => {
  const hasVideo = media.some(item => item.file_type === 'video')
  if (hasVideo) {
    currentPreviewMedia.value = media
    currentPreviewIndex.value = index
    showMediaPreview.value = true
  } else {
    currentPreviewImages.value = media.map(item => item.image_path)
    currentPreviewIndex.value = index
    showImagePreview.value = true
  }
}

const onLoad = async () => {
  try {
    const response = await request.get(`/users/${route.params.id}/records`, {
      params: {
        limit,
        offset: offset.value
      }
    })

    if (response.success && response.data) {
      const newRecords = response.data
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
