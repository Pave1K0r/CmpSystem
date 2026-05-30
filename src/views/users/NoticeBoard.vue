<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Bell } from '@element-plus/icons-vue'
import { getNoticeListService } from '@/api/notice'

// 公告列表数据
const noticeList = ref([])
const loading = ref(false)

// 轮询定时器
let pollTimer = null
const POLL_INTERVAL = 3000

// 获取公告列表
const fetchNoticeList = async (showTip = false) => {
  loading.value = true
  try {
    const res = await getNoticeListService()
    const newList = res.data || []

    // 判断是否有新公告更新
    if (showTip && newList.length > noticeList.value.length) {
      ElMessage.info('有新公告更新')
    }

    noticeList.value = newList
  } finally {
    loading.value = false
  }
}

// 启动轮询
const startPolling = () => {
  stopPolling()
  pollTimer = setInterval(() => {
    fetchNoticeList(true)
  }, POLL_INTERVAL)
}

// 停止轮询
const stopPolling = () => {
  if (pollTimer) {
    clearInterval(pollTimer)
    pollTimer = null
  }
}

onMounted(() => {
  fetchNoticeList()
  startPolling()
})

onUnmounted(() => {
  stopPolling()
})
</script>

<template>
  <el-card v-loading="loading" class="notice-card">
    <div class="notice-header">
      <span class="title">
        <el-icon style="margin-right: 8px"><Bell /></el-icon>
        最新公告
      </span>
      <el-tag type="info" size="small" effect="plain"> 共 {{ noticeList.length }} 条 </el-tag>
    </div>

    <div v-if="noticeList.length === 0" class="empty-text">暂无公告</div>

    <el-timeline v-else>
      <el-timeline-item
        v-for="(item, index) in noticeList"
        :key="item.id"
        :type="index === 0 ? 'primary' : ''"
        :hollow="index !== 0"
      >
        <el-card shadow="hover" class="notice-item">
          <div class="notice-content">{{ item.content }}</div>
        </el-card>
      </el-timeline-item>
    </el-timeline>
  </el-card>
</template>

<style scoped>
.notice-card {
  margin: 0;
}

.notice-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.title {
  font-size: 18px;
  font-weight: 600;
  color: #1e3c72;
  display: flex;
  align-items: center;
}

.empty-text {
  text-align: center;
  color: #909399;
  padding: 40px 0;
  font-size: 14px;
}

.notice-item {
  margin-bottom: 8px;
}

.notice-content {
  font-size: 15px;
  line-height: 1.6;
  color: #303133;
  word-break: break-all;
}

:deep(.el-timeline-item__node--primary) {
  background-color: #008c8c;
}
</style>
