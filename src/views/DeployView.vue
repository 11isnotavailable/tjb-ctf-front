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

    <!-- 第三步：确认生成 -->
    <div v-if="currentStep === 3" class="step-content">
      <div class="form-card">
        <div class="form-header">
          <h2>✅ 确认生成</h2>
          <p>请确认您的题目信息，点击生成按钮开始创建CTF题目</p>
        </div>
        
        <div class="form-body">
          <!-- 题目信息预览 -->
          <div class="preview-section">
            <h3>📋 题目信息</h3>
            <div class="preview-grid">
              <div class="preview-item">
                <label>题目标题:</label>
                <span>{{ formData.title }}</span>
              </div>
              <div class="preview-item">
                <label>难度等级:</label>
                <span class="difficulty-stars">
                  <span v-for="i in 5" :key="i" class="star" :class="{ active: i <= formData.difficulty }">★</span>
                  <span class="difficulty-text">{{ getDifficultyText(formData.difficulty) }}</span>
                </span>
              </div>
              <div class="preview-item">
                <label>是否启用:</label>
                <span :class="formData.enabled ? 'status-enabled' : 'status-disabled'">
                  {{ formData.enabled ? '是' : '否' }}
                </span>
              </div>
              <div class="preview-item">
                <label>Flag模板:</label>
                <span class="code-text">{{ formData.flagTemplate }}</span>
              </div>
              <div class="preview-item">
                <label>有效时间:</label>
                <span>{{ formData.validTime }}秒</span>
              </div>
              <div class="preview-item">
                <label>最大尝试次数:</label>
                <span>{{ formData.maxAttempts }}次</span>
              </div>
            </div>
            
            <div class="preview-item full-width">
              <label>题目简介:</label>
              <div class="description-preview">{{ formData.description }}</div>
            </div>
          </div>
          
          <!-- 需求描述预览 -->
          <div class="preview-section">
            <h3>💡 需求描述</h3>
            <div class="requirements-preview">{{ formData.requirements }}</div>
          </div>
          
          <!-- 生成状态 -->
          <div v-if="isGenerating" class="generation-status">
            <div class="loading-spinner"></div>
            <p>正在生成题目，请稍候...</p>
            <div class="progress-text">{{ generationProgress }}</div>
          </div>
          
          <!-- 生成结果 -->
          <div v-if="generationResult" class="generation-result">
            <h3>🎉 生成完成</h3>
            <div class="result-info">
              <p>题目已成功生成！</p>
              <div class="result-actions">
                <button class="btn btn-primary" @click="viewGeneratedQuestion">查看题目</button>
                <button class="btn btn-secondary" @click="downloadFiles">下载文件</button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 导航按钮 -->
        <div class="card-footer">
          <button 
            v-if="currentStep > 1 && !isGenerating" 
            class="nav-btn prev-btn" 
            @click="prevStep"
          >
            ← 上一步
          </button>
          <button 
            v-if="!generationResult"
            class="nav-btn submit-btn" 
            @click="generateQuestion"
            :disabled="!canSubmit || isGenerating"
          >
            <span v-if="isGenerating">生成中...</span>
            <span v-else>生成题目 🚀</span>
          </button>
          <button 
            v-if="generationResult"
            class="nav-btn submit-btn" 
            @click="resetForm"
          >
            重新开始
          </button>
        </div>
      </div>
    </div>



  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'



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

// 生成相关状态
const isGenerating = ref(false)
const generationProgress = ref('')
const generationResult = ref(null)

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
    return formData.value.title.trim() !== '' && 
           formData.value.description.trim() !== '' &&
           formData.value.requirements.trim() !== ''
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

