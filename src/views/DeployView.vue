<template>
  <div class="deploy-container">
    <!-- 固定进度条 -->
    <div class="progress-bar">
      <div class="progress-steps">
        <div
          v-for="(step, index) in steps"
          :key="index"
          class="progress-step"
          :class="{
            'active': currentStep === index + 1,
            'completed': currentStep > index + 1
          }"
        >
          <div class="step-circle">
            <i v-if="currentStep > index + 1" class="check-icon">✓</i>
            <span v-else>{{ index + 1 }}</span>
          </div>
          <span class="step-label">{{ step }}</span>
        </div>
      </div>
    </div>

    <!-- 内容区域 -->
    <div class="content-area">
      <!-- 第一步：出题界面 -->
      <div v-if="currentStep === 1" class="step-content">
        <h2 class="step-title">题目信息设置</h2>

        <div class="form-container">
          <div class="form-group">
            <label class="form-label">题目标题 <span class="required">*</span></label>
            <input
              v-model="questionForm.title"
              type="text"
              class="form-input"
              placeholder="请输入题目标题"
            />
          </div>

          <div class="form-group">
            <label class="form-label">题目简介 <span class="required">*</span></label>
            <textarea
              v-model="questionForm.description"
              class="form-textarea"
              placeholder="请输入题目简介"
              rows="4"
            ></textarea>
          </div>

          <div class="form-row">
            <div class="form-group half-width">
              <label class="form-label">是否启用</label>
              <div class="radio-group">
                <label class="radio-item">
                  <input
                    v-model="questionForm.enabled"
                    type="radio"
                    :value="true"
                  />
                  <span class="radio-custom"></span>
                  是
                </label>
                <label class="radio-item">
                  <input
                    v-model="questionForm.enabled"
                    type="radio"
                    :value="false"
                  />
                  <span class="radio-custom"></span>
                  否
                </label>
              </div>
            </div>

            <div class="form-group half-width">
              <label class="form-label">难度评级</label>
              <div class="star-rating">
                <span
                  v-for="star in 5"
                  :key="star"
                  class="star"
                  :class="{ 'active': star <= questionForm.difficulty }"
                  @click="questionForm.difficulty = star"
                >
                  ★
                </span>
              </div>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Flag <span class="required">*</span></label>
            <input
              v-model="questionForm.flag"
              type="text"
              class="form-input"
              placeholder="请输入Flag，例如：flag{your_flag_here}"
            />
            <div class="form-hint">请输入完整的Flag，系统将自动生成Flag</div>
          </div>

          <div class="form-group">
            <label class="form-label">题目标签 <span class="required">*</span></label>
            <select
              v-model="questionForm.tag_id"
              class="form-select"
            >
              <option value="">请选择题目标签</option>
              <option value="1">电子数据取证</option>
              <option value="2">渗透测试</option>
              <option value="3">系统安全</option>
              <option value="4">密码技术与应用</option>
              <option value="5">恶意软件分析</option>
            </select>
          </div>

          <div class="form-row">
            <div class="form-group half-width">
              <label class="form-label">有效时间（秒） <span class="required">*</span></label>
              <input
                v-model.number="questionForm.validTime"
                type="number"
                class="form-input"
                min="1"
                placeholder="3600"
              />
            </div>

            <div class="form-group half-width">
              <label class="form-label">题目星级 <span class="required">*</span></label>
              <select
                v-model="questionForm.star"
                class="form-select"
              >
                <option value="1">⭐ 1星</option>
                <option value="2">⭐⭐ 2星</option>
                <option value="3">⭐⭐⭐ 3星</option>
                <option value="4">⭐⭐⭐⭐ 4星</option>
                <option value="5">⭐⭐⭐⭐⭐ 5星</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- 第二步：需求输入界面 -->
      <div v-else-if="currentStep === 2" class="step-content">
        <h2 class="step-title">需求描述</h2>

        <div class="form-container">
          <div class="form-group">
            <label class="form-label">请详细描述您的需求 <span class="required">*</span></label>
            <textarea
              v-model="requirementForm.description"
              class="form-textarea large"
              placeholder="请输入详细的需求描述，包括题目类型、涉及技术栈、期望的解题思路等..."
              rows="10"
            ></textarea>
          </div>
        </div>
      </div>

      <!-- 第三步：漏洞注入界面 -->
      <div v-else-if="currentStep === 3" class="step-content">
        <h2 class="step-title">漏洞注入</h2>

        <div class="form-container">
          <div class="vulnerability-info">
            <div class="info-card">
              <div class="info-icon">🔒</div>
              <div class="info-content">
                <h3>漏洞注入说明</h3>
                <p>在这个步骤中，您可以描述希望在部署环境中注入的安全漏洞。AI将根据您的描述自动生成相应的漏洞配置和利用场景。</p>
              </div>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">漏洞描述 <span class="required">*</span></label>
            <textarea
              v-model="vulnerabilityForm.description"
              class="form-textarea large"
              placeholder="请详细描述您希望注入的漏洞类型和特征，例如：SQL注入漏洞、XSS漏洞、文件上传漏洞、权限提升漏洞等。请包含漏洞位置、触发条件、利用方式等信息..."
              rows="12"
            ></textarea>
          </div>

          <div class="vulnerability-examples">
            <h4>漏洞描述示例：</h4>
            <div class="example-list">
              <div class="example-item" @click="fillExample('sql')">
                <strong>SQL注入漏洞：</strong>
                <span>在用户登录页面存在SQL注入漏洞，攻击者可以通过构造特殊的用户名或密码绕过身份验证...</span>
              </div>
              <div class="example-item" @click="fillExample('xss')">
                <strong>XSS漏洞：</strong>
                <span>在评论功能中存在存储型XSS漏洞，用户提交的内容未经过滤直接显示，可执行恶意脚本...</span>
              </div>
              <div class="example-item" @click="fillExample('upload')">
                <strong>文件上传漏洞：</strong>
                <span>文件上传功能存在安全漏洞，可以上传恶意文件获取服务器权限...</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 第四步：生成确认界面 -->
      <div v-else-if="currentStep === 4" class="step-content">
        <h2 class="step-title">生成确认</h2>

        <div class="form-container">
          <div class="confirmation-info">
            <div class="info-card">
              <div class="info-icon">📋</div>
              <div class="info-content">
                <h3>题目信息确认</h3>
                <p>请确认以下题目配置信息，确认无误后点击"提交部署"开始生成CTF题目。</p>
              </div>
            </div>
          </div>

          <div class="confirmation-details">
            <div class="detail-section">
              <h4>基础信息</h4>
              <div class="detail-item">
                <label>题目标题：</label>
                <span>{{ questionForm.title }}</span>
              </div>
              <div class="detail-item">
                <label>题目简介：</label>
                <span>{{ questionForm.description }}</span>
              </div>
              <div class="detail-item">
                <label>题目标签：</label>
                <span>{{ getTagLabel(questionForm.tag_id) }}</span>
              </div>
              <div class="detail-item">
                <label>Flag：</label>
                <span>{{ questionForm.flag }}</span>
              </div>
              <div class="detail-item">
                <label>题目星级：</label>
                <span>{{ '⭐'.repeat(questionForm.star) }}</span>
              </div>
              <div class="detail-item">
                <label>有效时间：</label>
                <span>{{ questionForm.validTime }} 秒</span>
              </div>
              <div class="detail-item">
                <label>最大尝试次数：</label>
                <span>{{ questionForm.maxAttempts }} 次</span>
              </div>
            </div>

            <div class="detail-section">
              <h4>需求描述</h4>
              <div class="detail-content">
                {{ requirementForm.description }}
              </div>
            </div>

            <div class="detail-section">
              <h4>漏洞配置</h4>
              <div class="detail-content">
                {{ vulnerabilityForm.description }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 导航按钮 -->
    <div class="navigation-buttons">
      <button
        v-if="currentStep > 1"
        @click="prevStep"
        class="nav-button prev-button"
      >
        上一步
      </button>
      <button
        @click="nextStep"
        class="nav-button next-button"
        :disabled="!isCurrentStepValid || isSubmitting"
      >
        <span v-if="isSubmitting && currentStep === 3">
          正在注入漏洞...
        </span>
        <span v-else-if="isSubmitting && currentStep === 4">
          正在提交部署...
        </span>
        <span v-else>
          {{ currentStep === steps.length ? '提交部署' : '下一步' }}
        </span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
// import { injectVulnerability, type VulnerabilityInjectionRequest } from '@/api/deploy'
// import { ElMessage } from 'element-plus'

// 步骤定义
const steps = ['题目设置', '需求描述', '漏洞注入', '生成确认']
const currentStep = ref(1)

// 表单数据
const questionForm = ref({
  title: '',
  description: '',
  enabled: true,
  flag: '',
  tag_id: null, // 标签ID (1-5)
  validTime: 3600, // 有效时间，单位秒
  star: 3, // 星级 (1-5)
  maxAttempts: 20
})

const requirementForm = ref({
  description: ''
})

const vulnerabilityForm = ref({
  description: ''
})

// 部署ID (实际使用时应该从路由参数或其他地方获取)
const deployId = ref(1)

// 加载状态
const isSubmitting = ref(false)

// 根据tag_id获取标签名称
const getTagLabel = (tagId) => {
  const tagMap = {
    1: '电子数据取证',
    2: '渗透测试',
    3: '系统安全',
    4: '密码技术与应用',
    5: '恶意软件分析'
  }
  return tagMap[tagId] || '未选择'
}

// 表单验证
const isCurrentStepValid = computed(() => {
  switch (currentStep.value) {
    case 1:
      return questionForm.value.title.trim() !== '' &&
             questionForm.value.description.trim() !== '' &&
             questionForm.value.flag.trim() !== '' &&
             questionForm.value.tag_id &&
             questionForm.value.validTime > 0 &&
             questionForm.value.star >= 1 && questionForm.value.star <= 5
    case 2:
      return requirementForm.value.description.trim() !== ''
    case 3:
      return vulnerabilityForm.value.description.trim() !== ''
    default:
      return true
  }
})

// 导航方法
const nextStep = async () => {
  if (!isCurrentStepValid.value) return

  // 如果是第三步（漏洞注入），调用API
  if (currentStep.value === 3) {
    await handleVulnerabilityInjection()
  }

  // 如果是第四步（最终确认），提交部署
  if (currentStep.value === 4) {
    await handleFinalSubmit()
    return // 提交完成后不再前进步骤
  }

  if (currentStep.value < steps.length) {
    currentStep.value++
  }
}

// 处理漏洞注入
const handleVulnerabilityInjection = async () => {
  try {
    isSubmitting.value = true

    // TODO: 实现漏洞注入API调用
    console.log('漏洞注入描述:', vulnerabilityForm.value.description)

    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))

    console.log('漏洞注入成功！')
  } catch (error) {
    console.error('漏洞注入失败:', error)
    throw error // 阻止步骤前进
  } finally {
    isSubmitting.value = false
  }
}

