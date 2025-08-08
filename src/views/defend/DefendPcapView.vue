<script setup lang="ts">
import { onMounted, type Ref, ref, computed } from 'vue'
import { type ContainerInfo, getUserContainerList, getPcapStatus, stopPcapWithFiles, getContainerLogs, PcapStatusEnum } from '@/api/docker.ts'
import { getQuestionDetail, type QuestionItem } from '@/api/question.ts'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Document, FolderOpened, Files } from '@element-plus/icons-vue'
import { saveFilesToLocal, saveCurrentContext } from '@/utils/localFileStore'
import router from '@/router'

const userContainers: Ref<ContainerInfo[]> = ref([])
const questions: Ref<{[key: number]: QuestionItem}> = ref({})
const selectedContainerId = ref<number | null>(null)
const isCapturing = ref(false)
const capturedFiles: Ref<string[]> = ref([])
const logFiles: Ref<string[]> = ref([])
const captureCompleted = ref(false)

// 计算属性：获取可选择的容器选项
const containerOptions = computed(() => {
  return userContainers.value.map(container => ({
    value: container.docker_id,
    label: questions.value[container.question_id]?.title || `容器 ${container.docker_id}`,
    container
  }))
})

// 计算属性：是否显示确认提示
const showConfirmation = computed(() => {
  return selectedContainerId.value !== null && !captureCompleted.value
})

// 计算属性：捕获按钮是否可用
const captureButtonEnabled = computed(() => {
  return selectedContainerId.value !== null && !isCapturing.value
})

// 捕获按钮文本
const captureButtonText = computed(() => {
  if (captureCompleted.value) {
    return '下一步'
  }
  return isCapturing.value ? '正在捕获...' : '开始捕获数据'
})

// 新增文件类型接口
interface FileItem {
  name: string;
  type: 'pcap' | 'log';
}

// 计算属性：合并所有文件到一个列表
const allFiles = computed(() => {
  const files: FileItem[] = []

  // 添加pcap文件
  capturedFiles.value.forEach(file => {
    files.push({ name: file, type: 'pcap' });
  });

  // 添加日志文件
  logFiles.value.forEach(file => {
    files.push({ name: file, type: 'log' });
  });

  return files;
});

onMounted(async () => {
  try {
    const response = await getUserContainerList()
    userContainers.value = response.data || []
    console.log('用户容器列表:', userContainers.value)
    // 获取对应的题目详情
    for (const container of userContainers.value) {
      try {
        const questionResponse = await getQuestionDetail(container.question_id)
        if (questionResponse.data) {
          questions.value[container.question_id] = questionResponse.data
        }
      } catch (error) {
        console.error(`获取题目 ${container.question_id} 详情失败:`, error)
      }
    }
    console.log('获取题目详情完毕')
  } catch (error) {
    console.error('获取用户容器列表失败:', error)
    ElMessage.error('获取容器列表失败')
  }
})

// 处理容器选择变化
const handleContainerChange = (containerId: number) => {
  selectedContainerId.value = containerId
  capturedFiles.value = []
  logFiles.value = []
  captureCompleted.value = false
}

// 保存本地文件和上下文，然后前往下一步
function saveContextAndNext() {
  if (selectedContainerId.value) {
    const container = userContainers.value.find(c => c.docker_id === selectedContainerId.value)
    const questionId = container?.question_id
    if (questionId) {
      saveFilesToLocal({
        containerId: selectedContainerId.value,
        questionId,
        pcapFiles: capturedFiles.value,
        logFiles: logFiles.value
      })
      saveCurrentContext({ containerId: selectedContainerId.value, questionId })
      ElMessage.success('文件和上下文已保存到本地，可进行后续分析！')
      router.push('/home/defend/analyzer')
    } else {
      ElMessage.warning('未找到对应题目信息，无法保存上下文')
    }
  }
}

