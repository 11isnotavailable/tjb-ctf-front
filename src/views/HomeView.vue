<script setup lang="ts">
import { useRouter } from 'vue-router';
import { Setting, Aim, ShieldCheck } from '@element-plus/icons-vue';

const router = useRouter();
</script>

<template>
  <div class="home-container">
    <div class="welcome-banner">
      <h1>欢迎来到 挑战杯-CTF 平台</h1>
      <p class="platform-description">一个动态生成的安全训练环境，结合AI与自动化攻防技术</p>

      <div class="action-buttons">
        <el-button type="primary" size="large" @click="router.push('/home/questions')">
          开始挑战
        </el-button>
        <el-button type="success" size="large" @click="router.push('/home/deploy')" style="margin-left: 16px;">
          AI 部署助手
        </el-button>
      </div>
    </div>

    <div class="features-section">
      <h2 class="section-title">核心功能</h2>

      <el-row :gutter="20">
        <el-col :span="8">
          <el-card class="feature-card">
            <template #header>
              <div class="feature-header">
                <el-icon><Setting /></el-icon>
                <span>动态场景生成</span>
              </div>
            </template>
            <div class="feature-content">
              <p>通过AI智能体自动生成网络拓扑、配置文件和注入漏洞，创建高度定制的靶场环境</p>
            </div>
          </el-card>
        </el-col>

        <el-col :span="8">
          <el-card class="feature-card">
            <template #header>
              <div class="feature-header">
                <el-icon><Aim /></el-icon>
                <span>智能攻击模拟</span>
              </div>
            </template>
            <div class="feature-content">
              <p>基于ATT&CK框架的自动化攻击模拟，针对指定目标执行精准的渗透测试</p>
            </div>
          </el-card>
        </el-col>

        <el-col :span="8">
          <el-card class="feature-card">
            <template #header>
              <div class="feature-header">
                <el-icon><ShieldCheck /></el-icon>
                <span>自适应防御</span>
              </div>
            </template>
            <div class="feature-content">
              <p>实时分析攻击行为，自动调整防御策略，提供全面的安全防护能力</p>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<style scoped>
.home-container {
  padding: 20px;
}

.welcome-banner {
  text-align: center;
  padding: 60px 20px;
  margin-bottom: 40px;
  background-color: #f5f7fa;
  border-radius: 8px;
}

.welcome-banner h1 {
  font-size: 32px;
  color: #303133;
  margin-bottom: 20px;
}

.platform-description {
  font-size: 18px;
  color: #606266;
  margin-bottom: 30px;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
}

.action-buttons {
  margin-top: 20px;
}

.section-title {
  text-align: center;
  margin-bottom: 30px;
  font-size: 24px;
  color: #303133;
}

.feature-card {
  height: 100%;
  transition: all 0.3s;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.feature-header {
  display: flex;
  align-items: center;
  font-size: 18px;
  color: #303133;
}

.feature-header .el-icon {
  margin-right: 10px;
  font-size: 20px;
  color: #409EFF;
}

.feature-content {
  color: #606266;
  line-height: 1.6;
}

@media (max-width: 768px) {
  .el-col {
    margin-bottom: 20px;
  }
}
</style>