const generateQuestion = async () => {
  if (!canSubmit.value) return
  
  isGenerating.value = true
  generationProgress.value = '正在分析需求...'
  
  try {
    // 模拟生成过程
    await new Promise(resolve => setTimeout(resolve, 1000))
    generationProgress.value = '正在生成题目框架...'
    
    await new Promise(resolve => setTimeout(resolve, 1500))
    generationProgress.value = '正在配置环境...'
    
    await new Promise(resolve => setTimeout(resolve, 1000))
    generationProgress.value = '正在生成测试用例...'
    
    await new Promise(resolve => setTimeout(resolve, 1000))
    generationProgress.value = '生成完成！'
    
    // 设置生成结果
    generationResult.value = {
      success: true,
      questionId: 'ctf_' + Date.now(),
      files: ['docker-compose.yml', 'src/', 'writeup.md']
    }
    
    ElMessage.success('题目生成成功！')
  } catch (error) {
    ElMessage.error('生成失败，请重试')
    console.error('生成错误:', error)
  } finally {
    isGenerating.value = false
  }
}

const viewGeneratedQuestion = () => {
  ElMessage.info('跳转到题目详情页面')
  // 这里可以跳转到题目详情页
}

const downloadFiles = () => {
  ElMessage.info('开始下载生成的文件')
  // 这里可以下载生成的文件
}

const resetForm = () => {
  currentStep.value = 1
  isGenerating.value = false
  generationProgress.value = ''
  generationResult.value = null
  formData.value = {
    title: '',
    description: '',
    enabled: true,
    flagTemplate: 'flag{...}',
    validTime: 3600,
    difficulty: 3,
    maxAttempts: 20,
    requirements: ''
  }
  ElMessage.success('已重置表单')
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

/* 第三步预览样式 */
.preview-section {
  margin-bottom: 32px;
  padding: 24px;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.preview-section h3 {
  font-size: 1.2rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 20px 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.preview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.preview-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.preview-item.full-width {
  grid-column: 1 / -1;
}

.preview-item label {
  font-weight: 500;
  color: #64748b;
  font-size: 0.9rem;
}

.preview-item span {
  color: #1e293b;
  font-weight: 500;
}

.difficulty-stars {
  display: flex;
  align-items: center;
  gap: 4px;
}

.star {
  color: #e2e8f0;
  font-size: 1.2rem;
  transition: color 0.2s;
}

.star.active {
  color: #fbbf24;
}

.difficulty-text {
  margin-left: 8px;
  font-size: 0.9rem;
  color: #64748b;
}

.status-enabled {
  color: #10b981;
  font-weight: 600;
}

.status-disabled {
  color: #ef4444;
  font-weight: 600;
}

.code-text {
  font-family: 'Courier New', monospace;
  background: #f1f5f9;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.9rem;
}

.description-preview,
.requirements-preview {
  background: white;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  color: #374151;
  line-height: 1.6;
  white-space: pre-wrap;
}

/* 生成状态样式 */
.generation-status {
  text-align: center;
  padding: 40px 20px;
  background: #f0f9ff;
  border-radius: 12px;
  border: 2px solid #0ea5e9;
  margin: 24px 0;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e2e8f0;
  border-top: 4px solid #0ea5e9;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.generation-status p {
  font-size: 1.1rem;
  font-weight: 600;
  color: #0c4a6e;
  margin: 0 0 12px 0;
}

.progress-text {
  color: #0369a1;
  font-size: 0.95rem;
}

/* 生成结果样式 */
.generation-result {
  text-align: center;
  padding: 32px 20px;
  background: #f0fdf4;
  border-radius: 12px;
  border: 2px solid #22c55e;
  margin: 24px 0;
}

.generation-result h3 {
  color: #15803d;
  font-size: 1.3rem;
  margin: 0 0 16px 0;
}

.result-info p {
  color: #166534;
  font-size: 1.1rem;
  margin: 0 0 20px 0;
}

.result-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover {
  background: #2563eb;
  transform: translateY(-1px);
}

.btn-secondary {
  background: #6b7280;
  color: white;
}

.btn-secondary:hover {
  background: #4b5563;
  transform: translateY(-1px);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .preview-grid {
    grid-template-columns: 1fr;
  }
  
  .result-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .btn {
    width: 100%;
    max-width: 200px;
  }
}
</style>