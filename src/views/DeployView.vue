<template>
  <div class="deploy-container">
    <!-- 固定进度条 -->
    <div class="progress-header">
      <div class="progress-container">
        <div class="progress-bar">
          <div class="progress-step" :class="{ active: currentStep >= 1, completed: currentStep > 1 }">
            <div class="step-number">1</div>
            <div class="step-label">题目配置</div>
          </div>
          <div class="progress-line" :class="{ completed: currentStep > 1 }"></div>
          <div class="progress-step" :class="{ active: currentStep >= 2, completed: currentStep > 2 }">
            <div class="step-number">2</div>
            <div class="step-label">需求输入</div>
          </div>
          <div class="progress-line" :class="{ completed: currentStep > 2 }"></div>
          <div class="progress-step" :class="{ active: currentStep >= 3 }">
            <div class="step-number">3</div>
            <div class="step-label">网络拓扑</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <!-- 第一步：题目配置 -->
      <div v-if="currentStep === 1" class="step-content">
        <div class="form-card">
          <div class="form-header">
            <h2>📝 题目配置</h2>
            <p>设置CTF题目的基本信息和参数</p>
          </div>
          
          <div class="form-body">
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">题目标题 *</label>
                <input 
                  v-model="formData.title" 
                  type="text" 
                  class="form-input" 
                  placeholder="请输入题目标题"
                  maxlength="100"
                />
              </div>
              <div class="form-group">
                <label class="form-label">难度等级 *</label>
                <div class="difficulty-selector">
                  <div 
                    v-for="star in 5" 
                    :key="star"
                    class="star"
                    :class="{ active: star <= formData.difficulty }"
                    @click="formData.difficulty = star"
                  >
                    ★
                  </div>
                  <span class="difficulty-text">{{ getDifficultyText(formData.difficulty) }}</span>
                </div>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group full-width">
                <label class="form-label">题目简介 *</label>
                <textarea 
                  v-model="formData.description" 
                  class="form-textarea" 
                  placeholder="请简要描述题目内容和解题思路"
                  rows="4"
                  maxlength="500"
                ></textarea>
                <div class="char-count">{{ formData.description.length }}/500</div>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">是否启用 *</label>
                <div class="toggle-group">
                  <label class="toggle-option">
                    <input v-model="formData.enabled" type="radio" :value="true" />
                    <span class="toggle-button" :class="{ active: formData.enabled === true }">是</span>
                  </label>
                  <label class="toggle-option">
                    <input v-model="formData.enabled" type="radio" :value="false" />
                    <span class="toggle-button" :class="{ active: formData.enabled === false }">否</span>
                  </label>
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">最大尝试次数</label>
                <input 
                  v-model.number="formData.maxAttempts" 
                  type="number" 
                  class="form-input" 
                  min="1" 
                  max="100"
                />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Flag模板</label>
                <input 
                  v-model="formData.flagTemplate" 
                  type="text" 
                  class="form-input" 
                  placeholder="flag{...}"
                  readonly
                />
                <div class="form-hint">系统将自动生成随机Flag</div>
              </div>
              <div class="form-group">
                <label class="form-label">有效时间（秒）</label>
                <input 
                  v-model.number="formData.validTime" 
                  type="number" 
                  class="form-input" 
                  min="60" 
                  max="86400"
                />
                <div class="form-hint">{{ formatTime(formData.validTime) }}</div>
              </div>
            </div>
          </div>
          
          <!-- 导航按钮 -->
          <div class="card-footer">
            <button 
              v-if="currentStep > 1" 
              class="nav-btn prev-btn" 
              @click="prevStep"
            >
              ← 上一步
            </button>
            <button 
              v-if="currentStep < 3" 
              class="nav-btn next-btn" 
              @click="nextStep"
              :disabled="!canProceed"
            >
              下一步 →
            </button>
          </div>
        </div>
      </div>

      <!-- 第二步：需求输入 -->
      <div v-if="currentStep === 2" class="step-content">
        <div class="form-card">
          <div class="form-header">
            <h2>💡 需求输入</h2>
            <p>详细描述您的题目需求，AI将根据您的描述生成相应的CTF题目</p>
          </div>
          
          <div class="form-body">
            <div class="form-group full-width">
              <label class="form-label">题目需求描述 *</label>
              <textarea 
                v-model="formData.requirements" 
                class="form-textarea large" 
                placeholder="请详细描述您想要的CTF题目类型、知识点、解题方式等需求&#10;&#10;例如：Web安全题目，考察SQL注入，难度适中..."
                rows="8"
              ></textarea>
              <div class="char-count">{{ formData.requirements.length }} 字符</div>
            </div>
            
            <div class="requirements-tips">
              <h4>💡 写作建议：</h4>
              <ul>
                <li>明确指出题目类型（Web、Pwn、Crypto、Misc等）</li>
                <li>描述想要考察的具体知识点或技能</li>
                <li>说明题目的应用场景或背景故事</li>
                <li>提及特殊要求或限制条件</li>
                <li>如有参考题目，可以简要说明</li>
              </ul>
            </div>
          </div>
          
          <!-- 导航按钮 -->
          <div class="card-footer">
            <button 
              v-if="currentStep > 1" 
              class="nav-btn prev-btn" 
              @click="prevStep"
            >
              ← 上一步
            </button>
            <button 
              v-if="currentStep < 3" 
              class="nav-btn next-btn" 
              @click="nextStep"
              :disabled="!canProceed"
            >
              下一步 →
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 第三步：网络拓扑配置 -->
    <div v-if="currentStep === 3" class="step-content">
      <div class="form-card">
        <div class="form-header">
          <h3>🌐 网络拓扑配置</h3>
          <p>配置您的CTF题目网络环境</p>
        </div>
        
        <div class="topology-container">
          <!-- 网络区域列表 -->
          <div class="network-zones">
            <!-- 内网区域 -->
            <div class="zone-row">
              <div class="zone-label">内网:</div>
              <div class="topology-nodes">
                <TopologyNode 
                  v-for="node in topology.internal" 
                  :key="node.id"
                  :node="node"
                  :zone="'internal'"
                  @add-branch="addBranch"
                  @configure="configureNode"
                />
                <AddNodeButton 
                  v-if="topology.internal.length === 0"
                  zone="internal"
                  @add="addInitialNode"
                />
              </div>
            </div>
            
            <!-- DMZ区域 -->
            <div class="zone-row">
              <div class="zone-label">DMZ:</div>
              <div class="topology-nodes">
                <TopologyNode 
                  v-for="node in topology.dmz" 
                  :key="node.id"
                  :node="node"
                  :zone="'dmz'"
                  @add-branch="addBranch"
                  @configure="configureNode"
                />
                <AddNodeButton 
                  v-if="topology.dmz.length === 0"
                  zone="dmz"
                  @add="addInitialNode"
                />
              </div>
            </div>
            
            <!-- 攻击区域 -->
            <div class="zone-row">
              <div class="zone-label">攻击区:</div>
              <div class="topology-nodes">
                <TopologyNode 
                  v-for="node in topology.attack" 
                  :key="node.id"
                  :node="node"
                  :zone="'attack'"
                  @add-branch="addBranch"
                  @configure="configureNode"
                />
                <AddNodeButton 
                  v-if="topology.attack.length === 0"
                  zone="attack"
                  @add="addInitialNode"
                />
              </div>
            </div>
          </div>
        </div>
        
        <!-- 导航按钮 -->
        <div class="card-footer">
          <button 
            v-if="currentStep > 1" 
            class="nav-btn prev-btn" 
            @click="prevStep"
          >
            ← 上一步
          </button>
          <button 
            class="nav-btn submit-btn" 
            @click="submitForm"
            :disabled="!canSubmit"
          >
            生成题目 🚀
          </button>
        </div>
      </div>
    </div>

    <!-- 子网配置弹窗 -->
    <SubnetConfigDialog 
      v-model="showSubnetDialog"
      @confirm="handleSubnetConfig"
    />
    
    <!-- 节点配置弹窗 -->
    <NodeConfigDialog 
      v-model="showNodeDialog"
      :node="currentConfigNode"
      @confirm="handleNodeConfig"
    />

  </div>
