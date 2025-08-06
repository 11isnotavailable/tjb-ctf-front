<template>
  <div class="theme-switcher">
    <div 
      class="theme-dropdown-link"
      @click="toggleDropdown"
    >
      <div class="setting-icon">⚙️</div>
    </div>
    
    <div v-if="showDropdown" class="dropdown-menu" @click.stop>
      <div 
        v-for="theme in availableThemes" 
        :key="theme.value" 
        class="dropdown-item"
        :class="{ active: currentTheme === theme.value }"
        @click="selectTheme(theme.value)"
      >
        {{ theme.label }}
      </div>
    </div>
    
    <div v-if="showDropdown" class="dropdown-overlay" @click="hideDropdown"></div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useThemeStore, type ThemeType } from '@/stores/theme';

const themeStore = useThemeStore();
const currentTheme = computed(() => themeStore.currentTheme);
const showDropdown = ref(false);

const availableThemes = [
  { label: '明亮主题', value: 'light' },
  { label: '暗黑主题', value: 'dark' }
];

const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value;
};

const hideDropdown = () => {
  showDropdown.value = false;
};

const selectTheme = (theme: ThemeType) => {
  themeStore.setTheme(theme);
  showDropdown.value = false;
};
</script>

<style scoped>
.theme-switcher {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.theme-dropdown-link {
  cursor: pointer;
  display: flex;
  align-items: center;
  font-size: 16px;
  padding: 8px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.theme-dropdown-link:hover {
  background-color: rgba(0, 0, 0, 0.1);
}

.setting-icon {
  font-size: 16px;
  user-select: none;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  min-width: 120px;
  overflow: hidden;
}

.dropdown-item {
  padding: 12px 16px;
  cursor: pointer;
  font-size: 14px;
  color: #333;
  transition: background-color 0.2s;
}

.dropdown-item:hover {
  background-color: #f5f5f5;
}

.dropdown-item.active {
  color: var(--el-color-primary, #409eff);
  font-weight: bold;
  background-color: rgba(64, 158, 255, 0.1);
}

.dropdown-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 999;
}
</style> 