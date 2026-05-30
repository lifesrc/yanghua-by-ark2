
<template>
  <van-popup 
    v-model:show="visible" 
    :close-on-click-overlay="false"
    position="top"
    :style="{ background: 'rgba(0,0,0,0.9)', padding: '0', boxShadow: 'none', height: '100%' }"
  >
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
                playsinline
                @timeupdate="updateProgress(index)"
                @loadedmetadata="onVideoLoaded(index)"
              />
              <van-icon 
                v-if="!isPlaying(index)"
                name="play-circle" 
                class="video-play-indicator" 
              />
            </template>
            <template v-else>
              <img :src="item.image_path" class="preview-image" />
            </template>
          </div>
        </van-swipe-item>
      </van-swipe>

      <div class="video-controls" v-if="media[swipeIndex]?.file_type === 'video'">
        <div class="progress-bar" @click="seekVideo">
          <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
          <div class="progress-thumb" :style="{ left: progressPercent + '%' }"></div>
        </div>
        <div class="time-display">
          <span class="current-time">{{ formatTime(currentTime) }}</span>
          <span class="duration">{{ formatTime(duration) }}</span>
        </div>
      </div>

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

interface Props {
  show: boolean
  media: RecordImage[]
  startIndex?: number
}

interface VideoProgress {
  currentTime: number
  duration: number
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
const videoProgress = ref<Map<number, VideoProgress>>(new Map())

const currentTime = computed(() => {
  const progress = videoProgress.value.get(swipeIndex.value)
  return progress?.currentTime || 0
})

const duration = computed(() => {
  const progress = videoProgress.value.get(swipeIndex.value)
  return progress?.duration || 0
})

const progressPercent = computed(() => {
  if (duration.value === 0) return 0
  return (currentTime.value / duration.value) * 100
})

const isPlaying = (index: number) => {
  const video = videoRefs.value[index]
  return video && !video.paused
}

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

const updateProgress = (index: number) => {
  const video = videoRefs.value[index]
  if (video) {
    const current = videoProgress.value.get(index) || { currentTime: 0, duration: 0 }
    videoProgress.value.set(index, {
      ...current,
      currentTime: video.currentTime,
      duration: video.duration || 0
    })
  }
}

const onVideoLoaded = (index: number) => {
  const video = videoRefs.value[index]
  if (video) {
    const current = videoProgress.value.get(index) || { currentTime: 0, duration: 0 }
    videoProgress.value.set(index, {
      ...current,
      duration: video.duration || 0
    })
  }
}

const seekVideo = (e: MouseEvent) => {
  const video = videoRefs.value[swipeIndex.value]
  if (!video) return
  
  const target = e.currentTarget as HTMLElement
  const rect = target.getBoundingClientRect()
  const percent = (e.clientX - rect.left) / rect.width
  video.currentTime = percent * video.duration
}

const pauseAllVideos = () => {
  videoRefs.value.forEach(video => {
    if (video) {
      video.pause()
    }
  })
}

const autoPlayCurrentVideo = () => {
  const currentMedia = props.media[swipeIndex.value]
  if (currentMedia?.file_type === 'video') {
    setTimeout(() => {
      const video = videoRefs.value[swipeIndex.value]
      if (video) {
        video.play().catch(() => {})
      }
    }, 100)
  }
}

const onSwipeChange = (index: number) => {
  pauseAllVideos()
  swipeIndex.value = index
  
  const currentMedia = props.media[index]
  if (currentMedia?.file_type === 'video') {
    setTimeout(() => {
      const video = videoRefs.value[index]
      if (video) {
        video.play().catch(() => {})
      }
    }, 100)
  }
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

watch(() => props.show, (newVal) => {
  if (newVal) {
    swipeIndex.value = props.startIndex
    swipeRef.value?.swipeTo(props.startIndex)
    document.body.style.overflow = 'hidden'
    setTimeout(() => {
      autoPlayCurrentVideo()
    }, 200)
  } else {
    pauseAllVideos()
    document.body.style.overflow = ''
  }
}, { immediate: true })

watch(() => props.startIndex, (newVal) => {
  swipeIndex.value = newVal
  if (visible.value) {
    swipeRef.value?.swipeTo(newVal)
  }
})

watch(swipeIndex, (newIndex, oldIndex) => {
  if (oldIndex !== newIndex && oldIndex >= 0) {
    const oldVideo = videoRefs.value[oldIndex]
    if (oldVideo) {
      const current = videoProgress.value.get(oldIndex) || { currentTime: 0, duration: 0 }
      videoProgress.value.set(oldIndex, {
        ...current,
        currentTime: oldVideo.currentTime,
        duration: oldVideo.duration || 0
      })
    }
    
    const newVideo = videoRefs.value[newIndex]
    if (newVideo) {
      const savedProgress = videoProgress.value.get(newIndex)
      if (savedProgress) {
        newVideo.currentTime = savedProgress.currentTime
      }
    }
  }
  pauseAllVideos()
})
</script>

<style scoped lang="scss">
.media-preview {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;

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
    position: relative;

    .preview-image {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
    }

    .preview-video {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
      display: block;
    }

    .video-play-indicator {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 64px;
      color: rgba(255, 255, 255, 0.8);
      pointer-events: none;
      opacity: 1;
      transition: opacity 0.2s ease;
    }
  }

  .video-controls {
    position: absolute;
    bottom: 80px;
    left: 20px;
    right: 20px;
    z-index: 100;

    .progress-bar {
      position: relative;
      height: 4px;
      background: rgba(255, 255, 255, 0.3);
      border-radius: 2px;
      cursor: pointer;

      .progress-fill {
        position: absolute;
        top: 0;
        left: 0;
        height: 100%;
        background: #8FA98F;
        border-radius: 2px;
        transition: width 0.1s linear;
      }

      .progress-thumb {
        position: absolute;
        top: 50%;
        width: 12px;
        height: 12px;
        background: white;
        border-radius: 50%;
        transform: translate(-50%, -50%);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        transition: left 0.1s linear;
      }
    }

    .time-display {
      display: flex;
      justify-content: space-between;
      margin-top: 8px;
      color: rgba(255, 255, 255, 0.8);
      font-size: 12px;

      .current-time,
      .duration {
        font-family: monospace;
      }
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
