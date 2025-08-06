<template>
  <div class="test-detail">
    <el-card>
      <template #header>
        <h2>题目详情页测试</h2>
      </template>
      
      <el-space direction="vertical" size="large" style="width: 100%">
        <el-alert 
          title="测试说明" 
          description="此页面用于测试题目详情页的各项功能，包括拓扑图显示、容器管理、提交记录等。"
          type="info" 
          show-icon 
        />
        
        <div>
          <h3>快速测试</h3>
          <el-space wrap>
            <el-button type="primary" @click="gotoMockDetail">访问模拟题目详情</el-button>
            <el-button type="success" @click="testTopology">查看新设计特点</el-button>
            <el-button type="warning" @click="testAPI">测试API接口</el-button>
          </el-space>
        </div>
        
        <div>
          <h3>设计预览</h3>
          <el-alert 
            title="新设计特点" 
            description="参考竞品布局：左侧题目信息+右侧统计标签，简化容器管理，突出核心功能"
            type="success" 
            show-icon 
          />
        </div>
        
        <div>
          <h3>功能清单</h3>
          <el-table :data="featureList" stripe>
            <el-table-column prop="feature" label="功能" width="200" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="scope">
                <el-tag :type="scope.row.implemented ? 'success' : 'warning'">
                  {{ scope.row.implemented ? '已实现' : '待测试' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="description" label="说明" />
          </el-table>
        </div>
      </el-space>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
// import TopologyViewer from '@/components/common/TopologyViewer.vue';
// import { mockTopologyData } from '@/utils/test-data';

const router = useRouter();

const featureList = ref([
  { feature: '简洁布局设计', implemented: true, description: '参考竞品，左右分栏，简洁明了' },
  { feature: '题目信息展示', implemented: true, description: '标题、描述、难度星级、统计数据' },
  { feature: '附件下载', implemented: true, description: '题目附件一键下载功能' },
  { feature: '环境管理', implemented: true, description: '简化的启动/访问/停止环境功能' },
  { feature: '实时状态', implemented: true, description: '环境状态实时更新，倒计时显示' },
  { feature: 'Flag提交', implemented: true, description: '答案提交和结果反馈' },
  { feature: '题目标签', implemented: true, description: '技术栈和类型标签展示' },
  { feature: '提交记录', implemented: true, description: '个人提交历史记录' },
  { feature: '解题统计', implemented: true, description: 'solves数量、尝试次数、解题率' },
  { feature: '响应式设计', implemented: true, description: '移动端友好的自适应布局' }
]);

const gotoMockDetail = () => {
  // 跳转到一个存在的题目ID
  router.push('/home/questions/1');
  ElMessage.success('跳转到题目详情页');
};

const testTopology = () => {
  ElMessage.info('新设计测试：简洁的CTF题目详情页布局');
};

const testAPI = () => {
  ElMessage.warning('API测试：请确保后端服务已启动，然后访问具体的题目详情页');
};
</script>

<style scoped>
.test-detail {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

.test-detail h3 {
  color: #409EFF;
  margin-bottom: 15px;
}
</style>