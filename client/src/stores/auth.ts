import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import request from '@/utils/request'
import type { User } from '@/types'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('token'))
  const user = ref<User | null>(null)

  const isLoggedIn = computed(() => !!token.value)

  const setToken = (newToken: string) => {
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
    const res = await request.post('/auth?action=login', { email, password })
    setToken(res.data.token)
    setUser(res.data.user)
    return res
  }

  const register = async (username: string, email: string, password: string) => {
    const res = await request.post('/auth?action=register', { username, email, password })
    setToken(res.data.token)
    setUser(res.data.user)
    return res
  }

  const logout = () => {
    setToken(null)
    setUser(null)
  }

  return {
    token,
    user,
    isLoggedIn,
    login,
    register,
    logout
  }
})
