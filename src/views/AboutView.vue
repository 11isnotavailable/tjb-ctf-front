<template>
  <div class="about-page">
    <!-- Matrix雨动画效果 -->
    <MatrixRainCanvas
      :color="matrixColor"
      :background-color="matrixBackground"
      :speed="matrixSpeed"
      :density="matrixDensity"
    />

    <!-- 顶部导航栏 -->
    <header class="header">
      <div class="header-content">
        <div class="brand">
          <TianYanLogo :show-text="true" size="medium" />
        </div>

        <!-- 导航菜单 -->
        <div class="nav-section">
          <div class="nav-item" @click="goToHome"><el-icon><HomeFilled /></el-icon><span>首页</span></div>
          <div class="nav-item active"><el-icon><DataLine /></el-icon><span>平台介绍</span></div>
          <div class="nav-item" @click="goToQuestions"><el-icon><List /></el-icon><span>题目</span></div>
          <div class="nav-item" @click="goToLeaderboard"><el-icon><Trophy /></el-icon><span>排行榜</span></div>
          <div class="nav-item" @click="goToDeploy"><el-icon><Monitor /></el-icon><span>部署</span></div>
          <div class="nav-item" @click="goToAttack"><CrossSwords class="custom-icon" /><span>一键攻击</span></div>
          <div class="nav-item" @click="goToDefense"><Shield class="custom-icon" /><span>智能防御</span></div>
        </div>

        <!-- 右侧操作区 -->
        <div class="action-area">
          <ThemeSwitcher />
          <template v-if="userStore.isAuthenticated">
            <UserAvatar />
          </template>
          <template v-else>
            <el-button class="login-btn" type="primary" @click="goToLogin">登录</el-button>
          </template>
        </div>
      </div>
    </header>

    <!-- 主内容区 -->
    <main class="main-content">
      <div class="content-container">
        <!-- 平台标题 -->
        <div class="hero-section">
          <TypewriterText
            :key="'about-title-' + currentTheme"
            text="天演——AI Agent驱动的动态攻防推演靶场平台"
            :speed="60"
            tag="h1"
            class="main-title"
            @typing-complete="titleTypingComplete"
          />
          <transition name="fade">
            <p v-if="showSubtitle" class="subtitle">
              实现演练与实战零时差对接的网络安全新范式
            </p>
          </transition>
        </div>

        <!-- 平台特色介绍 -->
        <transition name="slide-up">
          <div v-if="showContent" class="features-section">
            <div class="feature-grid">
              <!-- 动态场景生成 -->
              <div class="feature-card">
                <div class="feature-icon">
                  <el-icon size="40"><SetUp /></el-icon>
                </div>
                <h3>动态场景生成Agent</h3>
                <p>突破传统靶场"场景静态化"痛点，基于Coze工作流的智能场景生成Agent，将CVE漏洞发布与演练场景更新时间差缩短至≤72小时。</p>
                <ul>
                  <li>• 标准场景（<20节点）：≤1分钟生成</li>
                  <li>• 复杂场景（<50节点）：<5分钟生成</li>
                  <li>• 场景覆盖率≥90%（主流业务协议/组件）</li>
                  <li>• 支持企业级、工业级、军工级多种安全场景</li>
                </ul>
              </div>

              <!-- 智能攻击模拟 -->
              <div class="feature-card">
                <div class="feature-icon">
                  <CrossSwords class="custom-feature-icon" />
                </div>
                <h3>智能攻击Agent</h3>
                <p>基于DeepSeek-R1大模型构建的渗透测试智能体，模拟≥10条完整APT攻击链，单条攻击链平均节点≥6个，覆盖MITRE ATT&CK 90%以上战术。</p>
                <ul>
                  <li>• 自主决策能力：无需人工干预的全链路攻击</li>
                  <li>• 白盒模式攻击成功率：99%+</li>
                  <li>• 平均攻击时间：3-8分钟</li>
                  <li>• 支持HTTP/TCP/UDP多协议混合路径</li>
                </ul>
              </div>

              <!-- 自适应防御决策 -->
              <div class="feature-card">
                <div class="feature-icon">
                  <Shield class="custom-feature-icon" />
                </div>
                <h3>智能防御Agent</h3>
                <p>基于WireMCP协议和恒脑安全垂域大模型的智能防御Agent，实现威胁检测到自动响应的完整闭环，30秒内完成自动封禁/隔离/补丁下发。</p>
                <ul>
                  <li>• 威胁检测准确率：98%+（复杂攻击场景）</li>
                  <li>• 平均响应时间：<30秒（告警到处置）</li>
                  <li>• 误报率控制：≤5%</li>
                  <li>• 溯源成功率：≥85%</li>
                </ul>
              </div>

              <!-- 容器化部署 -->
              <div class="feature-card">
                <div class="feature-icon">
                  <el-icon size="40"><Box /></el-icon>
                </div>
                <h3>容器化部署模块</h3>
                <p>基于Docker和FRP内网穿透技术，实现靶场环境的快速部署和弹性管理，支持复杂网络拓扑的一键化部署。</p>
                <ul>
                  <li>• 标准场景（<20服务）：≤5秒生成配置</li>
                  <li>• 复杂场景（<50服务）：≤15秒生成配置</li>
                  <li>• 端口动态分配算法：平均冲突率<1%</li>
                  <li>• 环境销毁后10秒内回收全部资源</li>
                </ul>
              </div>

              <!-- 多智能体协同 -->
              <div class="feature-card">
                <div class="feature-icon">
                  <el-icon size="40"><DataBoard /></el-icon>
                </div>
                <h3>多智能体协同架构</h3>
                <p>创新性地采用Docker作为智能体间的共享状态空间，实现部署、攻击、防御、评估四大Agent的无缝协同。</p>
                <ul>
                  <li>• 四大Agent实时状态同步</li>
                  <li>• 支持智能体热插拔和动态配置</li>
                  <li>• 基于国产化AI模型的自主决策</li>
                </ul>
              </div>

              <!-- 智能评估 -->
              <div class="feature-card">
                <div class="feature-icon">
                  <el-icon size="40"><TrendCharts /></el-icon>
                </div>
                <h3>自动化评估Agent</h3>
                <p>基于9步解析公式的量化评估模型，演练结束后5分钟内输出量化评估报告，包含攻击路径图、防御响应时间线、人员技能画像（8维度雷达图）。</p>
                <ul>
                  <li>• 标签级三指标评估：熟练度/稳定性/成长值</li>
                  <li>• 全局三指标评估：综合能力画像</li>
                  <li>• 实时生成（<30秒）专业Word报告</li>
                  <li>• 可操作建议≥5条，计算误差≤1%</li>
                </ul>
              </div>
            </div>
          </div>
        </transition>

        <!-- 技术架构 -->
        <transition name="slide-up">
          <div v-if="showArchitecture" class="architecture-section">
            <h2 class="section-title">技术架构</h2>
            <div class="architecture-content">
              <div class="tech-stack">
                <div class="stack-layer">
                  <h4>前端层</h4>
                  <div class="tech-tags">
                    <el-tag>Vue 3.3+</el-tag>
                    <el-tag>ElementPlus</el-tag>
                    <el-tag>TypeScript 5.0+</el-tag>
                    <el-tag>SVG拓扑可视化</el-tag>
                  </div>
                </div>
                <div class="stack-layer">
                  <h4>中台层</h4>
                  <div class="tech-tags">
                    <el-tag type="success">Python 3.12+</el-tag>
                    <el-tag type="success">FastAPI 0.104+</el-tag>
                    <el-tag type="success">SQLAlchemy 2.0+</el-tag>
                    <el-tag type="success">JWT统一鉴权</el-tag>
                  </div>
                </div>
                <div class="stack-layer">
                  <h4>数据层</h4>
                  <div class="tech-tags">
                    <el-tag type="warning">OceanBase 4.0+</el-tag>
                    <el-tag type="warning">Redis 7.0+</el-tag>
                    <el-tag type="warning">openEuler操作系统</el-tag>
                  </div>
                </div>
                <div class="stack-layer">
                  <h4>智能体层</h4>
                  <div class="tech-tags">
                    <el-tag type="danger">Coze工作流</el-tag>
                    <el-tag type="danger">DeepSeek-R1大模型</el-tag>
                    <el-tag type="danger">恒脑安全大模型</el-tag>
                    <el-tag type="danger">WireMCP协议</el-tag>
                  </div>
                </div>
                <div class="stack-layer">
                  <h4>容器层</h4>
                  <div class="tech-tags">
                    <el-tag type="info">Docker 24.0+</el-tag>
                    <el-tag type="info">Docker Compose 2.20+</el-tag>
                    <el-tag type="info">FRP内网穿透</el-tag>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </transition>

        <!-- 应用场景 -->
        <transition name="slide-up">
          <div v-if="showScenarios" class="scenarios-section">
            <h2 class="section-title">应用场景</h2>
            <div class="scenario-grid">
              <div class="scenario-card">
                <el-icon size="30"><School /></el-icon>
                <h4>网络安全教育</h4>
                <p>为网络安全专业提供实践教学平台，支持职业培训和企业内训，缓解网络安全人才结构性失衡矛盾。</p>
              </div>
              <div class="scenario-card">
                <el-icon size="30"><OfficeBuilding /></el-icon>
                <h4>企业安全演练</h4>
                <p>为关键信息基础设施运营单位提供常态化实战演练基础设施，支撑国家、行业、企业三级网络安全演练体系。</p>
              </div>
              <div class="scenario-card">
                <el-icon size="30"><Trophy /></el-icon>
                <h4>红蓝对抗演练</h4>
                <p>支持AWD竞赛、红蓝对抗、技能评估等活动，通过量化技能画像提供客观的能力评估。</p>
              </div>
              <div class="scenario-card">
                <el-icon size="30"><Tools /></el-icon>
                <h4>安全能力建设</h4>
                <p>为政府机构和安全厂商提供工具测试验证平台，推动网络安全产业从"工具供给"向"能力供给"升级。</p>
              </div>
            </div>
          </div>
        </transition>

        <!-- 联系我们 -->
        <transition name="slide-up">
          <div v-if="showContact" class="contact-section">
            <h2 class="section-title">联系我们</h2>
            <div class="contact-content">
              <p>如果您对我们的平台感兴趣，或有任何问题和建议，欢迎联系我们：</p>
              <div class="contact-info">
                <div class="contact-item">
                  <el-icon><Message /></el-icon>
                  <span>邮箱：2815670632@qq.com</span>
                </div>
              </div>
            </div>
          </div>
        </transition>

        <!-- 行动号召 -->
        <transition name="slide-up">
          <div v-if="showCTA" class="cta-section">
            <h3>准备体验"演练与实战零时差对接"的攻防新范式吗？</h3>
            <div class="cta-buttons">
              <el-button type="primary" size="large" @click="handleStartChallenge">
                立即开始挑战
              </el-button>
              <el-button size="large" @click="goToQuestions">
                浏览题目
              </el-button>
            </div>
          </div>
        </transition>
      </div>
    </main>

    <!-- 页脚 -->
    <footer class="footer">
      <div class="footer-content">
        <span>© 2025 "天演"研发团队 版权所有</span>
        <div class="footer-icons">
          <el-icon><ChatDotRound /></el-icon>
          <el-icon><Service /></el-icon>
          <el-icon><InfoFilled /></el-icon>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { computed, ref, watch, onMounted } from 'vue';
