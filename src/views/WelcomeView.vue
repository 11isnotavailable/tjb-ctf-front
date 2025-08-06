<template>
  <div class="welcome-page">
    <!-- Matrix雨动画效果 -->
    <MatrixRainCanvas
      :color="matrixColor"
      :background-color="matrixBackground"
      :speed="matrixSpeed"
      :density="matrixDensity"
    />
    
    <!-- 过渡动画层 -->
    <TransitionRainOverlay
      :active="transitionActive"
      :color="matrixColor"
      :background-color="matrixBackground"
      :speed="3"
      :density="1"
      @transition-complete="handleTransitionComplete"
    />
    
    <!-- 顶部导航栏 -->
    <header class="header">
      <div class="header-content">
        <div class="brand">
          <div class="brand-logo">TJB-CTF</div>
        </div>
        
        <!-- 导航菜单 - 改为左对齐而非居中 -->
        <div class="nav-section">
          <div class="nav-item" @click="goToHome"><el-icon><HomeFilled /></el-icon><span>首页</span></div>
          <div class="nav-item"><el-icon><DataLine /></el-icon><span>平台介绍</span></div>
          <div class="nav-item" @click="goToQuestions"><el-icon><List /></el-icon><span>题目</span></div>
          <div class="nav-item" @click="goToDeploy"><el-icon><Monitor /></el-icon><span>部署</span></div>
          <div class="nav-item"><CrossSwords class="custom-icon" /><span>一键攻击</span></div>
          <div class="nav-item"><Shield class="custom-icon" /><span>智能防御</span></div>
        </div>
        
        <!-- 右侧操作区 -->
        <div class="action-area">
          <el-icon><Search /></el-icon>
          <ThemeSwitcher />
          
          <!-- 根据登录状态显示不同的元素 -->
          <template v-if="userStore.isAuthenticated">
            <UserAvatar />
          </template>
          <template v-else>
          <el-button class="login-btn" type="primary" @click="goToLogin('/login')">登录</el-button>
          </template>
        </div>
      </div>
    </header>
    
    <!-- 主内容区 -->
    <main class="main-content">
      <div class="hero-section">
        <!-- 标题使用打字机效果，使用key属性确保主题切换时重新渲染 -->
        <TypewriterText 
          :key="'typewriter-' + currentTheme"
          text="▶通过实战演练提升网络安全技能"
          :speed="80" 
          tag="h1" 
          class="main-title" 
          @typing-complete="titleTypingComplete"
        />
        
        <!-- 副标题在打字机效果完成后显示 -->
        <transition name="fade">
          <p v-if="showSubtitle" class="subtitle">加入我们的CTF平台，挑战各种网络安全难题</p>
        </transition>
        
        <!-- 按钮在副标题显示后显示 -->
        <transition name="fade">
          <div v-if="showButtons" class="hero-actions mt-5">
            <el-button type="primary" size="large" @click="handleStartChallenge">开始挑战</el-button>
            <el-button size="large">了解更多</el-button>
          </div>
        </transition>
      </div>
    </main>
    
    <!-- 页脚 -->
    <footer class="footer">
      <div class="footer-content">
        <span>© 2023 CTF平台 版权所有</span>
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
import { computed, ref, watch, nextTick } from 'vue';
import {
  HomeFilled,
  Search,
  DataLine,
  List,
  Monitor,
  ChatDotRound,
  Service,
  InfoFilled
} from '@element-plus/icons-vue';
import CrossSwords from '@/assets/icons/CrossSwords.vue'; // 导入自定义的交叉剑图标
import Shield from '@/assets/icons/Shield.vue'; // 导入自定义的盾牌图标
import MatrixRainCanvas from '@/components/effects/MatrixRainCanvas.vue';
import ThemeSwitcher from '@/components/ThemeSwitcher.vue';
import TypewriterText from '@/components/effects/TypewriterText.vue';
import TransitionRainOverlay from '@/components/effects/TransitionRainOverlay.vue';
import { useThemeStore } from '@/stores/theme';
import { useUserStore } from '@/stores/user'; // 导入用户存储
import UserAvatar from '@/components/UserAvatar.vue'; // 导入用户头像组件

const router = useRouter();
const themeStore = useThemeStore();
const userStore = useUserStore(); // 获取用户存储实例

// 从主题存储获取当前主题和Matrix效果的配置
const currentTheme = computed(() => themeStore.currentTheme);
const matrixColor = computed(() => themeStore.themeConfig.matrixColor);
const matrixBackground = computed(() => themeStore.themeConfig.matrixBackgroundColor);
const matrixSpeed = computed(() => themeStore.themeConfig.matrixSpeed);
const matrixDensity = computed(() => themeStore.themeConfig.matrixDensity);

// 控制副标题和按钮的显示
const showSubtitle = ref(false);
const showButtons = ref(false);

// 过渡动画控制
const transitionActive = ref(false);
const targetRoute = ref('');

// 监听主题变化，重置显示状态
watch(currentTheme, () => {
  // 主题变化时重置状态，打字机效果会通过key重新渲染
  showSubtitle.value = false;
  showButtons.value = false;
});

// 标题打字效果完成后的回调
const titleTypingComplete = () => {
  // 标题打字效果完成后，显示副标题
  setTimeout(() => {
    showSubtitle.value = true;
    
    // 副标题显示后，再显示按钮
    setTimeout(() => {
      showButtons.value = true;
    }, 500);
  }, 300);
};