</template>

<script setup>
import { ref, computed, defineComponent } from 'vue'
import { ElMessage } from 'element-plus'

// 拓扑节点组件
const TopologyNode = defineComponent({
  name: 'TopologyNode',
  props: {
    node: Object,
    zone: String
  },
  emits: ['add-branch', 'configure'],
  template: `
    <div class="topology-node-container">
      <div 
        class="topology-node"
        :class="[
          'zone-' + zone,
          node.type,
          { configured: node.configured }
        ]"
        @click="handleNodeClick"
      >
        <div v-if="node.type === 'add'" class="add-icon">+</div>
        <div v-else-if="node.type === 'subnet'" class="node-text">配置子网网段</div>
        <div v-else-if="node.type === 'subnet-configured'" class="node-text">{{ node.subnet }}</div>
        <div v-else-if="node.type === 'config'" class="node-text">具体配置</div>
        <div v-else-if="node.type === 'configured'" class="configured-node">
          <div class="node-type">{{ node.nodeType }}</div>
          <div class="node-system">{{ node.system }}</div>
          <div class="node-ip">{{ node.ip }}</div>
        </div>
      </div>
      
      <div class="node-connections" v-if="node.children && node.children.length > 0">
        <div class="connection-line"></div>
        <div class="child-nodes">
          <TopologyNode 
            v-for="child in node.children"
            :key="child.id"
            :node="child"
            :zone="zone"
            @add-branch="$emit('add-branch', $event)"
            @configure="$emit('configure', $event)"
          />
        </div>
      </div>
    </div>
  `,
  methods: {
    handleNodeClick() {
      if (this.node.type === 'add') {
        this.$emit('add-branch', this.node)
      } else if (this.node.type === 'subnet' || this.node.type === 'config') {
        this.$emit('configure', this.node)
      }
    }
  }
})

