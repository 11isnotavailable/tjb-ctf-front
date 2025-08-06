<template>
  <div class="not-found">
    <div class="content">
      <h1>404</h1>
      <h2>页面未找到</h2>
      <p>抱歉，您访问的页面不存在或已被移除</p>
      <el-button type="primary" @click="router.push('/')">返回首页</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();
</script>

<style scoped>
.not-found {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 80vh;
  text-align: center;
}

.content h1 {
  font-size: 120px;
  color: #409EFF;
  margin: 0;
  line-height: 1.2;
}

.content h2 {
  font-size: 32px;
  color: #303133;
  margin: 0 0 20px;
}

.content p {
  font-size: 16px;
  color: #606266;
  margin-bottom: 30px;
}
</style> 