<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { VideoPlay, VideoPause, Document } from '@element-plus/icons-vue'
import { startDefense, getDefenseLogs, stopDefense, type StartDefenseReq } from '@/api/defender'
import { getCurrentContext, getAnalysisReport } from '@/utils/localFileStore'
import router from '@/router'

// 响应式数据
const logsContainer = ref<HTMLElement>()
const isStarting = ref(false)
const isDefending = ref(false)
const currentDefenseId = ref('')
const logs = ref<string[]>([])
const foundFlag = ref('')
const defenseStartTime = ref('')
const defenseDuration = ref(0)
let logPollingTimer: number | null = null
let durationTimer: number | null = null

// 上下文和报告数据
const context = ref({ containerId: 0, questionId: 0 })
const analysisReport = ref<any>(null)

// 计算属性
const defenseStatus = computed(() => {
  if (isDefending.value) return 'running'
  if (foundFlag.value) return 'success'
  return 'idle'
})

const statusText = computed(() => {
  if (isDefending.value) return '防御进行中'
  if (foundFlag.value) return '防御成功'
  return '就绪'
})

// 页面初始化
onMounted(() => {
  const currentContext = getCurrentContext()
  context.value = currentContext

  if (!currentContext.containerId) {
    ElMessage.error('未找到上下文信息，请重新开始流程')
    router.push('/home/defend/capture')
    return
  }

  // 获取分析报告
  const report = getAnalysisReport(currentContext.containerId)
  if (!report) {
    ElMessage.error('未找到分析报告，请重新分析')
    router.push('/home/defend/analyzer')
    return
  }

  analysisReport.value = report
})

// 方法
const handleStartDefense = async () => {
  if (!context.value.questionId) {
    ElMessage.error('缺少问题编号，无法启动防御')
    return
  }

  if (!analysisReport.value || (!analysisReport.value.pcapReport && !analysisReport.value.logReport)) {
    ElMessage.error('缺少分析报告，无法启动防御')
    return
  }

  try {
    isStarting.value = true

    // 组合选中的报告内容
    let combinedReport = ''
    if (analysisReport.value.pcapReport) {
      combinedReport += '# PCAP分析报告\n\n' + analysisReport.value.pcapReport + '\n\n'
    }
    if (analysisReport.value.logReport) {
      combinedReport += '# 日志分析报告\n\n' + analysisReport.value.logReport
    }

    const defenseData: StartDefenseReq = {
      question_id: context.value.questionId,
      report: combinedReport
    }

    const response = await startDefense(defenseData)

    if (response.code === 200 && response.data) {
      currentDefenseId.value = response.data.defense_id
      isDefending.value = true
      defenseStartTime.value = new Date().toLocaleString()
      logs.value = [response.data.message]
      foundFlag.value = ''
      defenseDuration.value = 0

      ElMessage.success('防御系统启动成功')
      startLogPolling()
      startDurationTimer()
    }
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || '启动防御失败')
  } finally {
    isStarting.value = false
  }
}

const handleStopDefense = async () => {
  try {
    await ElMessageBox.confirm('确定要停止当前防御吗？', '确认操作', {
      type: 'warning'
    })

    await stopDefense(currentDefenseId.value)
    stopDefenseProcess()
    ElMessage.success('防御已停止')
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('停止防御失败')
    }
  }
}

const startLogPolling = () => {
  if (logPollingTimer) return

  logPollingTimer = setInterval(async () => {
    if (!currentDefenseId.value || !isDefending.value) return

    try {
      const response = await getDefenseLogs(currentDefenseId.value)
      if (response.code === 200 && response.data) {
        logs.value = response.data.logs

        if (response.data.flag) {
          foundFlag.value = response.data.flag
          ElMessage.success('防御成功，获取Flag！')
        }

        if (response.data.is_finished) {
          stopDefenseProcess()
        }

        // 自动滚动到底部
        await nextTick()
        if (logsContainer.value) {
          logsContainer.value.scrollTop = logsContainer.value.scrollHeight
        }
      }
    } catch (error) {
      console.error('获取日志失败:', error)
    }
  }, 2000) // 每2秒轮询一次
}

const stopDefenseProcess = () => {
  isDefending.value = false
  if (logPollingTimer) {
    clearInterval(logPollingTimer)
    logPollingTimer = null
  }
  if (durationTimer) {
    clearInterval(durationTimer)
    durationTimer = null
  }
}