// 添加节点按钮组件  
const AddNodeButton = defineComponent({
  props: {
    zone: String
  },
  emits: ['add'],
  template: `
    <div 
      class="topology-node add-node-btn"
      :class="'zone-' + zone"
      @click="$emit('add', zone)"
    >
      <div class="add-icon">+</div>
    </div>
  `
})

// 子网配置对话框组件
const SubnetConfigDialog = defineComponent({
  props: {
    modelValue: Boolean
  },
  emits: ['update:modelValue', 'confirm'],
  setup(props, { emit }) {
    const subnet = ref('')
    
    const handleConfirm = () => {
      if (subnet.value.trim()) {
        emit('confirm', { subnet: subnet.value })
        subnet.value = ''
        emit('update:modelValue', false)
      }
    }
    
    const handleCancel = () => {
      subnet.value = ''
      emit('update:modelValue', false)
    }
    
    return { subnet, handleConfirm, handleCancel }
  },
  template: `
    <div v-if="modelValue" class="dialog-overlay" @click.self="handleCancel">
      <div class="dialog-content">
        <h3>配置子网网段</h3>
        <div class="form-group">
          <input 
            v-model="subnet"
            type="text" 
            class="form-input"
            placeholder="xxx.xxx.xxx.xxx"
            @keyup.enter="handleConfirm"
          />
        </div>
        <div class="dialog-buttons">
          <button class="btn btn-secondary" @click="handleCancel">取消</button>
          <button class="btn btn-primary" @click="handleConfirm">确定</button>
        </div>
      </div>
    </div>
  `
})