// 处理最终提交
const handleFinalSubmit = async () => {
  try {
    isSubmitting.value = true

    // 构建符合创建题目接口要求的数据
    const questionData = {
      title: questionForm.value.title,
      introduction: questionForm.value.description, // 接口要求字段名为introduction
      tag_id: parseInt(questionForm.value.tag_id), // 确保是数字类型
      is_active: questionForm.value.enabled,
      flag_prefix: questionForm.value.flag, // 接口要求字段名为flag_prefix
      topology: {}, // 拓扑结构，暂时为空对象
      valid_time: questionForm.value.validTime, // 接口要求字段名为valid_time
      star: parseInt(questionForm.value.star) // 确保是数字类型
    }

    // TODO: 调用创建题目接口 POST /api/question/insert
    console.log('提交题目数据:', questionData)

    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 2000))

    console.log('题目创建成功！')

    // 可以在这里添加成功后的处理逻辑，比如跳转到结果页面
    // router.push('/deploy/result')

  } catch (error) {
    console.error('题目创建失败:', error)
    // 可以在这里添加错误处理，比如显示错误消息
    throw error
  } finally {
    isSubmitting.value = false
  }
}

const prevStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

// 填充漏洞示例
const fillExample = (type: string) => {
  const examples = {
    sql: '在Web应用的用户登录模块存在SQL注入漏洞。具体表现为：1. 登录表单的用户名字段未进行输入验证和参数化查询；2. 攻击者可以通过输入特制的SQL语句（如：admin\' OR \'1\'=\'1\' --）绕过身份验证；3. 利用此漏洞可以获取数据库中的用户信息，包括密码哈希等敏感数据；4. 进一步可能导致数据库完全被控制。',
    xss: '在Web应用的评论/留言功能中存在存储型XSS漏洞。具体表现为：1. 用户提交的评论内容未经过HTML实体编码直接存储到数据库；2. 当其他用户查看包含恶意脚本的评论时，恶意代码会在其浏览器中执行；3. 攻击者可以通过插入<script>标签盗取用户Cookie、会话信息；4. 可能导致账户劫持、钓鱼攻击等安全风险。',
    upload: '在Web应用的文件上传功能中存在任意文件上传漏洞。具体表现为：1. 文件上传接口仅检查文件扩展名，未验证文件内容类型；2. 攻击者可以上传webshell（如.php、.jsp、.aspx等后门文件）；3. 上传的恶意文件可以直接通过Web路径访问执行；4. 利用此漏洞可以获取服务器shell权限，进行进一步的内网渗透。'
  }
  vulnerabilityForm.value.description = examples[type as keyof typeof examples] || ''
}
</script>