const startDurationTimer = () => {
  if (durationTimer) return

  durationTimer = setInterval(() => {
    defenseDuration.value += 1
  }, 1000)
}

const getLogClass = (log: string) => {
  if (log.includes('成功') || log.includes('Flag') || log.includes('防御')) return 'log-success'
  if (log.includes('失败') || log.includes('错误') || log.includes('威胁')) return 'log-error'
  if (log.includes('执行') || log.includes('检测')) return 'log-command'
  return 'log-info'
}

const formatTime = (date: Date) => {
  return date.toLocaleTimeString()
}

const formatDuration = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

// 生命周期
onUnmounted(() => {
  stopDefenseProcess()
})
</script>

<template>
  <div class="defend-actor-page">
    <div class="defend-container">
      <!-- 页面标题 -->
      <div class="page-header">
        <h1 class="page-title">🛡️ 智能防御系统</h1>
        <p class="page-subtitle">基于AI分析的智能安全防护</p>
      </div>

      <div class="defend-content">
        <!-- 左侧信息面板 -->
        <div class="info-panel">
          <!-- 防御配置 -->
          <div class="panel-card">
            <div class="panel-header">
              <h2>防御配置</h2>
              <p>基于AI分析报告的智能防御</p>
            </div>

            <div class="panel-body">
              <div class="config-info">
                <div class="info-item">
                  <span class="info-label">问题编号:</span>
                  <span class="info-value">{{ context.questionId || '未设置' }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">容器ID:</span>
                  <span class="info-value">{{ context.containerId || '未设置' }}</span>
                </div>
              </div>

              <!-- 操作按钮 -->
              <div class="action-buttons">
                <el-button
                  type="primary"
                  size="large"
                  :loading="isStarting"
                  :disabled="isDefending || !context.questionId"
                  @click="handleStartDefense"
                  class="start-btn"
                >
                  <el-icon><Shield /></el-icon>
                  启动智能防御
                </el-button>

                <el-button
                  type="danger"
                  size="large"
                  :disabled="!isDefending"
                  @click="handleStopDefense"
                  class="stop-btn"
                >
                  <el-icon><VideoPause /></el-icon>
                  停止防御
                </el-button>
              </div>
            </div>
          </div>

          <!-- 分析报告摘要 -->
          <div v-if="analysisReport" class="report-summary-card">
            <div class="panel-header">
              <h2>分析报告摘要</h2>
              <p>AI分析的威胁情报</p>
            </div>

            <div class="panel-body">
              <div class="report-stats">
                <div class="stat-item">
                  <span class="stat-label">PCAP报告:</span>
                  <span class="stat-value">{{ analysisReport.pcapReport ? '✅ 已加载' : '❌ 未选择' }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">日志报告:</span>
                  <span class="stat-value">{{ analysisReport.logReport ? '✅ 已加载' : '❌ 未选择' }}</span>
                </div>
              </div>

              <!-- 报告预览 -->
              <div v-if="analysisReport.pcapReport || analysisReport.logReport" class="report-preview">
                <div class="preview-item">
                  <span class="preview-label">报告长度:</span>
                  <span class="preview-value">
                    {{ (analysisReport.pcapReport || '').length + (analysisReport.logReport || '').length }} 字符
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧日志面板 -->
        <div class="logs-panel">
          <div class="panel-card">
            <div class="panel-header">
              <h2>防御日志</h2>
              <div class="status-indicator">
                <span :class="['status-dot', defenseStatus]"></span>
                <span class="status-text">{{ statusText }}</span>
              </div>
            </div>

            <div class="panel-body">
              <!-- 防御信息 -->
              <div v-if="currentDefenseId" class="defense-info">
                <p><strong>防御ID:</strong> {{ currentDefenseId }}</p>
                <p><strong>开始时间:</strong> {{ defenseStartTime }}</p>
                <p v-if="foundFlag"><strong>发现Flag:</strong> <span class="flag-text">{{ foundFlag }}</span></p>
              </div>

              <!-- 日志显示区域 -->
              <div class="logs-container" ref="logsContainer">
                <div v-if="logs.length === 0" class="empty-logs">
                  <el-icon><Document /></el-icon>
                  <p>暂无日志信息</p>
                  <p class="empty-hint">点击"启动智能防御"开始基于AI分析的安全防护</p>
                </div>
                <div v-else class="logs-content">
                  <div
                    v-for="(log, index) in logs"
                    :key="index"
                    class="log-item"
                    :class="getLogClass(log)"
                  >
                    <span class="log-time">{{ formatTime(new Date()) }}</span>
                    <span class="log-content">{{ log }}</span>
                  </div>
                </div>
              </div>

              <!-- 实时统计 -->
              <div v-if="isDefending" class="defense-stats">
                <div class="stat-item">
                  <span class="stat-label">运行时长:</span>
                  <span class="stat-value">{{ formatDuration(defenseDuration) }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">日志条数:</span>
                  <span class="stat-value">{{ logs.length }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.defend-actor-page {
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.defend-container {
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  text-align: center;
  margin-bottom: 40px;
  color: white;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 10px;
  text-shadow: 0 2px 4px rgba(0,0,0,0.3);
}

.page-subtitle {
  font-size: 1.1rem;
  opacity: 0.9;
  margin: 0;
}

.defend-content {
  display: grid;
  grid-template-columns: 400px 1fr;
  gap: 30px;
  align-items: start;
}

.info-panel {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.panel-card, .report-summary-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.panel-header {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  padding: 20px;
  text-align: center;
}

.panel-header h2 {
  margin: 0 0 5px 0;
  font-size: 1.4rem;
  font-weight: 600;
}

.panel-header p {
  margin: 0;
  opacity: 0.9;
  font-size: 0.9rem;
}

.panel-body {
  padding: 25px;
}

.config-info {
  margin-bottom: 25px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f3f4f6;
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  font-weight: 500;
  color: #6b7280;
}

.info-value {
  font-weight: 600;
  color: #374151;
}

.action-buttons {
  display: flex;
  gap: 15px;
}

.start-btn, .stop-btn {
  flex: 1;
  height: 45px;
  font-weight: 600;
  border-radius: 8px;
}

.report-stats {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-label {
  font-size: 0.9rem;
  color: #6b7280;
  font-weight: 500;
}

.stat-value {
  font-size: 0.9rem;
  font-weight: 600;
  color: #374151;
}

.report-preview {
  padding-top: 15px;
  border-top: 1px solid #e5e7eb;
}

.preview-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.preview-label {
  font-size: 0.85rem;
  color: #6b7280;
}

.preview-value {
  font-size: 0.85rem;
  font-weight: 500;
  color: #10b981;
}

.logs-panel .panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
}

.status-dot.idle {
  background: #9ca3af;
}

.status-dot.running {
  background: #10b981;
  animation: pulse 2s infinite;
}

.status-dot.success {
  background: #059669;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.defense-info {
  background: #f0fdf4;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  border-left: 4px solid #10b981;
}

.defense-info p {
  margin: 5px 0;
  font-size: 0.9rem;
}

.flag-text {
  color: #059669;
  font-weight: 600;
  font-family: 'Courier New', monospace;
}

.logs-container {
  height: 400px;
  overflow-y: auto;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #f9fafb;
}

.empty-logs {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
  text-align: center;
  padding: 40px 20px;
}

.empty-hint {
  margin-top: 10px;
  font-size: 0.9rem;
  color: #6b7280;
}

.logs-content {
  padding: 10px;
}

.log-item {
  display: flex;
  gap: 10px;
  padding: 5px 0;
  border-bottom: 1px solid #f3f4f6;
  font-family: 'Courier New', monospace;
  font-size: 0.85rem;
}

.log-time {
  color: #6b7280;
  min-width: 80px;
}

.log-content {
  flex: 1;
}

.log-info { color: #374151; }
.log-success { color: #10b981; font-weight: 600; }
.log-error { color: #ef4444; font-weight: 600; }
.log-command { color: #3b82f6; font-weight: 600; }

.defense-stats {
  display: flex;
  gap: 20px;
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #e5e7eb;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .defend-content {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .info-panel {
    order: 2;
  }

  .logs-panel {
    order: 1;
  }
}

@media (max-width: 768px) {
  .defend-container {
    padding: 10px;
  }

  .page-title {
    font-size: 2rem;
  }

  .panel-body {
    padding: 20px;
  }

  .action-buttons {
    flex-direction: column;
  }
}
</style>
