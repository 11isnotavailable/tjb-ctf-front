<template>
  <div class="topology-viewer">
    <div class="topology-controls">
      <el-button-group>
        <el-button size="small" @click="zoomIn" icon="ZoomIn">放大</el-button>
        <el-button size="small" @click="zoomOut" icon="ZoomOut">缩小</el-button>
        <el-button size="small" @click="resetView" icon="Refresh">重置</el-button>
      </el-button-group>
      <el-switch 
        v-model="showLabels" 
        active-text="显示标签" 
        inactive-text="隐藏标签" 
        style="margin-left: 15px;"
      />
    </div>
    
    <div ref="networkContainer" class="network-container">
      <div v-if="!topologyData || !Object.keys(topologyData).length" class="empty-topology">
        <el-icon><Document /></el-icon>
        <p>暂无拓扑数据</p>
      </div>
    </div>
    
    <div v-if="error" class="error-message">
      <el-alert
        title="拓扑图加载失败"
        :description="error"
        type="error"
        show-icon
        :closable="false"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue';
import { Document } from '@element-plus/icons-vue';

interface TopologyNode {
  id: string;
  label: string;
  icon?: string;
  group?: string;
}

interface TopologyEdge {
  from: string;
  to: string;
  label?: string;
  color?: string;
  style?: string;
  bidirectional?: boolean;
}

interface TopologyData {
  title?: string;
  nodes?: TopologyNode[];
  clusters?: any[];
  connections?: TopologyEdge[];
  direction?: string;
}

const props = defineProps<{
  topologyData: TopologyData | null;
}>();

const networkContainer = ref<HTMLElement | null>(null);
const showLabels = ref(true);
const error = ref('');

let network: any = null;
let nodes: any = null;
let edges: any = null;

// 简化的拓扑图渲染（不依赖外部库）
const renderSimpleTopology = () => {
  if (!networkContainer.value || !props.topologyData) return;

  const container = networkContainer.value;
  container.innerHTML = '';

  try {
    // 创建SVG容器
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '400');
    svg.setAttribute('viewBox', '0 0 800 400');
    svg.style.background = '#f8f9fa';
    svg.style.border = '1px solid #e4e7ed';
    svg.style.borderRadius = '4px';

    // 简单的节点布局
    const nodeElements: { [key: string]: { x: number; y: number; element: SVGElement } } = {};
    
    if (props.topologyData.nodes) {
      props.topologyData.nodes.forEach((node, index) => {
        // 简单的圆形布局
        const angle = (index / props.topologyData.nodes!.length) * 2 * Math.PI;
        const radius = 120;
        const centerX = 400;
        const centerY = 200;
        
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);

        // 创建节点组
        const nodeGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        nodeGroup.setAttribute('transform', `translate(${x}, ${y})`);

        // 创建节点圆形
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('r', '25');
        circle.setAttribute('fill', '#409EFF');
        circle.setAttribute('stroke', '#ffffff');
        circle.setAttribute('stroke-width', '3');
        circle.style.cursor = 'pointer';

        // 创建节点标签
        if (showLabels.value) {
          const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          text.setAttribute('text-anchor', 'middle');
          text.setAttribute('dy', '40');
          text.setAttribute('fill', '#303133');
          text.setAttribute('font-size', '12');
          text.textContent = node.label || node.id;
          nodeGroup.appendChild(text);
        }

        // 节点图标（简化为文字）
        const icon = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        icon.setAttribute('text-anchor', 'middle');
        icon.setAttribute('dy', '4');
        icon.setAttribute('fill', 'white');
        icon.setAttribute('font-size', '10');
        icon.setAttribute('font-weight', 'bold');
        icon.textContent = node.icon ? node.icon.substring(0, 3).toUpperCase() : 'N';

        nodeGroup.appendChild(circle);
        nodeGroup.appendChild(icon);
        svg.appendChild(nodeGroup);

        nodeElements[node.id] = { x, y, element: nodeGroup };
      });
    }

    // 绘制连接线
    if (props.topologyData.connections) {
      props.topologyData.connections.forEach(connection => {
        const fromNode = nodeElements[connection.from];
        const toNode = nodeElements[connection.to];

        if (fromNode && toNode) {
          const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
          line.setAttribute('x1', fromNode.x.toString());
          line.setAttribute('y1', fromNode.y.toString());
          line.setAttribute('x2', toNode.x.toString());
          line.setAttribute('y2', toNode.y.toString());
          line.setAttribute('stroke', connection.color || '#909399');
          line.setAttribute('stroke-width', '2');
          
          if (connection.style === 'dashed') {
            line.setAttribute('stroke-dasharray', '5,5');
          }

          // 插入到节点之前，使线条在节点下方
          svg.insertBefore(line, svg.firstChild);

          // 如果是双向连接，添加双向箭头
          if (connection.bidirectional) {
            // 简化处理，这里可以添加箭头标记
          }
        }
      });
    }

    container.appendChild(svg);
    
    // 添加标题
    if (props.topologyData.title) {
      const title = document.createElement('div');
      title.className = 'topology-title';
      title.textContent = props.topologyData.title;
      title.style.cssText = `
        text-align: center;
        font-weight: bold;
        margin-bottom: 10px;
        color: #303133;
      `;
      container.insertBefore(title, svg);
    }

  } catch (err) {
    error.value = '拓扑图渲染失败: ' + String(err);
    console.error('拓扑图渲染错误:', err);
  }
};

