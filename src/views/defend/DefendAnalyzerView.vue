<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { ElMessage, ElButton, ElSwitch, ElCard } from 'element-plus'
import { User, MagicStick, Document, Files, ArrowRight } from '@element-plus/icons-vue'
import { marked } from 'marked'
import router from '@/router'
import { getCurrentContext, getFilesFromLocal, saveAnalysisReport, type AnalysisReport } from '@/utils/localFileStore'
import { acquireAnalyzer, addPcapFilesToAnalyzer, startAnalyze } from '@/api/analyzer'

// 页面状态管理
const currentStep = ref<'setup' | 'analyzing' | 'results'>('setup')
const enableReasoner = ref(true)
const isAnalyzing = ref(false)

// 分析结果
const pcapAnalysisResult = ref('')
const logAnalysisResult = ref('')

// 当前上下文信息
const context = ref({ containerId: 0, questionId: 0 })
const fileData = ref<{ pcapFiles: string[], logFiles: string[] }>({ pcapFiles: [], logFiles: [] })

// 轮播文字
const analysisMessages = [
  '🔍 正在初始化AI分析引擎...',
  '📊 开始深度解析网络数据包...',
  '🧠 智能体正在学习攻击模式...',
  '🔎 分析异常流量特征...',
  '⚡ 运用深度学习算法检测威胁...',
  '🛡️ 生成智能防御策略...',
  '📋 整理分析报告中...'
]
const currentMessageIndex = ref(0)
let messageInterval: number | null = null

// 计算属性：解析后的报告HTML
const parsedPcapReport = computed(() => {
  if (!pcapAnalysisResult.value) return ''
  return marked(pcapAnalysisResult.value)
})

const parsedLogReport = computed(() => {
  if (!logAnalysisResult.value) return ''
  return marked(logAnalysisResult.value)
})

// 页面初始化
onMounted(() => {
  const currentContext = getCurrentContext()
  context.value = currentContext

  if (!currentContext.containerId) {
    ElMessage.error('未找到上下文信息，请重新开始流程')
    router.push('/home/defend/pcap')
    return
  }

  const files = getFilesFromLocal(currentContext.containerId)
  if (!files) {
    ElMessage.error('未找到文件信息，请重新捕获数据')
    router.push('/home/defend/pcap')
    return
  }

  fileData.value = { pcapFiles: files.pcapFiles, logFiles: files.logFiles }
})

// 开始分析
async function startAnalysis() {
  if (fileData.value.pcapFiles.length === 0 && fileData.value.logFiles.length === 0) {
    ElMessage.warning('没有可分析的文件')
    return
  }

  currentStep.value = 'analyzing'
  isAnalyzing.value = true

  // 开始轮播消息
  startMessageRotation()

  try {
    // 同时启动两个分析任务
    const [pcapResult, logResult] = await Promise.all([
      analyzePcapFiles(),
      analyzeLogFiles()
    ])

    pcapAnalysisResult.value = pcapResult
    logAnalysisResult.value = logResult

    // 保存分析报告到localStorage
    const report: AnalysisReport = {
      pcapReport: pcapResult,
      logReport: logResult
    }
    saveAnalysisReport(context.value.containerId, report)

    stopMessageRotation()
    currentStep.value = 'results'
    ElMessage.success('分析完成！')

  } catch (error) {
    console.error('分析失败:', error)
    ElMessage.error('分析过程中发生错误')
    stopMessageRotation()
    currentStep.value = 'setup'
  } finally {
    isAnalyzing.value = false
  }
}

// 分析PCAP文件
async function analyzePcapFiles(): Promise<string> {
  if (fileData.value.pcapFiles.length === 0) {
    return '# PCAP分析报告\n\n**状态**: 无PCAP文件可供分析\n\n未检测到网络数据包文件，跳过此项分析。'
  }

  try {
    // 获取分析器
    const acquireResponse = await acquireAnalyzer({ enable_reasoner: enableReasoner.value })
    if (!acquireResponse.data?.analyzer_id) {
      throw new Error('获取分析器失败')
    }

    const analyzerId = acquireResponse.data.analyzer_id

    // 添加文件到分析器
    await addPcapFilesToAnalyzer(analyzerId, { files: fileData.value.pcapFiles })

    // 开始分析
    const analyzeResponse = await startAnalyze(analyzerId)
    return analyzeResponse.data?.result || '分析完成，但未获取到结果'

  } catch (error) {
    console.error('PCAP分析失败:', error)
    return '# PCAP分析报告\n\n**状态**: 分析失败\n\n分析过程中出现错误，请稍后重试。'
  }
}

// 分析日志文件 (暂时stub)
async function analyzeLogFiles(): Promise<string> {
  if (fileData.value.logFiles.length === 0) {
    return '# 日志分析报告\n\n**状态**: 无日志文件可供分析\n\n未检测到日志文件，跳过此项分析。'
  }

  // 模拟分析耗时
  await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000))

  return `# 日志分析报告

## 概述
- **分析文件数量**: ${fileData.value.logFiles.length}
- **分析状态**: 功能开发中
- **深度思考**: ${enableReasoner.value ? '已启用' : '未启用'}

## 文件列表
${fileData.value.logFiles.map(file => `- \`${file}\``).join('\n')}

