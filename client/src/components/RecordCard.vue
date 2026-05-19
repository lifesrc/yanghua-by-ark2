<template>
  <div class="record-card" :class="layout">
    <!-- Social Layout: Avatar on left -->
    <template v-if="layout === 'social'">
      <div class="card-avatar clickable" v-if="showUser && record.user_avatar" @click="goToUserProfile">
        <img :src="record.user_avatar" class="avatar-img" />
      </div>
      <div class="card-avatar-placeholder clickable" v-else-if="showUser" @click="goToUserProfile">
        {{ (record as SquareRecord).username?.charAt(0) || '?' }}
      </div>

      <div class="card-content">
        <div class="card-header">
          <div class="user-info clickable" v-if="showUser" @click="goToUserProfile">
            <span class="username">{{ (record as SquareRecord).username || '用户' }}</span>
          </div>
          <div class="meta-info">
            <span class="record-badge" :class="record.type">
              {{ record.type === 'water' ? '💧 浇水' : '🧪 施肥' }}
            </span>
            <span class="plant-name" v-if="showPlant && record.plant_name">
              🪴 {{ record.plant_name }}
            </span>
          </div>
        </div>

        <div class="card-body">
          <p class="description" v-if="record.description">{{ record.description }}</p>
        </div>

        <div class="card-images" v-if="record.images && record.images.length > 0">
          <div
            v-for="(img, index) in record.images.slice(0, 4)"
            :key="img.id"
            class="image-wrapper"
            :class="{ 'image-more': index === 3 && record.images!.length > 4 }"
            @click="$emit('previewImage', record.images!.map(i => i.image_path), index)"
          >
            <img :src="img.image_path" class="record-image" />
            <span v-if="index === 3 && record.images!.length > 4" class="image-count">
              +{{ record.images!.length - 3 }}
            </span>
          </div>
        </div>

        <div class="card-footer">
          <span class="created-time">{{ formatTime(record.created_at) }}</span>
        </div>
      </div>
    </template>

    <!-- Timeline Layout: More compact, time at bottom -->
    <template v-else-if="layout === 'timeline'">
      <div class="timeline-content">
        <div class="timeline-header">
          <div class="record-icon-wrapper" :class="record.type">
            <span class="record-icon">{{ record.type === 'water' ? '💧' : '🧪' }}</span>
          </div>
          <div class="header-info">
            <div class="action-text">
              {{ record.type === 'water' ? '浇水' : '施肥' }}
              <span class="plant-name-inline" v-if="showPlant && record.plant_name">
                · {{ record.plant_name }}
              </span>
            </div>
            <div class="user-row" v-if="showUser">
              <span class="username-inline">{{ (record as SquareRecord).username || '用户' }}</span>
            </div>
          </div>
        </div>

        <div class="timeline-body" v-if="record.description">
          <p class="description">{{ record.description }}</p>
        </div>

        <div class="timeline-images" v-if="record.images && record.images.length > 0">
          <div
            v-for="(img, index) in record.images.slice(0, 3)"
            :key="img.id"
            class="image-wrapper"
            :class="{ 'image-more': index === 2 && record.images!.length > 3 }"
            @click="$emit('previewImage', record.images!.map(i => i.image_path), index)"
          >
            <img :src="img.image_path" class="record-image" />
            <span v-if="index === 2 && record.images!.length > 3" class="image-count">
              +{{ record.images!.length - 2 }}
            </span>
          </div>
        </div>

        <div class="timeline-footer">
          <span class="created-time">{{ formatTime(record.created_at) }}</span>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import dayjs from 'dayjs'
import { useRouter } from 'vue-router'
import type { SquareRecord, CareRecord } from '@/types'

interface Props {
  record: SquareRecord | CareRecord
  showUser?: boolean
  showPlant?: boolean
  layout?: 'social' | 'timeline'
}

const props = withDefaults(defineProps<Props>(), {
  showUser: true,
  showPlant: true,
  layout: 'social'
})

const emit = defineEmits<{
  previewImage: [images: string[], index: number]
}>()

const router = useRouter()

const goToUserProfile = () => {
  const record = props.record as SquareRecord
  if (record.user_id) {
    router.push(`/user/${record.user_id}`)
  }
}

const formatTime = (time: string) => {
  return dayjs(time).format('MM-DD HH:mm')
}
</script>

