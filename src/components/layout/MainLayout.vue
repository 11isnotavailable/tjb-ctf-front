<template>
  <div class="layout-container">
    <header class="header">
      <div class="header-content">
        <div class="brand">
          <div class="brand-logo">挑战杯-CTF</div>
        </div>
        <div class="nav-section">
          <div class="nav-item" @click="goToHome">
            <el-icon>
              <HomeFilled />
            </el-icon>
            <span>首页</span>
          </div>
          <div class="nav-item">
            <el-icon>
              <DataLine />
            </el-icon>
            <span>平台介绍</span>
          </div>
          <div class="nav-item" @click="goToQuestions">
            <el-icon>
              <List />
            </el-icon>
            <span>题目</span>
          </div>
          <div class="nav-item" @click="goToLeaderboard">
            <el-icon>
              <Trophy />
            </el-icon>
            <span>排行榜</span>
          </div>
          <div class="nav-item" @click="goToDeploy">
            <el-icon>
              <Monitor />
            </el-icon>
            <span>部署</span>
          </div>
          <div class="nav-item" @click="goToAttack">
            <el-icon>
              <CrossSwords />
            </el-icon>
            <span>一键攻击</span>
          </div>
          <div class="nav-item" @click="goToDefense">
            <el-icon>
              <Shield />
            </el-icon>
            <span>智能防御</span>
          </div>
        </div>
        <div class="action-area">
          <ThemeSwitcher />
          <template v-if="userStore.isAuthenticated">
            <UserAvatar />
          </template>
          <template v-else>
            <el-button class="login-btn" type="primary" @click="goToLogin('/login')"
              >登录</el-button
            >
          </template>
        </div>
      </div>
    </header>
    <main class="main-content">
      <router-view />
    </main>
    <footer class="footer">
      <div class="footer-content">
        <span>&copy; {{ currentYear }} 挑战杯-CTF 版权所有</span>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { HomeFilled, DataLine, List, Monitor, Trophy } from '@element-plus/icons-vue'
import CrossSwords from '@/assets/icons/CrossSwords.vue'
import Shield from '@/assets/icons/Shield.vue'
import ThemeSwitcher from '@/components/ThemeSwitcher.vue'
import UserAvatar from '@/components/UserAvatar.vue'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

const currentYear = computed(() => new Date().getFullYear())

const goToHome = () => {
  router.push('/')
}
const goToQuestions = () => {
  router.push('/home/questions')
}
const goToLeaderboard = () => {
  router.push('/home/leaderboard')
}
const goToDeploy = () => {
  router.push('/home/deploy')
}
const goToLogin = (route = '/login') => {
  router.push(route)
}
const goToDefense = () => {
  router.push('/home/defend/capture')
}
const goToAttack = () => {
  router.push('/home/attack')
}
</script>

<style scoped>
.layout-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  background-color: var(--header-background, #fff);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  position: relative;
  z-index: 10;
  width: 100%;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-height: 60px;
  padding: 10px 40px;
}

.brand {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.brand-logo {
  font-size: 24px;
  font-weight: bold;
  color: #409eff;
  letter-spacing: 2px;
  font-family: 'Segoe UI', 'Arial', 'Helvetica Neue', sans-serif;
  text-align: center;
  line-height: 32px;
}

.nav-section {
  display: flex;
  align-items: center;
  position: absolute;
  left: 200px;
  height: auto;
  padding: 5px 0;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 5px 15px;
  cursor: pointer;
  transition: color 0.2s;
  color: var(--color-text, #333);
}

.nav-item .el-icon,
.custom-icon {
  margin-bottom: 4px;
  font-size: 18px;
  width: 18px;
  height: 18px;
  display: inline-block;
  vertical-align: middle;
}

.nav-item span {
  font-size: 12px;
  white-space: nowrap;
}

.nav-item:hover {
  color: var(--color-primary, #409eff);
}

.action-area {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-shrink: 0;
  height: auto;
  padding: 5px 0;
}

.el-icon {
  font-size: 20px;
  color: var(--color-text, #333);
  cursor: pointer;
}

.login-btn {
  font-weight: 500;
  margin-left: 10px;
}

.main-content {
  margin: 0 auto;
  width: 100%;
  padding: 0;
  flex: 1;
}

.footer {
  background-color: #f5f7fa;
  display: flex;
  align-items: center;
  justify-content: center;
}

.footer-content {
  text-align: center;
  color: #909399;
}
</style>
