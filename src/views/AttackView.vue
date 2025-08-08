<template>
  <div class="attack-page">
    <!-- 背景特效 -->
    <CircuitBoardCanvas />
    
    <div class="attack-container">
      <!-- 页面标题 -->
      <div class="page-header">
        <TypewriterText 
          text="▶ 自动渗透测试平台"
          :speed="80" 
          tag="h1" 
          class="page-title" 
        />
        <p class="page-subtitle">基于AI的智能渗透测试系统</p>
      </div>

      <div class="attack-content">
        <!-- 左侧配置面板 -->
        <div class="config-panel">
          <div class="panel-card">
            <div class="panel-header">
              <h2>攻击配置</h2>
              <p>配置目标服务器信息</p>
            </div>
            
            <div class="panel-body">
              <el-form ref="formRef" :model="attackForm" :rules="formRules" label-width="80px">
                <el-form-item label="目标IP" prop="ip">
                  <el-input 
                    v-model="attackForm.ip" 
                    placeholder="例: 192.168.1.100"
                    :disabled="isAttacking"
                  />
                </el-form-item>
                
                <el-form-item label="端口" prop="port">
                  <el-input-number 
                    v-model="attackForm.port" 
                    :min="1" 
                    :max="65535"
                    :disabled="isAttacking"
                    style="width: 100%"
                  />
                </el-form-item>
                
                <el-form-item label="用户名" prop="username">
                  <el-input 
                    v-model="attackForm.username" 
                    placeholder="SSH用户名"
                    :disabled="isAttacking"
                  />
                </el-form-item>
                
                <el-form-item label="密码" prop="password">
                  <el-input 
                    v-model="attackForm.password" 
                    type="password"
                    show-password
                    placeholder="SSH密码"
                    :disabled="isAttacking"
                  />
                </el-form-item>
                
                <el-form-item label="测试模式">
                  <el-radio-group v-model="attackForm.is_white" :disabled="isAttacking">
                    <el-radio :label="false">黑盒测试</el-radio>
                    <el-radio :label="true">白盒测试</el-radio>
                  </el-radio-group>
                </el-form-item>
                
                
              </el-form>
              
              <!-- 操作按钮 -->
              <div class="action-buttons">
                <el-button 
                  type="primary" 
                  size="large"
                  :loading="isStarting"
                  :disabled="isAttacking"
                  @click="handleStartAttack"
                  class="start-btn"
                >
                  <el-icon><VideoPlay /></el-icon>
                  启动攻击
                </el-button>
                
                <el-button 
                  type="danger" 
                  size="large"
                  :disabled="!isAttacking"
                  @click="handleStopAttack"
                  class="stop-btn"
                >
                  <el-icon><VideoPause /></el-icon>
                  停止攻击
                </el-button>
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧日志面板 -->
        <div class="logs-panel">
          <div class="panel-card">
            <div class="panel-header">
              <h2>攻击日志</h2>
              <div class="status-indicator">
                <span :class="['status-dot', attackStatus]"></span>
                <span class="status-text">{{ statusText }}</span>
              </div>
            </div>
            
            <div class="panel-body">
              <!-- 攻击信息 -->
              <div v-if="currentAttackId" class="attack-info">
                <p><strong>攻击ID:</strong> {{ currentAttackId }}</p>
                <p><strong>开始时间:</strong> {{ attackStartTime }}</p>
                <p v-if="foundFlag"><strong>发现Flag:</strong> <span class="flag-text">{{ foundFlag }}</span></p>
              </div>
              
              <!-- 日志显示区域 -->
              <div class="logs-container" ref="logsContainer">
                <div v-if="logs.length === 0" class="empty-logs">
                  <el-icon><Document /></el-icon>
                  <p>暂无日志信息</p>
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
              <div v-if="isAttacking" class="attack-stats">
                <div class="stat-item">
                  <span class="stat-label">运行时长:</span>
                  <span class="stat-value">{{ formatDuration(attackDuration) }}</span>
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

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted, nextTick } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { VideoPlay, VideoPause, Document } from '@element-plus/icons-vue';
import { startAttack, getAttackLogs, stopAttack, type StartAttackReq } from '@/api/attacker';
import CircuitBoardCanvas from '@/components/effects/CircuitBoardCanvas.vue';
import TypewriterText from '@/components/effects/TypewriterText.vue';

// 响应式数据
const formRef = ref();
const logsContainer = ref<HTMLElement>();
const isStarting = ref(false);
const isAttacking = ref(false);
const currentAttackId = ref('');
const logs = ref<string[]>([]);
const foundFlag = ref('');
const attackStartTime = ref('');
const attackDuration = ref(0);
let logPollingTimer: NodeJS.Timeout | null = null;
let durationTimer: NodeJS.Timeout | null = null;

// 表单数据
const attackForm = reactive<StartAttackReq>({
  ip: '127.0.0.1',
  port: 31403,
  username: 'root',
  password: 'root',
  is_white: false,
});

