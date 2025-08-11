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
          <div class="progress-step" :class="{ active: currentStep >= 3, completed: currentStep > 3 }">
            <div class="step-number">3</div>
            <div class="step-label">网络拓扑</div>
          </div>
          <div class="progress-line" :class="{ completed: currentStep > 3 }"></div>
          <div class="progress-step" :class="{ active: currentStep >= 4, completed: currentStep > 4 }">
            <div class="step-number">4</div>
            <div class="step-label">拓扑生成</div>
          </div>
                      <div class="progress-line" :class="{ completed: currentStep > 4 }"></div>
            <div class="progress-step" :class="{ active: currentStep >= 5, completed: currentStep > 5 }">
              <div class="step-number">5</div>
              <div class="step-label">Docker配置</div>
            </div>
            <div class="progress-line" :class="{ completed: currentStep > 5 }"></div>
            <div class="progress-step" :class="{ active: currentStep >= 6 }">
              <div class="step-number">6</div>
              <div class="step-label">部署完成</div>
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
                <label class="form-label">题目标签 *</label>
                <select
                  v-model="formData.tagId"
                  class="form-select"
                >
                  <option value="" disabled>请选择题目标签</option>
                  <option v-for="tag in tagOptions" :key="tag.tag_id" :value="tag.tag_id">
                    {{ tag.tag }}
                  </option>
                </select>
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

            <div class="form-row">
              <div class="form-group full-width">
                <label class="form-label">Flag *</label>
                <input
                  v-model="formData.flag"
                  type="text"
                  class="form-input"
                  placeholder="请输入完整的flag，例如：flag{this_is_a_sample_flag}"
                  maxlength="200"
                />
                <div class="form-hint">请输入完整的flag内容，包括格式</div>
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
          <p>配置您的CTF题目网络环境，每个区域可以设置一个子网并添加多个设备</p>
        </div>

        <div class="network-config-container">
          <!-- 内网区域 -->
          <div class="network-zone-config">
            <div class="zone-header">
              <div class="zone-title">
                <div class="zone-icon internal">🏠</div>
                <span class="zone-name">内网区域</span>
              </div>
            </div>

            <div class="zone-content">
              <!-- 子网配置 -->
              <div class="subnet-config">
                <label class="subnet-label">子网地址段:</label>
                <input
                  v-model="networkConfig.internal.subnet"
                  type="text"
                  class="subnet-input"
                  placeholder="例如: 192.168.1.0/24"
                />
              </div>

              <!-- 设备列表 -->
              <div class="devices-section">
                <div class="devices-header">
                  <span class="devices-title">设备列表 ({{ networkConfig.internal.devices.length }})</span>
                  <button
                    class="add-device-btn"
                    @click="addDevice('internal')"
                    :disabled="!networkConfig.internal.subnet.trim()"
                  >
                    <span class="add-icon">+</span>
                    添加设备
                  </button>
                </div>

                <div class="devices-list">
                  <div
                    v-for="(device, index) in networkConfig.internal.devices"
                    :key="device.id"
                    class="device-item"
                  >
                    <div class="device-info">
                      <div class="device-type">{{ device.type || '未配置' }}</div>
                      <div class="device-details">
                        <span class="device-ip">{{ device.ip || '未设置IP' }}</span>
                        <span class="device-system">{{ device.system || '未选择系统' }}</span>
                      </div>
                    </div>
                    <div class="device-actions">
                      <button class="edit-device-btn" @click="editDevice('internal', index)">编辑</button>
                      <button class="delete-device-btn" @click="deleteDevice('internal', index)">删除</button>
                    </div>
                  </div>

                  <div v-if="networkConfig.internal.devices.length === 0" class="no-devices">
                    <div class="no-devices-icon">📱</div>
                    <p>暂无设备，点击"添加设备"开始配置</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- DMZ区域 -->
          <div class="network-zone-config">
            <div class="zone-header">
              <div class="zone-title">
                <div class="zone-icon dmz">🌐</div>
                <span class="zone-name">DMZ区域</span>
              </div>
            </div>

            <div class="zone-content">
              <!-- 子网配置 -->
              <div class="subnet-config">
                <label class="subnet-label">子网地址段:</label>
                <input
                  v-model="networkConfig.dmz.subnet"
                  type="text"
                  class="subnet-input"
                  placeholder="例如: 10.0.1.0/24"
                />
              </div>

              <!-- 设备列表 -->
              <div class="devices-section">
                <div class="devices-header">
                  <span class="devices-title">设备列表 ({{ networkConfig.dmz.devices.length }})</span>
                  <button
                    class="add-device-btn"
                    @click="addDevice('dmz')"
                    :disabled="!networkConfig.dmz.subnet.trim()"
                  >
                    <span class="add-icon">+</span>
                    添加设备
                  </button>
                </div>

                <div class="devices-list">
                  <div
                    v-for="(device, index) in networkConfig.dmz.devices"
                    :key="device.id"
                    class="device-item"
                  >
                    <div class="device-info">
                      <div class="device-type">{{ device.type || '未配置' }}</div>
                      <div class="device-details">
                        <span class="device-ip">{{ device.ip || '未设置IP' }}</span>
                        <span class="device-system">{{ device.system || '未选择系统' }}</span>
                      </div>
                    </div>
                    <div class="device-actions">
                      <button class="edit-device-btn" @click="editDevice('dmz', index)">编辑</button>
                      <button class="delete-device-btn" @click="deleteDevice('dmz', index)">删除</button>
                    </div>
                  </div>

                  <div v-if="networkConfig.dmz.devices.length === 0" class="no-devices">
                    <div class="no-devices-icon">📱</div>
                    <p>暂无设备，点击"添加设备"开始配置</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 攻击区域 -->
          <div class="network-zone-config">
            <div class="zone-header">
              <div class="zone-title">
                <div class="zone-icon attack">⚡</div>
                <span class="zone-name">攻击区域</span>
              </div>
            </div>

            <div class="zone-content">
              <!-- 子网配置 -->
              <div class="subnet-config">
                <label class="subnet-label">子网地址段:</label>
                <input
                  v-model="networkConfig.attack.subnet"
                  type="text"
                  class="subnet-input"
                  placeholder="例如: 172.16.1.0/24"
                />
              </div>

              <!-- 设备列表 -->
              <div class="devices-section">
                <div class="devices-header">
                  <span class="devices-title">设备列表 ({{ networkConfig.attack.devices.length }})</span>
                  <button
                    class="add-device-btn"
                    @click="addDevice('attack')"
                    :disabled="!networkConfig.attack.subnet.trim()"
                  >
                    <span class="add-icon">+</span>
                    添加设备
                  </button>
                </div>

                <div class="devices-list">
                  <div
                    v-for="(device, index) in networkConfig.attack.devices"
                    :key="device.id"
                    class="device-item"
                  >
                    <div class="device-info">
                      <div class="device-type">{{ device.type || '未配置' }}</div>
                      <div class="device-details">
                        <span class="device-ip">{{ device.ip || '未设置IP' }}</span>
                        <span class="device-system">{{ device.system || '未选择系统' }}</span>
                      </div>
                    </div>
                    <div class="device-actions">
                      <button class="edit-device-btn" @click="editDevice('attack', index)">编辑</button>
                      <button class="delete-device-btn" @click="deleteDevice('attack', index)">删除</button>
                    </div>
                  </div>

                  <div v-if="networkConfig.attack.devices.length === 0" class="no-devices">
                    <div class="no-devices-icon">📱</div>
                    <p>暂无设备，点击"添加设备"开始配置</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 导航按钮 -->
        <div class="card-footer">
          <button
            class="nav-btn prev-btn"
            @click="prevStep"
          >
            ← 上一步
          </button>
          <button
            class="nav-btn next-btn"
            @click="nextStep"
            :disabled="!canProceed"
          >
            下一步 →
          </button>
        </div>
      </div>
    </div>

    <!-- 第四步：生成拓扑图 -->
    <div v-if="currentStep === 4" class="step-content">
      <div class="form-card">
        <div class="form-header">
          <h3>🎨 生成拓扑图</h3>
          <p>基于您的网络配置生成可视化拓扑图</p>
        </div>

        <div class="topology-generation">
          <!-- 配置摘要 -->
          <div class="config-summary">
            <h4>📋 配置摘要</h4>
            <div class="summary-grid">
              <div class="summary-item">
                <div class="summary-label">题目名称:</div>
                <div class="summary-value">{{ formData.title }}</div>
              </div>
              <div class="summary-item">
                <div class="summary-label">难度等级:</div>
                <div class="summary-value">{{ getDifficultyText(formData.difficulty) }}</div>
              </div>
              <div class="summary-item">
                <div class="summary-label">网络分区:</div>
                <div class="summary-value">
                  <span v-for="(config, zone) in networkConfig" :key="zone" v-if="config && config.subnet && config.devices.length > 0" class="zone-tag">
                    {{ getZoneName(zone) }}
                    <span class="node-count">({{ config.devices.length }}个设备)</span>
                  </span>
                </div>
              </div>
              <div class="summary-item">
                <div class="summary-label">部署ID:</div>
                <div class="summary-value">{{ deployId || '未设置' }}</div>
              </div>
            </div>
          </div>

          <!-- 生成状态区域 -->
          <div class="generation-area">
            <!-- 未开始生成状态 -->
            <div v-if="generationState === 'idle'" class="generation-idle">
              <div class="idle-icon">🎯</div>
              <h4>准备生成拓扑图</h4>
              <p>点击下方按钮开始生成您的网络拓扑图</p>
              <div class="button-group">
                <button class="generate-btn" @click="startTopologyGeneration">
                  🚀 立即生成拓扑图
                </button>
                <button class="debug-btn" @click="checkDeployStatus" style="margin-left: 10px;">
                  🔍 检查状态
                </button>
              </div>
              <div style="margin-top: 15px;">
                <button @click="logDevicesData" style="font-size: 12px; padding: 5px 10px; background: #e6f7ff; border: 1px solid #91d5ff; border-radius: 4px; color: #1890ff;">
                  🔍 预览设备数据
                </button>
              </div>
            </div>

            <!-- 第一阶段：配置处理中 -->
            <div v-if="generationState === 'processing'" class="generation-processing">
              <div class="processing-animation">
                <div class="spinner"></div>
              </div>
              <h4>⚙️ 正在处理网络配置</h4>
              <p>AI正在分析您的网络架构，预计需要1-2分钟...</p>
              <div class="progress-bar">
                <div class="progress-fill" :style="{ width: processingProgress + '%' }"></div>
              </div>
              <div class="progress-text">{{ processingProgress }}% 完成</div>
            </div>

            <!-- 第二阶段：图片生成中 -->
            <div v-if="generationState === 'rendering'" class="generation-rendering">
              <div class="rendering-animation">
                <div class="pulse-circle"></div>
              </div>
              <h4>🎨 正在生成拓扑图</h4>
              <p>正在渲染可视化图表，即将完成...</p>
              <div class="dots-loading">
                <span class="dot"></span>
                <span class="dot"></span>
                <span class="dot"></span>
              </div>
            </div>

            <!-- 生成完成状态 -->
            <div v-if="generationState === 'completed'" class="generation-completed">
              <div class="topology-result">
                <h4>✅ 拓扑图生成完成！</h4>
                <div class="topology-link-container">
                  <p class="link-description">点击下方链接在新标签页中查看拓扑图：</p>
                  <a 
                    :href="generatedTopologyImage" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    class="topology-link"
                  >
                    🖼️ 查看拓扑图
                  </a>
                </div>
                <div class="result-actions">
                  <button class="action-btn download-btn" @click="downloadTopology">
                    📥 下载拓扑图
                  </button>
                  <button class="action-btn regenerate-btn" @click="regenerateTopology">
                    🔄 重新生成
                  </button>
                </div>
              </div>
            </div>

            <!-- 生成失败状态 -->
            <div v-if="generationState === 'failed'" class="generation-failed">
              <div class="error-icon">❌</div>
              <h4>生成失败</h4>
              <p class="error-message">{{ generationError }}</p>
              <button class="retry-btn" @click="startTopologyGeneration">
                🔄 重试生成
              </button>
            </div>
          </div>
        </div>

        <!-- 导航按钮 -->
        <div class="card-footer">
          <button
            class="nav-btn prev-btn"
            @click="prevStep"
          >
            ← 上一步
          </button>
          <button
            v-if="generationState === 'completed'"
            class="nav-btn next-btn"
            @click="nextStep"
          >
            下一步 →
          </button>
        </div>
      </div>
    </div>



    <!-- 第五步：生成Docker Compose -->
    <div v-if="currentStep === 5" class="step-content">
      <div class="form-card">
        <div class="form-header">
          <h3>🐳 生成Docker Compose</h3>
          <p>根据网络拓扑配置生成Docker Compose部署文件</p>
        </div>

        <div class="docker-generation">
          <!-- 生成状态区域 -->
          <div class="generation-area">

            <!-- 第一阶段：准备生成 -->
            <div v-if="dockerGenerationState === 'idle'" class="generation-idle">
              <div class="ready-icon">🚀</div>
              <h4>准备生成Docker Compose文件</h4>
              <p>将基于您的网络拓扑配置生成完整的Docker Compose部署文件</p>
              <div class="generation-info">
                <div class="info-item">
                  <span class="info-label">部署ID:</span>
                  <span class="info-value">{{ deployId || '未设置' }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">网络分区:</span>
                  <span class="info-value">
                    <span v-for="(config, zone) in networkConfig" :key="zone" v-if="config && config.subnet && config.devices.length > 0" class="zone-tag">
                      {{ getZoneName(zone) }}
                      <span class="node-count">({{ config.devices.length }}个设备)</span>
                    </span>
                  </span>
                </div>
              </div>
              <button class="generate-docker-btn" @click="startDockerGeneration" :disabled="!deployId">
                🐳 生成Docker Compose
              </button>
            </div>

            <!-- 第二阶段：文件生成中 -->
            <div v-if="dockerGenerationState === 'generating'" class="generation-processing">
              <div class="processing-animation">
                <div class="pulse-circle"></div>
              </div>
              <h4>🔄 正在生成Docker Compose</h4>
              <p>正在解析网络配置并生成部署文件...</p>
              <div class="dots-loading">
                <span class="dot"></span>
                <span class="dot"></span>
                <span class="dot"></span>
              </div>
            </div>

            <!-- 生成完成状态 -->
            <div v-if="dockerGenerationState === 'completed'" class="generation-completed">
              <div class="docker-result">
                <h4>✅ Docker Compose文件生成完成！</h4>
                <div class="file-content-container">
                  <div class="file-header">
                    <div class="file-name">
                      <span class="file-icon">📄</span>
                      docker-compose.yml
                    </div>
                    <div class="file-actions">
                      <button class="copy-btn" @click="copyDockerContent">
                        📋 复制内容
                      </button>
                      <button class="download-btn" @click="downloadDockerFile">
                        📥 下载文件
                      </button>
                    </div>
                  </div>
                  <div class="file-content">
                    <pre><code class="yaml">{{ dockerComposeContent }}</code></pre>
                  </div>
                </div>
                <div class="result-actions">
                  <button class="action-btn regenerate-btn" @click="regenerateDocker">
                    🔄 重新生成
                  </button>
                </div>
              </div>
            </div>

            <!-- 生成失败状态 -->
            <div v-if="dockerGenerationState === 'failed'" class="generation-failed">
              <div class="error-icon">❌</div>
              <h4>生成失败</h4>
              <p class="error-message">{{ dockerGenerationError }}</p>
              <button class="retry-btn" @click="startDockerGeneration">
                🔄 重试生成
              </button>
            </div>
          </div>
        </div>

        <!-- 导航按钮 -->
        <div class="card-footer">
          <button
            class="nav-btn prev-btn"
            @click="prevStep"
          >
            ← 上一步
          </button>
          <button
            v-if="dockerGenerationState === 'completed'"
            class="nav-btn next-btn"
            @click="nextStep"
          >
            下一步 →
          </button>
        </div>
      </div>
    </div>

    <!-- 第六步：部署到题目 -->
    <div v-if="currentStep === 6" class="step-content">
      <div class="form-card">
        <div class="form-header">
          <h3>🚀 部署到题目</h3>
          <p>配置部署参数并将Docker环境部署到CTF题目</p>
        </div>

        <div class="deploy-configuration">
          <!-- 基本部署信息 -->
          <div class="deploy-info-section">
            <h4>📋 部署信息</h4>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">题目ID:</span>
                <span class="info-value">{{ questionId || '未设置' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">部署ID:</span>
                <span class="info-value">{{ deployId || '未设置' }}</span>
              </div>
            </div>
          </div>

          <!-- 部署参数配置 -->
          <div class="deploy-params-section">
            <h4>⚙️ 部署参数配置</h4>
            
            <!-- Docker类型配置 -->
            <div class="param-group">
              <label class="param-label">Docker类型:</label>
              <select 
                v-model="deployConfig.dockerType"
                class="param-select"
              >
                <option value="">请选择Docker类型</option>
                <option value="STATIC">STATIC - 静态部署</option>
                <option value="DYNAMIC">DYNAMIC - 动态部署</option>
                <option value="ISOLATED">ISOLATED - 隔离部署</option>
              </select>
            </div>

            <!-- FRP隧道类型配置 -->
            <div class="param-group">
              <label class="param-label">FRP隧道类型:</label>
              <select v-model="deployConfig.frpType" class="param-select">
                <option value="">请选择隧道类型</option>
                <option value="TCP">TCP</option>
                <option value="UDP">UDP</option>
                <option value="HTTP">HTTP</option>
              </select>
            </div>
          </div>

          <!-- 端口配置区域 -->
          <div class="ports-config-section">
            <h4>🔌 端口配置</h4>
            <div v-if="detectedPorts.length === 0" class="no-ports-message">
              <span class="no-ports-icon">📭</span>
              <p>未在Docker Compose文件中检测到需要配置的端口</p>
              <p class="no-ports-hint">请确保Docker Compose文件已生成并包含#PORT1#、#PORT2#等端口占位符</p>
            </div>
            
            <div v-else class="ports-list">
              <div 
                v-for="(port, index) in detectedPorts" 
                :key="index" 
                class="port-config-item"
              >
                <div class="port-header">
                  <span class="port-number">端口 {{ port.portNumber }}</span>
                  <span class="port-hint">81.70.202.254:{{ port.targetPort }}</span>
                </div>
                
                <div class="port-form">
                  <div class="port-field">
                    <label>服务名称:</label>
                    <input 
                      v-model="port.config.name" 
                      type="text" 
                      class="port-input"
                      placeholder="请输入服务名称"
                    />
                  </div>
                  
                  <div class="port-field">
                    <label>FRP类型:</label>
                    <select v-model="port.config.frp_type" class="port-select">
                      <option value="">请选择</option>
                      <option value="TCP">TCP</option>
                      <option value="UDP">UDP</option>
                      <option value="HTTP">HTTP</option>
                    </select>
                  </div>
                  
                  <div class="port-field">
                    <label>描述信息:</label>
                    <input 
                      v-model="port.config.description" 
                      type="text" 
                      class="port-input"
                      placeholder="请输入服务描述"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 部署预览 -->
          <div v-if="canPreviewDeploy" class="deploy-preview-section">
            <h4>👀 部署预览</h4>
            <div class="preview-config">
              <pre class="config-preview">{{ formatDeployConfig() }}</pre>
            </div>
          </div>

          <!-- 分值配置 -->
          <div class="score-config-section">
            <h4>💯 分值配置</h4>
            <p class="section-description">配置此题目的分值策略和衰减规则</p>
            
            <div class="score-config-grid">
              <!-- 最大分值 -->
              <div class="param-group">
                <label class="param-label">最大分值:</label>
                <input 
                  v-model.number="scoreConfig.max_score" 
                  type="number" 
                  class="param-input"
                  placeholder="请输入最大分值 (如: 1000)"
                  min="0"
                />
              </div>

              <!-- 最小分值 -->
              <div class="param-group">
                <label class="param-label">最小分值:</label>
                <input 
                  v-model.number="scoreConfig.min_score" 
                  type="number" 
                  class="param-input"
                  placeholder="请输入最小分值 (如: 200)"
                  min="0"
                />
              </div>

              <!-- 衰减类型 -->
              <div class="param-group">
                <label class="param-label">衰减类型:</label>
                <select 
                  v-model="scoreConfig.decay_type"
                  class="param-select"
                >
                  <option value="">请选择衰减类型</option>
                  <option value="STATIC">STATIC - 静态分值</option>
                  <option value="LINEAR">LINEAR - 线性衰减</option>
                  <option value="LOGARITHMIC">LOGARITHMIC - 对数衰减</option>
                </select>
              </div>

              <!-- 衰减因子 -->
              <div class="param-group">
                <label class="param-label">衰减因子:</label>
                <input 
                  v-model.number="scoreConfig.decay" 
                  type="number" 
                  class="param-input"
                  placeholder="请输入衰减因子 (如: 0.8)"
                  step="0.1"
                  min="0"
                  max="1"
                />
              </div>


            </div>

            <!-- 分值配置说明 -->
            <div class="score-config-tips">
              <h5>💡 配置说明</h5>
              <ul>
                <li><strong>最大分值:</strong> 题目的初始分值（未衰减时的分值）</li>
                <li><strong>最小分值:</strong> 分值衰减的下限</li>
                <li><strong>STATIC:</strong> 分值不随时间变化，始终为最大分值</li>
                <li><strong>LINEAR:</strong> 分值随解题人数线性衰减</li>
                <li><strong>LOGARITHMIC:</strong> 分值随解题人数对数衰减</li>
                <li><strong>衰减因子:</strong> 控制衰减速度，值越小衰减越快</li>
              </ul>
            </div>
          </div>

          <!-- 部署操作区域 -->
          <div class="deploy-action-section">
            <!-- 准备部署状态 -->
            <div v-if="deployState === 'idle'" class="deploy-idle">
              <div class="deploy-ready-icon">🚀</div>
              <h4>准备部署到题目</h4>
              <p>点击下方按钮将Docker环境部署到CTF题目</p>
              <button 
                class="deploy-submit-btn" 
                @click="startDeploy"
                :disabled="!canDeploy"
              >
                🎯 开始部署
              </button>
              <p v-if="!canDeploy" class="deploy-disabled-hint">
                请完成所有必填配置项后再进行部署
              </p>
            </div>

            <!-- 部署进行中 -->
            <div v-if="deployState === 'deploying'" class="deploy-processing">
              <div class="deploy-spinner">
                <div class="spinner-circle"></div>
              </div>
              <h4>🔄 正在部署</h4>
              <p>正在将Docker环境部署到题目中，请稍候...</p>
            </div>

            <!-- 部署成功 -->
            <div v-if="deployState === 'success'" class="deploy-success">
              <div class="deploy-success-icon">✅</div>
              <h4>部署成功！</h4>
              <p>Docker环境已成功部署到CTF题目</p>
              <div class="deploy-result-info">
                <div class="result-item">
                  <span class="result-label">题目ID:</span>
                  <span class="result-value">{{ questionId }}</span>
                </div>
                <div class="result-item">
                  <span class="result-label">部署ID:</span>
                  <span class="result-value">{{ deployId }}</span>
                </div>
              </div>
            </div>

            <!-- 部署失败 -->
            <div v-if="deployState === 'failed'" class="deploy-failed">
              <div class="deploy-error-icon">❌</div>
              <h4>部署失败</h4>
              <p class="deploy-error-message">{{ deployError }}</p>
              <button class="deploy-retry-btn" @click="startDeploy">
                🔄 重试部署
              </button>
            </div>
          </div>
        </div>

        <!-- 导航按钮 -->
        <div class="card-footer">
          <button
            class="nav-btn prev-btn"
            @click="prevStep"
          >
            ← 上一步
          </button>
          <button
            v-if="deployState === 'success'"
            class="nav-btn next-btn"
            @click="nextStep"
          >
            完成 →
          </button>
        </div>
      </div>
    </div>

    <!-- 第七步：部署完成 -->
    <div v-if="currentStep === 7" class="step-content">
      <div class="form-card">
        <div class="form-header">
          <h3>🎉 部署完成</h3>
          <p>您的CTF题目已成功部署</p>
        </div>

        <div class="completion-summary">
          <div class="summary-section">
            <h4>📋 部署摘要</h4>
            <div class="summary-grid">
              <div class="summary-item">
                <span class="summary-label">题目名称:</span>
                <span class="summary-value">{{ formData.title }}</span>
              </div>
              <div class="summary-item">
                <span class="summary-label">难度等级:</span>
                <span class="summary-value">{{ getDifficultyText(formData.difficulty) }}</span>
              </div>
              <div class="summary-item">
                <span class="summary-label">部署ID:</span>
                <span class="summary-value">{{ deployId || '未设置' }}</span>
              </div>
              <div class="summary-item">
                <span class="summary-label">网络分区数:</span>
                <span class="summary-value">{{ Object.keys(networkConfig).filter(zone => networkConfig[zone] && networkConfig[zone].subnet && networkConfig[zone].devices.length > 0).length }}</span>
              </div>
              <div class="summary-item">
                <span class="summary-label">设备总数:</span>
                <span class="summary-value">{{ Object.values(networkConfig).reduce((total, config) => total + (config && config.devices ? config.devices.length : 0), 0) }}</span>
              </div>
            </div>
          </div>

          <div class="success-message">
            <div class="success-icon">✅</div>
            <h4>部署成功完成！</h4>
            <p>您的CTF题目已成功生成并准备就绪。</p>
          </div>

          <div class="action-buttons">
            <button class="action-btn secondary-btn" @click="createNew">
              🆕 创建新题目
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 子网配置弹窗 -->
    <SubnetConfigDialog
      v-model="showSubnetDialog"
      @confirm="handleSubnetConfig"
    />

    <!-- 设备配置弹窗 -->
    <DeviceConfigDialog
      v-model="showDeviceDialog"
      :device="currentEditingDevice.device"
      @confirm="handleDeviceConfig"
    />

    <!-- 节点配置弹窗（旧版本，保留兼容） -->
    <NodeConfigDialog
      v-model="showNodeDialog"
      :node="currentConfigNode"
      @confirm="handleNodeConfig"
    />

  </div>
</template>

<script setup lang="ts">
import { ref, computed, defineComponent, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { createQuestion, type CreateQuestionRequest } from '@/api/question'
// import { getAllTags, type Tag } from '@/api/tag' // 已注释，使用硬编码数据

// 定义Tag类型
interface Tag {
  tag_id: number;
  tag: string;
}
import {
  inputScenario,
  inputDevices,
  generateTopology,
  generateTopologyImage,
  getTopologyImage,
  generateDockerCompose,
  getComposeFile,
  deployToQuestion,
  configureScore,
  type InputScenarioRequest,
  type InputDevicesRequest,
  type GenerateTopologyRequest,
  type TopologyImageResponse,
  type ComposeFileResponse,
  type DeployToQuestionRequest,
  type ScoreConfigRequest,
  type DeviceZone,
  type TargetMachine
} from '@/api/deploy'

// 拓扑节点组件
const TopologyNode = defineComponent({
  name: 'TopologyNode',
  props: {
    node: Object,
    zone: String
  },
  emits: ['add-branch', 'configure'],
  components: {
    // 递归组件自引用
    TopologyNode: 'TopologyNode'
  },
  setup(props) {
    // 调试日志
    console.log('TopologyNode props:', props)
    return {}
  },
  template: `
    <div class="topology-node-container">
      <div
        class="topology-node"
        :class="{
          'zone-internal': zone === 'internal',
          'zone-dmz': zone === 'dmz',
          'zone-attack': zone === 'attack',
          'add': node.type === 'add',
          'subnet': node.type === 'subnet',
          'subnet-configured': node.type === 'subnet-configured',
          'config': node.type === 'config',
          'configured': node.type === 'configured' || node.configured
        }"
        @click="handleNodeClick"
        :title="'Zone: ' + zone + ', Type: ' + node.type"
      >
        <div v-if="node.type === 'add'">+</div>
        <div v-else-if="node.type === 'subnet'" class="node-text">配置子网网段</div>
        <div v-else-if="node.type === 'subnet-configured'" class="node-text">{{ node.subnet || node.label }}</div>
        <div v-else-if="node.type === 'config'" class="node-text">具体配置</div>
        <div v-else-if="node.configured || node.type === 'configured'" class="configured-node">
          <div class="node-type">{{ node.nodeType || node.type }}</div>
          <div class="node-system">{{ node.system }}</div>
          <div class="node-ip">{{ node.ip }}</div>
        </div>
        <div v-else class="default-node">
          <div class="node-type">{{ node.type || '未知' }}</div>
          <div class="node-details">{{ node.label || node.name || 'Node' }}</div>
        </div>
      </div>

      <!-- 显示子节点 -->
      <div v-if="node.children && node.children.length > 0" class="node-connections">
        <div v-for="child in node.children" :key="child.id" class="child-node">
          <div class="connection-line"></div>
          <TopologyNode
            :node="child"
            :zone="child.zone || zone"
            @add-branch="$emit('add-branch', $event)"
            @configure="$emit('configure', $event)"
          />
        </div>
      </div>
    </div>
  `,
  methods: {
    handleNodeClick() {
      console.log('Node clicked:', this.node, 'Zone:', this.zone)
      if (this.node.type === 'add') {
        this.$emit('add-branch', this.node)
      } else if (this.node.type === 'subnet' || this.node.type === 'subnet-configured' || this.node.type === 'config') {
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
      class="topology-node add"
      :class="{
        'zone-internal': zone === 'internal',
        'zone-dmz': zone === 'dmz',
        'zone-attack': zone === 'attack'
      }"
      @click="$emit('add', zone)"
    >
      +
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

// 美化的设备配置对话框组件
const DeviceConfigDialog = defineComponent({
  props: {
    modelValue: Boolean,
    device: Object
  },
  emits: ['update:modelValue', 'confirm'],
  setup(props, { emit }) {
    const deviceType = ref('')
    const system = ref('')
    const ip = ref('')
    const image = ref('')

    // 设备类型选项（严格按照图2）
    const deviceTypeOptions = [
      'Web服务器',
      '数据库服务器',
      'ftp服务器',
      'Ad域控',
      '攻击机'
    ]

    // 系统选项（严格按照图2格式）
    const systemOptions = {
      'Web服务器': ['apache+php', 'apache+python', 'apache+java'],
      '数据库服务器': ['mysql','oceanbase','MongoDB'],
      'ftp服务器': ['FTP','Pure-FTPd'],
      'Ad域控': ['Linux', 'windows'],
      '攻击机': ['kali', 'windows']
    }

    // 镜像选项（严格按照图2格式）
    const imageOptions = {
      'apache+php': ['php:apache'],
      'apache+python': ['apache:python'],
      'apache+java': ['apache:java'],
      'mysql': ['mysql:latest'],
      'oceanbase': ['oceanbase:latest'],
      'MongoDB': ['mangodb'],
      'FTP': ['fauria/vsftpd'],
      'Pure-FTPd': ['stilliard/pure-ftpd'],
      'Linux': ['dperson/samba'],
      'windows': ['windows:ad'],
      'kali': ['Kalilinux/kali-rolling']
    }

    // 监听device prop变化，更新表单数据
    watch(() => props.device, (newDevice) => {
      if (newDevice) {
        deviceType.value = newDevice.type || ''
        system.value = newDevice.system || ''
        ip.value = newDevice.ip || ''
        image.value = newDevice.image || ''
      }
    }, { immediate: true })

    // 监听设备类型变化，自动更新系统和镜像
    watch(deviceType, (newType) => {
      if (newType && systemOptions[newType]) {
        system.value = systemOptions[newType][0] || ''
      }
    })

    watch(system, (newSystem) => {
      if (newSystem && imageOptions[newSystem]) {
        image.value = imageOptions[newSystem][0] || ''
      }
    })

    const validateIP = (ip) => {
      const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
      return ipRegex.test(ip)
    }

    const handleConfirm = () => {
      if (!deviceType.value || !system.value || !ip.value || !image.value) {
        ElMessage.error('请填写所有必填项')
        return
      }

      if (!validateIP(ip.value)) {
        ElMessage.error('请输入有效的IP地址格式')
        return
      }

      emit('confirm', {
        type: deviceType.value,
        system: system.value,
        ip: ip.value,
        image: image.value
      })

      resetForm()
    }

    const handleCancel = () => {
      resetForm()
      emit('update:modelValue', false)
    }

    const resetForm = () => {
      deviceType.value = ''
      system.value = ''
      ip.value = ''
      image.value = ''
    }

    return {
      deviceType,
      system,
      ip,
      image,
      deviceTypeOptions,
      systemOptions,
      imageOptions,
      handleConfirm,
      handleCancel
    }
  },
  template: `
    <div v-if="modelValue" class="dialog-overlay" @click.self="handleCancel">
      <div class="device-dialog">
        <div class="dialog-header">
          <h3>⚙️ 设备配置</h3>
          <button class="close-btn" @click="handleCancel">×</button>
        </div>

        <div class="dialog-body">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">设备类型 <span class="required">*</span></label>
              <select v-model="deviceType" class="form-select">
                <option value="">请选择设备类型</option>
                <option v-for="type in deviceTypeOptions" :key="type" :value="type">
                  {{ type }}
                </option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">系统/服务 <span class="required">*</span></label>
              <select v-model="system" class="form-select" :disabled="!deviceType">
                <option value="">请选择系统</option>
                <option v-for="sys in systemOptions[deviceType] || []" :key="sys" :value="sys">
                  {{ sys }}
                </option>
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">IP地址 <span class="required">*</span></label>
              <input
                v-model="ip"
                type="text"
                class="form-input"
                placeholder="例如: 192.168.1.10"
              />
            </div>

            <div class="form-group">
              <label class="form-label">Docker镜像 <span class="required">*</span></label>
              <select v-model="image" class="form-select" :disabled="!system">
                <option value="">请选择镜像</option>
                <option v-for="img in imageOptions[system] || []" :key="img" :value="img">
                  {{ img }}
                </option>
              </select>
            </div>
          </div>

          <div class="form-tips">
            <div class="tip-item">
              <span class="tip-icon">💡</span>
              <span class="tip-text">系统选项会根据设备类型自动筛选</span>
            </div>
            <div class="tip-item">
              <span class="tip-icon">🐳</span>
              <span class="tip-text">Docker镜像会根据系统类型自动匹配</span>
            </div>
          </div>
        </div>

        <div class="dialog-footer">
          <button class="btn btn-secondary" @click="handleCancel">
            <span class="btn-icon">❌</span>
            取消
          </button>
          <button class="btn btn-primary" @click="handleConfirm">
            <span class="btn-icon">✅</span>
            确定
          </button>
        </div>
      </div>
    </div>
  `
})

// 节点配置对话框组件(旧版本)
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
    const image = ref('php:apache')

    const nodeTypeOptions = [
      'Web服务器',
      '数据库服务器',
      'ftp服务器',
      'Ad域控',
      '攻击机'
    ]

    const systemOptions = {
      'Web服务器': ['apache+php', 'apache+python', 'apache+java'],
      '数据库服务器': ['mysql','oceanbase','MongoDB'],
      'ftp服务器': ['FTP','Pure-FTPd'],
      'Ad域控': ['Linux', 'windows'],
      '攻击机': ['kali', 'windows']
    }

    const imageOptions = {
      'apache+php': ['php:apache'],
      'apache+python': ['apache:python'],
      'apache+java': ['apache:java'],
      'mysql': ['mysql:latest'],
      'oceanbase': ['oceanbase:latest'],
      'MongoDB': ['mangodb'],
      'FTP': ['fauria/vsftpd'],
      'Pure-FTPd': ['stilliard/pure-ftpd'],
      'Linux': ['dperson/samba'],
      'windows': ['windows:ad'],
      'kali': ['Kalilinux/kali-rolling']
    }

    const validateIP = (ip) => {
      const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
      return ipRegex.test(ip)
    }

    const handleConfirm = () => {
      if (!nodeType.value || !system.value || !ip.value || !image.value) {
        ElMessage.error('请填写所有必填项')
        return
      }

      if (!validateIP(ip.value)) {
        ElMessage.error('请输入有效的IP地址格式')
        return
      }

      emit('confirm', {
        nodeType: nodeType.value,
        system: system.value,
        ip: ip.value,
        image: image.value
      })
      resetForm()
      emit('update:modelValue', false)
    }

    const handleCancel = () => {
      resetForm()
      emit('update:modelValue', false)
    }

    const resetForm = () => {
      nodeType.value = 'Web服务器'
      system.value = 'apache+php'
      ip.value = ''
      image.value = 'php:apache'
    }

    // 当节点类型改变时，自动更新系统选项
    const updateSystemOptions = () => {
      const systems = systemOptions[nodeType.value]
      if (systems && systems.length > 0) {
        system.value = systems[0]
      }
    }

    // 当系统改变时，自动更新镜像选项
    const updateImageOptions = () => {
      const images = imageOptions[system.value]
      if (images && images.length > 0) {
        image.value = images[0]
      }
    }

    // 监听节点类型变化
    watch(nodeType, updateSystemOptions)

    // 监听系统变化
    watch(system, updateImageOptions)

    return {
      nodeType,
      system,
      ip,
      image,
      nodeTypeOptions,
      systemOptions,
      imageOptions,
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
            <option v-for="img in imageOptions[system] || []" :key="img" :value="img">
              {{ img }}
            </option>
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

// 存储创建的题目ID和部署ID
const questionId = ref<number | null>(null)
const deployId = ref<number | null>(null)

// 存储设备配置数据，待第四步使用
const deviceConfigData = ref<any>(null)

// 第四步：拓扑图生成相关状态
const generationState = ref<'idle' | 'processing' | 'rendering' | 'completed' | 'failed'>('idle')
const processingProgress = ref(0)
const generatedTopologyImage = ref('')
const generationError = ref('')

// 表单数据
const formData = ref({
  title: '',
  description: '',
  enabled: true,
  flag: '',
  tagId: '',
  validTime: 3600,
  difficulty: 3,
  maxAttempts: 20,
  requirements: ''
})

// 分值配置 - 严格按照API接口字段
const scoreConfig = ref({
  max_score: 200,            // 最大分值（基础分值）
  min_score: 50,             // 最小分值
  decay_type: 'LINEAR',      // 衰减类型：STATIC, LINEAR, LOGARITHMIC
  decay: 1                   // 衰减因子
})

// 新的网络配置数据结构
const networkConfig = ref({
  internal: {
    subnet: '',    // 子网地址段
    devices: []    // 设备列表
  },
  dmz: {
    subnet: '',
    devices: []
  },
  attack: {
    subnet: '',
    devices: []
  }
})

// 设备配置弹窗相关
const showDeviceDialog = ref(false)
const currentEditingDevice = ref({
  zone: '',
  index: -1,
  device: null
})

// 旧拓扑数据(保留向后兼容)
const topology = ref({
  internal: [],    // 内网节点
  dmz: [],         // DMZ节点
  attack: []       // 攻击区节点
})

// 标签选项数据（硬编码）
const tagOptions = ref<Tag[]>([
  { tag_id: 1, tag: '电子数据取证' },
  { tag_id: 2, tag: '渗透测试' },
  { tag_id: 3, tag: '系统安全' },
  { tag_id: 4, tag: '密码技术与应用' },
  { tag_id: 5, tag: '恶意软件分析' }
])

// 第六步：部署配置相关状态
const deployConfig = ref({
  dockerType: '',
  frpType: ''
})

const deployState = ref<'idle' | 'deploying' | 'success' | 'failed'>('idle')
const deployError = ref('')

// 检测到的端口配置
const detectedPorts = ref<Array<{
  portNumber: string,
  targetPort: string,
  config: {
    name: string,
    frp_type: string,
    description: string
  }
}>>([])

// Docker Compose相关状态
const dockerGenerationState = ref<'idle' | 'generating' | 'completed' | 'failed'>('idle')
const dockerGenerationError = ref('')
const dockerComposeContent = ref('')

// 页面加载时的钩子（已移除标签API调用）
// onMounted(() => {
//   fetchTags()
// })

// 添加调试函数
const logTopology = () => {
  console.log('Current topology:', JSON.stringify(topology.value, null, 2))
}

const logDevicesData = () => {
  const devices = convertTopologyToDevices()
  console.log('Converted devices data:', JSON.stringify(devices, null, 2))
  console.log('Deploy ID:', deployId.value)
  console.log('Scenario (requirements):', formData.value.requirements)
  ElMessage.success(`设备数据已打印到控制台，共 ${devices.length} 个区域`)
}



// 获取所有已配置的节点（包括嵌套的子节点）
const getAllConfiguredNodes = () => {
  const findConfiguredNodes = (nodes) => {
    let configuredNodes = []
    for (const node of nodes) {
      if (node.configured === true) {
        configuredNodes.push(node)
      }
      if (node.children && node.children.length > 0) {
        configuredNodes = configuredNodes.concat(findConfiguredNodes(node.children))
      }
    }
    return configuredNodes
  }

  const allZones = [...topology.value.internal, ...topology.value.dmz, ...topology.value.attack]
  return findConfiguredNodes(allZones)
}

// 对话框状态
const showSubnetDialog = ref(false)
const showNodeDialog = ref(false)
const currentConfigNode = ref(null)
const currentSubnetConfig = ref(null)

// 节点ID计数器
const nodeIdCounter = ref(1)

// 第五步：Docker Compose生成状态 (已在上面声明)

// 计算属性
const canProceed = computed(() => {
  if (currentStep.value === 1) {
    return formData.value.title.trim() !== '' &&
           formData.value.description.trim() !== '' &&
           formData.value.flag.trim() !== '' &&
           formData.value.tagId !== '' &&
           formData.value.difficulty > 0
  }
  if (currentStep.value === 2) {
    return formData.value.requirements.trim() !== ''
  }
  if (currentStep.value === 3) {
    // 第三步使用新的网络配置验证逻辑
    const zones = ['internal', 'dmz', 'attack']
    return zones.some(zone => {
      const config = networkConfig.value[zone]
      return config.subnet.trim() !== '' && config.devices.length > 0
    })
  }
  return true
})

const canSubmit = computed(() => {
  if (currentStep.value === 3) {
    // 第三步需要至少有一个配置好的节点（包括嵌套的子节点）
    return getAllConfiguredNodes().length > 0
  }
  return formData.value.requirements.trim() !== ''
})

// 第六步相关计算属性
const canPreviewDeploy = computed(() => {
  return deployConfig.value.dockerType.trim() !== '' &&
         deployConfig.value.frpType.trim() !== '' &&
         detectedPorts.value.every(port => 
           port.config.name.trim() !== '' &&
           port.config.frp_type.trim() !== '' &&
           port.config.description.trim() !== ''
         )
})

const canDeploy = computed(() => {
  return canPreviewDeploy.value &&
         questionId.value &&
         deployId.value &&
         dockerComposeContent.value.trim() !== '' &&
         scoreConfig.value.decay_type.trim() !== ''
})

// 方法
const nextStep = async () => {
  if (!canProceed.value || currentStep.value > 7) {
    return
  }

  try {
    // 根据当前步骤调用相应的API
    if (currentStep.value === 1) {
      // 第一步完成时，创建题目
      await createQuestionStep()
    } else if (currentStep.value === 2) {
      // 第二步完成时，提交scenario数据
      await submitScenarioStep()
    } else if (currentStep.value === 3) {
      // 第三步完成时，收集设备配置数据并提交到后端
      await collectDeviceConfigStep()
    } else if (currentStep.value === 4) {
      // 第四步完成时，直接进入第五步
      // 无需额外处理，直接跳转
    } else if (currentStep.value === 5) {
      // 第五步完成时，解析Docker Compose内容检测端口
      await parseDockerComposeForPorts()
    } else if (currentStep.value === 6) {
      // 第六步完成时，调用部署API
      // 部署成功时才会进入第七步
      return // 部署操作由 startDeploy 方法处理
    }

    currentStep.value++
    ElMessage.success(`进入第${currentStep.value}步`)

  } catch (error) {
    console.error('步骤切换失败:', error)
    ElMessage.error('操作失败，请重试')
  }
}

// 第一步：创建题目
const createQuestionStep = async () => {
  const questionData: CreateQuestionRequest = {
    title: formData.value.title,
    introduction: formData.value.description,
    tag_id: formData.value.tagId,
    is_active: formData.value.enabled,
    flag_prefix: formData.value.flag,
    topology: null, // 初始时拓扑图为空，后续第四步会更新
    valid_time: formData.value.validTime,
    star: formData.value.difficulty
  }

  const response = await createQuestion(questionData)
  console.log('API Response:', response)
  console.log('Response data:', response.data)

  if (response && response.code === 200 && response.data?.question_id) {
    questionId.value = response.data.question_id
    deployId.value = response.data.question_id // 使用question_id作为deploy_id
    ElMessage.success('题目创建成功')
    console.log('Created question ID:', questionId.value)
  } else {
    console.error('API响应不符合预期:', response)
    throw new Error(response?.message || '题目创建失败')
  }
}

// 第二步：提交scenario数据
const submitScenarioStep = async () => {
  if (!deployId.value) {
    throw new Error('缺少部署ID')
  }

  const scenarioData: InputScenarioRequest = {
    deploy_id: deployId.value,
    scenario: formData.value.requirements
  }

  const response = await inputScenario(scenarioData)
  console.log('Scenario API Response:', response)
  if (response.code === 200) {
    ElMessage.success('背景描述保存成功')
    console.log('Scenario saved for deploy_id:', deployId.value)
  } else {
    console.error('Scenario API响应不符合预期:', response)
    throw new Error(response.message || '背景描述保存失败')
  }
}

// 第三步：收集设备配置数据并提交到后端
const collectDeviceConfigStep = async () => {
  if (!deployId.value) {
    throw new Error('缺少部署ID')
  }

  // 收集当前网络配置中的所有设备数据
  const devices = []

  // 定义网络分区映射
  const zoneMapping = {
    'internal': '内网',
    'dmz': 'DMZ',
    'attack': '攻击区'
  }

  // 遍历所有网络分区
  for (const [zoneKey, zoneConfig] of Object.entries(networkConfig.value)) {
    if (zoneConfig.devices && zoneConfig.devices.length > 0) {
      const targetMachines = zoneConfig.devices.map(device => ({
        machine_type: device.type || '未配置',
        system: device.system || '未选择系统',
        ip_address: device.ip || '',
        image: device.image || 'ubuntu:latest' // 默认镜像
      }))

      devices.push({
        zone: zoneMapping[zoneKey] || zoneKey,
        subnet: zoneConfig.subnet || '192.168.1.0/24',
        target_machines: targetMachines
      })
    }
  }

  // 提交设备配置到后端
  const deviceData = {
    deploy_id: deployId.value,
    devices: devices
  }

  console.log('提交设备配置:', deviceData)
  const response = await inputDevices(deviceData)

  if (response.code === 200) {
    ElMessage.success('设备配置提交成功')
    console.log('Device config submitted for deploy_id:', deployId.value)
  } else {
    console.error('设备配置API响应不符合预期:', response)
    throw new Error(response.message || '设备配置提交失败')
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

// 获取选中标签的名称
const getSelectedTagName = () => {
  const selectedTag = tagOptions.value.find(tag => tag.tag_id === formData.value.tagId)
  return selectedTag ? selectedTag.tag : '未选择'
}

// 新的设备管理函数
const addDevice = (zone) => {
  currentEditingDevice.value = {
    zone: zone,
    index: -1,
    device: {
      id: Date.now(),
      type: '',
      system: '',
      ip: '',
      image: ''
    }
  }
  showDeviceDialog.value = true
}

const editDevice = (zone, index) => {
  currentEditingDevice.value = {
    zone: zone,
    index: index,
    device: { ...networkConfig.value[zone].devices[index] }
  }
  showDeviceDialog.value = true
}

const deleteDevice = (zone, index) => {
  networkConfig.value[zone].devices.splice(index, 1)
  ElMessage.success('设备已删除')
}

const handleDeviceConfig = (deviceData) => {
  const { zone, index } = currentEditingDevice.value

  if (index === -1) {
    // 添加新设备
    const newDevice = {
      id: Date.now(),
      ...deviceData
    }
    networkConfig.value[zone].devices.push(newDevice)
    ElMessage.success('设备添加成功')
  } else {
    // 编辑现有设备
    networkConfig.value[zone].devices[index] = {
      ...networkConfig.value[zone].devices[index],
      ...deviceData
    }
    ElMessage.success('设备更新成功')
  }

  showDeviceDialog.value = false
}

// 第三步验证函数
const canProceedStep3 = computed(() => {
  // 至少需要有一个区域配置了子网和设备
  const zones = ['internal', 'dmz', 'attack']
  return zones.some(zone => {
    const config = networkConfig.value[zone]
    return config.subnet.trim() !== '' && config.devices.length > 0
  })
})

// 新的设备配置收集函数
const collectDeviceConfigStepNew = async () => {
  try {
    // 将新的网络配置转换为旧的拓扑格式以保持兼容性
    const convertedTopology = convertNetworkConfigToTopology()

    // 更新旧的topology数据结构以保持兼容
    topology.value = convertedTopology

    // 转换为API需要的格式
    const devices = convertTopologyToDevices()

    if (devices.length === 0) {
      ElMessage.warning('请至少配置一个设备')
      throw new Error('No devices configured')
    }

    console.log('收集的设备配置数据:', devices)

    // 调用设备配置API
    const requestData: InputDevicesRequest = {
      deploy_id: deployId.value!,
      devices: devices
    }

    console.log('发送设备配置请求:', requestData)
    const response = await inputDevices(requestData)
    console.log('设备配置响应:', response)

    if (response && response.code === 200) {
      deviceConfigData.value = devices
      ElMessage.success('设备配置提交成功')
    } else {
      const errorMsg = response?.message || '设备配置提交失败'
      ElMessage.error(errorMsg)
      throw new Error(errorMsg)
    }

  } catch (error) {
    console.error('设备配置步骤失败:', error)
    throw error
  }
}

// 将新的网络配置转换为旧的拓扑格式
const convertNetworkConfigToTopology = () => {
  const convertedTopology = {
    internal: [],
    dmz: [],
    attack: []
  }

  // 遍历每个网络区域
  Object.keys(networkConfig.value).forEach(zone => {
    const config = networkConfig.value[zone]

    if (config.subnet.trim() && config.devices.length > 0) {
      // 为每个区域创建一个子网节点
      const subnetNode = {
        id: `${zone}-subnet`,
        type: 'subnet-configured',
        subnet: config.subnet,
        zone: zone,
        children: []
      }

      // 将设备作为子节点添加到子网下
      config.devices.forEach((device, index) => {
        const deviceNode = {
          id: `${zone}-device-${index}`,
          type: 'configured',
          nodeType: device.type,
          system: device.system,
          ip: device.ip,
          image: device.image,
          zone: zone,
          configured: true
        }
        subnetNode.children.push(deviceNode)
      })

      convertedTopology[zone].push(subnetNode)
    }
  })

  return convertedTopology
}

// 第四步相关辅助函数
const getZoneName = (zone) => {
  const zoneNames = {
    'internal': '内网',
    'dmz': 'DMZ',
    'attack': '攻击区'
  }
  return zoneNames[zone] || zone
}

const getConfiguredNodeCount = (nodes) => {
  let count = 0
  const countNodes = (nodeList) => {
    for (const node of nodeList) {
      if (node.configured && node.type === 'configured') {
        count++
      }
      if (node.children && node.children.length > 0) {
        countNodes(node.children)
      }
    }
  }
  countNodes(nodes)
  return count
}

// 拓扑图生成相关方法
const startTopologyGeneration = async () => {
  try {
    // 重置状态
    generationState.value = 'processing'
    processingProgress.value = 0
    generationError.value = ''

    ElMessage.info('开始生成拓扑图，整个过程可能需要1-3分钟，请耐心等待...')

    // 添加详细的调试信息
    console.log('=== 拓扑生成流程开始 ===')
    console.log('当前deployId:', deployId.value)
    console.log('当前拓扑数据:', JSON.stringify(topology.value, null, 2))

    // 第一步：发送场景描述 (20%) - 快速完成
    console.log('步骤1: 发送场景描述...')
    await sendScenarioDescription()
    processingProgress.value = 20
    console.log('步骤1: 场景描述发送成功')

    // 第二步：发送设备信息 (40%) - 快速完成
    console.log('步骤2: 发送设备信息...')
    await sendDevicesInfo()
    processingProgress.value = 40
    console.log('步骤2: 设备信息发送成功')

    // 第三步：生成拓扑序列 (70%) - 耗时1-2分钟，AI分析需求
    console.log('步骤3: 生成拓扑序列...')
    await generateTopologySequence()
    processingProgress.value = 70
    console.log('步骤3: 拓扑序列生成成功')

    // 切换到渲染阶段
    generationState.value = 'rendering'

    // 第四步：生成拓扑图像 (100%) - 耗时10-30秒，图像渲染
    const imageResult = await generateTopologyImageFile()
    processingProgress.value = 100

    // 完成
    generationState.value = 'completed'
    generatedTopologyImage.value = imageResult.image_url
    ElMessage.success('拓扑图生成完成！')

  } catch (error: any) {
    console.error('=== 拓扑图生成失败 ===')
    console.error('错误详情:', error)
    console.error('当前deployId:', deployId.value)
    console.error('当前步骤进度:', processingProgress.value)

    // 提供更具体的错误信息
    let errorMessage = '生成拓扑图时发生未知错误'
    if (error.message) {
      errorMessage = error.message
    }

    // 根据HTTP状态码提供更友好的错误信息
    if (error.response) {
      const status = error.response.status
      console.error('HTTP状态码:', status)
      console.error('响应数据:', error.response.data)

      if (status === 404) {
        errorMessage = '后端服务未找到对应的部署记录，请检查deployId是否正确'
      } else if (status === 500) {
        errorMessage = '后端服务器错误，请稍后重试或联系管理员'
      } else if (status === 403) {
        errorMessage = '权限不足，请检查登录状态'
      }
    }

    generationState.value = 'failed'
    generationError.value = errorMessage
    ElMessage.error('拓扑图生成失败: ' + errorMessage)
  }
}

// 发送场景描述
const sendScenarioDescription = async () => {
  if (!deployId.value) {
    throw new Error('部署ID不存在')
  }

  const scenarioData: InputScenarioRequest = {
    deploy_id: deployId.value,
    scenario: formData.value.requirements
  }

  console.log('发送场景描述:', scenarioData)
  const response = await inputScenario(scenarioData)
  console.log('场景描述响应:', response)

  // 检查响应是否存在且包含正确的结构
  if (!response || response.code !== 200) {
    throw new Error(response?.message || '发送场景描述失败')
  }

  console.log('场景描述发送成功')
}

// 发送设备信息
const sendDevicesInfo = async () => {
  if (!deployId.value) {
    throw new Error('部署ID不存在')
  }

  // 将拓扑数据转换为API所需的格式
  const devices: DeviceZone[] = convertTopologyToDevices()

  const devicesData: InputDevicesRequest = {
    deploy_id: deployId.value,
    devices: devices
  }

  console.log('发送设备信息:', devicesData)
  const response = await inputDevices(devicesData)
  console.log('设备信息响应:', response)

  if (!response || response.code !== 200) {
    throw new Error(response?.message || '发送设备信息失败')
  }

  console.log('设备信息发送成功')
}

// 生成拓扑序列
const generateTopologySequence = async () => {
  if (!deployId.value) {
    throw new Error('部署ID不存在')
  }

  const topologyData: GenerateTopologyRequest = {
    deploy_id: deployId.value
  }

  console.log('开始生成拓扑序列，Deploy ID:', deployId.value)
  console.log('发送的数据:', topologyData)
  console.log('注意：此步骤可能需要1-2分钟，AI正在分析需求并生成拓扑...')

  try {
    // 增加超时时间，因为这一步可能需要1-2分钟
    const response = await generateTopology(topologyData)
    console.log('拓扑序列生成响应:', response)

    if (!response || response.code !== 200) {
      console.error('拓扑序列生成失败，响应码:', response?.code)
      console.error('错误消息:', response?.message)
      console.error('完整响应数据:', response)
      throw new Error(response?.message || '生成拓扑序列失败')
    }

    console.log('拓扑序列生成成功')
  } catch (error: any) {
    console.error('调用生成拓扑序列API时发生错误:', error)
    console.error('Deploy ID:', deployId.value)
    console.error('错误类型:', error.name)
    console.error('错误码:', error.code)
    console.error('完整错误对象:', error)

    // 重要：区分HTTP错误和业务逻辑错误
    if (error.businessError) {
      // 这是业务逻辑错误（后端返回HTTP 200但code不是200）
      console.error('业务逻辑错误:', error.message)
      console.error('响应状态码:', error.response?.status)
      console.error('业务错误码:', error.response?.data?.code)
      console.error('业务错误信息:', error.response?.data?.message)

      throw new Error(`生成拓扑序列失败: ${error.message}`)
    } else if (error.response) {
      // 这是真正的HTTP错误（404, 500, 504等）
      const status = error.response.status
      const data = error.response.data
      console.error('HTTP错误状态:', status)
      console.error('错误响应数据:', JSON.stringify(data, null, 2))
      console.error('响应头:', error.response.headers)

      if (status === 404) {
        throw new Error(`部署记录不存在 (ID: ${deployId.value})，请确认前面的步骤是否成功保存数据`)
      } else if (status === 500) {
        const detail = data?.detail || data?.message || '服务器处理异常'
        throw new Error(`服务器内部错误 (500): ${detail}。这通常是后端处理时出现异常，请检查后端日志或稍后重试。`)
      } else if (status === 504) {
        throw new Error(`请求超时 (504): 服务器处理时间过长，这可能是因为AI分析需要更多时间。请稍后重试。`)
      } else {
        throw new Error(`HTTP ${status}: ${data?.detail || data?.message || error.message}`)
      }
    } else if (error.request) {
      // 网络连接错误
      console.error('请求详情:', error.request)
      throw new Error('网络连接失败，请检查网络状态和后端服务是否正常运行')
    } else {
      // 其他未知错误
      console.error('未知错误:', error.message)
      throw error
    }
  }
}

// 生成拓扑图像
const generateTopologyImageFile = async () => {
  if (!deployId.value) {
    throw new Error('部署ID不存在')
  }

  const imageData: GenerateTopologyRequest = {
    deploy_id: deployId.value
  }

  console.log('开始生成拓扑图像，Deploy ID:', deployId.value)
  
  // 调用POST接口生成拓扑图像
  const response = await generateTopologyImage(imageData)
  console.log('拓扑图像生成响应:', response)

  if (!response || response.code !== 200) {
    console.error('拓扑图像生成失败，响应:', response)
    throw new Error(response?.message || '生成拓扑图像失败')
  }

  console.log('拓扑图像生成成功，构建图片访问链接...')
  
  // 构建完整的图片访问URL
  const imageUrl = `http://81.70.202.254:5005/api/deploy/topology_image/${deployId.value}`
  console.log('拓扑图像访问链接:', imageUrl)
  
  return {
    image_url: imageUrl
  }
}

// 将拓扑数据转换为API所需的设备格式
const convertTopologyToDevices = (): DeviceZone[] => {
  const devices: DeviceZone[] = []

  // 直接从 networkConfig 转换数据
  Object.keys(networkConfig.value).forEach(zone => {
    const config = networkConfig.value[zone]

    if (config.subnet.trim() && config.devices.length > 0) {
      const targetMachines: TargetMachine[] = []

      // 转换每个设备
      config.devices.forEach(device => {
        const machine: TargetMachine = {
          machine_type: device.type || 'Web服务器',
          system: device.system || 'apache+php',
          ip_address: device.ip || '自动分配',
          image: device.image || 'php:apache'
        }
        targetMachines.push(machine)
      })

      const zoneNames = {
        'internal': '内网区',
        'dmz': 'DMZ区',
        'attack': '攻击区'
      }

      const deviceZone: DeviceZone = {
        zone: zoneNames[zone as keyof typeof zoneNames] || zone,
        subnet: config.subnet,
        target_machines: targetMachines
      }

      devices.push(deviceZone)
    }
  })

  return devices
}

// 将单个区域的节点转换为设备信息
const convertZoneToDevices = (nodes: any[], zone: string, defaultSubnet: string): DeviceZone | null => {
  const targetMachines: TargetMachine[] = []

  const processNodes = (nodeList: any[]) => {
    for (const node of nodeList) {
      if (node.configured && node.type === 'configured') {
        const machine: TargetMachine = {
          machine_type: node.nodeType || 'Web服务器',
          system: node.system || 'apache+php',
          ip_address: node.ip || '自动分配',
          image: node.image || 'php:apache'
        }
        targetMachines.push(machine)
      }

      // 递归处理子节点
      if (node.children && node.children.length > 0) {
        processNodes(node.children)
      }
    }
  }

  processNodes(nodes)

  if (targetMachines.length === 0) {
    return null
  }

  const zoneNames = {
    'internal': '内网区',
    'dmz': 'DMZ区',
    'attack': '攻击区'
  }

  return {
    zone: zoneNames[zone as keyof typeof zoneNames] || zone,
    subnet: defaultSubnet,
    target_machines: targetMachines
  }
}

const downloadTopology = () => {
  if (!generatedTopologyImage.value) {
    ElMessage.error('没有可下载的拓扑图')
    return
  }

  try {
    // 创建下载链接
    const link = document.createElement('a')
    link.href = generatedTopologyImage.value
    link.download = `topology_${deployId.value || 'generated'}.svg`
    link.target = '_blank'
    link.rel = 'noopener noreferrer'

    // 触发下载
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    ElMessage.success('拓扑图下载已开始')
  } catch (error) {
    console.error('下载失败:', error)
    ElMessage.error('下载拓扑图失败')
  }
}

const regenerateTopology = () => {
  // 重置状态并重新开始生成
  generationState.value = 'idle'
  generatedTopologyImage.value = ''
  processingProgress.value = 0
  generationError.value = ''
  ElMessage.info('准备重新生成拓扑图')
}

// 检查部署状态的调试函数
const checkDeployStatus = () => {
  console.log('=== 部署状态检查 ===')
  console.log('当前deployId:', deployId.value)
  console.log('当前questionId:', questionId.value)
  console.log('题目数据:', JSON.stringify(formData.value, null, 2))
  console.log('拓扑数据:', JSON.stringify(topology.value, null, 2))

  // 检查是否有配置的设备
  const devices = convertTopologyToDevices()
  console.log('转换后的设备数据:', JSON.stringify(devices, null, 2))

  if (!deployId.value) {
    ElMessage.warning('❌ 部署ID不存在，请确保已完成前面的步骤')
    return
  }

  if (devices.length === 0) {
    ElMessage.warning('❌ 没有配置任何设备，请先配置网络设备')
    return
  }

  if (!formData.value.requirements) {
    ElMessage.warning('❌ 缺少场景描述，请在第一步中添加需求描述')
    return
  }

  ElMessage.success('✅ 基础检查通过，deployId和设备数据都存在')
}

const finalSubmit = () => {
  console.log('最终提交...')
  ElMessage.success('CTF题目创建完成！')
}

// Docker Compose相关方法
const startDockerGeneration = async () => {
  try {
    // 重置状态
    dockerGenerationState.value = 'generating'
    dockerGenerationError.value = ''

    ElMessage.info('正在生成Docker Compose文件，这可能需要2-3分钟，请耐心等待...')

    if (!deployId.value) {
      throw new Error('部署ID不存在')
    }

    const requestData: GenerateTopologyRequest = {
      deploy_id: deployId.value
    }

    console.log('开始生成Docker Compose，Deploy ID:', deployId.value)
    const response = await generateDockerCompose(requestData)
    console.log('Docker Compose生成响应:', response)

    if (!response || response.code !== 200) {
      throw new Error(response?.message || '生成Docker Compose文件失败')
    }

    // 生成成功后，立即获取真实的compose文件内容
    console.log('开始获取compose文件内容，Deploy ID:', deployId.value)
    const composeResponse = await getComposeFile(deployId.value)
    console.log('获取compose文件响应:', composeResponse)

    if (!composeResponse || composeResponse.code !== 200 || !composeResponse.data?.compose_file) {
      throw new Error('获取compose文件内容失败')
    }

    dockerComposeContent.value = composeResponse.data.compose_file
    dockerGenerationState.value = 'completed'
    ElMessage.success('Docker Compose文件生成完成！')

  } catch (error: any) {
    console.error('Docker Compose生成失败:', error)
    dockerGenerationState.value = 'failed'
    
    // 更详细的错误处理
    let errorMessage = error.message || '生成Docker Compose文件时发生未知错误'
    
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      errorMessage = '请求超时，后端AI生成需要较长时间，请稍后重试'
    } else if (error.response?.status === 502) {
      errorMessage = '服务器网关错误，可能是后端AI服务超时，请稍后重试'
    } else if (error.response?.status === 500) {
      errorMessage = '服务器内部错误，可能是AI生成失败，请联系管理员或稍后重试'
    }
    
    dockerGenerationError.value = errorMessage
    ElMessage.error('Docker Compose生成失败: ' + errorMessage)
  }
}

// 硬编码的generateSampleDockerCompose函数已移除
// 现在直接从后端API获取真实的compose文件内容

const copyDockerContent = () => {
  if (!dockerComposeContent.value) {
    ElMessage.error('没有可复制的内容')
    return
  }

  try {
    navigator.clipboard.writeText(dockerComposeContent.value).then(() => {
      ElMessage.success('Docker Compose内容已复制到剪贴板')
    }).catch(() => {
      // 降级方案
      const textArea = document.createElement('textarea')
      textArea.value = dockerComposeContent.value
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      ElMessage.success('Docker Compose内容已复制到剪贴板')
    })
  } catch (error) {
    console.error('复制失败:', error)
    ElMessage.error('复制失败，请手动复制')
  }
}

const downloadDockerFile = () => {
  if (!dockerComposeContent.value) {
    ElMessage.error('没有可下载的内容')
    return
  }

  try {
    const blob = new Blob([dockerComposeContent.value], { type: 'text/yaml' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `docker-compose-${deployId.value || 'generated'}.yml`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    ElMessage.success('Docker Compose文件下载已开始')
  } catch (error) {
    console.error('下载失败:', error)
    ElMessage.error('下载Docker Compose文件失败')
  }
}

const regenerateDocker = () => {
  // 重置状态并重新开始生成
  dockerGenerationState.value = 'idle'
  dockerComposeContent.value = ''
  dockerGenerationError.value = ''
  ElMessage.info('准备重新生成Docker Compose文件')
}

// 第六步相关方法

const createNew = () => {
  // 创建新题目的逻辑
  console.log('创建新题目')

  // 重置所有表单数据
  formData.value = {
    title: '',
    description: '',
    enabled: true,
    flag: '',
    tagId: '',
    validTime: 3600,
    difficulty: 3,
    maxAttempts: 20,
    requirements: ''
  }

  // 重置网络配置
  networkConfig.value = {
    internal: {
      subnet: '',
      devices: []
    },
    dmz: {
      subnet: '',
      devices: []
    },
    attack: {
      subnet: '',
      devices: []
    }
  }

  // 重置拓扑数据
  topology.value = {
    internal: [],
    dmz: [],
    attack: []
  }

  // 重置所有状态
  currentStep.value = 1
  questionId.value = null
  deployId.value = null
  generationState.value = 'idle'
  dockerGenerationState.value = 'idle'
  generatedTopologyImage.value = ''
  dockerComposeContent.value = ''
  generationError.value = ''
  dockerGenerationError.value = ''
  processingProgress.value = 0

  ElMessage.success('已重置所有数据，可以开始创建新题目')
}

// 第六步：端口解析和部署相关方法
const parseDockerComposeForPorts = async () => {
  try {
    const content = dockerComposeContent.value
    if (!content) {
      ElMessage.warning('没有找到Docker Compose内容')
      return
    }

    // 解析端口占位符的正则表达式：匹配 #PORT[1-9]\d*#:端口号
    const portRegex = /#PORT(\d+)#:(\d+)/g
    const foundPorts = []
    
    let match
    while ((match = portRegex.exec(content)) !== null) {
      const portNumber = match[1]
      const targetPort = match[2]
      
      // 只处理PORT1、PORT2等，不处理PORT0
      if (parseInt(portNumber) > 0) {
        foundPorts.push({
          portNumber: portNumber,
          targetPort: targetPort,
          config: {
            name: '',
            frp_type: '',
            description: ''
          }
        })
      }
    }

    detectedPorts.value = foundPorts
    
    if (foundPorts.length > 0) {
      ElMessage.success(`检测到 ${foundPorts.length} 个需要配置的端口`)
    } else {
      ElMessage.info('未检测到需要配置的端口占位符')
    }

  } catch (error) {
    console.error('解析Docker Compose端口失败:', error)
    ElMessage.error('解析端口配置失败')
  }
}

const formatDeployConfig = () => {
  // 格式化部署配置预览
  const config = {
    deploy_id: deployId.value,
    question_id: questionId.value,
    docker_type: deployConfig.value.dockerType,
    frp_type: deployConfig.value.frpType,
    config: {
      extend_ports: detectedPorts.value.map(port => ({
        name: port.config.name,
        frp_type: port.config.frp_type,
        description: port.config.description
      }))
    }
  }
  
  return JSON.stringify(config, null, 2)
}

const startDeploy = async () => {
  try {
    deployState.value = 'deploying'
    deployError.value = ''

    // 构建部署请求数据
    const deployRequestData: DeployToQuestionRequest = {
      deploy_id: deployId.value!,
      question_id: questionId.value!,
      docker_type: deployConfig.value.dockerType as any,
      frp_type: deployConfig.value.frpType as any,
      config: {
        extend_ports: detectedPorts.value.map(port => ({
          name: port.config.name,
          frp_type: port.config.frp_type as any,
          description: port.config.description
        }))
      }
    }

    console.log('开始部署，请求数据:', deployRequestData)
    
    // 调用真实的部署API
    const response = await deployToQuestion(deployRequestData)
    
    if (response.code !== 200) {
      throw new Error(response.message || '部署失败')
    }
    
    // 部署成功后配置分值
    await configureScoreStep()
    
    deployState.value = 'success'
    ElMessage.success('部署和分值配置成功！')
    
    // 部署成功后自动进入下一步
    setTimeout(() => {
      currentStep.value = 7
    }, 1000)

  } catch (error: any) {
    console.error('部署失败:', error)
    deployState.value = 'failed'
    deployError.value = error.message || '部署过程中发生未知错误'
    ElMessage.error('部署失败: ' + deployError.value)
  }
}

// 配置分值
const configureScoreStep = async () => {
  if (!deployId.value || !questionId.value) {
    throw new Error('缺少必要的ID信息')
  }

  // 验证分值配置数据
  if (!scoreConfig.value.decay_type) {
    throw new Error('请选择衰减类型')
  }

  const scoreData: ScoreConfigRequest = {
    deploy_id: deployId.value,
    question_id: questionId.value,
    decay_type: scoreConfig.value.decay_type,
    decay: scoreConfig.value.decay,
    min_score: scoreConfig.value.min_score,
    max_score: scoreConfig.value.max_score
  }

  console.log('配置分值，请求数据:', scoreData)
  
  const response = await configureScore(scoreData)
  
  if (response.code !== 200) {
    throw new Error(response.message || '分值配置失败')
  }
  
  console.log('分值配置成功')
}

// 拓扑相关方法
const addInitialNode = (zone) => {
  const nodeId = ++nodeIdCounter.value
  const newNode = {
    id: nodeId,
    zone: zone, // 确保zone值正确传递
    type: 'add',
    configured: false,
    children: []
  }
  topology.value[zone].push(newNode)
  console.log(`Added initial node to ${zone}:`, newNode)
  logTopology()
}

const addBranch = (parentNode) => {
  const nodeId = ++nodeIdCounter.value

  // 如果父节点是"加号"节点，转换为子网配置节点
  if (parentNode.type === 'add') {
    parentNode.type = 'subnet'
    parentNode.label = '配置子网网段'
    showSubnetDialog.value = true
    currentSubnetConfig.value = parentNode
  } else {
    // 否则添加新的子节点
    const newNode = {
      id: nodeId,
      zone: parentNode.zone,
      type: 'subnet',
      configured: false,
      children: [],
      parent: parentNode.id,
      label: '配置子网网段'
    }
    parentNode.children.push(newNode)
    showSubnetDialog.value = true
    currentSubnetConfig.value = newNode
  }
}

const configureNode = (node) => {
  if (node.type === 'subnet' || node.type === 'subnet-configured') {
    showSubnetDialog.value = true
    currentSubnetConfig.value = node
  } else if (node.type === 'config' || node.type === 'configured' || node.type === 'add') {
    // add类型节点也可以配置，配置后会变成configured类型
    showNodeDialog.value = true
    currentConfigNode.value = node
  }
}

const handleSubnetConfig = (subnetData) => {
  if (currentSubnetConfig.value) {
    currentSubnetConfig.value.subnet = subnetData.subnet
    currentSubnetConfig.value.label = subnetData.subnet
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

    // 添加新的"加号"节点用于继续扩展
    const addNode = {
      id: ++nodeIdCounter.value,
      zone: currentSubnetConfig.value.zone,
      type: 'add',
      configured: false,
      children: [],
      parent: currentSubnetConfig.value.id
    }
    currentSubnetConfig.value.children.push(addNode)

    console.log('Configured subnet:', currentSubnetConfig.value)
    logTopology()
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

    console.log('Configured node:', currentConfigNode.value)

    // 如果当前节点是父级节点的唯一子节点，且父级还有空间，添加新的扩展节点
    const parentZone = topology.value[currentConfigNode.value.zone]
    const parentNode = findNodeById(parentZone, currentConfigNode.value.parent)

    console.log('Found parent node:', parentNode)

    if (parentNode && parentNode.children.length < 5) { // 限制每个分支最多5个子节点
      const addNode = {
        id: ++nodeIdCounter.value,
        zone: currentConfigNode.value.zone,
        type: 'add',
        configured: false,
        children: [],
        parent: currentConfigNode.value.parent
      }
      parentNode.children.push(addNode)
      console.log('Added new add node:', addNode)
    }

    logTopology()
  }
  showNodeDialog.value = false
  currentConfigNode.value = null
}

// 辅助函数：根据ID查找节点
const findNodeById = (nodes, targetId) => {
  for (const node of nodes) {
    if (node.id === targetId) {
      return node
    }
    if (node.children && node.children.length > 0) {
      const found = findNodeById(node.children, targetId)
      if (found) return found
    }
  }
  return null
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
  color: #e2ebf7;
  transition: all 0.3s ease;
}

.progress-step.active .step-label {
  color: #6eafff;
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
  padding: 12px 40px;
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
  padding: 12px 40px;
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
.form-textarea,
.form-select {
  padding: 8px 12px;
  border: 2px solid #e5e7eb;
  border-radius: 6px;
  font-size: 0.85rem;
  transition: all 0.2s ease;
  background: #fafbfc;
  font-family: inherit;
}

.form-input:focus,
.form-textarea:focus,
.form-select:focus {
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
  padding: 20px 40px;
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
  min-width: 100px;
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
  flex-shrink: 0;
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

.default-node {
  display: flex;
  flex-direction: column;
  gap: 4px;
  text-align: center;
}

.node-details {
  font-size: 0.8rem;
  opacity: 0.8;
}

/* 节点连接线 - 横向树布局 */
.topology-node-container {
  position: relative;
  display: flex;
  flex-direction: row;
  align-items: flex-start;
}

.node-connections {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-left: 30px;
  margin-top: 10px;
}

.child-node {
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-bottom: 10px;
}

.connection-line {
  width: 30px;
  height: 2px;
  background: #d1d5db;
  margin-right: 10px;
  margin-top: 30px;
  flex-shrink: 0;
}

.child-nodes {
  display: flex;
  flex-direction: row;
  gap: 20px;
  align-items: flex-start;
  flex-wrap: nowrap;
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

/* 第四步：拓扑图生成样式 */
.topology-generation {
  padding: 20px 0;
}

.config-summary {
  background: #f8fafc;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 30px;
  border: 1px solid #e2e8f0;
}

.config-summary h4 {
  margin: 0 0 16px 0;
  color: #334155;
  font-size: 1.1rem;
  font-weight: 600;
}

.summary-grid {
  display: grid;
  gap: 16px;
}

.summary-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.summary-label {
  font-weight: 600;
  color: #475569;
  min-width: 100px;
}

.summary-value {
  color: #1e293b;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.zone-tag {
  background: #e0f2fe;
  color: #0369a1;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 4px;
}

.node-count {
  background: #0369a1;
  color: white;
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 0.75rem;
}

.generation-area {
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 16px;
  padding: 40px;
  text-align: center;
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 未开始生成状态 */
.generation-idle {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.idle-icon {
  font-size: 4rem;
  margin-bottom: 10px;
}

.generation-idle h4 {
  color: #1e293b;
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
}

.generation-idle p {
  color: #64748b;
  font-size: 1rem;
  margin: 0;
}

.generate-btn {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  border: none;
  padding: 16px 32px;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.generate-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(59, 130, 246, 0.4);
}

.debug-btn {
  background: linear-gradient(135deg, #ffa726 0%, #ff7043 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 10px rgba(255, 167, 38, 0.3);
}

.debug-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 15px rgba(255, 167, 38, 0.5);
}

.button-group {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 10px;
}

/* 处理中状态 */
.generation-processing {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.processing-animation {
  margin-bottom: 20px;
}

.spinner {
  width: 60px;
  height: 60px;
  border: 4px solid #e2e8f0;
  border-top: 4px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.generation-processing h4 {
  color: #1e293b;
  font-size: 1.3rem;
  font-weight: 600;
  margin: 0;
}

.generation-processing p {
  color: #64748b;
  margin: 0;
}

.progress-bar {
  width: 300px;
  height: 8px;
  background: #e2e8f0;
  border-radius: 4px;
  overflow: hidden;
  margin: 20px 0 10px 0;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #1d4ed8);
  border-radius: 4px;
  transition: width 0.5s ease;
}

.progress-text {
  color: #3b82f6;
  font-weight: 600;
  font-size: 0.9rem;
}

/* 渲染中状态 */
.generation-rendering {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.rendering-animation {
  margin-bottom: 20px;
}

.pulse-circle {
  width: 60px;
  height: 60px;
  background: #3b82f6;
  border-radius: 50%;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  50% {
    transform: scale(1.2);
    opacity: 1;
  }
  100% {
    transform: scale(0.8);
    opacity: 0.5;
  }
}

.generation-rendering h4 {
  color: #1e293b;
  font-size: 1.3rem;
  font-weight: 600;
  margin: 0;
}

.generation-rendering p {
  color: #64748b;
  margin: 0;
}

.dots-loading {
  display: flex;
  gap: 8px;
  margin-top: 20px;
}

.dot {
  width: 8px;
  height: 8px;
  background: #3b82f6;
  border-radius: 50%;
  animation: dotPulse 1.4s ease-in-out infinite both;
}

.dot:nth-child(1) { animation-delay: -0.32s; }
.dot:nth-child(2) { animation-delay: -0.16s; }
.dot:nth-child(3) { animation-delay: 0s; }

@keyframes dotPulse {
  0%, 80%, 100% {
    transform: scale(0);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

/* 完成状态 */
.generation-completed {
  width: 100%;
}

.topology-result h4 {
  color: #059669;
  font-size: 1.4rem;
  font-weight: 600;
  margin: 0 0 30px 0;
}

.topology-image-container {
  background: #f8fafc;
  border: 2px dashed #cbd5e1;
  border-radius: 12px;
  padding: 20px;
  margin: 20px 0;
  max-width: 100%;
  overflow: hidden;
}

.topology-image {
  max-width: 100%;
  max-height: 500px;
  object-fit: contain;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.result-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  margin-top: 30px;
}

.action-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.download-btn {
  background: #059669;
  color: white;
}

.download-btn:hover {
  background: #047857;
  transform: translateY(-1px);
}

.regenerate-btn {
  background: #6366f1;
  color: white;
}

.regenerate-btn:hover {
  background: #4f46e5;
  transform: translateY(-1px);
}

/* 失败状态 */
.generation-failed {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.error-icon {
  font-size: 4rem;
  margin-bottom: 10px;
}

.generation-failed h4 {
  color: #dc2626;
  font-size: 1.4rem;
  font-weight: 600;
  margin: 0;
}

.error-message {
  color: #64748b;
  margin: 0;
  max-width: 400px;
}

.retry-btn {
  background: #dc2626;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.retry-btn:hover {
  background: #b91c1c;
  transform: translateY(-1px);
}

/* 第五步：部署完成样式 */
.completion-content {
  text-align: center;
  padding: 20px 0;
}

.completion-icon {
  font-size: 4rem;
  margin-bottom: 20px;
}

.completion-content h3 {
  color: #059669;
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0 0 16px 0;
}

.completion-description {
  color: #64748b;
  font-size: 1rem;
  margin: 0 0 30px 0;
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.6;
}

.deployment-summary {
  background: #f8fafc;
  padding: 20px;
  border-radius: 12px;
  margin: 30px 0;
  border: 1px solid #e2e8f0;
  text-align: left;
}

.deployment-summary h4 {
  margin: 0 0 16px 0;
  color: #334155;
  font-size: 1.1rem;
  font-weight: 600;
}

.placeholder-content {
  background: #eff6ff;
  border: 2px dashed #bfdbfe;
  border-radius: 12px;
  padding: 30px;
  margin: 30px 0;
}

.placeholder-content h4 {
  color: #1e40af;
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 12px 0;
}

.placeholder-text {
  color: #64748b;
  font-size: 1rem;
  margin: 0;
  font-style: italic;
}

/* 第三步新设计的样式 */
.network-config-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
  margin: 20px 0;
}

.network-zone-config {
  background: #ffffff;
  border: 2px solid #e2e8f0;
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.network-zone-config:hover {
  border-color: #cbd5e1;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.zone-header {
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  padding: 16px 20px;
  border-bottom: 1px solid #e2e8f0;
}

.zone-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.zone-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  font-weight: bold;
}

.zone-icon.internal {
  background: linear-gradient(135deg, #22c55e, #16a34a);
  color: white;
}

.zone-icon.dmz {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
}

.zone-icon.attack {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
}

.zone-name {
  font-size: 1.2rem;
  font-weight: 600;
  color: #1e293b;
}

.zone-content {
  padding: 20px;
}

.subnet-config {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.subnet-label {
  font-size: 1rem;
  font-weight: 500;
  color: #374151;
  white-space: nowrap;
  min-width: 120px;
}

.subnet-input {
  flex: 1;
  padding: 10px 12px;
  border: 2px solid #d1d5db;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s ease;
}

.subnet-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.devices-section {
  margin-top: 20px;
}

.devices-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.devices-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #374151;
}

.add-device-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 10px 16px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.add-device-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #059669, #047857);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.add-device-btn:disabled {
  background: #9ca3af;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.add-icon {
  font-size: 1.2rem;
  font-weight: bold;
}

.devices-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.device-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #ffffff;
  border: 2px solid #f1f5f9;
  border-radius: 12px;
  transition: all 0.2s ease;
}

.device-item:hover {
  border-color: #cbd5e1;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.device-info {
  flex: 1;
}

.device-type {
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 4px;
}

.device-details {
  display: flex;
  gap: 16px;
  font-size: 0.875rem;
  color: #64748b;
}

.device-ip {
  font-family: 'Monaco', 'Consolas', monospace;
  background: #f1f5f9;
  padding: 2px 6px;
  border-radius: 4px;
}

.device-system {
  background: #eff6ff;
  color: #1e40af;
  padding: 2px 6px;
  border-radius: 4px;
}

.device-actions {
  display: flex;
  gap: 8px;
}

.edit-device-btn, .delete-device-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.edit-device-btn {
  background: #3b82f6;
  color: white;
}

.edit-device-btn:hover {
  background: #2563eb;
  transform: translateY(-1px);
}

.delete-device-btn {
  background: #ef4444;
  color: white;
}

.delete-device-btn:hover {
  background: #dc2626;
  transform: translateY(-1px);
}

.no-devices {
  text-align: center;
  padding: 32px 16px;
  color: #9ca3af;
}

.no-devices-icon {
  font-size: 2rem;
  margin-bottom: 8px;
}

.no-devices p {
  margin: 0;
  font-size: 0.9rem;
}

/* 美化的设备配置弹窗样式 */
.device-dialog {
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  width: 90%;
  max-width: 650px;
  max-height: 90vh;
  overflow: hidden;
  animation: dialogSlideIn 0.3s ease-out;
}

@keyframes dialogSlideIn {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.dialog-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dialog-header h3 {
  margin: 0;
  font-size: 1.3rem;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  font-weight: bold;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.dialog-body {
  padding: 24px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 6px;
}

.required {
  color: #ef4444;
}

.form-select, .form-input {
  padding: 12px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s ease;
  background: white;
}

.form-select:focus, .form-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-select:disabled, .form-input:disabled {
  background: #f9fafb;
  color: #9ca3af;
  cursor: not-allowed;
}

.form-tips {
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 8px;
  padding: 16px;
  margin-top: 16px;
}

.tip-item {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.tip-item:last-child {
  margin-bottom: 0;
}

.tip-icon {
  font-size: 1rem;
}

.tip-text {
  font-size: 0.875rem;
  color: #0c4a6e;
}

.dialog-footer {
  background: #f8fafc;
  padding: 16px 24px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  border-top: 1px solid #e2e8f0;
}

.btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-secondary {
  background: #6b7280;
  color: white;
}

.btn-secondary:hover {
  background: #4b5563;
  transform: translateY(-1px);
}

.btn-primary {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
}

.btn-primary:hover {
  background: linear-gradient(135deg, #2563eb, #1e40af);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.btn-icon {
  font-size: 0.8rem;
}

/* 弹窗蒙版样式优化 */
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.75);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: overlayFadeIn 0.3s ease-out;
}

@keyframes overlayFadeIn {
  from {
    opacity: 0;
    backdrop-filter: blur(0px);
  }
  to {
    opacity: 1;
    backdrop-filter: blur(8px);
  }
}

/* 通用弹窗内容样式 */
.dialog-content {
  background: white;
  border-radius: 16px;
  box-shadow: 0 25px 80px rgba(0, 0, 0, 0.25);
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow: hidden;
  animation: dialogSlideIn 0.3s ease-out;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.dialog-content h3 {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  margin: 0;
  padding: 20px 24px;
  font-size: 1.2rem;
  font-weight: 600;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.dialog-content .form-group {
  margin-bottom: 16px;
  padding: 0 24px;
}

.dialog-content .form-group:first-of-type {
  margin-top: 20px;
}

.dialog-content label {
  display: block;
  font-size: 0.9rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 6px;
}

.dialog-content .form-input,
.dialog-content .form-select {
  width: 100%;
  padding: 12px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s ease;
  background: white;
  box-sizing: border-box;
}

.dialog-content .form-input:focus,
.dialog-content .form-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.dialog-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 24px;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-secondary {
  background: #6b7280;
  color: white;
}

.btn-secondary:hover {
  background: #4b5563;
  transform: translateY(-1px);
}

.btn-primary {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
}

.btn-primary:hover {
  background: linear-gradient(135deg, #2563eb, #1e40af);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

/* 配置对话框特定样式 */
.config-dialog {
  max-width: 600px;
}

.config-dialog .form-group {
  display: flex;
  flex-direction: column;
}

/* 第五步：Docker Compose生成样式 */
.docker-generation {
  padding: 20px 0;
}

.generation-info {
  background: #f8fafc;
  padding: 16px;
  border-radius: 8px;
  margin: 20px 0;
  border: 1px solid #e2e8f0;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.info-item:last-child {
  margin-bottom: 0;
}

.info-label {
  font-weight: 600;
  color: #475569;
  min-width: 80px;
}

.info-value {
  color: #1e293b;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.generate-docker-btn {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border: none;
  padding: 16px 32px;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
  margin-top: 20px;
}

.generate-docker-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(16, 185, 129, 0.4);
}

.generate-docker-btn:disabled {
  background: #9ca3af;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.ready-icon {
  font-size: 4rem;
  margin-bottom: 10px;
}

/* Docker Compose文件内容样式 */
.docker-result {
  width: 100%;
}

.docker-result h4 {
  color: #059669;
  font-size: 1.4rem;
  font-weight: 600;
  margin: 0 0 30px 0;
}

.file-content-container {
  background: #ffffff;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
  margin: 20px 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.file-header {
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
  color: white;
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.file-name {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1rem;
  font-weight: 600;
}

.file-icon {
  font-size: 1.2rem;
}

.file-actions {
  display: flex;
  gap: 8px;
}

.copy-btn, .download-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 4px;
}

.copy-btn {
  background: #3b82f6;
  color: white;
}

.copy-btn:hover {
  background: #2563eb;
  transform: translateY(-1px);
}

.download-btn {
  background: #10b981;
  color: white;
}

.download-btn:hover {
  background: #059669;
  transform: translateY(-1px);
}

.file-content {
  background: #1e293b;
  color: #e2e8f0;
  padding: 20px;
  max-height: 400px;
  overflow-y: auto;
  font-family: 'Monaco', 'Consolas', 'Courier New', monospace;
  font-size: 0.85rem;
  line-height: 1.5;
  text-align: left;
}

.file-content pre {
  margin: 0;
  white-space: pre-wrap;
  word-wrap: break-word;
  text-align: left;
}

.file-content code {
  color: #e2e8f0;
}

.file-content code.yaml {
  color: #e2e8f0;
}

/* 第六步：部署完成样式 */
.completion-summary {
  padding: 20px 0;
}

.summary-section {
  background: #f8fafc;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 30px;
  border: 1px solid #e2e8f0;
}

.summary-section h4 {
  margin: 0 0 16px 0;
  color: #334155;
  font-size: 1.1rem;
  font-weight: 600;
}

.success-message {
  text-align: center;
  padding: 40px 20px;
  background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
  border-radius: 16px;
  margin: 30px 0;
  border: 2px solid #a7f3d0;
}

.success-icon {
  font-size: 4rem;
  margin-bottom: 20px;
}

.success-message h4 {
  color: #059669;
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0 0 16px 0;
}

.success-message p {
  color: #047857;
  font-size: 1rem;
  margin: 0;
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.6;
}

.action-buttons {
  display: flex;
  gap: 16px;
  justify-content: center;
  margin-top: 30px;
  flex-wrap: wrap;
}

.action-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 6px;
}

.primary-btn {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
}

.primary-btn:hover {
  background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.secondary-btn {
  background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
  color: white;
}

.secondary-btn:hover {
  background: linear-gradient(135deg, #4b5563 0%, #374151 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(107, 114, 128, 0.3);
}

/* 拓扑图链接样式 */
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

/* 响应式设计 */
@media (max-width: 768px) {
  .file-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }

  .file-actions {
    width: 100%;
    justify-content: flex-end;
  }

  .action-buttons {
    flex-direction: column;
    align-items: center;
  }

  .action-btn {
    width: 100%;
    max-width: 300px;
    justify-content: center;
  }

  .topology-link {
    padding: 14px 20px;
    font-size: 0.95rem;
  }
}

/* 第六步：部署到题目样式 */
.deploy-configuration {
  padding: 20px 0;
}

.deploy-info-section,
.deploy-params-section,
.ports-config-section,
.deploy-preview-section,
.deploy-action-section {
  margin-bottom: 30px;
}

.deploy-info-section h4,
.deploy-params-section h4,
.ports-config-section h4,
.deploy-preview-section h4 {
  color: #1e293b;
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.info-label {
  font-weight: 600;
  color: #475569;
  min-width: 80px;
}

.info-value {
  color: #1e293b;
  font-weight: 500;
}

.param-group {
  margin-bottom: 20px;
}

.param-label {
  display: block;
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
}

.param-input,
.param-select {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.param-input:focus,
.param-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.no-ports-message {
  text-align: center;
  padding: 40px 20px;
  background: #f8fafc;
  border-radius: 12px;
  border: 2px dashed #cbd5e0;
}

.no-ports-icon {
  font-size: 3rem;
  margin-bottom: 16px;
  display: block;
}

.no-ports-hint {
  color: #6b7280;
  font-size: 0.9rem;
  margin-top: 8px;
}

.ports-list {
  space-y: 20px;
}

.port-config-item {
  background: #ffffff;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 20px;
  transition: all 0.3s ease;
}

.port-config-item:hover {
  border-color: #3b82f6;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1);
}

.port-header {
  display: flex;
  justify-content: between;
  align-items: center;
  margin-bottom: 20px;
  padding: 12px 16px;
  background: #f1f5f9;
  border-radius: 8px;
}

.port-number {
  font-weight: 600;
  color: #1e293b;
  font-size: 1.1rem;
}

.port-hint {
  color: #3b82f6;
  font-weight: 500;
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  background: #eff6ff;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.9rem;
}

.port-form {
  display: grid;
  grid-template-columns: 1fr 150px 1fr;
  gap: 16px;
  align-items: end;
}

.port-field {
  display: flex;
  flex-direction: column;
}

.port-field label {
  font-weight: 600;
  color: #374151;
  margin-bottom: 6px;
  font-size: 0.9rem;
}

.port-input,
.port-select {
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.95rem;
  transition: all 0.3s ease;
}

.port-input:focus,
.port-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

.deploy-preview-section {
  margin-top: 30px;
}

.preview-config {
  background: #1e293b;
  color: #e2e8f0;
  padding: 20px;
  border-radius: 8px;
  overflow-x: auto;
}

.config-preview {
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 0.85rem;
  line-height: 1.4;
  margin: 0;
  white-space: pre-wrap;
}

.deploy-action-section {
  margin-top: 40px;
  text-align: center;
}

.deploy-idle,
.deploy-processing,
.deploy-success,
.deploy-failed {
  padding: 40px 20px;
}

.deploy-ready-icon {
  font-size: 4rem;
  margin-bottom: 16px;
}

.deploy-submit-btn {
  background: linear-gradient(135deg, #059669 0%, #10b981 100%);
  color: white;
  border: none;
  padding: 16px 32px;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(5, 150, 105, 0.3);
  margin-top: 20px;
}

.deploy-submit-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #047857 0%, #059669 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(5, 150, 105, 0.4);
}

.deploy-submit-btn:disabled {
  background: #9ca3af;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.deploy-disabled-hint {
  color: #ef4444;
  font-size: 0.9rem;
  margin-top: 10px;
  font-weight: 500;
}

.deploy-spinner {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.spinner-circle {
  width: 40px;
  height: 40px;
  border: 4px solid #e5e7eb;
  border-top: 4px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.deploy-success-icon {
  font-size: 4rem;
  margin-bottom: 16px;
}

.deploy-result-info {
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 8px;
  padding: 16px;
  margin-top: 20px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
}

.result-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.result-label {
  font-weight: 600;
  color: #475569;
}

.result-value {
  color: #1e293b;
  font-weight: 500;
}

.deploy-error-icon {
  font-size: 3rem;
  margin-bottom: 16px;
}

.deploy-error-message {
  color: #dc2626;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  padding: 12px 16px;
  margin: 16px 0;
}

.deploy-retry-btn {
  background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.deploy-retry-btn:hover {
  background: linear-gradient(135deg, #b91c1c 0%, #dc2626 100%);
  transform: translateY(-1px);
}

/* 分值配置样式 */
.score-config-section {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
}

.score-config-section h4 {
  color: #1f2937;
  margin-bottom: 8px;
  font-size: 1.25rem;
  font-weight: 600;
}

.section-description {
  color: #6b7280;
  margin-bottom: 20px;
  font-size: 0.95rem;
}

.score-config-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.score-config-tips {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 20px;
  margin-top: 24px;
}

.score-config-tips h5 {
  color: #475569;
  margin-bottom: 12px;
  font-size: 1rem;
  font-weight: 600;
}

.score-config-tips ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.score-config-tips li {
  color: #64748b;
  margin-bottom: 8px;
  padding-left: 16px;
  position: relative;
  font-size: 0.9rem;
  line-height: 1.5;
}

.score-config-tips li::before {
  content: '•';
  color: #3b82f6;
  position: absolute;
  left: 0;
  font-weight: bold;
}

.score-config-tips strong {
  color: #374151;
  font-weight: 600;
}

/* 响应式设计 - 第六步 */
@media (max-width: 768px) {
  .port-form {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
  }
  
  .deploy-result-info {
    grid-template-columns: 1fr;
  }
  
  .port-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .score-config-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
}
</style>
