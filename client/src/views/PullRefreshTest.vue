<template>
  <div class="pull-refresh-test">
    <van-nav-bar title="下拉刷新测试" />

    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <div class="content">
        <div class="info-card">
          <h3>测试说明</h3>
          <p>下拉页面触发刷新效果</p>
          <p>当前刷新次数：<strong>{{ refreshCount }}</strong></p>
          <p>最后刷新时间：<strong>{{ lastRefreshTime || '暂无' }}</strong></p>
        </div>

        <div class="list-item" v-for="item in list" :key="item.id">
          <div class="item-title">{{ item.title }}</div>
          <div class="item-desc">{{ item.desc }}</div>
        </div>
      </div>
    </van-pull-refresh>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { showToast } from 'vant'

const refreshing = ref(false)
const refreshCount = ref(0)
const lastRefreshTime = ref('')

const list = ref([
  { id: 1, title: '列表项 1', desc: '这是第一条数据' },
  { id: 2, title: '列表项 2', desc: '这是第二条数据' },
  { id: 3, title: '列表项 3', desc: '这是第三条数据' },
  { id: 4, title: '列表项 4', desc: '这是第四条数据' },
  { id: 5, title: '列表项 5', desc: '这是第五条数据' },
  { id: 6, title: '列表项 6', desc: '这是第六条数据' },
  { id: 7, title: '列表项 7', desc: '这是第七条数据' },
  { id: 8, title: '列表项 8', desc: '这是第八条数据' },
  { id: 9, title: '列表项 9', desc: '这是第九条数据' },
  { id: 10, title: '列表项 10', desc: '这是第十条数据' },
  { id: 11, title: '列表项 11', desc: '这是第十一条数据' },
  { id: 12, title: '列表项 12', desc: '这是第十二条数据' },
  { id: 13, title: '列表项 13', desc: '这是第十三条数据' },
  { id: 14, title: '列表项 14', desc: '这是第十四条数据' },
  { id: 15, title: '列表项 15', desc: '这是第十五条数据' },
  { id: 16, title: '列表项 16', desc: '这是第十六条数据' },
  { id: 17, title: '列表项 17', desc: '这是第十七条数据' },
  { id: 18, title: '列表项 18', desc: '这是第十八条数据' },
  { id: 19, title: '列表项 19', desc: '这是第十九条数据' },
  { id: 20, title: '列表项 20', desc: '这是第二十条数据' }
])

const onRefresh = () => {
  setTimeout(() => {
    refreshCount.value++
    lastRefreshTime.value = new Date().toLocaleTimeString()

    list.value.unshift({
      id: Date.now(),
      title: `新增项 ${refreshCount.value}`,
      desc: `第 ${refreshCount.value} 次刷新添加的数据`
    })

    refreshing.value = false
    showToast('刷新成功')
  }, 1500)
}
</script>

<style scoped lang="scss">
.pull-refresh-test {
  min-height: 100vh;
  background-color: #f8f9fa;
}

.content {
  min-height: calc(100vh - 46px);
  padding: 16px;
}

.info-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

  h3 {
    margin: 0 0 12px 0;
    color: #333;
    font-size: 18px;
  }

  p {
    margin: 6px 0;
    color: #666;
    font-size: 14px;

    strong {
      color: #8FA98F;
    }
  }
}

.list-item {
  background: white;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

.item-title {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
}

.item-desc {
  font-size: 13px;
  color: #999;
}
</style>
