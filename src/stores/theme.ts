import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export type ThemeType = 'light' | 'dark';

interface ThemeConfig {
  name: string;
  backgroundColor: string;
  textColor: string;
  primaryColor: string;
  secondaryColor: string;
  matrixColor: string;
  matrixBackgroundColor: string;
  matrixSpeed: number;
  matrixDensity: number;
  headerBackground: string;
  footerBackground: string;
}

const themes: Record<ThemeType, ThemeConfig> = {
  light: {
    name: '明亮主题',
    backgroundColor: '#ffffff',
    textColor: '#333333',
    primaryColor: '#409eff',
    secondaryColor: '#67c23a',
    matrixColor: '#aaaaaa',  // 从深灰色#333333改为更淡的灰色#aaaaaa
    matrixBackgroundColor: 'rgba(255, 255, 255, 0.95)',
    matrixSpeed: 0.4,     // 降为原来的一半 (从1.2改为0.6)
    matrixDensity: 2.8,  // 增加到当前的3倍
    headerBackground: 'white',
    footerBackground: 'white'
  },
  dark: {
    name: '暗黑主题',
    backgroundColor: '#000000',  // 纯黑背景
    textColor: '#e0e0e0',
    primaryColor: '#0a84ff',
    secondaryColor: '#30d158',
    matrixColor: '#3a9c3a',  // 从#5cce5c改为更淡的绿色#3a9c3a
    matrixBackgroundColor: 'rgba(0, 0, 0, 0.95)',  // 对应纯黑背景
    matrixSpeed: 0.4,     // 降为原来的一半 (从1.5改为0.75)
    matrixDensity: 2.8,  // 增加到当前的3倍
    headerBackground: '#222222',  // 深灰顶栏
    footerBackground: '#222222'   // 深灰底栏
  }
};

export const useThemeStore = defineStore('theme', () => {
  const currentTheme = ref<ThemeType>('light');
  
  // 获取当前主题配置
  const themeConfig = computed(() => themes[currentTheme.value]);
  
  // 切换主题
  const setTheme = (theme: ThemeType) => {
    currentTheme.value = theme;
    applyThemeToDOM();
    localStorage.setItem('tjb_ctf_theme', theme);
  };
  
  // 从localStorage加载保存的主题
  const loadSavedTheme = () => {
    const savedTheme = localStorage.getItem('tjb_ctf_theme') as ThemeType | null;
    if (savedTheme && themes[savedTheme]) {
      currentTheme.value = savedTheme;
    }
    applyThemeToDOM();
  };
  
  // 将主题应用到DOM
  const applyThemeToDOM = () => {
    const theme = themeConfig.value;
    document.documentElement.style.setProperty('--color-background', theme.backgroundColor);
    document.documentElement.style.setProperty('--color-text', theme.textColor);
    document.documentElement.style.setProperty('--color-primary', theme.primaryColor);
    document.documentElement.style.setProperty('--color-secondary', theme.secondaryColor);
    document.documentElement.style.setProperty('--header-background', theme.headerBackground);
    document.documentElement.style.setProperty('--footer-background', theme.footerBackground);
    
    // 设置body背景色
    document.body.style.backgroundColor = theme.backgroundColor;
    document.body.style.color = theme.textColor;
    
    // 设置主题类名用于额外的CSS选择器
    document.body.className = document.body.className
      .replace(/theme-light|theme-dark/g, '')
      .trim();
    document.body.classList.add(`theme-${currentTheme.value}`);
  };
  
  return {
    currentTheme,
    themeConfig,
    setTheme,
    loadSavedTheme
  };
});
 