<style scoped lang="scss">
.record-card {
  background: linear-gradient(145deg, #FFFFFF 0%, #F8FAF8 100%);
  border-radius: 20px;
  box-shadow:
    0 4px 20px rgba(143, 169, 143, 0.1),
    0 1px 3px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(143, 169, 143, 0.15);
  transition: all 0.3s ease;

  &:active {
    transform: scale(0.98);
    box-shadow: 0 2px 10px rgba(143, 169, 143, 0.15);
  }

  /* Social Layout */
  &.social {
    display: flex;
    gap: 14px;
    padding: 18px;

    .card-avatar {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      overflow: hidden;
      flex-shrink: 0;
      box-shadow: 0 2px 8px rgba(143, 169, 143, 0.2);

      .avatar-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }

    .card-avatar-placeholder {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: linear-gradient(135deg, #8FA98F 0%, #A5C4A5 100%);
      color: white;
      font-size: 20px;
      font-weight: 600;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      box-shadow: 0 2px 8px rgba(143, 169, 143, 0.3);
    }

    .clickable {
      cursor: pointer;
      transition: opacity 0.2s ease;

      &:hover {
        opacity: 0.8;
      }
    }

    .card-content {
      flex: 1;
      min-width: 0;
    }

    .card-header {
      display: flex;
      flex-direction: column;
      gap: 6px;
      margin-bottom: 10px;

      .user-info {
        .username {
          font-size: 15px;
          font-weight: 700;
          color: #3D5A3D;
        }
      }

      .meta-info {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;

        .record-badge {
          padding: 3px 10px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;

          &.water {
            background: rgba(66, 165, 245, 0.1);
            color: #1976D2;
          }

          &.fertilize {
            background: rgba(255, 152, 0, 0.1);
            color: #F57C00;
          }
        }

        .plant-name {
          font-size: 12px;
          color: #8FA98F;
          font-weight: 500;
        }
      }
    }

    .card-body {
      margin-bottom: 12px;

      .description {
        font-size: 14px;
        color: #5A6E5A;
        line-height: 1.6;
        margin: 0;
        display: -webkit-box;
        -webkit-line-clamp: 4;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
    }

    .card-images {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 8px;
      margin-bottom: 12px;

      .image-wrapper {
        aspect-ratio: 1;
        border-radius: 12px;
        overflow: hidden;
        position: relative;
        background: #F5F5F5;
        cursor: pointer;
        transition: transform 0.2s ease;

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

    .card-footer {
      .created-time {
        font-size: 12px;
        color: #9E9E9E;
        font-weight: 500;
      }
    }
  }

  /* Timeline Layout - More compact */
  &.timeline {
    padding: 14px 16px;

    .timeline-content {
      display: flex;
      flex-direction: column;
    }

    .timeline-header {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      margin-bottom: 10px;

      .record-icon-wrapper {
        width: 36px;
        height: 36px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;

        &.water {
          background: linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%);
        }

        &.fertilize {
          background: linear-gradient(135deg, #FFF3E0 0%, #FFE0B2 100%);
        }

        .record-icon {
          font-size: 18px;
        }
      }

      .header-info {
        flex: 1;
        min-width: 0;

        .action-text {
          font-size: 15px;
          font-weight: 700;
          color: #3D5A3D;
          display: flex;
          align-items: center;
          gap: 6px;

          .plant-name-inline {
            font-size: 13px;
            font-weight: 500;
            color: #8FA98F;
          }
        }

        .user-row {
          .username-inline {
            font-size: 12px;
            color: #9E9E9E;
            font-weight: 500;
          }
        }
      }
    }

    .timeline-body {
      margin-bottom: 10px;
      padding-left: 46px;

      .description {
        font-size: 13px;
        color: #5A6E5A;
        line-height: 1.5;
        margin: 0;
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
    }

    .timeline-images {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 6px;
      margin-bottom: 10px;
      padding-left: 46px;

      .image-wrapper {
        aspect-ratio: 1;
        border-radius: 8px;
        overflow: hidden;
        position: relative;
        background: #F5F5F5;
        cursor: pointer;
        transition: transform 0.2s ease;

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

        .image-count {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0, 0, 0, 0.5);
          color: white;
          font-size: 14px;
          font-weight: 700;
          backdrop-filter: blur(2px);
        }
      }
    }

    .timeline-footer {
      padding-left: 46px;

      .created-time {
        font-size: 11px;
        color: #B0B0B0;
        font-weight: 500;
      }
    }
  }
}
</style>