// 表单验证规则
const formRules = {
  ip: [
    { required: true, message: '请输入目标IP地址', trigger: 'blur' },
    { pattern: /^(\d{1,3}\.){3}\d{1,3}$/, message: '请输入有效的IP地址', trigger: 'blur' }
  ],
  port: [
    { required: true, message: '请输入端口号', trigger: 'blur' }
  ],
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' }
  ]
};

// 计算属性
const attackStatus = computed(() => {
  if (isAttacking.value) return 'running';
  if (foundFlag.value) return 'success';
  return 'idle';
});

const statusText = computed(() => {
  if (isAttacking.value) return '攻击进行中';
  if (foundFlag.value) return '攻击成功';
  return '就绪';
});

// 方法
const handleStartAttack = async () => {
  if (!formRef.value) return;
  
  try {
    await formRef.value.validate();
    
    isStarting.value = true;
    const response = await startAttack(attackForm);
    
    if (response.code === 200 && response.data) {
      currentAttackId.value = response.data.attack_id;
      isAttacking.value = true;
      attackStartTime.value = new Date().toLocaleString();
      logs.value = [response.data.message];
      foundFlag.value = '';
      attackDuration.value = 0;
      
      ElMessage.success('攻击服务启动成功');
      startLogPolling();
      startDurationTimer();
    }
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || '启动攻击失败');
  } finally {
    isStarting.value = false;
  }
};

const handleStopAttack = async () => {
  try {
    await ElMessageBox.confirm('确定要停止当前攻击吗？', '确认操作', {
      type: 'warning'
    });
    
    await stopAttack(currentAttackId.value);
    stopAttackProcess();
    ElMessage.success('攻击已停止');
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('停止攻击失败');
    }
  }
};

const startLogPolling = () => {
  if (logPollingTimer) return;
  
  logPollingTimer = setInterval(async () => {
    if (!currentAttackId.value || !isAttacking.value) return;
    
    try {
      const response = await getAttackLogs(currentAttackId.value);
      if (response.code === 200 && response.data) {
        logs.value = response.data.logs;
        
        if (response.data.flag) {
          foundFlag.value = response.data.flag;
          ElMessage.success('成功获取Flag！');
        }
        
        if (response.data.is_finished) {
          stopAttackProcess();
        }
        
        // 自动滚动到底部
        await nextTick();
        if (logsContainer.value) {
          logsContainer.value.scrollTop = logsContainer.value.scrollHeight;
        }
      }
    } catch (error) {
      console.error('获取日志失败:', error);
    }
  }, 2000); // 每2秒轮询一次
};

const stopAttackProcess = () => {
  isAttacking.value = false;
  if (logPollingTimer) {
    clearInterval(logPollingTimer);
    logPollingTimer = null;
  }
  if (durationTimer) {
    clearInterval(durationTimer);
    durationTimer = null;
  }
};

const startDurationTimer = () => {
  if (durationTimer) return;
  
  durationTimer = setInterval(() => {
    attackDuration.value += 1;
  }, 1000);
};

const getLogClass = (log: string) => {
  if (log.includes('成功') || log.includes('Flag')) return 'log-success';
  if (log.includes('失败') || log.includes('错误')) return 'log-error';
  if (log.includes('执行命令')) return 'log-command';
  return 'log-info';
};

const formatTime = (date: Date) => {
  return date.toLocaleTimeString();
};

const formatDuration = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

// 生命周期
onMounted(() => {
  // 组件挂载时的初始化逻辑
});

onUnmounted(() => {
  stopAttackProcess();
});
</script>

<style scoped>
.attack-page {
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.attack-container {
  position: relative;
  z-index: 10;
  padding: 20px;
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

.attack-content {
  display: grid;
  grid-template-columns: 400px 1fr;
  gap: 30px;
  align-items: start;
}

.panel-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.panel-header {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
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

.action-buttons {
  display: flex;
  gap: 15px;
  margin-top: 30px;
}

.start-btn, .stop-btn {
  flex: 1;
  height: 45px;
  font-weight: 600;
  border-radius: 8px;
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
  background: #fbbf24;
  animation: pulse 2s infinite;
}

.status-dot.success {
  background: #10b981;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.attack-info {
  background: #f8fafc;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  border-left: 4px solid #3b82f6;
}

.attack-info p {
  margin: 5px 0;
  font-size: 0.9rem;
}

.flag-text {
  color: #10b981;
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

.attack-stats {
  display: flex;
  gap: 20px;
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #e5e7eb;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.stat-label {
  font-size: 0.8rem;
  color: #6b7280;
  font-weight: 500;
}

.stat-value {
  font-size: 1.1rem;
  font-weight: 600;
  color: #374151;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .attack-content {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .config-panel {
    order: 2;
  }
  
  .logs-panel {
    order: 1;
  }
}

@media (max-width: 768px) {
  .attack-container {
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