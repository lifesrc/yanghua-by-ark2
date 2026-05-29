
<template>
  <van-popup v-model:show="visible" position="center" :style="{ background: 'rgba(0, 0, 0, 0.9)' }">
    <div class="media-preview">
      <van-icon name="cross" class="close-btn" @click="visible = false" />
      
      <div class="preview-header">
        <span class="page-indicator">{{ swipeIndex + 1 }} / {{ media.length }}</span>
      </div>

      <van-swipe
        ref="swipeRef"
        :loop="false"
        :show-indicators="false"
        :initial-swipe="swipeIndex"
        @change="onSwipeChange"
        class="media-swipe"
      >
        <van-swipe-item v-for="(item, index) in media" :key="item.id">
          <div class="preview-content" @click="togglePlay(index)">
            <template v-if="item.file_type === 'video'">
              <video 
                :ref="el => { if (el) videoRefs[index] = el as HTMLVideoElement }"
                :src="item.image_path" 
                class="preview-video"
                controls
                playsinline
              />
            </template>
            <template v-else>
              <img :src="item.image_path" class="preview-image" />
            </template>
          </div>
        </van-swipe-item>
      </van-swipe>

      <div class="preview-footer" v-if="media.length > 1">
        <van-icon 
          name="arrow-left" 
          class="nav-btn prev-btn" 
          @click="goPrev" 
          :class="{ disabled: swipeIndex === 0 }"
        />
        <van-icon 
          name="arrow" 
          class="nav-btn next-btn" 
          @click="goNext"
          :class="{ disabled: swipeIndex === media.length - 1 }"
        />
      </div>
    </div>
  </van-popup>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { RecordImage } from '@/types'
import { Swipe as VanSwipe, SwipeItem as VanSwipeItem } from 'vant'

interface Props {
  show: boolean
  media: RecordImage[]
  startIndex?: number
}

const props = withDefaults(defineProps<Props>(), {
  startIndex: 0
})

const emit = defineEmits<{
  (e: 'update:show', value: boolean): void
}>()

const visible = computed({
  get: () => props.show,
  set: (val) => emit('update:show', val)
})

const swipeIndex = ref(props.startIndex)
const swipeRef = ref<any>(null)
const videoRefs = ref<HTMLVideoElement[]>([])

watch(() => props.show, (newVal) => {
  if (newVal) {
    swipeIndex.value = props.startIndex
    swipeRef.value?.swipeTo(props.startIndex)
  }
}, { immediate: true })

watch(() => props.startIndex, (newVal) => {
  swipeIndex.value = newVal
  if (visible.value) {
    swipeRef.value?.swipeTo(newVal)
  }
})

const onSwipeChange = (index: number) => {
  pauseAllVideos()
  swipeIndex.value = index
}

const pauseAllVideos = () => {
  videoRefs.value.forEach(video => {
    if (video) {
      video.pause()
    }
  })
}

const goPrev = () => {
  if (swipeIndex.value > 0) {
    swipeIndex.value--
  }
}

const goNext = () => {
  if (swipeIndex.value < props.media.length - 1) {
    swipeIndex.value++
  }
}

const togglePlay = (index: number) => {
  const currentVideo = videoRefs.value[index]
  if (currentVideo) {
    if (currentVideo.paused) {
      currentVideo.play()
    } else {
      currentVideo.pause()
    }
  }
}
</script>

<style scoped lang="scss">
.media-preview {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;

  .media-swipe {
    width: 100%;
    height: 100%;
    
    :deep(.van-swipe__track) {
      height: 100%;
      display: flex;
      align-items: center;
    }
    
    :deep(.van-swipe-item) {
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }

  .close-btn {
    position: absolute;
    top: 20px;
    right: 20px;
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.5);
    border-radius: 50%;
    color: white;
    font-size: 24px;
    z-index: 100;
    cursor: pointer;

    &:active {
      opacity: 0.7;
    }
  }

  .preview-header {
    position: absolute;
    top: 20px;
    left: 20px;
    z-index: 100;

    .page-indicator {
      padding: 6px 12px;
      background: rgba(0, 0, 0, 0.5);
      border-radius: 12px;
      color: white;
      font-size: 14px;
      font-weight: 500;
    }
  }

  .preview-content {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #000;
    cursor: pointer;

    .preview-image {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
    }

    .preview-video {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
    }
  }

  .preview-footer {
    position: absolute;
    bottom: 30px;
    left: 0;
    right: 0;
    display: flex;
    justify-content: space-between;
    padding: 0 20px;
    z-index: 100;

    .nav-btn {
      width: 48px;
      height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(0, 0, 0, 0.5);
      border-radius: 50%;
      color: white;
      font-size: 28px;
      cursor: pointer;

      &:active {
        opacity: 0.7;
      }

      &.disabled {
        opacity: 0.3;
        pointer-events: none;
      }
    }
  }
}
</style>
