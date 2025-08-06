<template>
  <div class="silk-container">
    <canvas 
      ref="silkCanvas" 
      class="silk-canvas"
      :style="{ backgroundColor: getBgColor() }"
      @mousedown="startDrawing" 
      @mousemove="draw" 
      @mouseup="stopDrawing"
      @mouseleave="stopDrawing"
      @touchstart="handleTouchStart"
      @touchmove="handleTouchMove"
      @touchend="stopDrawing"
    ></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from 'vue';
import { useThemeStore } from '@/stores/theme';

const themeStore = useThemeStore();
const isDarkTheme = computed(() => themeStore.isDarkTheme);

const silkCanvas = ref<HTMLCanvasElement | null>(null);
let ctx: CanvasRenderingContext2D | null = null;
let isDrawing = false;
let lastX = 0;
let lastY = 0;
let hue = 0;
let direction = true;
let particles: Particle[] = [];
let symmetry = 12;
let trailsActive = true;
let autoDrawInterval: number | null = null;

class Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  color: string;
  constructor(x: number, y: number, size: number, color: string) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.speedX = Math.random() * 3 - 1.5;
    this.speedY = Math.random() * 3 - 1.5;
    this.color = color;
  }
  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    if (this.size > 0.2) this.size -= 0.05;
  }
  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = this.color;
    ctx.strokeStyle = this.color;
    ctx.lineWidth = this.size;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

function getBgColor() {
  return isDarkTheme.value ? '#000' : '#fff';
}

