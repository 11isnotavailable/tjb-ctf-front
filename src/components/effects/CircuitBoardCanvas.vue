<template>
  <div class="circuit-container">
    <canvas ref="circuitCanvas" class="circuit-canvas"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';

const props = defineProps({
  // 电路的主要颜色
  circuitColor: {
    type: String,
    default: '#3a9c3a'
  },
  // 电路背景颜色
  backgroundColor: {
    type: String,
    default: 'rgba(0, 0, 0, 0.95)'
  },
  // 电流脉冲颜色
  pulseColor: {
    type: String,
    default: '#5cff5c'
  },
  // 电路密度 (0-1)
  density: {
    type: Number,
    default: 0.8
  },
  // 脉冲频率 (秒)
  pulseInterval: {
    type: Number,
    default: 2
  },
  // 芯片区域（中心区域的位置和大小）
  chipArea: {
    type: Object,
    default: () => ({ 
      x: 0, // 居中 (在代码中会自动计算)
      y: 0, // 居中 (在代码中会自动计算)
      width: 350, // 像素
      height: 350 // 像素
    })
  },
  // 是否立即触发一次脉冲
  triggerPulseNow: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['pulse-complete']);

const circuitCanvas = ref<HTMLCanvasElement | null>(null);
let animationId: number | null = null;
let pulseTimer: number | null = null;
let circuitPaths: Path[] = [];
let activePulses: Pulse[] = [];

// 电路路径
interface Path {
  points: Point[];
  thickness: number;
}

// 点
interface Point {
  x: number;
  y: number;
}

// 电流脉冲
interface Pulse {
  pathIndex: number;
  progress: number; // 0-1
  speed: number; // 每帧移动的速度
}

// 停止动画
const stopAnimation = () => {
  if (animationId !== null) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }
  
  if (pulseTimer !== null) {
    clearInterval(pulseTimer);
    pulseTimer = null;
  }
};

