<template>
  <div class="page-container square-page">
    <van-nav-bar title="广场" fixed placeholder />

    <!-- <van-pull-refresh v-model="refreshing" @refresh="onRefresh"> -->
      <van-list
        v-model:loading="loading"
        :finished="finished"
        finished-text="没有更多了"
        @load="onLoad"
        offset="10"
      >
        <div class="records-list">
          <RecordCard
            v-for="record in records"
            :key="record.id"
            :record="record"
            :show-user="true"
            :show-plant="true"
            layout="social"
            @preview-image="handlePreviewImage"
          />
        </div>
      </van-list>
    <!-- </van-pull-refresh> -->

    <van-image-preview v-model:show="showPreview" :images="previewImages" :start-position="previewIndex" />

    <TabBar />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { showToast } from 'vant'
import request from '@/utils/request'
import type { SquareRecord } from '@/types'
import TabBar from '@/components/TabBar.vue'
import RecordCard from '@/components/RecordCard.vue'

const PAGE_SIZE = 10
const records = ref<SquareRecord[]>([])
const loading = ref(false)
const finished = ref(false)
const refreshing = ref(false)
const showPreview = ref(false)
const previewImages = ref<string[]>([])
const previewIndex = ref(0)

const fetchRecords = async (isRefresh = false) => {
  try {
    const offset = isRefresh ? 0 : records.value.length
    const res = await request.get('/records/all', {
      params: { limit: PAGE_SIZE, offset }
    })

    const newRecords = res.data || []

    if (isRefresh) {
      records.value = newRecords
    } else {
      records.value = [...records.value, ...newRecords]
    }

    if (newRecords.length < PAGE_SIZE) {
      finished.value = true
    }
  } catch (error) {
    showToast('加载失败，请稍后重试')
    console.error('加载记录失败:', error)
  }
}

const onLoad = async () => {
  await fetchRecords(false)
  loading.value = false
}

const onRefresh = async () => {
  finished.value = false
  await fetchRecords(true)
  refreshing.value = false
}

const handlePreviewImage = (images: string[], index: number) => {
  previewImages.value = images
  previewIndex.value = index
  showPreview.value = true
}
</script>

<style scoped lang="scss">
.square-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #F5F9F5 0%, #FAFFFA 100%);
  padding-bottom: 60px;

  .records-list {
    padding: 12px 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
}
</style>