## 分析结果
> ⚠️ **注意**: 日志分析功能正在开发中，当前为演示版本。

### 检测到的异常
- 暂未实现具体分析逻辑
- 请等待后续版本更新

### 建议措施
1. 加强日志监控
2. 定期检查异常访问
3. 升级安全防护策略

---
*本报告由AI智能分析引擎生成 (开发版本)*`
}

// 消息轮播控制
function startMessageRotation() {
  currentMessageIndex.value = 0
  messageInterval = setInterval(() => {
    currentMessageIndex.value = (currentMessageIndex.value + 1) % analysisMessages.length
  }, 2000)
}

function stopMessageRotation() {
  if (messageInterval) {
    clearInterval(messageInterval)
    messageInterval = null
  }
}

// 跳转到下一步
function goToDefense() {
  router.push('/home/defend/defense')
}

// 组件销毁时清理
onMounted(() => {
  return () => {
    stopMessageRotation()
  }
})
</script>

<template>
  <div class="defend-analyzer-page">
    <div class="page-container">

      <!-- 设置阶段 -->
      <div v-if="currentStep === 'setup'" class="setup-stage">
        <!-- 标题区域 -->
        <div class="header-section">
          <h1 class="main-title">AI 智能分析引擎</h1>
          <h2 class="sub-title">深度学习威胁检测与分析</h2>
          <p class="description">
            运用先进的人工智能技术，对捕获的网络数据包和系统日志进行深度分析，
            识别潜在威胁并生成智能防御策略
          </p>
        </div>

        <!-- 文件信息 -->
        <div class="files-info-section">
          <el-card class="files-card">
            <template #header>
              <div class="card-header">
                <el-icon><Files /></el-icon>
                <span>待分析文件</span>
              </div>
            </template>

            <div class="file-stats">
              <div class="stat-item">
                <el-icon class="stat-icon pcap-icon"><Document /></el-icon>
                <div class="stat-content">
                  <div class="stat-number">{{ fileData.pcapFiles.length }}</div>
                  <div class="stat-label">数据包文件</div>
                </div>
              </div>

              <div class="stat-item">
                <el-icon class="stat-icon log-icon"><Files /></el-icon>
                <div class="stat-content">
                  <div class="stat-number">{{ fileData.logFiles.length }}</div>
                  <div class="stat-label">日志文件</div>
                </div>
              </div>
            </div>
          </el-card>
        </div>

        <!-- 配置选项 -->
        <div class="config-section">
          <el-card class="config-card">
            <template #header>
              <div class="card-header">
                <el-icon><User /></el-icon>
                <span>分析配置</span>
              </div>
            </template>

            <div class="config-option">
              <div class="option-info">
                <div class="option-title">启用深度思考</div>
                <div class="option-desc">
                  启用大模型的深度思考模式，提供更深入的威胁分析和防御建议
                </div>
              </div>
              <el-switch
                v-model="enableReasoner"
                size="large"
                :active-icon="User"
                :inactive-icon="MagicStick"
              />
            </div>
          </el-card>
        </div>

        <!-- 开始按钮 -->
        <div class="start-section">
          <el-button
            type="primary"
            size="large"
            :loading="isAnalyzing"
            @click="startAnalysis"
            class="start-button"
          >
            <el-icon><User /></el-icon>
            开始AI分析
          </el-button>
        </div>
      </div>

      <!-- 分析阶段 -->
      <div v-if="currentStep === 'analyzing'" class="analyzing-stage">
        <div class="analyzing-content">
          <div class="analyzing-animation">
            <div class="spinner-container">
              <div class="cyber-spinner"></div>
              <div class="pulse-ring"></div>
            </div>
          </div>

          <div class="analyzing-message">
            <h2 class="analyzing-title">AI分析进行中</h2>
            <p class="message-text">{{ analysisMessages[currentMessageIndex] }}</p>

            <div class="progress-dots">
              <span
                v-for="(_, index) in analysisMessages"
                :key="index"
                class="dot"
                :class="{ active: index === currentMessageIndex }"
              ></span>
            </div>
          </div>
        </div>
      </div>

      <!-- 结果阶段 -->
      <div v-if="currentStep === 'results'" class="results-stage">
        <!-- 标题区域 -->
        <div class="results-header">
          <h1 class="results-title">分析报告</h1>
          <p class="results-desc">AI智能分析已完成，以下是详细报告</p>
        </div>

        <!-- 报告内容 -->
        <div class="reports-container">
          <div class="report-column">
            <el-card class="report-card">
              <template #header>
                <div class="report-header">
                  <el-icon class="report-icon"><Document /></el-icon>
                  <span>数据包分析报告</span>
                </div>
              </template>
              <div
                class="report-content"
                v-html="parsedPcapReport"
              ></div>
            </el-card>
          </div>

          <div class="report-column">
            <el-card class="report-card">
              <template #header>
                <div class="report-header">
                  <el-icon class="report-icon"><Files /></el-icon>
                  <span>日志分析报告</span>
                </div>
              </template>
              <div
                class="report-content"
                v-html="parsedLogReport"
              ></div>
            </el-card>
          </div>
        </div>

        <!-- 下一步按钮 -->
        <div class="next-section">
          <el-button
            type="primary"
            size="large"
            @click="goToDefense"
            class="next-button"
          >
            下一步：智能防御
            <el-icon><ArrowRight /></el-icon>
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.defend-analyzer-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40px 20px;
}

.page-container {
  max-width: 1200px;
  margin: 0 auto;
}

/* 设置阶段样式 */
.header-section {
  text-align: center;
  margin-bottom: 60px;
}

.main-title {
  font-size: 3rem;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 16px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.sub-title {
  font-size: 1.5rem;
  color: #e0e7ff;
  margin-bottom: 24px;
  font-weight: 500;
}

.description {
  font-size: 1.1rem;
  color: #f1f5f9;
  line-height: 1.6;
  max-width: 600px;
  margin: 0 auto;
}

.files-info-section {
  margin-bottom: 40px;
}

.files-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  font-size: 16px;
}

.file-stats {
  display: flex;
  justify-content: space-around;
  gap: 40px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  font-size: 32px;
}

.pcap-icon {
  color: #3b82f6;
}

.log-icon {
  color: #f59e0b;
}

.stat-content {
  text-align: center;
}

.stat-number {
  font-size: 2rem;
  font-weight: bold;
  color: #1f2937;
}

.stat-label {
  font-size: 0.9rem;
  color: #6b7280;
}

.config-section {
  margin-bottom: 40px;
}

.config-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
}

.config-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
}

.option-info {
  flex: 1;
}

.option-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 8px;
}

.option-desc {
  color: #6b7280;
  line-height: 1.5;
}

.start-section {
  text-align: center;
}

.start-button {
  padding: 16px 48px;
  font-size: 18px;
  font-weight: 600;
  border-radius: 12px;
}

/* 分析阶段 */
.analyzing-stage {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 70vh;
}

.analyzing-content {
  text-align: center;
  color: white;
}

.analyzing-animation {
  margin-bottom: 40px;
  position: relative;
}

.spinner-container {
  position: relative;
  width: 120px;
  height: 120px;
  margin: 0 auto;
}

.cyber-spinner {
  width: 100%;
  height: 100%;
  border: 4px solid rgba(255, 255, 255, 0.1);
  border-left: 4px solid #60a5fa;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.pulse-ring {
  position: absolute;
  top: -20px;
  left: -20px;
  width: 160px;
  height: 160px;
  border: 2px solid rgba(96, 165, 250, 0.3);
  border-radius: 50%;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 0.3; }
  50% { transform: scale(1.1); opacity: 0.6; }
}

.analyzing-title {
  font-size: 2rem;
  margin-bottom: 16px;
  color: #ffffff;
}

.message-text {
  font-size: 1.2rem;
  color: #e0e7ff;
  margin-bottom: 24px;
  min-height: 1.5em;
}

.progress-dots {
  display: flex;
  justify-content: center;
  gap: 8px;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
}

.dot.active {
  background: #60a5fa;
  transform: scale(1.2);
}

/* 结果阶段样式 */
.results-header {
  text-align: center;
  margin-bottom: 40px;
}

.results-title {
  font-size: 2.5rem;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 16px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.results-desc {
  font-size: 1.1rem;
  color: #e0e7ff;
}

.reports-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  margin-bottom: 40px;
}

.report-column {
  display: flex;
  flex-direction: column;
}

.report-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  height: 100%;
}

.report-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  font-size: 16px;
}

.report-icon {
  font-size: 20px;
}

.report-content {
  max-height: 500px;
  overflow-y: auto;
  line-height: 1.6;
}

.report-content :deep(h1) {
  color: #1f2937;
  font-size: 1.5rem;
  margin-bottom: 16px;
}

.report-content :deep(h2) {
  color: #374151;
  font-size: 1.3rem;
  margin: 20px 0 12px 0;
}

.report-content :deep(h3) {
  color: #4b5563;
  font-size: 1.1rem;
  margin: 16px 0 8px 0;
}

.report-content :deep(p) {
  margin-bottom: 12px;
  color: #6b7280;
}

.report-content :deep(ul), .report-content :deep(ol) {
  margin-left: 20px;
  margin-bottom: 12px;
}

.report-content :deep(code) {
  background: #f3f4f6;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

.report-content :deep(blockquote) {
  border-left: 4px solid #60a5fa;
  padding-left: 16px;
  margin: 16px 0;
  color: #4b5563;
  background: #f8fafc;
  padding: 12px 16px;
  border-radius: 4px;
}

.next-section {
  text-align: center;
}

.next-button {
  padding: 16px 48px;
  font-size: 18px;
  font-weight: 600;
  border-radius: 12px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .main-title, .results-title {
    font-size: 2rem;
  }

  .sub-title {
    font-size: 1.2rem;
  }

  .reports-container {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .file-stats {
    flex-direction: column;
    gap: 20px;
  }

  .config-option {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }
}
</style>