// 启动电路动画
const startCircuitAnimation = () => {
  if (!circuitCanvas.value) return;
  
  const canvas = circuitCanvas.value;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // 调整canvas大小以适应容器
  const resizeCanvas = () => {
    console.log('重新调整Canvas大小');
    const { width, height } = canvas.parentElement?.getBoundingClientRect() || { width: window.innerWidth, height: window.innerHeight };
    console.log('Canvas尺寸:', width, height);
    canvas.width = width;
    canvas.height = height;
    
    // 重新生成电路
    generateCircuits();
  };

  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  // 生成电路路径
  const generateCircuits = () => {
    circuitPaths = [];
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    
    // 计算芯片区域中心位置
    const chipX = (canvasWidth - props.chipArea.width) / 2 + props.chipArea.x;
    const chipY = (canvasHeight - props.chipArea.height) / 2 + props.chipArea.y;
    
    // 芯片边界点，用于连接电路
    const chipPoints = [
      // 上边
      ...Array.from({ length: 8 }, (_, i) => ({
        x: chipX + props.chipArea.width * (i + 1) / 9,
        y: chipY
      })),
      // 右边
      ...Array.from({ length: 8 }, (_, i) => ({
        x: chipX + props.chipArea.width,
        y: chipY + props.chipArea.height * (i + 1) / 9
      })),
      // 下边
      ...Array.from({ length: 8 }, (_, i) => ({
        x: chipX + props.chipArea.width * (1 - (i + 1) / 9),
        y: chipY + props.chipArea.height
      })),
      // 左边
      ...Array.from({ length: 8 }, (_, i) => ({
        x: chipX,
        y: chipY + props.chipArea.height * (1 - (i + 1) / 9)
      }))
    ];
    
    // 画布边缘的出发点
    const edgePoints = [
      // 上边缘
      ...Array.from({ length: 12 }, (_, i) => ({
        x: canvasWidth * (i + 1) / 13,
        y: 0
      })),
      // 右边缘
      ...Array.from({ length: 12 }, (_, i) => ({
        x: canvasWidth,
        y: canvasHeight * (i + 1) / 13
      })),
      // 下边缘
      ...Array.from({ length: 12 }, (_, i) => ({
        x: canvasWidth * (1 - (i + 1) / 13),
        y: canvasHeight
      })),
      // 左边缘
      ...Array.from({ length: 12 }, (_, i) => ({
        x: 0,
        y: canvasHeight * (1 - (i + 1) / 13)
      }))
    ];
    
    // 根据密度创建电路路径
    const pathCount = Math.floor(48 * props.density);
    for (let i = 0; i < pathCount; i++) {
      const startPoint = edgePoints[Math.floor(Math.random() * edgePoints.length)];
      const endPoint = chipPoints[Math.floor(Math.random() * chipPoints.length)];
      
      const midPoints = generatePathMidpoints(startPoint, endPoint, 2 + Math.floor(Math.random() * 3));
      
      circuitPaths.push({
        points: [startPoint, ...midPoints, endPoint],
        thickness: 1.5 + Math.random() * 2.5
      });
    }
  };

  // 为路径生成中间点（使电路路径折线化）
  const generatePathMidpoints = (start: Point, end: Point, count: number): Point[] => {
    const points: Point[] = [];
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    
    for (let i = 1; i <= count; i++) {
      const ratio = i / (count + 1);
      const x = start.x + dx * ratio + (Math.random() - 0.5) * 100;
      const y = start.y + dy * ratio + (Math.random() - 0.5) * 100;
      points.push({ x, y });
    }
    
    return points;
  };

  // 创建新的电路脉冲
  const createPulse = (specificPathIndex: number | null = null) => {
    if (circuitPaths.length === 0) return;
    
    // 如果指定了特定路径索引，则在该路径上创建脉冲
    // 否则随机选择一条路径
    const pathIndex = specificPathIndex !== null ? 
      specificPathIndex : Math.floor(Math.random() * circuitPaths.length);
    
    activePulses.push({
      pathIndex,
      progress: 0,
      speed: 0.01 + Math.random() * 0.02 // 每帧移动1-3%的路径
    });
  };

  // 创建全局脉冲（所有路径同时）
  const createGlobalPulse = () => {
    console.log('触发全局脉冲');
    // 清空当前脉冲
    activePulses = [];
    
    // 为每条路径创建脉冲
    for (let i = 0; i < circuitPaths.length; i++) {
      createPulse(i);
    }
  };

  // 绘制电路和脉冲
  const draw = () => {
    // 清空画布
    ctx.fillStyle = props.backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 绘制芯片区域（略微发光的矩形）
    const chipX = (canvas.width - props.chipArea.width) / 2 + props.chipArea.x;
    const chipY = (canvas.height - props.chipArea.height) / 2 + props.chipArea.y;
    
    // 芯片发光效果
    const gradient = ctx.createRadialGradient(
      chipX + props.chipArea.width / 2, 
      chipY + props.chipArea.height / 2, 
      0,
      chipX + props.chipArea.width / 2, 
      chipY + props.chipArea.height / 2, 
      props.chipArea.width / 1.5
    );
    gradient.addColorStop(0, 'rgba(0, 120, 0, 0.3)');
    gradient.addColorStop(1, 'rgba(0, 60, 0, 0.1)');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 绘制芯片边框
    ctx.strokeStyle = props.circuitColor;
    ctx.lineWidth = 2;
    ctx.strokeRect(chipX, chipY, props.chipArea.width, props.chipArea.height);

    // 添加芯片内部纹路
    ctx.beginPath();
    ctx.moveTo(chipX, chipY + props.chipArea.height / 3);
    ctx.lineTo(chipX + props.chipArea.width, chipY + props.chipArea.height / 3);
    ctx.moveTo(chipX, chipY + props.chipArea.height * 2 / 3);
    ctx.lineTo(chipX + props.chipArea.width, chipY + props.chipArea.height * 2 / 3);
    ctx.moveTo(chipX + props.chipArea.width / 3, chipY);
    ctx.lineTo(chipX + props.chipArea.width / 3, chipY + props.chipArea.height);
    ctx.moveTo(chipX + props.chipArea.width * 2 / 3, chipY);
    ctx.lineTo(chipX + props.chipArea.width * 2 / 3, chipY + props.chipArea.height);
    ctx.strokeStyle = props.circuitColor;
    ctx.lineWidth = 1;
    ctx.stroke();

    // 绘制所有电路路径
    for (let i = 0; i < circuitPaths.length; i++) {
      const path = circuitPaths[i];
      ctx.beginPath();
      ctx.moveTo(path.points[0].x, path.points[0].y);
      
      for (let j = 1; j < path.points.length; j++) {
        ctx.lineTo(path.points[j].x, path.points[j].y);
      }
      
      ctx.strokeStyle = props.circuitColor;
      ctx.lineWidth = path.thickness;
      ctx.stroke();
    }

    // 绘制活跃脉冲
    let pulseCompleted = false;
    const completedPulses: number[] = [];
    
    for (let i = 0; i < activePulses.length; i++) {
      const pulse = activePulses[i];
      const path = circuitPaths[pulse.pathIndex];
      
      // 计算脉冲在路径上的当前位置
      const totalSegments = path.points.length - 1;
      const segmentProgress = pulse.progress * totalSegments;
      const currentSegment = Math.min(Math.floor(segmentProgress), totalSegments - 1);
      const segmentRatio = segmentProgress - currentSegment;
      
      const p1 = path.points[currentSegment];
      const p2 = path.points[currentSegment + 1];
      
      const pulseX = p1.x + (p2.x - p1.x) * segmentRatio;
      const pulseY = p1.y + (p2.y - p1.y) * segmentRatio;
      
      // 绘制脉冲点
      ctx.beginPath();
      const pulseSize = 2 + path.thickness * 2;
      const gradient = ctx.createRadialGradient(
        pulseX, pulseY, 0,
        pulseX, pulseY, pulseSize * 2
      );
      gradient.addColorStop(0, props.pulseColor);
      gradient.addColorStop(1, 'rgba(0,0,0,0)');
      
      ctx.fillStyle = gradient;
      ctx.arc(pulseX, pulseY, pulseSize * 2, 0, Math.PI * 2);
      ctx.fill();
      
      // 更新脉冲进度
      pulse.progress += pulse.speed;
      
      // 检查脉冲是否完成
      if (pulse.progress >= 1) {
        completedPulses.push(i);
        pulseCompleted = true;
      }
    }
    
    // 移除完成的脉冲
    for (let i = completedPulses.length - 1; i >= 0; i--) {
      activePulses.splice(completedPulses[i], 1);
    }
    
    // 如果有脉冲完成，触发事件
    if (pulseCompleted) {
      emit('pulse-complete');
    }
    
    // 持续动画
    animationId = requestAnimationFrame(draw);
  };

  // 初始化电路
  generateCircuits();
  
  // 开始定期创建脉冲
  pulseTimer = window.setInterval(() => {
    // 随机生成1-3个脉冲
    const pulseCount = Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < pulseCount; i++) {
      createPulse();
    }
  }, props.pulseInterval * 1000) as unknown as number;

  // 如果需要立即触发脉冲
  if (props.triggerPulseNow) {
    createGlobalPulse();
  }

  // 开始动画
  draw();
  
  // 提供公共方法
  defineExpose({
    triggerGlobalPulse: createGlobalPulse
  });
  
  // 清理函数
  onUnmounted(() => {
    stopAnimation();
    window.removeEventListener('resize', resizeCanvas);
  });
};

// 监听属性变化，重新启动动画
watch(
  () => [props.circuitColor, props.backgroundColor, props.density, props.pulseInterval],
  () => {
    stopAnimation();
    startCircuitAnimation();
  }
);

// 监听triggerPulseNow属性变化
watch(() => props.triggerPulseNow, (newVal) => {
  if (newVal && circuitCanvas.value) {
    createGlobalPulse();
  }
});

onMounted(() => {
  console.log('电路板组件已挂载');
  setTimeout(() => {
    startCircuitAnimation();
    console.log('电路板动画已启动');
  }, 0);
});
</script>

<style scoped>
.circuit-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  pointer-events: none;
}

.circuit-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
</style> 