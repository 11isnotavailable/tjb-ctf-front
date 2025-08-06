<template>
  <div class="matrix-container">
    <canvas ref="matrixCanvas" class="matrix-canvas"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';

const props = defineProps({
  color: {
    type: String,
    default: '#333333'
  },
  backgroundColor: {
    type: String,
    default: 'rgba(255, 255, 255, 0.95)'
  },
  fontSize: {
    type: Number,
    default: 36  // 保持大字号
  },
  speed: {
    type: Number,
    default: 1.2
  },
  density: {
    type: Number,
    default: 0.36  // 增加到当前的3倍（0.12 * 3 = 0.36）
  }
});

const matrixCanvas = ref<HTMLCanvasElement | null>(null);
let animationId: number | null = null;

// 停止动画
const stopAnimation = () => {
  if (animationId !== null) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }
};

// 创建一个数字流下落列
interface DropColumn {
  x: number;           // x位置
  y: number;           // y位置（列头位置）
  chars: string[];     // 字符串（01序列）
  speed: number;       // 下落速度
  alpha: number;       // 整个列的基础透明度（明暗度）
}

// 生成随机01字符串
const generateRandomBinaryString = (minLength: number, maxLength: number) => {
  const length = Math.floor(Math.random() * (maxLength - minLength + 1)) + minLength;
  const result = [];
  for (let i = 0; i < length; i++) {
    result.push(Math.random() > 0.5 ? '1' : '0');
  }
  return result;
};

// 启动数据流效果
const startMatrixRain = () => {
  if (!matrixCanvas.value) return;
  
  const canvas = matrixCanvas.value;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // 调整canvas大小以适应容器
  const resizeCanvas = () => {
    const { width, height } = canvas.parentElement?.getBoundingClientRect() || { width: window.innerWidth, height: window.innerHeight };
    canvas.width = width;
    canvas.height = height;
  };

  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  const columns = Math.floor(canvas.width / props.fontSize);
  
  // 创建下落字符数组
  const dropColumns: DropColumn[] = [];
  
  // 基于密度初始化字符列
  const initializeDropColumns = () => {
    dropColumns.length = 0;
    const totalPossibleColumns = columns;
    const columnsToCreate = Math.ceil(totalPossibleColumns * props.density * 1.5);
    
    for (let i = 0; i < columnsToCreate; i++) {
      const column = Math.floor(Math.random() * columns);
      const chars = generateRandomBinaryString(3, 15); // 生成3-15个字符的串
      
      dropColumns.push({
        x: column * props.fontSize + props.fontSize / 2,
        y: Math.random() * canvas.height * 2 - canvas.height, // 一些在屏幕上方，一些在屏幕内
        chars: chars,
        speed: (Math.random() * 0.5 + 0.5) * props.speed, // 速度有一定随机性
        alpha: 0.2 + Math.random() * 0.4  // 降低整体透明度范围(原来0.4-1.0，现在0.2-0.6)
      });
    }
  };
  
  // 初始化字符列
  initializeDropColumns();

  // 绘制函数
  const draw = () => {
    // 填充半透明背景，形成拖尾效果
    ctx.fillStyle = props.backgroundColor.replace(/[\d.]+\)$/, '0.92)');
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 绘制和更新每个字符列
    for (let i = 0; i < dropColumns.length; i++) {
      const column = dropColumns[i];
      
      // 设置文本样式 - 加粗字体
      ctx.font = `bold ${props.fontSize}px monospace`;
      ctx.textAlign = 'center';
      
      // 将字符颜色转换为RGBA格式
      let baseColor: string;
      if (props.color.startsWith('#')) {
        const r = parseInt(props.color.slice(1, 3), 16);
        const g = parseInt(props.color.slice(3, 5), 16);
        const b = parseInt(props.color.slice(5, 7), 16);
        baseColor = `rgba(${r}, ${g}, ${b}`;
      } else if (props.color.startsWith('rgb')) {
        baseColor = props.color.replace('rgb', 'rgba').replace(')', '');
      } else {
        // 默认情况
        baseColor = 'rgba(51, 51, 51';
      }
      
      // 绘制列中的每个字符
      for (let j = 0; j < column.chars.length; j++) {
        const posY = column.y - j * props.fontSize;
        
        // 只绘制在屏幕范围内的字符
        if (posY > -props.fontSize && posY < canvas.height + props.fontSize) {
          // 使用列的基础透明度，头部字符稍亮一些
          const charAlpha = j === 0 ? Math.min(0.8, column.alpha + 0.2) : column.alpha;
          ctx.fillStyle = `${baseColor}, ${charAlpha})`;
          ctx.fillText(column.chars[j], column.x, posY);
        }
      }
      
      // 更新位置
      column.y += props.fontSize * column.speed / 10;
      
      // 如果字符列完全离开屏幕，重新初始化它
      if (column.y - (column.chars.length * props.fontSize) > canvas.height) {
        const columnIndex = Math.floor(Math.random() * columns);
        column.x = columnIndex * props.fontSize + props.fontSize / 2;
        column.y = -props.fontSize * 2;
        column.chars = generateRandomBinaryString(3, 15);
        column.alpha = 0.2 + Math.random() * 0.4; // 降低重新生成的透明度
        column.speed = (Math.random() * 0.5 + 0.5) * props.speed;
      }
    }
    
    // 持续动画
    animationId = requestAnimationFrame(draw);
  };

  // 开始动画
  draw();
  
  // 清理函数
  onUnmounted(() => {
    stopAnimation();
    window.removeEventListener('resize', resizeCanvas);
  });
};

// 监听属性变化，重新启动动画
watch(
  () => [props.color, props.backgroundColor, props.fontSize, props.speed, props.density],
  () => {
    stopAnimation();
    startMatrixRain();
  }
);

onMounted(() => {
  startMatrixRain();
});
</script>

<style scoped>
.matrix-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  pointer-events: none;
}

.matrix-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
</style>
 