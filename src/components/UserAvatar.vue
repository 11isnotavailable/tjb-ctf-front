<template>
  <div class="user-avatar-container">
    <div 
      class="avatar" 
      :class="{ 'dark': isDarkTheme, 'light': !isDarkTheme }"
      @click="toggleDropdown"
    >
      {{ userInitials }}
    </div>
    
    <div v-if="showDropdown" class="dropdown-menu" @click.stop>
      <div class="dropdown-item" @click="goToProfile">
        个人信息
      </div>
      <div class="dropdown-item" @click="logout">
        退出登录
      </div>
    </div>
    
    <div v-if="showDropdown" class="dropdown-overlay" @click="hideDropdown"></div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';
import { useThemeStore } from '@/stores/theme';

const router = useRouter();
const userStore = useUserStore();
const themeStore = useThemeStore();

const showDropdown = ref(false);
const isDarkTheme = computed(() => themeStore.isDarkTheme);

// 获取用户名首字母或邮箱首字母作为头像显示
const userInitials = computed(() => {
  const username = userStore.userInfo.username || userStore.userInfo.email || '';
  if (!username) return '?';
  
  // 如果是中文名，取第一个字
  if (/[\u4e00-\u9fa5]/.test(username)) {
    return username.charAt(0);
  }
  
  // 如果是英文名，取首字母
  return username.charAt(0).toUpperCase();
});

// 切换下拉菜单显示
const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value;
};

// 隐藏下拉菜单
const hideDropdown = () => {
  showDropdown.value = false;
};

// 去个人信息页面
const goToProfile = () => {
  hideDropdown();
  router.push('/home/profile');
};

// 退出登录
const logout = () => {
  hideDropdown();
  userStore.logout();
  router.push('/');
};
</script>

<style scoped>
.user-avatar-container {
  position: relative;
  display: inline-flex;
  align-items: center;
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 16px;
  transition: all 0.3s ease;
  cursor: pointer;
}

.avatar.light {
  background-color: #4a99e9;
  color: white;
}

.avatar.dark {
  background-color: #181818;
  color: white;
  border: 2px solid #333;
}

.avatar:hover {
  transform: scale(1.05);
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.1);
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  z-index: 1000;
  min-width: 120px;
  margin-top: 8px;
}

.dropdown-item {
  padding: 12px 16px;
  cursor: pointer;
  transition: background-color 0.3s;
  font-size: 14px;
  color: #606266;
}

.dropdown-item:hover {
  background-color: #f5f7fa;
}

.dropdown-item:first-child {
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
}

.dropdown-item:last-child {
  border-bottom-left-radius: 4px;
  border-bottom-right-radius: 4px;
}

.dropdown-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 999;
  background: transparent;
}

/* 暗色主题下的下拉菜单样式 */
.dark .dropdown-menu {
  background: #303133;
  border-color: #4c4d4f;
}

.dark .dropdown-item {
  color: #e4e7ed;
}

.dark .dropdown-item:hover {
  background-color: #262727;
}
</style> 