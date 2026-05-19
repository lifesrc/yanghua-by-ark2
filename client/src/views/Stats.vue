<template>
  <div class="page-container stats-page">
    <van-nav-bar
      v-if="userId"
      :title="`${username}的养护统计`"
      left-arrow
      @click-left="goBack"
    />
    <div class="page-header">
      <h1 class="page-title">{{ userId ? `${username}的养护统计` : '养护统计' }}</h1>
      <p class="page-subtitle">{{ userId ? '查看其他用户的养护记录' : '见证你的用心照料' }}</p>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">🌱</div>
        <div class="stat-value">{{ stats.totalRecords || 0 }}</div>
        <div class="stat-label">总养护次数</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">💧</div>
        <div class="stat-value">{{ stats.waterCount || 0 }}</div>
        <div class="stat-label">浇水次数</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">🧪</div>
        <div class="stat-value">{{ stats.fertilizeCount || 0 }}</div>
        <div class="stat-label">施肥次数</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">🪴</div>
        <div class="stat-value">{{ stats.plantCount || 0 }}</div>
        <div class="stat-label">植物数量</div>
      </div>
    </div>

    <div class="chart-card">
      <div class="chart-header">
        <h3>近30天养护趋势</h3>
      </div>
      <div ref="chartRef" class="chart-container"></div>
    </div>

    <div class="chart-card">
      <div class="chart-header">
        <h3>养护类型分布</h3>
      </div>
      <div ref="pieChartRef" class="pie-chart-container"></div>
    </div>

    <TabBar />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import * as echarts from 'echarts'
import request from '@/utils/request'
import TabBar from '@/components/TabBar.vue'

const route = useRoute()
const router = useRouter()

const chartRef = ref<HTMLElement | null>(null)
const pieChartRef = ref<HTMLElement | null>(null)
const userId = ref<string | null>(null)
const username = ref('')
const stats = ref({
  totalRecords: 0,
  waterCount: 0,
  fertilizeCount: 0,
  plantCount: 0
})
const trendData = ref<any[]>([])

const fetchStats = async () => {
  try {
    let res
    if (userId.value) {
      res = await request.get(`/users/${userId.value}/stats`)
      // 转换字段名
      if (res.data && res.data.success) {
        const data = res.data.data
        stats.value = {
          totalRecords: data.total_records || 0,
          waterCount: data.water_count || 0,
          fertilizeCount: data.fertilize_count || 0,
          plantCount: data.plant_count || 0
        }
      }
    } else {
      res = await request.get('/stats/summary')
      stats.value = res.data
    }
  } catch (error) {
    console.error('获取统计数据失败', error)
  }
}

const getUsername = async () => {
  if (!userId.value) return
  try {
    const res = await request.get(`/users/${userId.value}`)
    if (res.data && res.data.success && res.data.data) {
      username.value = res.data.data.username
    }
  } catch (error) {
    console.error('获取用户信息失败', error)
  }
}

const goBack = () => {
  router.back()
}

const fetchTrend = async () => {
  try {
    const res = await request.get('/stats/trend', { params: { days: 30 } })
    trendData.value = res.data
  } catch (error) {
    console.error('获取趋势数据失败', error)
  }
}

const renderChart = () => {
  if (!chartRef.value) return

  const chart = echarts.init(chartRef.value)

  const dates = trendData.value.map(item => item.date.slice(5))
  const waterData = trendData.value.map(item => item.water)
  const fertilizeData = trendData.value.map(item => item.fertilize)

  const option = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#F0F0F0',
      textStyle: { color: '#4A4A4A' }
    },
    grid: {
      left: '8%',
      right: '8%',
      bottom: '10%',
      top: '15%',
      containLabel: false
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: dates,
      axisLine: { lineStyle: { color: '#E0E0E0' } },
      axisLabel: { color: '#767676', fontSize: 10 }
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: '#767676', fontSize: 10 },
      splitLine: { lineStyle: { color: '#F5F5F5' } }
    },
    series: [
      {
        name: '浇水',
        type: 'line',
        smooth: true,
        data: waterData,
        lineStyle: {
          color: '#64B5F6',
          width: 3
        },
        itemStyle: { color: '#64B5F6' },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(100, 181, 246, 0.3)' },
              { offset: 1, color: 'rgba(100, 181, 246, 0.05)' }
            ]
          }
        }
      },
      {
        name: '施肥',
        type: 'line',
        smooth: true,
        data: fertilizeData,
        lineStyle: {
          color: '#FFB74D',
          width: 3
        },
        itemStyle: { color: '#FFB74D' },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(255, 183, 77, 0.3)' },
              { offset: 1, color: 'rgba(255, 183, 77, 0.05)' }
            ]
          }
        }
      }
    ]
  }

  chart.setOption(option)
}

const renderPieChart = () => {
  if (!pieChartRef.value) return

  const chart = echarts.init(pieChartRef.value)

  const option = {
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#F0F0F0',
      textStyle: { color: '#4A4A4A' }
    },
    legend: {
      bottom: '5%',
      left: 'center',
      textStyle: { color: '#767676', fontSize: 12 }
    },
    series: [
      {
        name: '养护类型',
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['50%', '45%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: true,
          color: '#4A4A4A',
          fontSize: 12
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 'bold'
          }
        },
        data: [
          { value: stats.value.waterCount, name: '浇水', itemStyle: { color: '#64B5F6' } },
          { value: stats.value.fertilizeCount, name: '施肥', itemStyle: { color: '#FFB74D' } }
        ]
      }
    ]
  }

  chart.setOption(option)
}

onMounted(async () => {
  const idParam = route.params.id
  if (idParam) {
    userId.value = idParam as string
  }

  await getUsername()
  await fetchStats()
  await fetchTrend()
  await nextTick()
  renderChart()
  renderPieChart()
})
</script>

<style scoped lang="scss">
.stats-page {
  .stats-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    padding: 16px;

    .stat-card {
      background: white;
      border-radius: 16px;
      padding: 20px 16px;
      text-align: center;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);

      .stat-icon {
        font-size: 32px;
        margin-bottom: 8px;
      }

      .stat-value {
        font-size: 28px;
        font-weight: 700;
        color: #4A4A4A;
        margin-bottom: 4px;
      }

      .stat-label {
        font-size: 12px;
        color: #9E9E9E;
      }
    }
  }

  .chart-card {
    margin: 0 16px 16px;
    background: white;
    border-radius: 16px;
    padding: 16px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);

    .chart-header {
      margin-bottom: 16px;

      h3 {
        font-size: 16px;
        font-weight: 600;
        color: #4A4A4A;
        margin: 0;
      }
    }

    .chart-container {
      width: 100%;
      height: 200px;
    }

    .pie-chart-container {
      width: 100%;
      height: 220px;
    }
  }
}
</style>