import {
  HomeFilled,
  DataLine,
  List,
  Monitor,
  Trophy,
  ChatDotRound,
  Service,
  InfoFilled,
  SetUp,
  Box,
  DataBoard,
  TrendCharts,
  School,
  OfficeBuilding,
  Tools,
  Message,
  Phone,
  Location
} from '@element-plus/icons-vue';
import CrossSwords from '@/assets/icons/CrossSwords.vue';
import Shield from '@/assets/icons/Shield.vue';
import MatrixRainCanvas from '@/components/effects/MatrixRainCanvas.vue';
import ThemeSwitcher from '@/components/ThemeSwitcher.vue';
import TypewriterText from '@/components/effects/TypewriterText.vue';
import { useThemeStore } from '@/stores/theme';
import { useUserStore } from '@/stores/user';
import UserAvatar from '@/components/UserAvatar.vue';
import TianYanLogo from '@/components/TianYanLogo.vue';

const router = useRouter();
const themeStore = useThemeStore();
const userStore = useUserStore();

// 从主题存储获取当前主题和Matrix效果的配置
const currentTheme = computed(() => themeStore.currentTheme);
const matrixColor = computed(() => themeStore.themeConfig.matrixColor);
const matrixBackground = computed(() => themeStore.themeConfig.matrixBackgroundColor);
const matrixSpeed = computed(() => themeStore.themeConfig.matrixSpeed);
const matrixDensity = computed(() => themeStore.themeConfig.matrixDensity);

