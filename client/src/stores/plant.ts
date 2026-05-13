import { defineStore } from 'pinia'
import { ref } from 'vue'
import request from '@/utils/request'
import type { Plant } from '@/types'

export const usePlantStore = defineStore('plant', () => {
  const plants = ref<Plant[]>([])
  const selectedPlant = ref<Plant | null>(null)

  const fetchPlants = async () => {
    const res = await request.get('/plants')
    plants.value = res.data
    return res
  }

  const fetchPlantById = async (id: number) => {
    const res = await request.get(`/plants/${id}`)
    selectedPlant.value = res.data
    return res
  }

  const createPlant = async (data: FormData) => {
    const res = await request.post('/plants', data)
    plants.value.unshift(res.data)
    return res
  }

  const updatePlant = async (id: number, data: FormData) => {
    const res = await request.put(`/plants/${id}`, data)
    const index = plants.value.findIndex(p => p.id === id)
    if (index !== -1) {
      plants.value[index] = res.data
    }
    return res
  }

  const deletePlant = async (id: number) => {
    await request.delete(`/plants/${id}`)
    plants.value = plants.value.filter(p => p.id !== id)
  }

  return {
    plants,
    selectedPlant,
    fetchPlants,
    fetchPlantById,
    createPlant,
    updatePlant,
    deletePlant
  }
})