const initCanvas = () => {
  if (!silkCanvas.value) return;
  const canvas = silkCanvas.value;
  ctx = canvas.getContext('2d');
  const resizeCanvas = () => {
    const container = canvas.parentElement;
    if (container) {
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
      if (ctx) {
        ctx.fillStyle = getBgColor();
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
  };
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  if (ctx) {
    ctx.fillStyle = getBgColor();
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  animateParticles();
  startAutoDrawing();
  createInitialPattern();
};

const createInitialPattern = () => {
  if (!silkCanvas.value || !ctx) return;
  const canvas = silkCanvas.value;
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  for (let i = 0; i < 50; i++) {
    const angle = (Math.PI * 2 / 50) * i;
    const distance = Math.min(canvas.width, canvas.height) * 0.3;
    const x = centerX + Math.cos(angle) * distance;
    const y = centerY + Math.sin(angle) * distance;
    hue += 2;
    if (hue >= 360) hue = 0;
    const color = isDarkTheme.value 
      ? `hsla(${hue}, 100%, 60%, 0.8)` 
      : `hsla(${hue}, 90%, 45%, 0.8)`;
    for (let j = 0; j < symmetry; j++) {
      const symAngle = (Math.PI * 2 / symmetry) * j;
      const rotatedX = (x - centerX) * Math.cos(symAngle) - (y - centerY) * Math.sin(symAngle);
      const rotatedY = (x - centerX) * Math.sin(symAngle) + (y - centerY) * Math.cos(symAngle);
      particles.push(new Particle(centerX + rotatedX, centerY + rotatedY, 5, color));
    }
  }
};

const startAutoDrawing = () => {
  if (autoDrawInterval) clearInterval(autoDrawInterval);
  autoDrawInterval = window.setInterval(() => {
    if (!isDrawing && silkCanvas.value && ctx) {
      const canvas = silkCanvas.value;
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = Math.min(canvas.width, canvas.height) * 0.3;
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * radius;
      const x = centerX + Math.cos(angle) * distance;
      const y = centerY + Math.sin(angle) * distance;
      hue += 0.5;
      if (hue >= 360) hue = 0;
      const color = isDarkTheme.value 
        ? `hsla(${hue}, 100%, 60%, 0.8)` 
        : `hsla(${hue}, 90%, 45%, 0.8)`;
      for (let i = 0; i < symmetry; i++) {
        const symAngle = (Math.PI * 2 / symmetry) * i;
        const rotatedX = (x - centerX) * Math.cos(symAngle) - (y - centerY) * Math.sin(symAngle);
        const rotatedY = (x - centerX) * Math.sin(symAngle) + (y - centerY) * Math.cos(symAngle);
        particles.push(new Particle(centerX + rotatedX, centerY + rotatedY, 4, color));
      }
    }
  }, 50);
};

const animateParticles = () => {
  requestAnimationFrame(animateParticles);
  if (ctx && silkCanvas.value) {
    const fadeColor = isDarkTheme.value 
      ? 'rgba(0, 0, 0, 0.01)'
      : 'rgba(255, 255, 255, 0.01)';
    if (trailsActive) {
      ctx.fillStyle = fadeColor;
      ctx.fillRect(0, 0, silkCanvas.value.width, silkCanvas.value.height);
    } else {
      ctx.clearRect(0, 0, silkCanvas.value.width, silkCanvas.value.height);
      ctx.fillStyle = getBgColor();
      ctx.fillRect(0, 0, silkCanvas.value.width, silkCanvas.value.height);
    }
    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw(ctx);
      if (particles[i].size <= 0.2) {
        particles.splice(i, 1);
        i--;
      }
    }
  }
};

const startDrawing = (e: MouseEvent) => {
  isDrawing = true;
  lastX = e.offsetX;
  lastY = e.offsetY;
};

const draw = (e: MouseEvent) => {
  if (!isDrawing || !ctx || !silkCanvas.value) return;
  const centerX = silkCanvas.value.width / 2;
  const centerY = silkCanvas.value.height / 2;
  hue += 0.5;
  if (hue >= 360) hue = 0;
  const mouseX = e.offsetX - centerX;
  const mouseY = e.offsetY - centerY;
  for (let i = 0; i < symmetry; i++) {
    const angle = (Math.PI * 2 / symmetry) * i;
    const rotatedX = mouseX * Math.cos(angle) - mouseY * Math.sin(angle);
    const rotatedY = mouseX * Math.sin(angle) + mouseY * Math.cos(angle);
    const particleColor = isDarkTheme.value 
      ? `hsla(${hue}, 100%, 60%, 0.8)` 
      : `hsla(${hue}, 90%, 45%, 0.8)`;
    particles.push(new Particle(centerX + rotatedX, centerY + rotatedY, 5, particleColor));
  }
  lastX = e.offsetX;
  lastY = e.offsetY;
};

const handleTouchStart = (e: TouchEvent) => {
  if (!silkCanvas.value) return;
  e.preventDefault();
  const touch = e.touches[0];
  const rect = silkCanvas.value.getBoundingClientRect();
  lastX = touch.clientX - rect.left;
  lastY = touch.clientY - rect.top;
  isDrawing = true;
};

const handleTouchMove = (e: TouchEvent) => {
  if (!isDrawing || !silkCanvas.value) return;
  e.preventDefault();
  const touch = e.touches[0];
  const rect = silkCanvas.value.getBoundingClientRect();
  const offsetX = touch.clientX - rect.left;
  const offsetY = touch.clientY - rect.top;
  if (ctx) {
    const centerX = silkCanvas.value.width / 2;
    const centerY = silkCanvas.value.height / 2;
    hue += 0.5;
    if (hue >= 360) hue = 0;
    const touchX = offsetX - centerX;
    const touchY = offsetY - centerY;
    for (let i = 0; i < symmetry; i++) {
      const angle = (Math.PI * 2 / symmetry) * i;
      const rotatedX = touchX * Math.cos(angle) - touchY * Math.sin(angle);
      const rotatedY = touchX * Math.sin(angle) + touchY * Math.cos(angle);
      const particleColor = isDarkTheme.value 
        ? `hsla(${hue}, 100%, 60%, 0.8)` 
        : `hsla(${hue}, 90%, 45%, 0.8)`;
      particles.push(new Particle(centerX + rotatedX, centerY + rotatedY, 5, particleColor));
    }
    lastX = offsetX;
    lastY = offsetY;
  }
};

const stopDrawing = () => {
  isDrawing = false;
};

const resetCanvasBackground = () => {
  if (ctx && silkCanvas.value) {
    ctx.fillStyle = getBgColor();
    ctx.fillRect(0, 0, silkCanvas.value.width, silkCanvas.value.height);
    createInitialPattern();
  }
};

onMounted(() => {
  initCanvas();
  watch(isDarkTheme, () => {
    resetCanvasBackground();
  });
});

onUnmounted(() => {
  window.removeEventListener('resize', initCanvas);
  if (autoDrawInterval) {
    clearInterval(autoDrawInterval);
  }
});
</script>

<style scoped>
.silk-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 1;
}

.silk-canvas {
  display: block;
  width: 100%;
  height: 100%;
  cursor: crosshair;
}
</style> 