<style scoped>
.deploy-container {
  min-height: 100vh;
  background: #fafbfc;
  padding: 0;
}

/* 进度条样式 */
.progress-bar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 80px 0 100px;
  border-bottom: 3px solid #e8eaed;
  position: relative;
  width: 100%;
  min-height: 300px;
  box-sizing: border-box;
  display: block;
}

.progress-steps {
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 40px 50px;
  z-index: 2;
}

.progress-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}

.progress-step:not(:last-child)::after {
  content: '';
  position: absolute;
  top: 25px;
  left: 60px;
  width: 120px;
  height: 3px;
  background: #e8eaed;
  transition: all 0.3s ease;
  border-radius: 2px;
}

.progress-step.completed:not(:last-child)::after {
  background: #4caf50;
}

.step-circle {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: #e8eaed;
  color: #5f6368;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 16px;
  margin-bottom: 12px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.progress-step.active .step-circle {
  background: #1976d2;
  color: white;
}

.progress-step.completed .step-circle {
  background: #4caf50;
  color: white;
}

.step-label {
  font-size: 16px;
  color: #5f6368;
  font-weight: 500;
  text-align: center;
  white-space: nowrap;
}

.progress-step.active .step-label {
  color: #1976d2;
}



.check-icon {
  font-style: normal;
  font-size: 18px;
}

/* 内容区域样式 */
.content-area {
  max-width: 800px;
  margin: 40px auto 0;
  padding: 60px 40px;
}

.step-content {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.step-title {
  font-size: 28px;
  font-weight: 600;
  color: #202124;
  margin-bottom: 40px;
  text-align: center;
}

/* 表单样式 */
.form-container {
  background: white;
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.form-group {
  margin-bottom: 24px;
}

.form-row {
  display: flex;
  gap: 20px;
}

.half-width {
  flex: 1;
}

.form-label {
  display: block;
  font-size: 16px;
  font-weight: 500;
  color: #202124;
  margin-bottom: 8px;
}

.required {
  color: #ea4335;
}

.form-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #dadce0;
  border-radius: 8px;
  font-size: 16px;
  transition: all 0.2s ease;
  background: white;
}

.form-input:focus {
  outline: none;
  border-color: #1976d2;
  box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.1);
}

.form-select {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #dadce0;
  border-radius: 8px;
  font-size: 16px;
  transition: all 0.2s ease;
  background: white;
  cursor: pointer;
}

.form-select:focus {
  outline: none;
  border-color: #1976d2;
  box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.1);
}

