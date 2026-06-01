<template>
  <div
    class="plant-card"
    :class="{ selected: selected, selectable: mode === 'select' }"
    @click="handleClick"
  >
    <div class="plant-image-wrapper">
      <img :src="plant.image || defaultPlantImage" class="plant-image" />
      <div v-if="selected" class="check-badge">
        <van-icon name="success" size="14" color="#8FA98F" />
      </div>
    </div>

    <div class="plant-info">
      <div class="plant-name">{{ plant.name }}</div>
      <div class="plant-type">{{ PlantTypeLabels[plant.type] }}</div>
      <p v-if="plant.notes" class="plant-notes">{{ plant.notes }}</p>
    </div>

    <div
      v-if="showEdit"
      class="edit-btn"
      @click.stop="$emit('edit', plant)"
    >
      <van-icon name="edit" size="14" color="#9E9E9E" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { PlantTypeLabels, type Plant } from '@/types'

interface Props {
  plant: Plant
  mode?: 'select' | 'detail'
  selected?: boolean
  showEdit?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'detail',
  selected: false,
  showEdit: false
})

const emit = defineEmits<{
  select: [plant: Plant]
  edit: [plant: Plant]
}>()

const router = useRouter()

const defaultPlantImage =
  'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=plant%20pot%20simple%20morandi%20color&image_size=square_hd'

const handleClick = () => {
  if (props.mode === 'select') {
    emit('select', props.plant)
  } else {
    router.push(`/plant/${props.plant.id}`)
  }
}
</script>

<style scoped lang="scss">
.plant-card {
  width: 100%;
  background: white;
  border-radius: 16px;
  padding: 12px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
  position: relative;
  border: 2px solid transparent;

  &.selectable {
    cursor: pointer;
  }

  &.selected {
    border-color: #8FA98F;
    background: linear-gradient(135deg, #F0F8F0 0%, #F8FFF8 100%);
    box-shadow: 0 4px 16px rgba(143, 169, 143, 0.3);
    transform: scale(1.02);

    .plant-name {
      color: #8FA98F;
      font-weight: 700;
    }
  }

  &:active {
    transform: scale(0.96);
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
      bottom: -6px;
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

  .plant-info {
    text-align: center;
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

  .plant-notes {
    font-size: 11px;
    color: #B0B0B0;
    margin: 6px 0 0 0;
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .edit-btn {
    position: absolute;
    top: 8px;
    right: 8px;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.9);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
    opacity: 1;
    transition: opacity 0.2s ease;

    &:active {
      background: #F5F5F5;
    }
  }

  &:hover .edit-btn {
    opacity: 1;
  }
}
</style>
