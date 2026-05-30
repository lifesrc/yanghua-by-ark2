import axios from 'axios'
import { showToast } from 'vant'
import type { ApiResponse } from '@/types'

const request = axios.create({
  baseURL: '/api',
  timeout: 120000
})

request.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

request.interceptors.response.use(
  (response) => {
    const data: ApiResponse = response.data
    if (!data.success) {
      showToast(data.error || '请求失败')
      return Promise.reject(new Error(data.error))
    }
    return response.data
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    } else {
      showToast(error.response?.data?.error || '网络错误')
    }
    return Promise.reject(error)
  }
)

export default request