// 控制函数
const zoomIn = () => {
  // 简化实现
  if (networkContainer.value) {
    const svg = networkContainer.value.querySelector('svg');
    if (svg) {
      const currentScale = parseFloat(svg.style.transform.replace(/[^0-9.]/g, '') || '1');
      const newScale = Math.min(currentScale * 1.2, 3);
      svg.style.transform = `scale(${newScale})`;
    }
  }
};

const zoomOut = () => {
  // 简化实现
  if (networkContainer.value) {
    const svg = networkContainer.value.querySelector('svg');
    if (svg) {
      const currentScale = parseFloat(svg.style.transform.replace(/[^0-9.]/g, '') || '1');
      const newScale = Math.max(currentScale / 1.2, 0.3);
      svg.style.transform = `scale(${newScale})`;
    }
  }
};

const resetView = () => {
  if (networkContainer.value) {
    const svg = networkContainer.value.querySelector('svg');
    if (svg) {
      svg.style.transform = 'scale(1)';
    }
  }
};

// 监听数据变化
watch(() => props.topologyData, () => {
  nextTick(() => {
    renderSimpleTopology();
  });
}, { deep: true });

watch(showLabels, () => {
  renderSimpleTopology();
});

onMounted(() => {
  nextTick(() => {
    renderSimpleTopology();
  });
});

onBeforeUnmount(() => {
  // 清理资源
  if (network) {
    network = null;
  }
});
</script>

<style scoped>
.topology-viewer {
  width: 100%;
}

.topology-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 15px;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 4px;
  border: 1px solid #e4e7ed;
}

.network-container {
  width: 100%;
  min-height: 400px;
  position: relative;
  overflow: hidden;
  border-radius: 4px;
}

.empty-topology {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 400px;
  color: #909399;
  background: #f8f9fa;
  border: 1px dashed #dcdfe6;
  border-radius: 4px;
}

.empty-topology .el-icon {
  font-size: 48px;
  margin-bottom: 15px;
}

.empty-topology p {
  margin: 0;
  font-size: 16px;
}

.error-message {
  margin-top: 15px;
}

.topology-title {
  text-align: center;
  font-weight: bold;
  margin-bottom: 10px;
  color: #303133;
  font-size: 16px;
}

/* SVG样式增强 */
:deep(svg) {
  transition: transform 0.3s ease;
  transform-origin: center center;
}

:deep(svg circle:hover) {
  fill: #66b1ff;
  stroke-width: 4;
}

:deep(svg text) {
  user-select: none;
  pointer-events: none;
}

@media (max-width: 768px) {
  .topology-controls {
    flex-direction: column;
    gap: 10px;
    align-items: stretch;
  }
  
  .topology-controls .el-button-group {
    justify-content: center;
  }
}
</style>