// 节点配置对话框组件
const NodeConfigDialog = defineComponent({
  props: {
    modelValue: Boolean,
    node: Object
  },
  emits: ['update:modelValue', 'confirm'],
  setup(props, { emit }) {
    const nodeType = ref('Web服务器')
    const system = ref('apache+php')
    const ip = ref('')
    const image = ref('apache:php')
    
    const nodeTypeOptions = [
      'Web服务器',
      '数据库服务器', 
      '应用服务器',
      '文件服务器',
      '代理服务器'
    ]
    
    const systemOptions = {
      'Web服务器': ['apache+php', 'nginx+php', 'tomcat+java', 'iis+asp'],
      '数据库服务器': ['mysql', 'postgresql', 'mongodb', 'redis'],
      '应用服务器': ['nodejs', 'python+django', 'java+spring', 'dotnet'],
      '文件服务器': ['ftp', 'sftp', 'samba', 'nfs'],
      '代理服务器': ['nginx', 'apache', 'haproxy', 'envoy']
    }
    
    const handleConfirm = () => {
      if (nodeType.value && system.value && ip.value) {
        emit('confirm', {
          nodeType: nodeType.value,
          system: system.value,
          ip: ip.value,
          image: image.value
        })
        resetForm()
        emit('update:modelValue', false)
      }
    }
    
    const handleCancel = () => {
      resetForm()
      emit('update:modelValue', false)
    }
    
    const resetForm = () => {
      nodeType.value = 'Web服务器'
      system.value = 'apache+php'
      ip.value = ''
      image.value = 'apache:php'
    }
    
    return { 
      nodeType, 
      system, 
      ip, 
      image, 
      nodeTypeOptions, 
      systemOptions, 
      handleConfirm, 
      handleCancel 
    }
  },
  template: `
    <div v-if="modelValue" class="dialog-overlay" @click.self="handleCancel">
      <div class="dialog-content config-dialog">
        <h3>节点配置</h3>
        <div class="form-group">
          <label>类型:</label>
          <select v-model="nodeType" class="form-select">
            <option v-for="type in nodeTypeOptions" :key="type" :value="type">
              {{ type }}
            </option>
          </select>
        </div>
        <div class="form-group">
          <label>系统:</label>
          <select v-model="system" class="form-select">
            <option v-for="sys in systemOptions[nodeType]" :key="sys" :value="sys">
              {{ sys }}
            </option>
          </select>
        </div>
        <div class="form-group">
          <label>地址:</label>
          <input 
            v-model="ip"
            type="text" 
            class="form-input"
            placeholder="xxx.xxx.xxx.xxx"
          />
        </div>
        <div class="form-group">
          <label>镜像:</label>
          <select v-model="image" class="form-select">
            <option value="apache:php">apache:php</option>
            <option value="nginx:php">nginx:php</option>
            <option value="mysql:latest">mysql:latest</option>
            <option value="nodejs:alpine">nodejs:alpine</option>
          </select>
        </div>
        <div class="dialog-buttons">
          <button class="btn btn-secondary" @click="handleCancel">取消</button>
          <button class="btn btn-primary" @click="handleConfirm">确定</button>
        </div>
      </div>
    </div>
  `
})

// 当前步骤
const currentStep = ref(1)

// 表单数据
const formData = ref({
  title: '',
  description: '',
  enabled: true,
  flagTemplate: 'flag{...}',
  validTime: 3600,
  difficulty: 3,
  maxAttempts: 20,
  requirements: ''
})

// 拓扑数据
const topology = ref({
  internal: [],  // 内网节点
  dmz: [],       // DMZ节点
  attack: []     // 攻击区节点
})

// 对话框状态
const showSubnetDialog = ref(false)
const showNodeDialog = ref(false)
const currentConfigNode = ref(null)
const currentSubnetConfig = ref(null)

// 节点ID计数器
const nodeIdCounter = ref(0)

// 计算属性
const canProceed = computed(() => {
  if (currentStep.value === 1) {
    return formData.value.title.trim() !== '' && 
           formData.value.description.trim() !== '' &&
           formData.value.difficulty > 0
  }
  if (currentStep.value === 2) {
    return formData.value.requirements.trim() !== ''
  }
  return true
})

const canSubmit = computed(() => {
  if (currentStep.value === 3) {
    // 第三步需要至少有一个配置好的节点
    const allNodes = [...topology.value.internal, ...topology.value.dmz, ...topology.value.attack]
    return allNodes.some(node => node.configured)
  }
  return formData.value.requirements.trim() !== ''
})

// 方法
const nextStep = () => {
  if (canProceed.value && currentStep.value < 3) {
    currentStep.value++
    ElMessage.success(`进入第${currentStep.value}步`)
  }
}

const prevStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--
    ElMessage.info(`返回第${currentStep.value}步`)
  }
}

const submitForm = () => {
  if (canSubmit.value) {
    ElMessage.success('正在生成CTF题目，请稍候...')
    // 这里可以调用API提交表单数据
    console.log('提交的表单数据:', formData.value)
  }
}

const getDifficultyText = (difficulty) => {
  const difficultyMap = {
    1: '入门',
    2: '简单', 
    3: '中等',
    4: '困难',
    5: '极难'
  }
  return difficultyMap[difficulty] || '未设置'
}

const formatTime = (seconds) => {
  if (seconds < 60) {
    return `${seconds}秒`
  } else if (seconds < 3600) {
    return `${Math.floor(seconds / 60)}分钟`
  } else if (seconds < 86400) {
    return `${Math.floor(seconds / 3600)}小时`
  } else {
    return `${Math.floor(seconds / 86400)}天`
  }
}

// 拓扑相关方法
const addInitialNode = (zone) => {
  const nodeId = ++nodeIdCounter.value
  const newNode = {
    id: nodeId,
    zone,
    type: 'add',
    configured: false,
    children: []
  }
  topology.value[zone].push(newNode)
}

const addBranch = (parentNode) => {
  const nodeId = ++nodeIdCounter.value
  const newNode = {
    id: nodeId,
    zone: parentNode.zone,
    type: 'subnet',
    configured: false,
    children: [],
    parent: parentNode.id
  }
  parentNode.children.push(newNode)
  showSubnetDialog.value = true
  currentSubnetConfig.value = newNode
}

const configureNode = (node) => {
  if (node.type === 'subnet' || node.type === 'subnet-configured') {
    showSubnetDialog.value = true
    currentSubnetConfig.value = node
  } else if (node.type === 'config') {
    showNodeDialog.value = true
    currentConfigNode.value = node
  } else if (node.type === 'configured') {
    showNodeDialog.value = true
    currentConfigNode.value = node
  }
}

const handleSubnetConfig = (subnetData) => {
  if (currentSubnetConfig.value) {
    currentSubnetConfig.value.subnet = subnetData.subnet
    currentSubnetConfig.value.label = `配置子网网段`
    currentSubnetConfig.value.type = 'subnet-configured'
    
    // 添加具体配置节点
    const configNode = {
      id: ++nodeIdCounter.value,
      zone: currentSubnetConfig.value.zone,
      type: 'config',
      configured: false,
      children: [],
      parent: currentSubnetConfig.value.id,
      label: '具体配置'
    }
    currentSubnetConfig.value.children.push(configNode)
  }
  showSubnetDialog.value = false
  currentSubnetConfig.value = null
}

const handleNodeConfig = (nodeData) => {
  if (currentConfigNode.value) {
    Object.assign(currentConfigNode.value, nodeData)
    currentConfigNode.value.configured = true
    currentConfigNode.value.type = 'configured'
    currentConfigNode.value.label = `${nodeData.nodeType}\n${nodeData.system}\n${nodeData.ip}`
  }
  showNodeDialog.value = false
  currentConfigNode.value = null
}
</script>

<style scoped>
/* 主容器 */
.deploy-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
}

/* 进度条区域 */
.progress-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: white;
  border-bottom: 1px solid #e9ecef;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.progress-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 12px 24px;
}

.progress-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0;
}

.progress-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 2;
}

.step-number {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #e9ecef;
  color: #6c757d;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  border: 2px solid #e9ecef;
}

.progress-step.active .step-number {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.15);
}

.progress-step.completed .step-number {
  background: #10b981;
  color: white;
  border-color: #10b981;
}

.step-label {
  margin-top: 6px;
  font-size: 0.8rem;
  font-weight: 500;
  color: #6c757d;
  transition: all 0.3s ease;
}

.progress-step.active .step-label {
  color: #3b82f6;
  font-weight: 600;
}

.progress-step.completed .step-label {
  color: #10b981;
  font-weight: 600;
}

