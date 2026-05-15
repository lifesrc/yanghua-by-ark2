<template>
  <div class="page-container plant-form-page">
    <div class="page-header">
      <div class="header-top">
        <van-icon name="arrow-left" @click="$router.back()" />
        <h1 class="page-title">{{ isEdit ? '编辑植物' : '添加植物' }}</h1>
        <div class="placeholder"></div>
      </div>
    </div>

    <div class="form-card">
      <van-form @submit="onSubmit">
        <van-cell-group inset>
          <van-field
            v-model="form.name"
            name="name"
            label="植物名称"
            placeholder="请输入植物名称"
            :rules="[{ required: true, message: '请输入植物名称' }]"
          />
          <van-field
            v-model="form.type"
            name="type"
            label="植物类型"
            is-link
            readonly
            placeholder="请选择植物类型"
            :rules="[{ required: true, message: '请选择植物类型' }]"
            @click="showTypePicker = true"
          />
          <van-field name="image" label="植物照片">
            <template #input>
              <div class="image-upload" @click="triggerFileInput">
                <img v-if="previewImage" :src="previewImage" class="preview-image" />
                <van-icon v-else name="plus" size="24" color="#9E9E9E" />
              </div>
            </template>
          </van-field>
          <van-field
            v-model="form.notes"
            name="notes"
            label="备注"
            type="textarea"
            rows="3"
            placeholder="添加一些备注信息（可选）"
          />
        </van-cell-group>

        <div style="padding: 20px">
          <van-button
            round
            block
            type="primary"
            color="#8FA98F"
            native-type="submit"
            :loading="loading"
          >
            {{ isEdit ? '保存修改' : '添加植物' }}
          </van-button>
        </div>
      </van-form>
    </div>

    <input
      ref="fileInputRef"
      type="file"
      accept="image/*"
      style="display: none"
      @change="handleFileChange"
    />

    <van-popup v-model:show="showTypePicker" position="bottom">
      <van-picker
        :columns="plantTypeOptions"
        @confirm="onTypeConfirm"
        @cancel="showTypePicker = false"
      />
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePlantStore } from '@/stores/plant'
import { PlantTypeLabels, type PlantType } from '@/types'
import request from '@/utils/request'
import { showToast } from 'vant'
import { normalizeImageFile } from '@/utils/image'

const route = useRoute()
const router = useRouter()
const plantStore = usePlantStore()

const fileInputRef = ref<HTMLInputElement | null>(null)
const loading = ref(false)
const showTypePicker = ref(false)
const previewImage = ref('')
const selectedFile = ref<File | null>(null)

const isEdit = computed(() => !!route.params.id)

const form = ref({
  name: '',
  type: '' as PlantType,
  notes: ''
})

const plantTypeOptions = Object.entries(PlantTypeLabels).map(([value, text]) => ({
  text,
  value
}))

const triggerFileInput = () => {
  fileInputRef.value?.click()
}

const handleFileChange = async (e: Event) => {
  const input = e.target as HTMLInputElement
  const raw = input.files?.[0]
  if (!raw) return
  try {
    const file = await normalizeImageFile(raw)
    selectedFile.value = file
    previewImage.value = URL.createObjectURL(file)
  } catch (err) {
    console.error('图片处理失败', err)
    showToast('图片处理失败，请换一张')
  } finally {
    input.value = ''
  }
}

const onTypeConfirm = ({ selectedOptions }: any) => {
  form.value.type = selectedOptions[0].value as PlantType
  showTypePicker.value = false
}

const onSubmit = async () => {
  loading.value = true
  try {
    const formData = new FormData()
    formData.append('name', form.value.name)
    formData.append('type', form.value.type)
    if (form.value.notes) {
      formData.append('notes', form.value.notes)
    }
    if (selectedFile.value) {
      formData.append('image', selectedFile.value)
    }

    if (isEdit.value) {
      const plantId = Array.isArray(route.params.id) ? route.params.id[0] : (route.params.id || '')
      await plantStore.updatePlant(parseInt(plantId, 10), formData)
    } else {
      await plantStore.createPlant(formData)
    }

    router.push('/home')
  } catch (error) {
    console.error('提交失败', error)
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  if (isEdit.value) {
    const plantId = route.params.id as string
    try {
      const res = await request.get(`/plants/${plantId}`)
      form.value.name = res.data.name
      form.value.type = res.data.type
      form.value.notes = res.data.notes || ''
      if (res.data.image) {
        previewImage.value = res.data.image
      }
    } catch (error) {
      console.error('获取植物信息失败', error)
    }
  }
})
</script>

<style scoped lang="scss">
.plant-form-page {
  min-height: 100vh;

  .header-top {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .van-icon {
      font-size: 20px;
      color: white;
      padding: 8px;
      margin: -8px;
    }

    .page-title {
      font-size: 18px;
      font-weight: 600;
    }

    .placeholder {
      width: 36px;
    }
  }

  .form-card {
    margin: 16px;

    .image-upload {
      width: 80px;
      height: 80px;
      border-radius: 12px;
      border: 2px dashed #E0E0E0;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;

      .preview-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }
  }
}
</style>
