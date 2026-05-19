<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

onMounted(() => {
  if (authStore.token) {
    authStore.fetchUserInfo()
  }
})
</script>

<style>
#app {
  width: 100%;
  min-height: 100vh;
}
</style>