.progress-line {
  width: 100px;
  height: 2px;
  background: #e9ecef;
  position: relative;
  top: -16px;
  z-index: 1;
  transition: all 0.3s ease;
}

.progress-line.completed {
  background: #10b981;
}

/* 主要内容区域 */
.main-content {
  max-width: 900px;
  margin: 0 auto;
  padding: 12px 24px 32px;
  width: 100%;
  box-sizing: border-box;
  overflow-y: auto;
  min-height: 0;
}

.step-content {
  animation: fadeInUp 0.4s ease-out;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 表单卡片 */
.form-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  border: 1px solid #e9ecef;
  display: flex;
  flex-direction: column;
  height: fit-content;
}

.form-header {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  padding: 12px 20px;
  text-align: center;
  flex-shrink: 0;
}

.form-header h2 {
  font-size: 1.3rem;
  font-weight: 700;
  margin: 0 0 4px 0;
  letter-spacing: -0.025em;
}

.form-header p {
  font-size: 0.85rem;
  margin: 0;
  opacity: 0.9;
  font-weight: 400;
}

.form-body {
  padding: 12px 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  min-height: 0;
}

/* 表单布局 */
.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 12px;
}

.form-row:last-child {
  margin-bottom: 0;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 6px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.form-input,
.form-textarea {
  padding: 8px 12px;
  border: 2px solid #e5e7eb;
  border-radius: 6px;
  font-size: 0.85rem;
  transition: all 0.2s ease;
  background: #fafbfc;
  font-family: inherit;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #3b82f6;
  background: white;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 60px;
  line-height: 1.4;
}

.form-textarea.large {
  min-height: 100px;
}

.form-input:read-only {
  background: #f8f9fa;
  color: #6c757d;
  cursor: not-allowed;
}

.char-count {
  font-size: 0.85rem;
  color: #6c757d;
  text-align: right;
  margin-top: 6px;
}

.form-hint {
  font-size: 0.85rem;
  color: #6c757d;
  margin-top: 6px;
  font-style: italic;
}

/* 难度选择器 */
.difficulty-selector {
  display: flex;
  align-items: center;
  gap: 8px;
}

.star {
  font-size: 1.8rem;
  color: #d1d5db;
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
}

.star:hover,
.star.active {
  color: #fbbf24;
  transform: scale(1.1);
}

.difficulty-text {
  margin-left: 12px;
  font-size: 0.9rem;
  font-weight: 500;
  color: #3b82f6;
  padding: 4px 12px;
  background: rgba(59, 130, 246, 0.1);
  border-radius: 20px;
}

/* 切换按钮组 */
.toggle-group {
  display: flex;
  gap: 0;
  border-radius: 8px;
  overflow: hidden;
  border: 2px solid #e5e7eb;
  background: #f8f9fa;
}

.toggle-option {
  flex: 1;
  position: relative;
  cursor: pointer;
}

.toggle-option input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.toggle-button {
  display: block;
  padding: 12px 20px;
  text-align: center;
  font-weight: 500;
  color: #6c757d;
  background: transparent;
  transition: all 0.2s ease;
  border-right: 1px solid #e5e7eb;
}

.toggle-option:last-child .toggle-button {
  border-right: none;
}

.toggle-button.active {
  background: #3b82f6;
  color: white;
  font-weight: 600;
}

/* 需求输入提示 */
.requirements-tips {
  margin-top: 12px;
  padding: 12px;
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  border-radius: 8px;
  border: 1px solid #bfdbfe;
}

.requirements-tips h4 {
  color: #1e40af;
  font-size: 0.85rem;
  font-weight: 600;
  margin: 0 0 8px 0;
}

.requirements-tips ul {
  margin: 0;
  padding-left: 16px;
  color: #374151;
  line-height: 1.4;
}

.requirements-tips li {
  margin-bottom: 2px;
  font-size: 0.8rem;
}

/* 卡片底部按钮区域 */
.card-footer {
  border-top: 1px solid #f0f0f0;
  padding: 20px 24px;
  background: #fafafa;
  border-radius: 0 0 12px 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 24px;
}

.nav-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 100px;
  justify-content: center;
}

