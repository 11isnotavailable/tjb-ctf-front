<template>
  <div>
    <h1 v-if="tag === 'h1'" class="typewriter-text" :class="[textClass, {'typewriter-complete': isComplete}]">{{ displayedText }}</h1>
    <p v-else-if="tag === 'p'" class="typewriter-text" :class="[textClass, {'typewriter-complete': isComplete}]">{{ displayedText }}</p>
    <div v-else class="typewriter-text" :class="[textClass, {'typewriter-complete': isComplete}]">{{ displayedText }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';

const props = defineProps({
  text: {
    type: String,
    required: true
  },
  speed: {
    type: Number,
    default: 100  // 每个字符的打字速度（毫秒）
  },
  delay: {
    type: Number,
    default: 0    // 开始打字前的延迟（毫秒）
  },
  tag: {
    type: String,
    default: 'div' // 包装元素标签：'h1', 'p', 或 'div'
  },
  textClass: {
    type: String,
    default: ''
  },
  startTyping: {
    type: Boolean,
    default: true  // 是否自动开始打字
  }
});

const emit = defineEmits(['typing-complete']);

const displayedText = ref('');
const isComplete = ref(false);
let currentIndex = 0;
let typingTimer: number | null = null;

// 打字效果函数
const typeNextChar = () => {
  if (currentIndex < props.text.length) {
    displayedText.value += props.text[currentIndex];
    currentIndex++;
    typingTimer = setTimeout(typeNextChar, props.speed) as unknown as number;
  } else {
    isComplete.value = true;
    emit('typing-complete');
  }
};

// 开始打字过程
const startTypingProcess = () => {
  if (typingTimer) {
    clearTimeout(typingTimer);
  }
  
  displayedText.value = '';
  currentIndex = 0;
  isComplete.value = false;
  
  if (props.startTyping) {
    typingTimer = setTimeout(typeNextChar, props.delay) as unknown as number;
  }
};

// 监听文本变化重新开始打字
watch(() => props.text, () => {
  startTypingProcess();
});

// 监听startTyping变化
watch(() => props.startTyping, (newVal) => {
  if (newVal && !isComplete.value) {
    startTypingProcess();
  }
});

onMounted(() => {
  startTypingProcess();
});
</script>

<style scoped>
.typewriter-text {
  display: inline-block;
  overflow: hidden;
  border-right: 3px solid transparent;
}

.typewriter-text:not(.typewriter-complete) {
  border-right-color: currentColor;
  animation: blink-caret 0.75s step-end infinite;
}

@keyframes blink-caret {
  from, to { border-right-color: transparent; }
  50% { border-right-color: currentColor; }
}
</style> 