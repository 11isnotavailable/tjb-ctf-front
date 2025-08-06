<template>
  <div class="theme-switcher">
    <el-dropdown @command="handleCommand" trigger="click">
      <span class="theme-dropdown-link">
        <el-icon class="el-icon-setting">
          <Setting />
        </el-icon>
      </span>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item 
            v-for="theme in availableThemes" 
            :key="theme.value" 
            :command="theme.value"
            :class="{ active: currentTheme === theme.value }"
          >
            {{ theme.label }}
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Setting } from '@element-plus/icons-vue';
import { useThemeStore, type ThemeType } from '@/stores/theme';
import { ElDropdown, ElDropdownItem, ElDropdownMenu, ElIcon } from 'element-plus';

const themeStore = useThemeStore();
const currentTheme = computed(() => themeStore.currentTheme);

const availableThemes = [
  { label: '明亮主题', value: 'light' },
  { label: '暗黑主题', value: 'dark' }
];

const handleCommand = (theme: ThemeType) => {
  themeStore.setTheme(theme);
};
</script>

<style scoped>
.theme-switcher {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.theme-dropdown-link {
  cursor: pointer;
  display: flex;
  align-items: center;
  font-size: 16px;
}

.el-icon-setting {
  font-size: 16px;
  margin-right: 5px;
}

:deep(.active) {
  color: var(--color-primary);
  font-weight: bold;
}

:deep(.el-dropdown-menu__item:hover) {
  background-color: rgba(var(--color-primary-rgb), 0.1);
}
</style> 