// 捕获前的确认
async function confirmCapture() {
  await ElMessageBox.confirm(
    '是否要开始智能防御进程？',
    '确认捕获',
    {
      confirmButtonText: '确认捕获',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
}

// 执行捕获流程
async function doCapture() {
  isCapturing.value = true
  try {
    const statusResponse = await getPcapStatus(selectedContainerId.value!)
    const status = statusResponse.data?.status
    if (status === PcapStatusEnum.RUNNING || status === PcapStatusEnum.STOPPED_WITH_FILES) {
      const [filesResponse, logsResponse] = await Promise.all([
        stopPcapWithFiles(selectedContainerId.value!),
        getContainerLogs(selectedContainerId.value!)
      ])
      if (filesResponse.data?.pcap_files) {
        capturedFiles.value = filesResponse.data.pcap_files
      }
      if (logsResponse.data?.log_files) {
        logFiles.value = logsResponse.data.log_files
      }
      if (capturedFiles.value.length > 0 || logFiles.value.length > 0) {
        captureCompleted.value = true
        ElMessage.success('数据包和日志文件获取成功！')
      } else {
        ElMessage.warning('未获取到数据包或日志文件')
      }
    } else {
      ElMessage.error(`容器状态异常: ${status}，无法捕获数据包`)
    }
  } catch (error: unknown) {
    if (error !== 'cancel') {
      if (error instanceof Error) {
        console.error('捕获数据包失败:', error)
        ElMessage.error('捕获数据包失败')
      } else {
        console.error('捕获数据包失败:', error)
        ElMessage.error('捕获数据包失败')
      }
    }
  } finally {
    isCapturing.value = false
  }
}

// 处理捕获按钮点击
const handleCapture = async () => {
  if (captureCompleted.value) {
    saveContextAndNext()
    return
  }
  if (!selectedContainerId.value) {
    ElMessage.warning('请先选择一个容器')
    return
  }
  try {
    await confirmCapture()
    await doCapture()
  } catch (error: unknown) {
    // confirmCapture已处理cancel
    console.error('捕获操作被取消或发生错误:', error)
  }
}
</script>

<template>
  <div class="defend-pcap-page">
    <div class="page-container">
      <!-- 标题区域 -->
      <div class="header-section">
        <h1 class="main-title">AI 智能防御引擎</h1>
        <h2 class="sub-title">网络流量分析与威胁检测</h2>
        <p class="description">
          首先请选择正在运行的题目容器，获取其中的数据包和日志以便分析
        </p>
      </div>

      <!-- 容器选择区域 -->
      <div class="selection-section">
        <el-form class="selection-form">
          <el-form-item label="选择容器:" label-width="100px">
            <el-select
              v-model="selectedContainerId"
              placeholder="请选择一个运行中的容器"
              style="width: 300px"
              @change="handleContainerChange"
            >
              <el-option
                v-for="option in containerOptions"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              >
                <span>{{ option.label }}</span>
                <span style="color: #8492a6; font-size: 13px; margin-left: 10px">
                  ID: {{ option.value }}
                </span>
              </el-option>
            </el-select>
          </el-form-item>
        </el-form>

        <!-- 确认提示 -->
        <div v-if="showConfirmation" class="confirmation-section">
          <el-alert
            title="重要提示"
            description="数据只能捕获一次，请再三确认"
            type="warning"
            :closable="false"
            show-icon
          />
        </div>

        <!-- 捕获按钮 -->
        <div class="capture-section">
          <el-button
            type="primary"
            size="large"
            :disabled="!captureButtonEnabled"
            :loading="isCapturing"
            @click="handleCapture"
            class="capture-button"
          >
            {{ captureButtonText }}
          </el-button>
        </div>
      </div>

      <!-- 合并的文件列表 -->
      <div v-if="allFiles.length > 0" class="files-section">
        <div class="files-header">
          <el-icon class="files-icon"><FolderOpened /></el-icon>
          <span class="files-title">获取到的文件</span>
          <div class="file-counts">
            <el-tag v-if="capturedFiles.length > 0" type="info" size="small">
              {{ capturedFiles.length }} 个数据包
            </el-tag>
            <el-tag v-if="logFiles.length > 0" type="warning" size="small">
              {{ logFiles.length }} 个日志
            </el-tag>
            <el-tag type="success" size="small">
              共 {{ allFiles.length }} 个文件
            </el-tag>
          </div>
        </div>

        <el-card class="files-card">
          <div class="files-list">
            <div
              v-for="(file, index) in allFiles"
              :key="`${file.type}-${index}`"
              class="file-item"
            >
              <el-icon class="file-icon">
                <Document v-if="file.type === 'pcap'" />
                <Files v-else />
              </el-icon>
              <span class="file-name">{{ file.name }}</span>
              <el-tag
                size="small"
                :type="file.type === 'pcap' ? 'info' : 'warning'"
              >
                {{ file.type === 'pcap' ? 'PCAP' : 'LOG' }}
              </el-tag>
            </div>
          </div>
        </el-card>

        <el-alert
          title="文件获取成功"
          description="已成功获取数据包和日志文件，可以进行下一步分析"
          type="success"
          :closable="false"
          show-icon
          class="success-alert"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.defend-pcap-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40px 20px;
}

.page-container {
  max-width: 800px;
  margin: 0 auto;
}

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
  margin-bottom: 0;
}

.selection-section {
  background: rgba(255, 255, 255, 0.95);
  padding: 40px;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  margin-bottom: 30px;
}

.selection-form {
  margin-bottom: 24px;
}

.confirmation-section {
  margin-bottom: 24px;
}

.capture-section {
  text-align: center;
}

.capture-button {
  padding: 12px 48px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 8px;
}

.files-section {
  background: rgba(255, 255, 255, 0.95);
  padding: 30px;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
}

.files-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 2px solid #e5e7eb;
}

.files-icon {
  font-size: 24px;
  color: #3b82f6;
}

.files-title {
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
}

.files-card {
  margin-bottom: 20px;
}

.files-list {
  space-y: 12px;
}

.file-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  transition: all 0.2s;
}

.file-item:hover {
  background: #f1f5f9;
  border-color: #3b82f6;
}

.file-icon {
  font-size: 20px;
  color: #6366f1;
}

.file-name {
  flex: 1;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 14px;
  color: #374151;
}

.success-section {
  background: rgba(255, 255, 255, 0.95);
  padding: 20px;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  margin-top: 20px;
}

.success-alert {
  margin: 0;
}

.file-counts {
  display: flex;
  gap: 8px;
  align-items: center;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .main-title {
    font-size: 2rem;
  }

  .sub-title {
    font-size: 1.2rem;
  }

  .selection-section,
  .files-section {
    padding: 24px;
  }

  .files-header {
    flex-wrap: wrap;
  }
}
</style>
