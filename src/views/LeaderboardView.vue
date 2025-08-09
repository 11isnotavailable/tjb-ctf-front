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
    <div v-if="personalRank.length > 0" class="personal-rank">
      <h3>我的排名</h3>
      <div class="rank-cards">
        <div
          v-for="rank in personalRank"
          :key="orderType"
          class="rank-card"
        >
          <div class="rank-value">{{ rank.rank || 'N/A' }}</div>
          <div class="rank-info">
            <div class="rank-score">{{ rank.score }} 分</div>
            <div class="rank-total">共 {{ rank.total }} 人</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 排行榜表格 -->
    <div class="leaderboard-table">
      <el-table
        v-loading="loading"
        :data="leaderboardData"
        stripe
        highlight-current-row
        @row-click="onRowClick"
      >
        <el-table-column prop="rank" label="排名" width="80" align="center">
          <template #default="scope">
            <div class="rank-badge" :class="getRankClass(scope.row.rank)">
              <el-icon v-if="scope.row.rank <= 3"><Crown /></el-icon>
              {{ scope.row.rank }}
            </div>
          </template>
        </el-table-column>
        
        <el-table-column prop="username" label="用户名" min-width="150">
          <template #default="scope">
            <div class="user-info">
              <el-avatar
                :size="32"
                :src="`https://api.dicebear.com/7.x/initials/svg?seed=${scope.row.username}`"
              />
              <span class="username">{{ scope.row.username }}</span>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column prop="email" label="邮箱" width="200" show-overflow-tooltip />
        
        <el-table-column prop="score" label="总分" width="100" align="center">
          <template #default="scope">
            <span class="score-value">{{ scope.row.score }}</span>
          </template>
        </el-table-column>
        
        <el-table-column prop="solve_count" label="解题数" width="100" align="center">
          <template #default="scope">
            <el-tag type="success" size="small">{{ scope.row.solve_count }}</el-tag>
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
import { getAllTags, type Tag } from '@/api/tag'
// 移除 date-fns 依赖，使用简单的时间格式化

// 响应式数据
const loading = ref(false)
const tags = ref<Tag[]>([])
const selectedTagId = ref<number>()
const orderType = ref<'score' | 'solve_count' | 'submit'>('score')
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)
const leaderboardData = ref<UserBoardItemDTO[]>([])
const personalRank = ref<ScoreRankDTO[]>([])

// 计算属性
const hasSelectedTag = computed(() => selectedTagId.value !== undefined)

// 方法
const loadTags = async () => {
  try {
    const response = await getAllTags()
    if (response.data.code === 200 && response.data.data) {
      tags.value = response.data.data
      // 默认选择第一个标签
      if (tags.value.length > 0) {
        selectedTagId.value = tags.value[0].tag_id
      }
    }
  } catch (error) {
    console.error('加载标签失败:', error)
    ElMessage.error('加载标签列表失败')
  }
}

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

// 组件挂载
onMounted(async () => {
  await loadTags()
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
  gap: 8px;
  margin: 0 0 16px 0;
  font-size: 28px;
  font-weight: 600;
  color: #1a1a1a;
}

.filters {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
  align-items: center;
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
  width: 200px;
}

.option-desc {
  color: #909399;
  font-size: 12px;
  margin-left: 8px;
}

.personal-rank {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
  color: white;
}

.personal-rank h3 {
  margin: 0 0 16px 0;
  font-size: 18px;
  font-weight: 600;
}

.rank-cards {
  display: flex;
  gap: 16px;
}

.rank-card {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  backdrop-filter: blur(10px);
}

.rank-value {
  font-size: 32px;
  font-weight: bold;
  line-height: 1;
}

.rank-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.rank-score {
  font-size: 16px;
  font-weight: 600;
}

.rank-total {
  font-size: 12px;
  opacity: 0.8;
}

.leaderboard-table {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.rank-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 6px;
  font-weight: 600;
  background: #f5f7fa;
  color: #606266;
}

.rank-badge.rank-first {
  background: linear-gradient(135deg, #ffd700, #ffed4e);
  color: #8b6914;
}

.rank-badge.rank-second {
  background: linear-gradient(135deg, #c0c0c0, #e5e5e5);
  color: #5a5a5a;
}

.rank-badge.rank-third {
  background: linear-gradient(135deg, #cd7f32, #daa520);
  color: #654321;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.username {
  font-weight: 500;
  color: #303133;
}

.score-value {
  font-weight: 600;
  color: #409eff;
  font-size: 16px;
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
  display: flex;
  justify-content: center;
  padding: 20px;
  border-top: 1px solid #ebeef5;
}

/* 响应式设计 */
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

/* 表格样式优化 */
:deep(.el-table) {
  border: none;
}

:deep(.el-table th) {
  background: #fafbfc;
  border-bottom: 2px solid #ebeef5;
}

:deep(.el-table td) {
  border-bottom: 1px solid #f0f2f5;
}

:deep(.el-table--striped .el-table__body tr.el-table__row--striped td) {
  background: #fafbfc;
}

:deep(.el-table__body tr:hover > td) {
  background-color: #f5f7fa !important;
}

/* 加载状态 */
:deep(.el-loading-mask) {
  border-radius: 12px;
}
</style>
