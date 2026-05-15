<template>
  <div class="register-page">
    <div class="register-header">
      <router-link to="/login" class="back-btn">
        <van-icon name="arrow-left" size="20" />
      </router-link>
      <h1 class="title">创建账号</h1>
      <p class="subtitle">开启你的植物养护之旅</p>
    </div>

    <div class="register-form">
      <van-form @submit="onSubmit">
        <van-field
          v-model="form.username"
          name="username"
          label="昵称"
          placeholder="请输入昵称"
          :rules="[{ required: true, message: '请填写昵称' }]"
        />
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
          placeholder="请输入密码（至少6位）"
          :rules="[{ required: true, validator: passwordValidator, message: '密码至少6位' }]"
        />
        <div style="margin: 24px 16px 16px">
          <van-button round block type="primary" color="#8FA98F" native-type="submit" :loading="loading">
            注册
          </van-button>
        </div>
      </van-form>

      <div class="login-link">
        <span>已有账号？</span>
        <router-link to="/login" class="link">立即登录</router-link>
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
  username: '',
  email: '',
  password: ''
})

const passwordValidator = (value: string) => {
  return value && value.length >= 6
}

const onSubmit = async () => {
  loading.value = true
  try {
    await authStore.register(form.value.username, form.value.email, form.value.password)
    router.push('/home')
  } catch (error) {
    console.error('注册失败', error)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped lang="scss">
.register-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #E8F4E8 0%, #F5F2EB 50%, #F0E8E8 100%);
}

.register-header {
  padding: 20px;
  position: relative;

  .back-btn {
    position: absolute;
    left: 20px;
    top: 20px;
    color: #4A4A4A;
  }

  .title {
    font-size: 24px;
    font-weight: 600;
    color: #4A4A4A;
    margin-top: 40px;
    margin-bottom: 8px;
  }

  .subtitle {
    font-size: 14px;
    color: #767676;
  }
}

.register-form {
  background: white;
  border-radius: 24px 24px 0 0;
  padding: 24px;
  margin-top: 20px;
  min-height: calc(100vh - 160px);
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.06);
}

.login-link {
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