// 控制内容显示的状态
const showSubtitle = ref(false);
const showContent = ref(false);
const showArchitecture = ref(false);
const showScenarios = ref(false);
const showContact = ref(false);
const showCTA = ref(false);

// 监听主题变化，重置显示状态
watch(currentTheme, () => {
  showSubtitle.value = false;
  showContent.value = false;
  showArchitecture.value = false;
  showScenarios.value = false;
  showContact.value = false;
  showCTA.value = false;
});

// 标题打字效果完成后的回调
const titleTypingComplete = () => {
  setTimeout(() => {
    showSubtitle.value = true;
    
    setTimeout(() => {
      showContent.value = true;
      
      setTimeout(() => {
        showArchitecture.value = true;
        
        setTimeout(() => {
          showScenarios.value = true;
          
          setTimeout(() => {
            showContact.value = true;
            
            setTimeout(() => {
              showCTA.value = true;
            }, 300);
          }, 300);
        }, 300);
      }, 500);
    }, 300);
  }, 300);
};

// 导航方法
const goToHome = () => {
  router.push('/');
};

const goToLogin = () => {
  router.push('/login');
};

const goToQuestions = () => {
  if (userStore.isAuthenticated) {
    router.push('/home/questions');
  } else {
    router.push('/login');
  }
};

