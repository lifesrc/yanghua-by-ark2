<template>
  <div class="page-container calendar-page">
    <div class="page-header">
      <h1 class="page-title">养护日历</h1>
      <p class="page-subtitle">回顾每一天的照料</p>
    </div>

    <div class="calendar-card">
      <div class="calendar-header">
        <van-icon name="arrow-left" @click="prevMonth" />
        <span class="month-text">{{ currentYear }}年{{ currentMonth }}月</span>
        <van-icon name="arrow" @click="nextMonth" />
      </div>
      <div class="weekdays">
        <span v-for="day in weekDays" :key="day" class="weekday">{{ day }}</span>
      </div>
      <div class="days-grid">
        <div
          v-for="(day, index) in calendarDays"
          :key="index"
          class="day-cell"
          :class="{
            'other-month': !day.isCurrentMonth,
            'today': day.isToday,
            'has-water': day.hasWater,
            'has-fertilize': day.hasFertilize,
            'selected': selectedDate === day.dateStr
          }"
          @click="selectDate(day)"
        >
          <span class="day-number">{{ day.day }}</span>
          <div class="day-markers">
            <span v-if="day.hasWater" class="marker water">💧</span>
            <span v-if="day.hasFertilize" class="marker fertilize">🧪</span>
          </div>
        </div>
      </div>
    </div>

    <div class="records-section" v-if="selectedDateRecords.length > 0">
      <div class="section-header">
        <h3>{{ selectedDate }}的记录</h3>
      </div>
      <div class="records-list">
        <div v-for="record in selectedDateRecords" :key="record.id" class="record-item">
          <div class="record-icon" :class="record.type">
            {{ record.type === 'water' ? '💧' : '🧪' }}
          </div>
          <div class="record-content">
            <div class="record-title">
              {{ record.plant_name }} - {{ record.type === 'water' ? '浇水' : '施肥' }}
            </div>
            <div class="record-desc" v-if="record.description">{{ record.description }}</div>
            <div class="record-time">{{ formatTime(record.created_at) }}</div>
          </div>
          <img v-if="record.image" :src="record.image" class="record-image" @click="previewImage(record.image)" />
        </div>
      </div>
    </div>

    <div class="empty-records" v-else-if="selectedDate">
      <p>这一天没有养护记录</p>
    </div>

    <van-image-preview v-model:show="showImagePreview" :images="[currentPreviewImage]" />

    <TabBar />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import dayjs from 'dayjs'
import request from '@/utils/request'
import type { CareRecord } from '@/types'
import TabBar from '@/components/TabBar.vue'

const weekDays = ['日', '一', '二', '三', '四', '五', '六']
const currentYear = ref(dayjs().year())
const currentMonth = ref(dayjs().month() + 1)
const selectedDate = ref('')
const selectedDateRecords = ref<CareRecord[]>([])
const showImagePreview = ref(false)
const currentPreviewImage = ref('')
const calendarData = ref<Record<string, { hasWater: boolean; hasFertilize: boolean }>>({})

interface CalendarDay {
  day: number
  dateStr: string
  isCurrentMonth: boolean
  isToday: boolean
  hasWater: boolean
  hasFertilize: boolean
}

const calendarDays = computed<CalendarDay[]>(() => {
  const firstDay = dayjs(`${currentYear.value}-${currentMonth.value}-01`)
  const startDate = firstDay.startOf('month').startOf('week')
  const days: CalendarDay[] = []
  const today = dayjs().format('YYYY-MM-DD')

  for (let i = 0; i < 42; i++) {
    const date = startDate.add(i, 'day')
    const dateStr = date.format('YYYY-MM-DD')
    const isCurrentMonth = date.month() + 1 === currentMonth.value
    const dayData = calendarData.value[dateStr] || { hasWater: false, hasFertilize: false }

    days.push({
      day: date.date(),
      dateStr,
      isCurrentMonth,
      isToday: dateStr === today,
      hasWater: dayData.hasWater,
      hasFertilize: dayData.hasFertilize
    })
  }

  return days
})

const prevMonth = () => {
  if (currentMonth.value === 1) {
    currentMonth.value = 12
    currentYear.value--
  } else {
    currentMonth.value--
  }
  fetchCalendarData()
}

const nextMonth = () => {
  if (currentMonth.value === 12) {
    currentMonth.value = 1
    currentYear.value++
  } else {
    currentMonth.value++
  }
  fetchCalendarData()
}

