import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

import App from './App.vue'
import router from './router'
import { useThemeStore } from './stores/theme'
import { useUserStore } from './stores/user'
import { watch } from 'vue';

// 添加Vue全局错误处理
const handleError = (err: any, instance: any, info: string) => {
  console.error('Vue全局错误:', err);
  console.error('组件:', instance);
  console.error('信息:', info);
};

const app = createApp(App)

// 注册全局错误处理器
app.config.errorHandler = handleError;
app.config.warnHandler = (msg) => console.warn('Vue警告:', msg);

// 在全局对象上设置Vue实例以便调试
(window as any).app = app;

// 注册Element Plus图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// 使用Pinia状态管理
const pinia = createPinia()
app.use(pinia)

// 初始化主题
const themeStore = useThemeStore(pinia)
console.log('加载主题:', themeStore.currentTheme);
themeStore.loadSavedTheme()

// 自动切换 body class
const setBodyThemeClass = () => {
  document.body.classList.toggle('dark-theme', themeStore.currentTheme === 'dark');
  document.body.classList.toggle('light-theme', themeStore.currentTheme === 'light');
};
setBodyThemeClass();
watch(() => themeStore.currentTheme, setBodyThemeClass);

// 初始化用户信息
const userStore = useUserStore(pinia)
console.log('初始化用户信息');
userStore.init().then(() => {
  console.log('用户认证状态:', userStore.isAuthenticated ? '已登录' : '未登录');
}).catch(error => {
  console.error('用户初始化失败:', error);
});

app.use(ElementPlus)
app.use(router)

app.mount('#app')// 输出Vue和Router已准备就绪
console.log('应用已挂载');