const goToDeploy = () => {
  if (userStore.isAuthenticated) {
    router.push('/home/deploy');
  } else {
    router.push('/login');
  }
};

const goToLeaderboard = () => {
  if (userStore.isAuthenticated) {
    router.push('/home/leaderboard');
  } else {
    router.push('/login');
  }
};

const goToAttack = () => {
  if (userStore.isAuthenticated) {
    router.push('/home/attack');
  } else {
    router.push('/login');
  }
};

const goToDefense = () => {
  if (userStore.isAuthenticated) {
    router.push('/home/defend/capture');
  } else {
    router.push('/login');
  }
};

const handleStartChallenge = () => {
  if (userStore.isAuthenticated) {
    router.push('/home/questions');
  } else {
    router.push('/login');
  }
};

// 在组件挂载时加载保存的主题
onMounted(() => {
  themeStore.loadSavedTheme();
});
</script>

<style scoped>
.about-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow-x: hidden;
}

/* 顶部导航栏样式 */
.header {
  background-color: var(--header-background);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  position: relative;
  z-index: 10;
  width: 100%;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-height: 60px;
  padding: 10px 40px;
}

.brand {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.nav-section {
  display: flex;
  align-items: center;
  position: absolute;
  left: 200px;
  transform: none;
  height: auto;
  padding: 5px 0;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 5px 15px;
  cursor: pointer;
  transition: color 0.2s;
  color: var(--color-text);
}

.nav-item.active {
  color: var(--color-primary);
}

.nav-item .el-icon {
  margin-bottom: 4px;
  font-size: 18px;
}

.nav-item span {
  font-size: 12px;
  white-space: nowrap;
}

.nav-item:hover {
  color: var(--color-primary);
}

.custom-icon {
  width: 20px;
  height: 20px;
  margin-bottom: 4px;
}

.action-area {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-shrink: 0;
  height: auto;
  padding: 5px 0;
}

.login-btn {
  font-weight: 500;
  margin-left: 10px;
}

/* 主内容区 */
.main-content {
  flex: 1;
  position: relative;
  z-index: 1;
  padding: 50px 0;
}

.content-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.hero-section {
  text-align: center;
  margin-bottom: 80px;
}

.main-title {
  font-size: 36px;
  font-weight: 600;
  margin-bottom: 20px;
  color: var(--color-text);
  letter-spacing: 1px;
}

.subtitle {
  font-size: 20px;
  color: var(--color-secondary);
  font-weight: 400;
}

/* 特色功能网格 */
.features-section {
  margin-bottom: 80px;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 30px;
  margin-top: 40px;
}

.feature-card {
  background: rgba(255, 255, 255, 0.5);
  border-radius: 12px;
  padding: 30px;
  text-align: center;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border: 1px solid var(--color-border);
  backdrop-filter: blur(10px);
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.feature-icon {
  margin-bottom: 20px;
  color: var(--color-primary);
}

.custom-feature-icon {
  width: 40px;
  height: 40px;
  color: var(--color-primary);
}

.feature-card h3 {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 15px;
  color: var(--color-text);
}

.feature-card p {
  font-size: 14px;
  color: var(--color-text-secondary);
  line-height: 1.6;
  margin-bottom: 15px;
}

.feature-card ul {
  list-style: none;
  padding: 0;
  margin: 0;
  text-align: left;
}

.feature-card li {
  font-size: 13px;
  color: var(--color-text-secondary);
  line-height: 1.8;
  margin-bottom: 5px;
}

/* 技术架构 */
.architecture-section {
  margin-bottom: 80px;
}

.section-title {
  font-size: 28px;
  font-weight: 600;
  text-align: center;
  margin-bottom: 40px;
  color: var(--color-text);
}

.tech-stack {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.stack-layer {
  background: rgba(255, 255, 255, 0.5);
  border-radius: 12px;
  padding: 25px;
  border: 1px solid var(--color-border);
  backdrop-filter: blur(10px);
}

.stack-layer h4 {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 15px;
  color: var(--color-text);
}

.tech-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

/* 应用场景 */
.scenarios-section {
  margin-bottom: 80px;
}

.scenario-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 25px;
  margin-top: 40px;
}

.scenario-card {
  background: rgba(255, 255, 255, 0.5);
  border-radius: 12px;
  padding: 25px;
  text-align: center;
  transition: transform 0.3s ease;
  border: 1px solid var(--color-border);
  backdrop-filter: blur(10px);
}

.scenario-card:hover {
  transform: translateY(-3px);
}

.scenario-card .el-icon {
  color: var(--color-primary);
  margin-bottom: 15px;
}

.scenario-card h4 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 10px;
  color: var(--color-text);
}

.scenario-card p {
  font-size: 14px;
  color: var(--color-text-secondary);
  line-height: 1.6;
}

/* 联系我们 */
.contact-section {
  margin-bottom: 80px;
}

.contact-content {
  text-align: center;
}

.contact-content p {
  font-size: 16px;
  color: var(--color-text-secondary);
  margin-bottom: 30px;
}

.contact-info {
  display: flex;
  justify-content: center;
  gap: 40px;
  flex-wrap: wrap;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--color-text);
}