const selectDate = (day: CalendarDay) => {
  selectedDate.value = day.dateStr
  fetchDayRecords(day.dateStr)
}

const fetchCalendarData = async () => {
  try {
    const res = await request.get('/stats/calendar', {
      params: { year: currentYear.value, month: currentMonth.value }
    })
    const dataMap: Record<string, { hasWater: boolean; hasFertilize: boolean }> = {}
    res.data.forEach((item: any) => {
      dataMap[item.date] = {
        hasWater: item.hasWater,
        hasFertilize: item.hasFertilize
      }
    })
    calendarData.value = dataMap
  } catch (error) {
    console.error('获取日历数据失败', error)
  }
}

const fetchDayRecords = async (date: string) => {
  try {
    const res = await request.get(`/records/date/${date}`)
    selectedDateRecords.value = res.data
  } catch (error) {
    console.error('获取当日记录失败', error)
  }
}

const previewImage = (url: string) => {
  currentPreviewImage.value = url
  showImagePreview.value = true
}

const formatTime = (time: string) => {
  return dayjs(time).format('HH:mm')
}

onMounted(async () => {
  await fetchCalendarData()
  selectDate({ dateStr: dayjs().format('YYYY-MM-DD') } as CalendarDay)
})
</script>

<style scoped lang="scss">
.calendar-page {
  .calendar-card {
    margin: 16px;
    background: white;
    border-radius: 20px;
    padding: 16px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);

    .calendar-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 8px 16px;
      font-size: 16px;
      font-weight: 600;
      color: #4A4A4A;

      .van-icon {
        padding: 8px;
        font-size: 18px;
        color: #767676;
      }
    }

    .weekdays {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 4px;
      margin-bottom: 8px;

      .weekday {
        text-align: center;
        font-size: 13px;
        font-weight: 500;
        color: #767676;
        padding: 8px 0;
      }
    }

    .days-grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 4px;

      .day-cell {
        aspect-ratio: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        border-radius: 12px;
        font-size: 14px;
        color: #4A4A4A;
        position: relative;
        transition: all 0.2s ease;

        &.other-month {
          color: #E0E0E0;
        }

        &.today {
          background: linear-gradient(135deg, #8FA98F 0%, #A5C4A5 100%);
          color: white;
          font-weight: 600;
        }

        &.has-water:not(.today) {
          background: rgba(100, 181, 246, 0.15);
        }

        &.has-fertilize:not(.today) {
          background: rgba(255, 183, 77, 0.15);
        }

        &.has-water.has-fertilize:not(.today) {
          background: linear-gradient(135deg, rgba(100, 181, 246, 0.15) 50%, rgba(255, 183, 77, 0.15) 50%);
        }

        &.selected {
          box-shadow: 0 0 0 2px #8FA98F;
          transform: scale(1.05);
        }

        .day-number {
          margin-bottom: 2px;
        }

        .day-markers {
          display: flex;
          gap: 2px;

          .marker {
            font-size: 10px;
            opacity: 0.8;
          }
        }
      }
    }
  }

  .records-section {
    .section-header {
      padding: 16px 16px 8px;

      h3 {
        font-size: 16px;
        font-weight: 600;
        color: #4A4A4A;
        margin: 0;
      }
    }

    .records-list {
      padding: 0 16px;
    }

    .record-item {
      display: flex;
      align-items: center;
      padding: 16px;
      background: white;
      border-radius: 12px;
      margin-bottom: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);

      .record-icon {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
        margin-right: 12px;
        flex-shrink: 0;

        &.water {
          background: #E3F2FD;
        }

        &.fertilize {
          background: #FFF3E0;
        }
      }

      .record-content {
        flex: 1;

        .record-title {
          font-size: 14px;
          font-weight: 600;
          color: #4A4A4A;
          margin-bottom: 4px;
        }

        .record-desc {
          font-size: 13px;
          color: #767676;
          margin-bottom: 4px;
        }

        .record-time {
          font-size: 12px;
          color: #9E9E9E;
        }
      }

      .record-image {
        width: 48px;
        height: 48px;
        border-radius: 8px;
        object-fit: cover;
        margin-left: 12px;
        flex-shrink: 0;
      }
    }
  }

  .empty-records {
    text-align: center;
    padding: 40px;
    color: #9E9E9E;
    font-size: 14px;
  }
}
</style>