// 导航方法
const goToLogin = (route = '/login') => {
  // 存储目标路由
  targetRoute.value = route;
  
  // 激活过渡动画
  transitionActive.value = true;
  
  // 确保路由被记录
  console.log('目标路由:', targetRoute.value);
};

// 过渡动画完成后处理
const handleTransitionComplete = () => {
  // 重置动画状态
  transitionActive.value = false;
  
  // 导航到目标路由
  if (targetRoute.value) {
    console.log('跳转到:', targetRoute.value);
    // 使用nextTick确保DOM更新后再导航
    nextTick(() => {
      router.push(targetRoute.value);
      targetRoute.value = '';
    });
  }
};

const goToHome = () => {
  router.push('/');
};
const goToQuestions = () => {
  router.push('/home/questions');
};

const goToDeploy = () => {
  router.push('/home/deploy');
};

// 在组件挂载时加载保存的主题
themeStore.loadSavedTheme();

const handleStartChallenge = () => {
  if (userStore.isAuthenticated) {
    router.push('/home/questions');
  } else {
    goToLogin('/login');
  }
};
</script>

<style scoped>
.welcome-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}

/* 顶部导航栏 */
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
  min-height: 60px; /* 改为最小高度 */
  padding: 10px 40px; /* 增加上下内边距，确保有足够的空间 */
}

.brand {
  display: flex;
  align-items: center;
  flex-shrink: 0; /* 防止品牌区域被压缩 */
}

.brand-logo {
  font-size: 24px;
  font-weight: bold;
  color: #409EFF;
  letter-spacing: 2px;
  font-family: 'Segoe UI', 'Arial', 'Helvetica Neue', sans-serif;
  text-align: center;
  line-height: 32px;
}

.logo-icon {
  width: 32px;
  height: 32px;
  margin-right: 10px;
}

.brand-text {
  /* 修改为水平文本样式 */
  font-size: 16px;
  font-weight: 500;
  color: var(--color-text);
  letter-spacing: 1px; /* 增加字间距 */
  white-space: nowrap; /* 防止文本换行 */
  padding: 5px 0; /* 确保有足够的上下内边距 */
}

/* 导航菜单 - 改为左对齐而非居中 */
.nav-section {
  display: flex;
  align-items: center;
  position: absolute;
  left: 200px; /* 不再居中，改为固定位置从左边开始 */
  transform: none; /* 移除居中转换 */
  height: auto; /* 自动高度 */
  padding: 5px 0; /* 确保有足够的内边距 */
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 5px 15px; /* 增加上下内边距 */
  cursor: pointer;
  transition: color 0.2s;
  color: var(--color-text);
}

.nav-item .el-icon {
  margin-bottom: 4px;
  font-size: 18px;
}

.nav-item span {
  font-size: 12px;
  white-space: nowrap; /* 防止文本换行 */
}

.nav-item:hover {
  color: var(--color-primary);
}

/* 自定义图标样式 */
.custom-icon {
  width: 20px;
  height: 20px;
  margin-bottom: 4px;
}

.action-area {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-shrink: 0; /* 防止操作区被压缩 */
  height: auto; /* 自动高度 */
  padding: 5px 0; /* 确保有足够的内边距 */
}

.el-icon {
  font-size: 20px;
  color: var(--color-text);
  cursor: pointer;
}

.login-btn {
  font-weight: 500;
  margin-left: 10px;
}

/* 主内容区 */
.main-content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 50px 20px;
  overflow: visible; /* 确保内容不会被裁剪 */
  position: relative;
  z-index: 1;
}

.hero-section {
  text-align: center;
  width: 100%; /* 确保宽度足够 */
  max-width: 100%; /* 不限制最大宽度 */
}

.main-title {
  font-size: 36px;
  font-weight: 600;
  margin-bottom: 20px;
  color: var(--color-text);
  letter-spacing: 2px;
  white-space: normal; /* 允许文本换行 */
  word-break: break-word; /* 在必要时允许单词内换行 */
}

.subtitle {
  font-size: 18px;
  color: var(--color-secondary);
  font-weight: 500;
}

.hero-actions {
  margin-top: 30px;
}

/* 页脚 */
.footer {
  margin-top: auto;
  padding: 20px;
  width: 100%; /* 确保宽度足够 */
  overflow: visible; /* 确保内容不会被裁剪 */
  background-color: var(--footer-background);
  position: relative;
  z-index: 10;
}

.footer-content {
  display: flex;
  justify-content: center; /* 改为居中对齐 */
  align-items: center;
  color: var(--color-text);
  font-size: 14px;
  flex-direction: column; /* 纵向排列 */
  gap: 10px; /* 添加间隔 */
  text-align: center; /* 文本居中 */
}

.footer-icons {
  display: flex;
  gap: 10px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .header-content {
    padding: 15px 20px; /* 增加上下内边距 */
    position: relative;
    flex-wrap: wrap; /* 允许项目换行 */
  }

  .brand-text {
    font-size: 14px; /* 小屏幕上减小字体大小 */
  }

  .nav-section {
    position: static;
    transform: none;
    order: 3;
    width: 100%;
    margin: 15px 0; /* 增加上下间距 */
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
    font-size: 16px;
  }

  .footer-content {
    flex-direction: column;
    gap: 10px;
    text-align: center;
    padding: 5px 0; /* 确保有足够的内边距 */
  }
}

/* 淡入动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
 