.prev-btn {
  background: #f8f9fa;
  color: #6c757d;
  border: 2px solid #e9ecef;
}

.prev-btn:hover {
  background: #e9ecef;
  color: #495057;
  transform: translateY(-1px);
}

.next-btn {
  background: #3b82f6;
  color: white;
  border: 2px solid #3b82f6;
}

.next-btn:hover:not(:disabled) {
  background: #1d4ed8;
  border-color: #1d4ed8;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.submit-btn {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border: 2px solid #10b981;
}

.submit-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.nav-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
  box-shadow: none !important;
}

/* 让按钮右对齐当只有一个按钮时 */
.card-footer:has(.next-btn:only-child),
.card-footer:has(.submit-btn:only-child) {
  justify-content: flex-end;
}

/* 网络拓扑样式 */
.topology-container {
  padding: 24px 0;
}

.network-zones {
  display: flex;
  flex-direction: column;
  gap: 40px;
}

.zone-row {
  display: flex;
  align-items: flex-start;
  gap: 20px;
  min-height: 80px;
}

.zone-label {
  font-weight: 600;
  font-size: 1.1rem;
  color: #374151;
  width: 80px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
}

.topology-nodes {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
  flex: 1;
}

/* 拓扑节点 */
.topology-node {
  min-width: 120px;
  min-height: 60px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  padding: 12px 16px;
  text-align: center;
  font-size: 0.9rem;
  line-height: 1.3;
}

/* 区域颜色 */
.topology-node.zone-internal {
  background: #dcfce7;
  color: #166534;
  border-color: #bbf7d0;
}

.topology-node.zone-dmz {
  background: #dbeafe;
  color: #1e40af;
  border-color: #bfdbfe;
}

.topology-node.zone-attack {
  background: #fed7ca;
  color: #c2410c;
  border-color: #fdba74;
}

/* 节点类型 */
.topology-node.add {
  border-style: dashed;
  font-size: 24px;
  font-weight: bold;
}

.topology-node.add:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.topology-node.subnet,
.topology-node.config {
  border-style: solid;
}

.topology-node.subnet:hover,
.topology-node.config:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.topology-node.configured {
  background: #f3f4f6;
  color: #374151;
  border-color: #d1d5db;
}

/* 已配置节点内容 */
.configured-node {
  display: flex;
  flex-direction: column;
  gap: 4px;
  text-align: center;
}

.node-type {
  font-weight: 600;
  font-size: 0.85rem;
}

.node-system {
  font-size: 0.8rem;
  opacity: 0.8;
}

.node-ip {
  font-size: 0.75rem;
  font-family: monospace;
  background: rgba(0, 0, 0, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
}

/* 节点连接线 */
.topology-node-container {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.node-connections {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 20px;
}

.connection-line {
  width: 2px;
  height: 30px;
  background: #d1d5db;
  margin-bottom: 10px;
}

.child-nodes {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  justify-content: center;
  align-items: flex-start;
}

/* 对话框样式 */
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.dialog-content {
  background: white;
  border-radius: 12px;
  padding: 24px;
  min-width: 400px;
  max-width: 500px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.dialog-content h3 {
  margin: 0 0 20px 0;
  font-size: 1.2rem;
  font-weight: 600;
  color: #374151;
  text-align: center;
}

.dialog-content .form-group {
  margin-bottom: 16px;
}

.dialog-content .form-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
  color: #374151;
}

.dialog-content .form-input,
.dialog-content .form-select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.9rem;
  transition: border-color 0.2s;
}

.dialog-content .form-input:focus,
.dialog-content .form-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

.dialog-buttons {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
}

.btn-secondary:hover {
  background: #e5e7eb;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover {
  background: #2563eb;
}

.config-dialog {
  min-width: 450px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .zone-row {
    flex-direction: column;
    gap: 16px;
  }
  
  .zone-label {
    width: auto;
  }
  
  .topology-nodes {
    justify-content: center;
  }
  
  .dialog-content {
    min-width: 300px;
    margin: 20px;
  }
}
</style>