.contact-item .el-icon {
  color: var(--color-primary);
}

/* 行动号召 */
.cta-section {
  text-align: center;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 12px;
  padding: 40px;
  border: 1px solid var(--color-border);
  backdrop-filter: blur(10px);
}

.cta-section h3 {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 25px;
  color: var(--color-text);
}

.cta-buttons {
  display: flex;
  justify-content: center;
  gap: 20px;
  flex-wrap: wrap;
}

/* 页脚 */
.footer {
  margin-top: auto;
  padding: 30px 20px;
  background-color: var(--footer-background);
  position: relative;
  z-index: 10;
}

.footer-content {
  display: flex;
  justify-content: center;
  align-items: center;
  color: var(--color-text);
  font-size: 14px;
  flex-direction: column;
  gap: 10px;
  text-align: center;
}

.footer-icons {
  display: flex;
  gap: 10px;
}

/* 动画效果 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-up-enter-active {
  transition: all 0.6s ease-out;
}

.slide-up-enter-from {
  opacity: 0;
  transform: translateY(30px);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .header-content {
    padding: 15px 20px;
    position: relative;
    flex-wrap: wrap;
  }

  .nav-section {
    position: static;
    transform: none;
    order: 3;
    width: 100%;
    margin: 15px 0;
    justify-content: space-around;
  }

  .brand {
    margin-right: auto;
  }

  .action-area {
    margin-left: auto;
  }

  .main-title {
    font-size: 28px;
  }

  .subtitle {
    font-size: 18px;
  }

  .feature-grid {
    grid-template-columns: 1fr;
  }

  .scenario-grid {
    grid-template-columns: 1fr;
  }

  .contact-info {
    flex-direction: column;
    gap: 20px;
  }

  .cta-buttons {
    flex-direction: column;
    align-items: center;
  }

  .tech-stack {
    gap: 20px;
  }

  .stack-layer {
    padding: 20px;
  }
}

/* 暗色主题下的卡片样式 */
.dark .feature-card {
  background: rgba(0, 0, 0, 0.8);
}

.dark .stack-layer {
  background: rgba(0, 0, 0, 0.8);
}

.dark .scenario-card {
  background: rgba(0, 0, 0, 0.8);
}

.dark .cta-section {
  background: rgba(0, 0, 0, 0.8);
}
</style>