.form-hint {
  font-size: 14px;
  color: #666;
  margin-top: 4px;
}

.form-textarea {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #dadce0;
  border-radius: 8px;
  font-size: 16px;
  resize: vertical;
  min-height: 100px;
  font-family: inherit;
  transition: all 0.2s ease;
}

.form-textarea.large {
  min-height: 200px;
}

.form-textarea:focus {
  outline: none;
  border-color: #1976d2;
  box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.1);
}

/* 单选按钮样式 */
.radio-group {
  display: flex;
  gap: 24px;
}

.radio-item {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: 16px;
  color: #202124;
}

.radio-item input[type="radio"] {
  display: none;
}

.radio-custom {
  width: 20px;
  height: 20px;
  border: 2px solid #dadce0;
  border-radius: 50%;
  margin-right: 8px;
  position: relative;
  transition: all 0.2s ease;
}

.radio-item input[type="radio"]:checked + .radio-custom {
  border-color: #1976d2;
}

.radio-item input[type="radio"]:checked + .radio-custom::after {
  content: '';
  width: 10px;
  height: 10px;
  background: #1976d2;
  border-radius: 50%;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

/* 星级评分样式 */
.star-rating {
  display: flex;
  gap: 4px;
}

.star {
  font-size: 24px;
  color: #dadce0;
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
}

.star:hover,
.star.active {
  color: #ffc107;
}

/* 漏洞注入样式 */
.vulnerability-info {
  margin-bottom: 24px;
}

.info-card {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #1976d2;
}

.info-icon {
  font-size: 24px;
  flex-shrink: 0;
}

.info-content h3 {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: #202124;
}

.info-content p {
  margin: 0;
  font-size: 14px;
  color: #5f6368;
  line-height: 1.5;
}

.vulnerability-examples {
  margin-top: 24px;
}

.vulnerability-examples h4 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #202124;
}

