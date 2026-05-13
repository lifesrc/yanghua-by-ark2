<template>
  <div class="login-page">
    <div class="login-header">
      <div class="logo">🌱</div>
      <h1 class="title">花草养护</h1>
      <p class="subtitle">记录每一次呵护，见证每一次成长</p>
    </div>

    <div class="login-form">
      <van-form @submit="onSubmit">
        <van-field
          v-model="form.email"
          name="email"
          label="邮箱"
          type="email"
          placeholder="请输入邮箱"
          :rules="[{ required: true, message: '请填写邮箱' }]"
        />
        <van-field
          v-model="form.password"
          name="password"
          label="密码"
          type="password"
          placeholder="请输入密码"
          :rules="[{ required: true, message: '请填写密码' }]"
        />
        <div style="margin: 24px 16px 16px">
          <van-button round block type="primary" color="#8FA98F" native-type="submit" :loading="loading">
            登录
          </van-button>
        </div>
      </van-form>

      <div class="demo-tip">
        <p>演示账号：demo@example.com</p>
        <p>演示密码：demo123456</p>
      </div>

      <div class="register-link">
        <span>还没有账号？</span>
        <router-link to="/register" class="link">立即注册</router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const loading = ref(false)

const form = ref({
  email: 'demo@example.com',
  password: 'demo123456'
})

const onSubmit = async () => {
  loading.value = true
  try {
    await authStore.login(form.value.email, form.value.password)
    router.push('/home')
  } catch (error) {
    console.error('登录失败', error)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped lang="scss">
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #E8F4E8 0%, #F5F2EB 50%, #F0E8E8 100%);
  padding: 20px;
  display: flex;
  flex-direction: column;
}

.login-header {
  text-align: center;
  padding: 60px 0 40px;

  .logo {
    font-size: 64px;
    margin-bottom: 16px;
  }

  .title {
    font-size: 28px;
    font-weight: 600;
    color: #4A4A4A;
    margin-bottom: 8px;
  }

  .subtitle {
    font-size: 14px;
    color: #767676;
  }
}

.login-form {
  flex: 1;
  background: white;
  border-radius: 24px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.demo-tip {
  background: #F0F7F0;
  border-radius: 12px;
  padding: 12px;
  margin: 0 16px 16px;
  text-align: center;

  p {
    font-size: 12px;
    color: #6B8B6B;
    margin: 4px 0;
  }
}

.register-link {
  text-align: center;
  margin-top: 24px;
  font-size: 14px;
  color: #767676;

  .link {
    color: #8FA98F;
    text-decoration: none;
    font-weight: 500;
  }
}
</style>
