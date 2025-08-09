<template>
  <div class="leaderboard-container">
    <!-- 头部标题和筛选器 -->
    <div class="header-section">
      <h1 class="page-title">
        <el-icon><Trophy /></el-icon>
        排行榜
      </h1>
      
      <!-- 筛选器 -->
      <div class="filters">
        <div class="filter-group">
          <label>比赛标签：</label>
          <el-select
            v-model="selectedTagId"
            placeholder="选择比赛标签"
            @change="onTagChange"
            class="tag-select"
          >
            <el-option
              v-for="tag in tags"
              :key="tag.tag_id"
              :label="tag.tag"
              :value="tag.tag_id"
            />
          </el-select>
        </div>
        
        <div class="filter-group">
          <label>排序方式：</label>
          <el-select
            v-model="orderType"
            @change="onOrderChange"
            class="order-select"
          >
            <el-option
              v-for="option in ORDER_TYPE_OPTIONS"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            >
              <span>{{ option.label }}</span>
              <span class="option-desc">{{ option.description }}</span>
            </el-option>
          </el-select>
        </div>
      </div>
    </div>

    <!-- 个人排名信息 -->
    <div v-if="personalRank.length > 0" class="personal-rank-section">
      <h3>我的排名</h3>
      <div class="rank-cards">
        <div v-for="rank in personalRank" :key="rank.metric" class="rank-card">
          <div class="rank-info">
            <div class="rank-label">{{ rank.metric }}</div>
            <div class="rank-value">
              <span class="rank-number">#{{ rank.rank }}</span>
              <span class="rank-score">{{ rank.score }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 排行榜数据 -->
    <div v-if="hasSelectedTag" class="leaderboard-section">
      <el-table
        :data="leaderboardData"
        v-loading="loading"
        style="width: 100%"
        @row-click="onRowClick"
        row-class-name="table-row"
      >
        <el-table-column prop="rank" label="排名" width="80" align="center">
          <template #default="scope">
            <div class="rank-cell" :class="getRankClass(scope.row.rank)">
              <el-icon v-if="scope.row.rank <= 3" class="crown-icon">
                <Crown />
              </el-icon>
              <span class="rank-text">{{ scope.row.rank }}</span>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column prop="username" label="用户名" min-width="150">
          <template #default="scope">
            <div class="user-cell">
              <div class="user-avatar">
                {{ scope.row.username.charAt(0).toUpperCase() }}
              </div>
              <span class="username">{{ scope.row.username }}</span>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column prop="total_score" label="总分" width="120" align="center">
          <template #default="scope">
            <span class="score-text">{{ scope.row.total_score }}</span>
          </template>
        </el-table-column>
        
        <el-table-column prop="solve_count" label="解题数" width="100" align="center">
          <template #default="scope">
            <span class="solve-count">{{ scope.row.solve_count }}</span>
          </template>
        </el-table-column>
        
        <el-table-column prop="last_solve_time" label="最后解题时间" width="180">
          <template #default="scope">
            <span v-if="scope.row.last_solve_time" class="solve-time">
              {{ formatTime(scope.row.last_solve_time) }}
            </span>
            <span v-else class="no-solve">未解题</span>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页器 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="onPageSizeChange"
          @current-change="onPageChange"
        />
      </div>
    </div>

    <!-- 空状态 -->
    <el-empty
      v-if="!loading && leaderboardData.length === 0"
      description="暂无排行榜数据"
      :image-size="120"
    >
      <el-button type="primary" @click="refreshData">刷新数据</el-button>
    </el-empty>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Trophy, Crown } from '@element-plus/icons-vue'
import {
  getUserBoard,
  getPersonalRank,
  ORDER_TYPE_OPTIONS,
  type UserBoardItemDTO,
  type ScoreRankDTO,
  type UserBoardRequest
} from '@/api/leaderboard'

// 简化的Tag类型，避免依赖不存在的API
interface Tag {
  tag_id: number
  tag: string
}

// 响应式数据
const loading = ref(false)
const tags = ref<Tag[]>([
  { tag_id: 1, tag: "默认比赛" },
  { tag_id: 2, tag: "Web安全" },
  { tag_id: 3, tag: "二进制" }
])
const selectedTagId = ref<number>(1) // 默认选择第一个标签
const orderType = ref<'score' | 'solve_count' | 'submit'>('score')
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)
const leaderboardData = ref<UserBoardItemDTO[]>([])
const personalRank = ref<ScoreRankDTO[]>([])

// 计算属性
const hasSelectedTag = computed(() => selectedTagId.value !== undefined)

// 方法
const loadLeaderboard = async () => {
  if (!hasSelectedTag.value) return
  
  loading.value = true
  try {
    const params: UserBoardRequest = {
      tag_id: selectedTagId.value!,
      order_type: orderType.value,
      page: currentPage.value,
      size: pageSize.value
    }
    
    const response = await getUserBoard(params)
    leaderboardData.value = response.items
    total.value = response.total
  } catch (error) {
    console.error('加载排行榜失败:', error)
    ElMessage.error('加载排行榜数据失败')
  } finally {
    loading.value = false
  }
}