.example-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.example-item {
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid #e8eaed;
}

.example-item:hover {
  background: #e8f0fe;
  border-color: #1976d2;
}

.example-item strong {
  display: block;
  margin-bottom: 4px;
  color: #1976d2;
  font-size: 14px;
}

.example-item span {
  font-size: 13px;
  color: #5f6368;
  line-height: 1.4;
}

/* 导航按钮样式 */
.navigation-buttons {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 40px 40px;
  display: flex;
  justify-content: space-between;
  gap: 16px;
}

.nav-button {
  padding: 12px 32px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 120px;
}

.prev-button {
  background: white;
  color: #1976d2;
  border: 1px solid #1976d2;
}

.prev-button:hover {
  background: #f8f9fa;
}

.next-button {
  background: #1976d2;
  color: white;
  margin-left: auto;
}

.next-button:hover:not(:disabled) {
  background: #1565c0;
}

.next-button:disabled {
  background: #dadce0;
  color: #9aa0a6;
  cursor: not-allowed;
}

/* 确认页面样式 */
.confirmation-info {
  margin-bottom: 24px;
}

.confirmation-details {
  margin-top: 24px;
}

.detail-section {
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid #e8eaed;
}

.detail-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.detail-section h4 {
  margin: 0 0 16px 0;
  font-size: 18px;
  font-weight: 600;
  color: #202124;
}

.detail-item {
  display: flex;
  margin-bottom: 12px;
  align-items: flex-start;
}

.detail-item label {
  min-width: 120px;
  font-weight: 500;
  color: #5f6368;
  margin-right: 16px;
  flex-shrink: 0;
}

.detail-item span {
  color: #202124;
  flex: 1;
}

.detail-content {
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #1976d2;
  line-height: 1.6;
  color: #202124;
  white-space: pre-wrap;
}

/* 响应式设计 */
@media (max-width: 900px) {
  .content-area {
    padding: 40px 20px;
  }

  .form-container {
    padding: 30px 20px;
  }

  .navigation-buttons {
    padding: 0 20px 40px;
  }

  .form-row {
    flex-direction: column;
    gap: 16px;
  }

  .progress-steps {
    padding: 0 20px;
  }

  .step-line {
    margin: 0 10px;
  }
}
</style>
