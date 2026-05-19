<template>
  <van-tabbar v-model="active" route active-color="#8FA98F" inactive-color="#9E9E9E">
    <van-tabbar-item icon="home-o" to="/home">首页</van-tabbar-item>
    <van-tabbar-item icon="apps-o" to="/square">广场</van-tabbar-item>
    <van-tabbar-item icon="calendar-o" to="/calendar">日历</van-tabbar-item>
    <van-tabbar-item icon="chart-trending-o" to="/stats">统计</van-tabbar-item>
    <van-tabbar-item icon="user-o" to="/my">我的</van-tabbar-item>
  </van-tabbar>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const active = ref(0)

watch(
  () => route.path,
  (path) => {
    if (path === '/home') active.value = 0
    else if (path === '/square') active.value = 1
    else if (path === '/calendar') active.value = 2
    else if (path === '/stats') active.value = 3
    else if (path === '/my') active.value = 4
  },
  { immediate: true }
)
</script>
