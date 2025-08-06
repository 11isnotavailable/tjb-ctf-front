<template>
  <div class="transition-overlay" :class="{ 'active': active, 'completed': completed }">
    <!-- 使用现有的MatrixRainCanvas，但设置更高密度和速度 -->
    <MatrixRainCanvas
      :color="color"
      :background-color="backgroundColor"
      :speed="speed"
      :density="density"
      :font-size="fontSize"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue';
import MatrixRainCanvas from './MatrixRainCanvas.vue';

const props = defineProps({
  color: {
    type: String,
    default: '#3a9c3a'
  },
  backgroundColor: {
    type: String,
    default: 'rgba(0, 0, 0, 0.95)'
  },
  speed: {
    type: Number,
    default: 2 // 比普通下落速度快
  },
  density: {
    type: Number,
    default: 3 // 最大密度的3倍
  },
  fontSize: {
    type: Number,
    default: 36
  },
  duration: {
    type: Number,
    default: 1500 // 过渡动画持续时间（毫秒）
  },
  active: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['transition-complete']);

// 动画是否完成
const completed = ref(false);

// 定时器管理
let transitionTimer = null;
let completionTimer = null;

// 清理定时器
const clearTimers = () => {
  if (transitionTimer) {
    clearTimeout(transitionTimer);
    transitionTimer = null;
  }
  
  if (completionTimer) {
    clearTimeout(completionTimer);
    completionTimer = null;
  }
};

// 监听active变化
watch(() => props.active, (newVal) => {
  console.log('转场动画状态:', newVal ? '激活' : '未激活');
  
  // 清理之前的定时器
  clearTimers();
  
  if (newVal) {
    // 激活动画时，重置状态
    completed.value = false;
    
    // 设置动画完成定时器
    transitionTimer = setTimeout(() => {
      console.log('转场动画完成，准备淡出');
      completed.value = true;
      
      // 再等待一小段时间后触发完成事件，给予淡出动画时间
      completionTimer = setTimeout(() => {
        console.log('触发转场完成事件');
        emit('transition-complete');
      }, 500); // 淡出动画时间
    }, props.duration);
  }
}, { immediate: true });

// 组件卸载时清理定时器
onUnmounted(() => {
  clearTimers();
});
</script>

<style scoped>
.transition-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 9999; /* 确保在最顶层 */
  pointer-events: all; /* 捕获所有事件，防止页面锁死时底层元素可点击 */
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.3s ease, visibility 0.3s ease;
}

.transition-overlay.active {
  opacity: 1;
  visibility: visible;
}

.transition-overlay.completed {
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.5s ease, visibility 0.5s ease;
}
</style> 