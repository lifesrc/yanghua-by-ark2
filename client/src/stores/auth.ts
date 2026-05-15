import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import request from '@/utils/request'
import type { User } from '@/types'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('token'))
  const user = ref<User | null>(null)

  const isLoggedIn = computed(() => !!token.value)

  const setToken = (newToken: string | null) => {
    token.value = newToken
    if (newToken) {
      localStorage.setItem('token', newToken)
    } else {
      localStorage.removeItem('token')
    }
  }

  const setUser = (newUser: User | null) => {
    user.value = newUser
  }

  const login = async (email: string, password: string) => {
    const res = await request.post('/auth/login', { email, password })
    setToken(res.data.token)
    setUser(res.data.user)
    return res
  }

  const register = async (username: string, email: string, password: string) => {
    const res = await request.post('/auth/register', { username, email, password })
    setToken(res.data.token)
    setUser(res.data.user)
    return res
  }

  const logout = () => {
    setToken(null)
    setUser(null)
  }

  const fetchUserInfo = async () => {
    if (!token.value) return
    try {
      const res = await request.get('/auth/me')
      setUser(res.data)
    } catch (error) {
      console.error('获取用户信息失败', error)
    }
  }

  return {
    token,
    user,
    isLoggedIn,
    login,
    register,
    logout,
    fetchUserInfo
  }
})
