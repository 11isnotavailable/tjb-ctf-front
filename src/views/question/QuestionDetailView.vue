<template>
  <div class="question-detail">
    <!-- 背景动画 -->
    <MatrixRainCanvas :color="matrixColor" :background-color="matrixBackground" :speed="matrixSpeed" :density="matrixDensity" />

    <div class="main-content">
    <div v-if="loading" class="loading-container">
        <el-skeleton :rows="8" animated />
    </div>
    
    <div v-else-if="!question" class="not-found">
        <el-empty description="题目不存在或已被删除">
          <el-button type="primary" @click="router.push('/home/questions')">返回题目列表</el-button>
        </el-empty>
    </div>
    
      <div v-else>
        <div class="question-container">
          <!-- 左侧：题目信息和拓扑图 -->
          <div class="question-left">
            <!-- 题目基础信息卡片 -->
            <el-card class="question-info-card">
      <div class="question-header">
                <div class="title-section">
                  <h1>{{ question?.title || '加载中...' }}</h1>
                  <div class="meta-info">
                    <el-tag
                      v-for="tag in questionTags"
                      :key="tag"
                      :type="getTagType(tag)"
                      size="large"
                      class="tag-item"
                    >
                      {{ tag }}
                    </el-tag>
                    <el-rate :model-value="question?.star || 0" disabled show-score text-color="#ff9900" score-template="{value}星" />
          </div>
        </div>

                <div class="stats-section">
                  <div class="stat-item">
                    <span class="stat-label">解决人数</span>
                    <span class="stat-value">{{ question?.solved_number || 0 }}</span>
      </div>
                  <div class="stat-item">
                    <span class="stat-label">尝试次数</span>
                    <span class="stat-value">{{ question?.try_number || 0 }}</span>
        </div>
                  <div class="stat-item">
                    <span class="stat-label">当前分值</span>
                    <span class="stat-value score">{{ currentScore }}分</span>
        </div>
        </div>
      </div>
      
              <!-- 题目描述 -->
              <div class="question-description">
                <h3>📝 题目描述</h3>
                <div class="description-content" v-html="formatDescription(question.introduction)"></div>
              </div>

              <!-- 查看拓扑图区域 -->
              <div class="topology-section">
                <h3>🖼️ 网络拓扑图</h3>
                <div class="topology-link-container">
                  <p class="link-description">点击下方按钮在新标签页中查看该题目的网络拓扑图：</p>
                  <a 
                    :href="getTopologyImageUrl()" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    class="topology-link"
                  >
                    🖼️ 查看拓扑图
                  </a>
                </div>
              </div>

              <!-- Flag提交区域 -->
              <div class="submit-section">
                <h3>🏁 提交Flag</h3>
                <el-tag v-if="question?.try_number && question.try_number > 0" type="info" size="small" class="try-limit-tag">
                  最多{{ question.try_number }}次尝试
                </el-tag>

                <el-form :model="submitForm" @submit.prevent="submitFlag" class="submit-form">
                  <el-input
                    v-model="submitForm.flag"
                    placeholder="请输入flag，格式：flag{...}"
                    size="large"
                    clearable
                    :disabled="submitting || !canSubmit"
                    :prefix-icon="Flag"
                    @keyup.enter="submitFlag"
                    class="flag-input"
                  />

                  <el-button
                    type="primary"
                    size="large"
                    @click="submitFlag"
                    :loading="submitting"
                    :disabled="!submitForm.flag.trim() || !canSubmit"
                    class="submit-btn"
                    :icon="Position"
                  >
                    提交答案
                  </el-button>

                  <div v-if="!canSubmit" class="submit-hint">
                    <el-alert
                      title="请先启动靶场环境"
                      type="warning"
                      show-icon
                      :closable="false"
                      description="部分题目需要启动容器环境后才能提交Flag"
                    />
                  </div>
                </el-form>
              </div>

            </el-card>


          </div>

          <!-- 右侧：靶场环境 -->
          <div class="question-right">
            <!-- 靶场环境管理 -->
            <el-card class="environment-card">
              <template #header>
                <div class="card-header">
                  <span>🚀 靶场环境</span>
                  <el-tag v-if="container" :type="getContainerTypeColor(container.type)" size="small">
                    {{ getContainerTypeName(container.type) }}
              </el-tag>
                </div>
              </template>

              <!-- 环境状态显示 -->
              <div class="environment-status">
                <div v-if="!container" class="status-item">
                  <el-icon class="status-icon inactive"><Monitor /></el-icon>
                  <div class="status-info">
                    <span class="status-text">环境未启动</span>
                    <span class="status-desc">点击启动按钮创建专属靶场环境</span>
                  </div>
                </div>

                <div v-else class="status-item">
                  <el-icon class="status-icon" :class="getStatusClass(container.status)">
                    <Loading v-if="container.status === 'CREATING'" />
                    <Monitor v-else-if="container.status === 'RUNNING'" />
                    <Warning v-else-if="container.status === 'CLOSING'" />
                    <Close v-else />
                  </el-icon>
                  <div class="status-info">
                    <span class="status-text">{{ getStatusText(container.status) }}</span>
                    <span v-if="container.status === 'RUNNING' && countdown > 0" class="status-desc">
                      剩余时间: {{ formatCountdown(countdown) }}
                    </span>
                    <span v-else-if="container.status === 'CREATING'" class="status-desc">
                      正在部署Docker容器，请稍候...
                    </span>
        </div>
      </div>
        </div>

              <!-- 访问地址 -->
              <div v-if="container?.status === 'RUNNING' && parsedAccessList.length > 0" class="access-section">
                <h4>🌐 访问入口</h4>
                <div class="access-list">
                  <div v-for="(access, index) in parsedAccessList" :key="index" class="access-item">
                    <el-link
                      :href="formatAccessUrl(access.address)"
                      target="_blank"
                      type="primary"
                      :underline="false"
                      class="access-link"
                    >
                      <el-icon><Link /></el-icon>
                      {{ formatAccessUrl(access.address) }}
                    </el-link>
                    <span v-if="access.description" class="access-desc">{{ access.description }}</span>
        </div>
        </div>
      </div>

              <!-- 操作按钮 -->
              <div class="action-section">
                <el-button
                  v-if="!container"
                  type="primary"
                  size="large"
                  :loading="creating"
                  @click="startEnvironment"
                  class="action-button"
                  :icon="VideoPlay"
                >
                  启动靶场环境
            </el-button>

                <template v-else>
                  <div class="button-group">
                    <!-- <el-button
                      v-if="container.status === 'RUNNING'"
                      type="success"
                      size="large"
                      @click="openEnvironment"
                      :disabled="!parsedAccessList.length"
                      :icon="Link"
                    >
                      快速访问
                    </el-button> -->

                    <el-button
                      v-if="container.status === 'CREATING'"
                      type="warning"
                      size="large"
                      loading
                      disabled
                    >
                      启动中...
            </el-button>

                    <!-- <el-button
                      v-else
                      type="primary"
                      size="large"
                      @click="startEnvironment"
                      :loading="creating"
                      :icon="VideoPlay"
                    >
                      重新启动
                    </el-button> -->
          </div>

                  <!-- 容器管理按钮 -->
                  <div v-if="container.status === 'RUNNING'" class="secondary-actions">
                    <el-button
                      type="warning"
                      size="small"
                      @click="restartEnvironment"
                      :loading="restarting"
                      :icon="Refresh"
                    >
                    刷新容器
                    </el-button>
                    <el-button
                      type="danger"
                      size="small"
                      @click="confirmStopEnvironment"
                      :loading="stopping"
                      :icon="Close"
                    >
                      停止容器
            </el-button>
        </div>
                </template>
              </div>
            </el-card>



            <!-- 提交记录 -->
            <el-card class="records-card">
              <template #header>
                <div class="card-header">
                  <span>🎯 提交记录</span>
                  <el-button link size="small" @click="fetchUserRecords" :icon="Refresh">
                    刷新
            </el-button>
        </div>
              </template>

              <div v-if="userRecords.length === 0" class="empty-records">
                <el-empty description="暂无提交记录" :image-size="80" />
      </div>
      
              <div v-else class="records-list">
                <div v-for="record in userRecords.slice(0, 5)" :key="record.record_id" class="record-item">
                  <div class="record-status">
                    <el-icon v-if="record.status === 2" class="success-icon"><SuccessFilled /></el-icon>
                    <el-icon v-else class="fail-icon"><CircleCloseFilled /></el-icon>
                  </div>
                  <div class="record-info">
                    <div class="record-result">
                      {{ record.status === 2 ? '✅ 正确' : '❌ 错误' }}
                      <span v-if="record.score > 0" class="record-score">+{{ record.score }}分</span>
                    </div>
                    <div class="record-time">{{ formatDate(record.submit_time) }}</div>
                  </div>
                </div>
              </div>
            </el-card>
          </div>
        </div>

        <!-- 右侧边栏 -->
          <div class="question-sidebar">
            <!-- 倒计时 -->
            <div v-if="container && container.status === 'RUNNING' && countdown > 0" class="countdown-card">
              <div class="countdown-time">{{ formatCountdown(countdown) }}</div>
              <div class="countdown-label">剩余时间</div>
            </div>

            <!-- 解题统计 -->
            <div class="stats-card">
              <div class="solve-count">
                <el-icon><TrophyBase /></el-icon>
                <span>{{ question?.solved_number || 0 }} solves</span>
              </div>
              <div class="try-count">
                <span>{{ question?.try_number || 0 }} 次尝试</span>
              </div>
              <div class="solve-rate">
                <span>解题率: {{ solveRate }}%</span>
              </div>
            </div>

            <!-- 题目标签 -->
            <div class="tags-card">
              <h4>标签</h4>
              <div class="tags-list">
                <el-tag
                  v-for="tag in questionTags"
                  :key="tag"
                  :type="getTagType(tag)"
                  effect="plain"
                  class="question-tag"
                >
                  {{ tag }}
                </el-tag>
              </div>
            </div>

            <!-- 题目信息 -->
            <div class="info-card">
              <h4>题目信息</h4>
              <div class="info-list">
                <div class="info-item">
                  <span class="info-label">创建时间:</span>
                  <span class="info-value">{{ formatDate(question?.create_time || '') }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">有效时间:</span>
                  <span class="info-value">{{ question?.valid_time || 0 }}秒</span>
                </div>
                <div class="info-item">
                  <span class="info-label">状态:</span>
                  <el-tag :type="question?.is_active ? 'success' : 'info'" size="small">
                    {{ question?.is_active ? '激活' : '未激活' }}
                  </el-tag>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

        <!-- 提交记录 -->
        <div class="records-section">
          <el-card>
            <template #header>
              <div class="records-header">
                <span>🎯 我的提交记录</span>
                <el-button type="primary" size="small" @click="fetchUserRecords" :icon="Refresh">
                  刷新
                </el-button>
      </div>
    </template>

            <div v-if="userRecords.length === 0" class="empty-records">
              <el-empty description="暂无提交记录" :image-size="80" />
            </div>

            <el-table v-else :data="userRecords" stripe size="small">
              <el-table-column prop="question_title" label="题目" min-width="150" show-overflow-tooltip />
              <el-table-column prop="tag" label="分类" width="100" />
              <el-table-column prop="difficulty" label="难度" width="80">
                <template #default="scope">
                  <el-rate v-model="scope.row.difficulty" disabled size="small" />
                </template>
              </el-table-column>
              <el-table-column prop="status" label="状态" width="80">
                <template #default="scope">
                  <el-tag :type="scope.row.status === 2 ? 'success' : 'danger'" size="small">
                    {{ scope.row.status === 2 ? '✓ 已解决' : '✗ 未解决' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="score" label="分数" width="80">
                <template #default="scope">
                  <span class="score-text">{{ scope.row.score }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="submit_time" label="提交时间" width="160">
                <template #default="scope">
                  {{ formatDate(scope.row.submit_time) }}
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useThemeStore } from '@/stores/theme';
import {
  Monitor,
  Loading,
  Close,
  TrophyBase,
  Link,
  VideoPlay,
  Refresh,
  Flag,
  Position,
  SuccessFilled,
  CircleCloseFilled,
  Warning
} from '@element-plus/icons-vue';
import MatrixRainCanvas from '@/components/effects/MatrixRainCanvas.vue';

// API imports
import { getQuestionDetail, type QuestionItem, submitFlag as submitFlagAPI, type SubmitFlagRequest } from '@/api/question';
import {
  startContainer,
  getContainerInfo,
  refreshContainer,
  stopContainer,
  type ContainerInfo,
  ContainerStatus
} from '@/api/docker';
import { getUserRecords, type SubmitRecord, type UserSubmitRecord } from '@/api/record';

const route = useRoute();
const router = useRouter();
const themeStore = useThemeStore();

// 主题配置
const matrixColor = themeStore.themeConfig.matrixColor;
const matrixBackground = themeStore.themeConfig.matrixBackgroundColor;
const matrixSpeed = themeStore.themeConfig.matrixSpeed;
const matrixDensity = themeStore.themeConfig.matrixDensity;

const questionId = ref<number>(parseInt(route.params.id as string, 10));

// 状态管理
const loading = ref(true);
const submitting = ref(false);
const creating = ref(false);
const restarting = ref(false);
const stopping = ref(false);

// 数据管理
const question = ref<QuestionItem | null>(null);
const container = ref<ContainerInfo | null>(null);
const userRecords = ref<UserSubmitRecord[]>([]);
const submitForm = ref({
  flag: ''
});

// 容器计时器
const countdown = ref(0);
let countdownTimer: number | null = null;
let containerCheckTimer: number | null = null;



// 模拟题目标签
const questionTags = ref(['flask', 'rce', 'python']);

// 计算属性
const solveRate = computed(() => {
  if (!question.value || question.value.try_number === 0) return 0;
  return Math.round((question.value.solved_number / question.value.try_number) * 100);
});



const canSubmit = computed(() => {
  // 有些题目不需要容器环境就可以提交
  const needContainer = (question.value as any)?.need_container;
  return !needContainer || (container.value?.status === 'RUNNING');
});

const currentScore = computed(() => {
  if (!question.value) return 0;
  // 计算当前分值（随着解题人数增加而递减）
  const baseScore = question.value.star * 100;
  const solvedCount = question.value.solved_number;
  const penalty = Math.min(solvedCount * 5, baseScore * 0.5);
  return Math.max(baseScore - penalty, baseScore * 0.2);
});

// 解析容器访问地址
const parsedAccessList = computed(() => {
  if (!container.value?.access) return [];

  try {
    const accessData = JSON.parse(container.value.access);
    return Array.isArray(accessData) ? accessData : [];
  } catch (error) {
    console.error('解析容器访问地址失败:', error);
    return [];
  }
});

// 获取题目详情
const fetchQuestionDetail = async () => {
  loading.value = true;
  
  try {
    const response = await getQuestionDetail(questionId.value);
    question.value = response.data;

    // 检查用户是否有容器
    await checkUserContainer();

    // 获取用户提交记录
    await fetchUserRecords();
  } catch (error) {
    console.error('获取题目详情失败:', error);
    question.value = null;
    ElMessage.error('获取题目详情失败');
  } finally {
    loading.value = false;
  }
};

// 检查用户容器
const checkUserContainer = async () => {
  const storedContainerId = localStorage.getItem(`container_${questionId.value}`);
  if (storedContainerId) {
    try {
      const response = await getContainerInfo(parseInt(storedContainerId));
      container.value = response.data;

      if (container.value && container.value.status === ContainerStatus.RUNNING) {
        startCountdown();
        startContainerStatusCheck();
      }
    } catch (error: any) {
      console.log('检查用户容器失败，清理本地存储:', error?.response?.data?.message || error?.message);
      localStorage.removeItem(`container_${questionId.value}`);
      container.value = null;
    }
  }
};

// 启动环境
const startEnvironment = async () => {
  creating.value = true;

  try {
    const response = await startContainer({ question_id: questionId.value });
    if (response?.data?.container) {
      container.value = response.data.container;
    } else {
      throw new Error('启动容器失败：服务器返回数据异常');
    }

    if (container.value?.docker_id) {
      localStorage.setItem(`container_${questionId.value}`, container.value.docker_id.toString());
    }

    ElMessage.success('环境启动中，请稍候...');

    // 给后端一些时间来初始化容器，然后开始状态检查
    setTimeout(() => {
      startContainerStatusCheck();
    }, 2000);
  } catch (error: any) {
    console.error('启动环境失败:', error);
    const errorMessage = error?.response?.data?.message || error?.message || '启动环境失败';
    if (error?.response?.status === 404) {
      ElMessage.error('容器服务不可用，请联系管理员');
    } else {
      ElMessage.error(`启动环境失败: ${errorMessage}`);
    }
  } finally {
    creating.value = false;
  }
};

// 格式化访问URL
const formatAccessUrl = (address: string) => {
  // 硬编码IP地址
  const HARDCODED_IP = '81.70.202.254';
  
  // 如果地址已经包含协议，提取端口号并替换IP
  if (address.startsWith('http://') || address.startsWith('https://')) {
    const portMatch = address.match(/:(\d+)(?:\/|$)/);
    if (portMatch) {
      return `${HARDCODED_IP}:${portMatch[1]}`;
    }
    return address;
  }

  // 如果是 IP:PORT 格式，提取端口号并使用硬编码IP
  const ipPortMatch = address.match(/^[\d\.]+:(\d+)$/);
  if (ipPortMatch) {
    return `${HARDCODED_IP}:${ipPortMatch[1]}`;
  }

  // 如果是 localhost:PORT 或 127.0.0.1:PORT 格式，提取端口号并使用硬编码IP
  const localhostMatch = address.match(/^(?:localhost|127\.0\.0\.1):(\d+)$/);
  if (localhostMatch) {
    return `${HARDCODED_IP}:${localhostMatch[1]}`;
  }

  // 默认返回原地址
  return address;
};

// 打开环境
const openEnvironment = () => {
  if (parsedAccessList.value.length > 0) {
    // 打开第一个可用的访问地址
    const firstAccess = parsedAccessList.value[0];
    const url = formatAccessUrl(firstAccess.address);
    window.open(url, '_blank');
  } else if (container.value?.access) {
    // 兼容老版本，直接尝试打开access字段
    window.open(container.value.access, '_blank');
  }
};

// 重启环境
const restartEnvironment = async () => {
  if (!container.value) return;

  restarting.value = true;

  try {
    const response = await refreshContainer(container.value.docker_id);
    if (response?.data?.container) {
      container.value = response.data.container;
    } else {
      throw new Error('重启容器失败：服务器返回数据异常');
    }
    ElMessage.success('环境重启成功');
    startCountdown();
  } catch (error) {
    console.error('重启环境失败:', error);
    ElMessage.error('重启环境失败');
  } finally {
    restarting.value = false;
  }
};

// 停止环境
const confirmStopEnvironment = async () => {
  try {
    await ElMessageBox.confirm('确定要停止容器环境吗？停止后需要重新启动。', '确认停止', {
      confirmButtonText: '确定停止',
      cancelButtonText: '取消',
      type: 'warning'
    });

    await stopEnvironment();
  } catch (error) {
    // 用户取消操作
  }
};

const stopEnvironment = async () => {
  if (!container.value) return;

  try {
    stopping.value = true;

    await stopContainer(container.value.docker_id);

    container.value = null;
    localStorage.removeItem(`container_${questionId.value}`);
    stopCountdown();
    stopContainerStatusCheck();

    ElMessage.success('环境已停止');
  } catch (error) {
    console.error('停止环境失败:', error);
    ElMessage.error('停止环境失败');
  } finally {
    stopping.value = false;
  }
};

// 提交Flag
const submitFlag = async () => {
  if (!submitForm.value.flag.trim()) {
    ElMessage.warning('请输入Flag');
    return;
  }
  
  submitting.value = true;
  
  try {
    const response = await submitFlagAPI(questionId.value, {
      flag: submitForm.value.flag.trim()
    });

    console.log('提交Flag响应:', response);
    console.log('response.code:', response?.code);
    console.log('response.message:', response?.message);
    console.log('response.data:', response?.data);

    // 修正：响应拦截器已经展平了结构，直接从response读取，不是response.data
    // 实际响应结构经过拦截器处理后是: { code: 200, message: 'flag正确', data: null }
    const responseCode = response?.code;
    const responseMessage = response?.message;
    
    console.log('responseCode类型:', typeof responseCode, '值:', responseCode);
    console.log('responseMessage类型:', typeof responseMessage, '值:', responseMessage);
    console.log('严格相等判断 responseCode === 200:', responseCode === 200);
    console.log('严格相等判断 responseMessage === "flag正确":', responseMessage === 'flag正确');
    
    const isCorrect = responseCode === 200 && 
                     responseMessage && 
                     (responseMessage === 'flag正确' || 
                      responseMessage.includes('正确') ||
                      responseMessage.includes('成功'));

    console.log('isCorrect判断结果:', isCorrect);
    
    if (isCorrect) {
      console.log('进入正确分支');
      ElMessage.success(`🎉 恭喜！Flag正确！${response.data?.rank ? `您是第 ${response.data.rank} 个解出此题的人！` : ''}`);

      // 更新题目统计
      if (question.value) {
        question.value.solved_number += 1;
        question.value.try_number += 1;
      }

      // 清空输入框
      submitForm.value.flag = '';

      // 自动停止容器（如果有运行的容器）
      console.log('检查容器状态:', container.value?.status);
      console.log('容器docker_id:', container.value?.docker_id);
      if (container.value?.status === 'RUNNING') {
        console.log('开始停止容器...');
        try {
          await stopContainer(container.value.docker_id);
          ElMessage.info('容器已自动停止');
          container.value = null;
          localStorage.removeItem(`container_${questionId.value}`);
          stopCountdown();
          stopContainerStatusCheck();
          await checkUserContainer();
        } catch (stopError) {
          console.warn('自动停止容器失败:', stopError);
        }
      } else {
        console.log('容器未运行，无需停止');
      }

      // 尝试获取用户提交记录（如果API可用）
      try {
        await fetchUserRecords();
      } catch (recordError) {
        console.warn('获取提交记录失败:', recordError);
      }
    } else {
      console.log('进入错误分支');
      // 显示具体的错误信息
      const errorMessage = response?.data?.message || 'Flag错误，请继续尝试';
      console.log('错误信息:', errorMessage);
      ElMessage.error(`❌ ${errorMessage}`);

      if (question.value) {
        question.value.try_number += 1;
      }

      // 清空输入框
      submitForm.value.flag = '';
    }
  } catch (error) {
    console.error('提交失败:', error);
    ElMessage.error('提交失败');
  } finally {
    submitting.value = false;
  }
};



// 获取用户提交记录
const fetchUserRecords = async () => {
  try {
    // 暂时禁用：后端接口设计有错误（UserSubmitRecordReq缺少Depends()）
    // 会导致422错误，等后端修复后再启用
    console.warn('用户提交记录API暂时禁用，等待后端修复接口设计问题');

    // 使用空数组避免界面报错
    userRecords.value = [];

    // TODO: 后端修复后重新启用以下代码
    // const response = await getUserRecords({});
    // if (questionId.value) {
    //   userRecords.value = response.data.items.filter(record => record.question_id === questionId.value);
    // } else {
    //   userRecords.value = response.data.items;
    // }
  } catch (error) {
    console.error('获取提交记录失败:', error);
    userRecords.value = [];
  }
};

// 容器状态检查
const startContainerStatusCheck = () => {
  if (containerCheckTimer) return;

  containerCheckTimer = window.setInterval(async () => {
    if (!container.value) {
      stopContainerStatusCheck();
      return;
    }

    try {
      const response = await getContainerInfo(container.value.docker_id);
      const newContainer = response.data;

      if (!newContainer) {
        console.error('获取容器信息失败：返回数据为空');
        stopContainerStatusCheck();
        return;
      }

      if (newContainer.status !== container.value.status) {
        container.value = newContainer;

        if (newContainer.status === ContainerStatus.RUNNING) {
          ElMessage.success('🚀 环境已启动，可以开始答题！');
          startCountdown();
        } else if (newContainer.status === ContainerStatus.CLOSED) {
          ElMessage.info('环境已停止');
          stopCountdown();
          stopContainerStatusCheck();
        }
      } else {
        container.value = newContainer;
      }

      if (newContainer.status === ContainerStatus.RUNNING || newContainer.status === ContainerStatus.CLOSED) {
        stopContainerStatusCheck();
        if (newContainer.status === ContainerStatus.RUNNING) {
          containerCheckTimer = window.setInterval(() => {
            checkUserContainer();
          }, 30000);
        }
      }
    } catch (error: any) {
      console.error('检查容器状态失败:', error);

      // 如果是404错误，需要区分情况处理
      if (error?.response?.status === 404) {
        const errorMessage = error?.response?.data?.message || '';
        
        // 如果明确提示容器不存在，说明容器已被删除，清理本地状态
        if (errorMessage.includes('容器不存在') || errorMessage.includes('不存在')) {
          console.log('容器已不存在，清理本地状态');
          localStorage.removeItem(`container_${questionId.value}`);
          container.value = null;
          stopContainerStatusCheck();
          return;
        }
        
        // 其他404情况（容器还未准备好），继续重试
        console.log('容器还未准备好，继续等待...');
        return;
      }

      // 其他错误才停止检查
      stopContainerStatusCheck();
    }
  }, 3000);
};

const stopContainerStatusCheck = () => {
  if (containerCheckTimer) {
    clearInterval(containerCheckTimer);
    containerCheckTimer = null;
  }
};

// 倒计时管理
const startCountdown = () => {
  if (!container.value || !question.value) return;

  stopCountdown();

  const createTime = new Date(container.value.create_time).getTime();
  const validTimeMs = question.value.valid_time * 1000;
  const expireTime = createTime + validTimeMs;
  const remainingMs = expireTime - Date.now();

  if (remainingMs <= 0) {
    countdown.value = 0;
    return;
  }

  countdown.value = Math.floor(remainingMs / 1000);

  countdownTimer = window.setInterval(() => {
    countdown.value--;

    if (countdown.value <= 0) {
      stopCountdown();
      ElMessage.warning('⏰ 环境已过期');
      container.value = null;
      localStorage.removeItem(`container_${questionId.value}`);
    }
  }, 1000);
};

const stopCountdown = () => {
  if (countdownTimer) {
    clearInterval(countdownTimer);
    countdownTimer = null;
  }
};

// 工具函数
const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleString('zh-CN');
};

const formatDescription = (text: string) => {
  return text.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
};

const formatCountdown = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

const getStatusClass = (status: ContainerStatus) => {
  switch (status) {
    case ContainerStatus.RUNNING:
      return 'status-running';
    case ContainerStatus.CREATING:
      return 'status-creating';
    default:
      return 'status-stopped';
  }
};

const getStatusText = (status: ContainerStatus) => {
  switch (status) {
    case ContainerStatus.RUNNING:
      return '题目环境已启动';
    case ContainerStatus.CREATING:
      return '题目环境启动中';
    case ContainerStatus.CLOSING:
      return '题目环境关闭中';
    case ContainerStatus.CLOSED:
      return '题目环境已关闭';
    default:
      return '题目环境状态未知';
  }
};

const getServiceType = (access: string) => {
  // 从访问地址推断服务类型
  return 'app.service';
};

const getProtocol = (access: string) => {
  if (access.startsWith('http://')) return 'http';
  if (access.startsWith('https://')) return 'https';
  return 'tcp';
};

const getContainerTypeColor = (type?: string) => {
  switch (type) {
    case 'web':
      return 'primary';
    case 'pwn':
      return 'danger';
    case 'crypto':
      return 'success';
    case 'misc':
      return 'warning';
    default:
      return 'info';
  }
};

const getContainerTypeName = (type?: string) => {
  switch (type) {
    case 'web':
      return 'Web应用';
    case 'pwn':
      return '二进制';
    case 'crypto':
      return '密码学';
    case 'misc':
      return '杂项';
    default:
      return '通用环境';
  }
};

const getTagType = (tag: string) => {
  const tagTypes: Record<string, string> = {
    'flask': 'primary',
    'rce': 'danger',
    'python': 'success',
    'sql': 'warning',
    'xss': 'danger',
    'web': 'primary'
  };
  return tagTypes[tag.toLowerCase()] || 'info';
};

// 获取拓扑图URL
const getTopologyImageUrl = () => {
  return `http://81.70.202.254:5005/api/deploy/topology_image/question/${questionId.value}`;
};

onMounted(() => {
  fetchQuestionDetail();
});

onBeforeUnmount(() => {
  stopCountdown();
  stopContainerStatusCheck();
});
</script>

<style scoped>
.question-detail {
  min-height: 100vh;
  position: relative;
  overflow: hidden;
}

.main-content {
  position: relative;
  z-index: 1;
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
}

.loading-container,
.not-found {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  backdrop-filter: blur(10px);
}

.question-container {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 30px;
  margin-bottom: 30px;
  align-items: stretch;
}

.question-right {
  display: flex;
  flex-direction: column;
  gap: 20px;
  height: 100%;
}

.environment-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.records-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  flex: 1;
  display: flex;
  flex-direction: column;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: 600;
  color: #2c3e50;
}

/* 左侧题目信息 */
.question-left {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.question-info-card {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.question-info {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  padding: 30px;
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.question-header {
  margin-bottom: 30px;
}

.question-header h1 {
  margin: 0 0 15px 0;
  color: #2c3e50;
  font-size: 32px;
  font-weight: 700;
}

.difficulty-wrapper {
  display: flex;
  align-items: center;
}

.question-description {
  margin-bottom: 30px;
  padding: 25px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 8px;
  border-left: 4px solid #007bff;
}

.description-content {
  font-size: 16px;
  line-height: 1.8;
  color: #495057;
}

/* 拓扑图区域样式 */
.topology-section {
  margin-bottom: 30px;
  padding: 25px;
  background: linear-gradient(135deg, #e8f4f8 0%, #f0f8ff 100%);
  border-radius: 8px;
  border-left: 4px solid #17a2b8;
}

.topology-section h3 {
  color: #2c3e50;
  font-size: 18px;
  margin-bottom: 15px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 10px;
}

.topology-link-container {
  text-align: center;
  margin: 20px 0;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 12px;
  border: 2px dashed #e9ecef;
}

.link-description {
  color: #6c757d;
  margin-bottom: 15px;
  font-size: 0.95rem;
}

.topology-link {
  display: inline-block;
  padding: 12px 24px;
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(40, 167, 69, 0.2);
}

.topology-link:hover {
  background: linear-gradient(135deg, #20c997 0%, #17a2b8 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(40, 167, 69, 0.3);
  text-decoration: none;
  color: white;
}

.topology-link:active {
  transform: translateY(0);
}

.environment-section,
.submit-section {
  margin-bottom: 30px;
}

.submit-section {
  margin-bottom: 30px;
  padding: 25px;
  background: linear-gradient(135deg, #e8f5e8 0%, #f0f8f0 100%);
  border-radius: 8px;
  border-left: 4px solid #28a745;
}

.submit-section h3 {
  color: #2c3e50;
  font-size: 18px;
  margin-bottom: 15px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 10px;
}

.try-limit-tag {
  margin-left: auto;
}

.submit-form {
  margin-top: 15px;
}

.flag-input {
  margin-bottom: 15px;
}

.submit-btn {
  width: 100%;
  height: 44px;
  font-size: 16px;
  font-weight: 600;
}

.submit-hint {
  margin-top: 15px;
}



.environment-status {
  margin-bottom: 20px;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #dee2e6;
}

.status-icon {
  font-size: 20px;
  flex-shrink: 0;
}

.status-icon.inactive {
  color: #6c757d;
}

.status-icon.status-running {
  color: #28a745;
}

.status-icon.status-creating {
  color: #ffc107;
}

.status-icon.status-stopped {
  color: #6c757d;
}

.status-info {
  flex: 1;
}

.status-text {
  font-weight: 500;
  color: #495057;
  display: block;
  margin-bottom: 4px;
}

.status-desc {
  font-size: 14px;
  color: #6c757d;
}

.access-section {
  margin-bottom: 20px;
}

.access-section h4 {
  margin: 0 0 12px 0;
  color: #2c3e50;
  font-size: 16px;
  font-weight: 600;
}

.access-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.access-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.access-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: rgba(64, 158, 255, 0.1);
  border: 1px solid rgba(64, 158, 255, 0.3);
  border-radius: 6px;
  text-decoration: none;
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
  transition: all 0.2s ease;
  word-break: break-all;
  align-self: flex-start;
}

.access-link:hover {
  background: rgba(64, 158, 255, 0.2);
  border-color: rgba(64, 158, 255, 0.5);
  transform: translateY(-1px);
}

.access-desc {
  font-size: 12px;
  color: #6c757d;
  padding-left: 12px;
}

.service-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-left: auto;
  min-width: 0;
  flex: 1;
}

.service-tags {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.access-urls {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.access-urls h4 {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #495057;
  font-weight: 600;
}

.url-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.url-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.access-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: rgba(64, 158, 255, 0.1);
  border: 1px solid rgba(64, 158, 255, 0.3);
  border-radius: 6px;
  text-decoration: none;
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
  transition: all 0.2s ease;
  word-break: break-all;
}

.access-link:hover {
  background: rgba(64, 158, 255, 0.2);
  border-color: rgba(64, 158, 255, 0.5);
  transform: translateY(-1px);
}

.url-description {
  font-size: 12px;
  color: #6c757d;
  padding-left: 12px;
}

.action-section {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.action-button {
  height: 50px;
  font-size: 18px;
  font-weight: 600;
  border-radius: 8px;
}

.button-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.secondary-actions {
  display: flex;
  gap: 10px;
}

.submit-form {
  margin-top: 15px;
}

.submit-form .el-input {
  font-size: 16px;
}

/* 右侧边栏 */
.question-sidebar {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.countdown-card,
.stats-card,
.tags-card,
.info-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  padding: 20px;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.countdown-card {
  text-align: center;
  background: linear-gradient(135deg, #ff6b6b 0%, #ffd93d 100%);
  color: white;
}

.countdown-time {
  font-size: 28px;
  font-weight: bold;
  font-family: 'Monaco', 'Consolas', monospace;
}

.countdown-label {
  font-size: 14px;
  opacity: 0.9;
  margin-top: 5px;
}

.solve-count {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 10px;
}

.try-count,
.solve-rate {
  color: #6c757d;
  font-size: 14px;
  margin-bottom: 5px;
}

.tags-card h4,
.info-card h4 {
  margin: 0 0 15px 0;
  color: #2c3e50;
  font-size: 16px;
  font-weight: 600;
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.question-tag {
  border-radius: 20px;
  font-weight: 500;
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-label {
  color: #6c757d;
  font-size: 14px;
}

.info-value {
  color: #2c3e50;
  font-size: 14px;
  font-weight: 500;
}

/* 提交记录 */
.records-section {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.records-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
}

.score-text {
  font-weight: 600;
  color: #409eff;
}

/* 题目标签样式 */
.meta-info {
  display: flex;
  align-items: center;
  gap: 15px;
  flex-wrap: wrap;
}

.tag-item {
  margin-right: 8px;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .question-container {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .question-sidebar {
    order: -1;
  }
}

@media (max-width: 768px) {
  .main-content {
    padding: 10px;
  }

  .question-info {
    padding: 20px;
  }

  .question-header h1 {
    font-size: 24px;
  }

  .action-button {
    height: 44px;
    font-size: 16px;
  }

  .secondary-actions {
    flex-direction: column;
  }

  .topology-link {
    padding: 14px 20px;
    font-size: 0.95rem;
  }
}
</style> 