const loadPersonalRank = async () => {
  if (!hasSelectedTag.value) return
  
  try {
    const ranks = await getPersonalRank(selectedTagId.value!)
    personalRank.value = ranks
  } catch (error) {
    console.error('加载个人排名失败:', error)
    // 个人排名失败不显示错误，可能是未登录
  }
}

const refreshData = async () => {
  await Promise.all([
    loadLeaderboard(),
    loadPersonalRank()
  ])
}

// 事件处理
const onTagChange = () => {
  currentPage.value = 1
  refreshData()
}

const onOrderChange = () => {
  currentPage.value = 1
  refreshData()
}

const onPageChange = (page: number) => {
  currentPage.value = page
  loadLeaderboard()
}

const onPageSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
  loadLeaderboard()
}

const onRowClick = (row: UserBoardItemDTO) => {
  // 可以扩展点击用户查看详情的功能
  console.log('点击用户:', row)
}

// 工具函数
const getRankClass = (rank: number) => {
  if (rank === 1) return 'rank-first'
  if (rank === 2) return 'rank-second'
  if (rank === 3) return 'rank-third'
  return ''
}

const formatTime = (timeStr: string) => {
  try {
    const date = new Date(timeStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMinutes = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMinutes / 60)
    const diffDays = Math.floor(diffHours / 24)
    
    if (diffMinutes < 1) return '刚刚'
    if (diffMinutes < 60) return `${diffMinutes}分钟前`
    if (diffHours < 24) return `${diffHours}小时前`
    if (diffDays < 7) return `${diffDays}天前`
    
    // 超过一周显示具体日期
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return timeStr
  }
}

// 监听选中标签变化
watch(hasSelectedTag, (hasTag) => {
  if (hasTag) {
    refreshData()
  }
})

// 组件挂载时加载数据
onMounted(async () => {
  // 直接加载排行榜数据，使用默认标签
  await refreshData()
})
</script>

<style scoped>
.leaderboard-container {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.header-section {
  margin-bottom: 24px;
}

.page-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 28px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 20px;
}

.page-title .el-icon {
  font-size: 32px;
  color: #f39c12;
}

.filters {
  display: flex;
  gap: 24px;
  align-items: center;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-group label {
  font-weight: 500;
  color: #606266;
  white-space: nowrap;
}

.tag-select, .order-select {
  min-width: 180px;
}

.option-desc {
  color: #909399;
  font-size: 12px;
  margin-left: 8px;
}

.personal-rank-section {
  margin-bottom: 24px;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  color: white;
}

.personal-rank-section h3 {
  margin: 0 0 16px 0;
  font-size: 18px;
}

.rank-cards {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.rank-card {
  background: rgba(255, 255, 255, 0.2);
  padding: 16px;
  border-radius: 8px;
  backdrop-filter: blur(10px);
  min-width: 120px;
}

.rank-label {
  font-size: 12px;
  opacity: 0.9;
  margin-bottom: 4px;
}

.rank-value {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.rank-number {
  font-size: 20px;
  font-weight: bold;
}

.rank-score {
  font-size: 14px;
  opacity: 0.9;
}

.leaderboard-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.table-row {
  cursor: pointer;
  transition: background-color 0.2s;
}

.table-row:hover {
  background-color: #f5f7fa;
}

.rank-cell {
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: center;
}

.crown-icon {
  font-size: 16px;
}

.rank-first .crown-icon {
  color: #f1c40f;
}

.rank-second .crown-icon {
  color: #95a5a6;
}

.rank-third .crown-icon {
  color: #e67e22;
}

.rank-text {
  font-weight: bold;
}

.rank-first .rank-text {
  color: #f1c40f;
}

.rank-second .rank-text {
  color: #95a5a6;
}

.rank-third .rank-text {
  color: #e67e22;
}

.user-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 14px;
}

.username {
  font-weight: 500;
}

.score-text {
  font-weight: bold;
  color: #409eff;
}

.solve-count {
  font-weight: 500;
  color: #67c23a;
}

.solve-time {
  color: #606266;
  font-size: 14px;
}

.no-solve {
  color: #c0c4cc;
  font-style: italic;
}

.pagination-wrapper {
  margin-top: 24px;
  display: flex;
  justify-content: center;
}

/* 响应式样式 */
@media (max-width: 768px) {
  .leaderboard-container {
    padding: 16px;
  }
  
  .filters {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }
  
  .filter-group {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }
  
  .tag-select, .order-select {
    width: 100%;
  }
  
  .rank-cards {
    flex-direction: column;
  }
  
  .rank-card {
    justify-content: center;
  }
}
</style>