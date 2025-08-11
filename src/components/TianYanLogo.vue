<template>
  <div class="tianyan-logo" :class="{ 'tianyan-logo--dark': isDark }">
    <div class="logo-container">
      <!-- 天演图标 -->
      <svg class="logo-icon" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
        <!-- 外圈防护盾 -->
        <polygon 
          class="shield-border"
          points="60,10 85,25 95,50 85,75 60,90 35,75 25,50 35,25"
          fill="none"
          stroke="var(--tianyan-primary)"
          stroke-width="6"
        />
        
        <!-- 扫描环圈 -->
        <circle 
          class="scan-ring"
          cx="60" 
          cy="50" 
          r="25"
          fill="none"
          stroke="var(--tianyan-primary)"
          stroke-width="1.5"
          opacity="0.6"
        />
        
        <!-- 天演主体 -->
        <ellipse 
          class="eye-shape"
          cx="60" 
          cy="50" 
          rx="20" 
          ry="12"
          fill="var(--tianyan-primary)"
          opacity="0.2"
        />
        
        <!-- 瞳孔核心 -->
        <circle 
          class="pupil-core"
          cx="60" 
          cy="50" 
          r="6"
          fill="var(--tianyan-accent)"
        />
        
        <!-- 扫描线条 -->
        <g class="scan-lines">
          <line x1="60" y1="30" x2="60" y2="35" stroke="var(--tianyan-primary)" stroke-width="1"/>
          <line x1="60" y1="65" x2="60" y2="70" stroke="var(--tianyan-primary)" stroke-width="1"/>
          <line x1="40" y1="50" x2="45" y2="50" stroke="var(--tianyan-primary)" stroke-width="1"/>
          <line x1="75" y1="50" x2="80" y2="50" stroke="var(--tianyan-primary)" stroke-width="1"/>
        </g>
        
        <!-- 数据点 -->
        <g class="data-points">
          <circle cx="45" cy="35" r="1.5" fill="var(--tianyan-success)" opacity="0.8"/>
          <circle cx="75" cy="35" r="1.5" fill="var(--tianyan-warning)" opacity="0.8"/>
          <circle cx="45" cy="65" r="1.5" fill="var(--tianyan-danger)" opacity="0.8"/>
          <circle cx="75" cy="65" r="1.5" fill="var(--tianyan-info)" opacity="0.8"/>
        </g>
      </svg>
      
      <!-- 文字标识 -->
      <div class="logo-text" v-if="showText">
        <span class="brand-name">天演</span>
        <span class="brand-suffix">CTF</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useThemeStore } from '@/stores/theme';

interface Props {
  showText?: boolean;
  size?: 'small' | 'medium' | 'large';
}

const props = withDefaults(defineProps<Props>(), {
  showText: true,
  size: 'medium'
});

const themeStore = useThemeStore();
const isDark = computed(() => themeStore.currentTheme === 'dark');
</script>

<style scoped>
.tianyan-logo {
  /* 天演专属CSS变量 */
  --tianyan-primary: #00bcd4;
  --tianyan-accent: #1a237e;
  --tianyan-success: #4caf50;
  --tianyan-warning: #ff9800;
  --tianyan-danger: #f44336;
  --tianyan-info: #673ab7;
  
  display: inline-flex;
  align-items: center;
  transition: all 0.3s ease;
}

.tianyan-logo--dark {
  --tianyan-primary: #40e0d0;
  --tianyan-accent: #8b5cf6;
}

.logo-container {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  width: 48px;
  height: 48px;
  color: var(--color-text);
  transition: all 0.3s ease;
}

/* 动画效果 */
.logo-icon:hover .scan-ring {
  animation: scanning 2s linear infinite;
}

.logo-icon:hover .pupil-core {
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes scanning {
  0% {
    stroke-dasharray: 0 157;
    stroke-dashoffset: 0;
  }
  50% {
    stroke-dasharray: 78.5 78.5;
    stroke-dashoffset: -39.25;
  }
  100% {
    stroke-dasharray: 0 157;
    stroke-dashoffset: -157;
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.1);
  }
}

.logo-text {
  font-family: var(--font-family-base);
  font-weight: 600;
  line-height: 1;
}

.brand-name {
  font-size: 24px;
  color: var(--tianyan-primary);
  margin-right: 4px;
}

.brand-suffix {
  font-size: 20px;
  color: var(--color-text);
  opacity: 0.8;
}

/* 尺寸变体 */
.tianyan-logo[data-size="small"] .logo-icon {
  width: 32px;
  height: 32px;
}

.tianyan-logo[data-size="small"] .brand-name {
  font-size: 18px;
}

.tianyan-logo[data-size="small"] .brand-suffix {
  font-size: 16px;
}

.tianyan-logo[data-size="large"] .logo-icon {
  width: 64px;
  height: 64px;
}

.tianyan-logo[data-size="large"] .brand-name {
  font-size: 32px;
}

.tianyan-logo[data-size="large"] .brand-suffix {
  font-size: 28px;
}

/* 响应式 */
@media (max-width: 768px) {
  .logo-text {
    display: none;
  }
  
  .logo-icon {
    width: 40px;
    height: 40px;
  }
}
</style>
