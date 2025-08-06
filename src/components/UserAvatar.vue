<template>
  <div class="user-avatar-container">
    <el-dropdown trigger="click" @command="handleCommand">
      <div class="avatar" :class="{ 'dark': isDarkTheme, 'light': !isDarkTheme }">
        {{ userInitials }}
      </div>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item command="profile">
            <el-icon><User /></el-icon>
            个人信息
          </el-dropdown-item>
          <el-dropdown-item command="logout" divided>
            <el-icon><SwitchButton /></el-icon>
            退出登录
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { User, SwitchButton } from '@element-plus/icons-vue';
import { useUserStore } from '@/stores/user';
import { useThemeStore } from '@/stores/theme';

const router = useRouter();
const userStore = useUserStore();
const themeStore = useThemeStore();

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

// 下拉菜单命令处理
const handleCommand = (command: string) => {
  if (command === 'profile') {
    router.push('/home/profile');
  } else if (command === 'logout') {
    userStore.logout();
    router.push('/');
  }
};
</script>

<style scoped>
.user-avatar-container {
  display: inline-flex;
  align-items: center;
  cursor: pointer;
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
</style> 