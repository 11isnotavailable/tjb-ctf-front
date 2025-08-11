<template>
  <div class="login-page" :class="{'dark-theme': isDarkTheme, 'light-theme': !isDarkTheme}">
    <!-- Silk画布背景效果 -->
    <SilkCanvas />

    <div class="login-container">
      <div class="login-form">
        <!-- 打字机效果的标题 -->
        <TypewriterText
          :key="'login-' + currentTheme"
          text="▶ 天演-CTF平台登录"
          :speed="80"
          tag="h2"
          class="title"
        />

        <el-form ref="formRef" :model="form" :rules="rules" @submit.prevent="handleSubmit">
          <el-form-item prop="email">
            <el-input
              v-model="form.email"
              placeholder="邮箱"
              prefix-icon="Message"
              autocomplete="email"
            />
          </el-form-item>

          <el-form-item prop="password">
            <el-input
              v-model="form.password"
              type="password"
              placeholder="密码"
              prefix-icon="Lock"
              autocomplete="current-password"
              show-password
            />
          </el-form-item>

          <el-form-item>
            <el-button type="primary" native-type="submit" :loading="loading" class="submit-btn">
              登录
            </el-button>
          </el-form-item>

          <div class="form-footer">
            <span>还没有账号？</span>
            <router-link to="/register">立即注册</router-link>
          </div>
        </el-form>
      </div>

      <!-- 主题切换器 -->
      <div class="theme-switch-container">
        <ThemeSwitcher />
      </div>

      <!-- 返回首页 -->
      <div class="back-home">
        <el-button plain size="small" @click="goBackToHome">
          <el-icon class="mr-1"><HomeFilled /></el-icon>
          返回首页
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { useUserStore } from '@/stores/user';
import { useThemeStore } from '@/stores/theme';
import { validateFormField } from '@/utils/validator';
import TypewriterText from '@/components/effects/TypewriterText.vue';
import ThemeSwitcher from '@/components/ThemeSwitcher.vue';
import SilkCanvas from '@/components/effects/SilkCanvas.vue';
import { HomeFilled } from '@element-plus/icons-vue';

const router = useRouter();
const userStore = useUserStore();
const themeStore = useThemeStore();
const formRef = ref();
const loading = ref(false);

// 表单数据
const form = reactive({
  email: '',
  password: ''
});

// 表单验证规则
const rules = reactive({
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { validator: validateFormField, trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { validator: validateFormField, trigger: 'blur' }
  ]
});

// 主题相关
const currentTheme = computed(() => themeStore.currentTheme);
const isDarkTheme = computed(() => themeStore.isDarkTheme);

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return;

  try {
    loading.value = true;
    await formRef.value.validate();

    const { email, password } = form;
    const success = await userStore.loginAction({ email, password });

    if (success) {
      ElMessage.success('登录成功');
      router.push('/');
    }
  } catch (error) {
    console.error('表单验证失败:', error);
  } finally {
    loading.value = false;
  }
};

// 返回首页
const goBackToHome = () => {
  router.replace('/');
};

onMounted(() => {
  console.log('LoginView mounted, theme:', isDarkTheme.value ? 'dark' : 'light');
});
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  width: 100%;
  position: relative;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 暗色主题 */
.dark-theme {
  background-color: transparent;
}

/* 亮色主题 */
.light-theme {
  background-color: transparent;
}

.login-page.dark-theme {
  background-color: #000 !important;
}
.login-page.light-theme {
  background-color: #fff !important;
}

/* 登录容器 */
.login-container {
  position: relative;
  width: 100%;
  max-width: 420px;
  z-index: 10;
  padding: 20px;
}

.login-form {
  width: 100%;
  padding: 40px;
  border-radius: 8px;
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(5px);
}

.dark-theme .login-form {
  background-color: rgba(0, 0, 0, 0.7);
  border: 1px solid rgba(74, 220, 74, 0.6);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15),
              0 0 10px rgba(74, 220, 74, 0.3),
              0 0 30px rgba(74, 220, 74, 0.2);
}

.light-theme .login-form {
  background-color: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(10, 132, 255, 0.6);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1),
              0 0 10px rgba(10, 132, 255, 0.2),
              0 0 30px rgba(10, 132, 255, 0.1);
}

/* 表单网格背景 */
.login-form::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  pointer-events: none;
}

.dark-theme .login-form::before {
  background-image:
    repeating-linear-gradient(0deg, transparent, transparent 19px, rgba(74, 220, 74, 0.07) 19px, rgba(74, 220, 74, 0.07) 20px),
    repeating-linear-gradient(90deg, transparent, transparent 19px, rgba(74, 220, 74, 0.07) 19px, rgba(74, 220, 74, 0.07) 20px);
}

.light-theme .login-form::before {
  background-image:
    repeating-linear-gradient(0deg, transparent, transparent 19px, rgba(10, 132, 255, 0.07) 19px, rgba(10, 132, 255, 0.07) 20px),
    repeating-linear-gradient(90deg, transparent, transparent 19px, rgba(10, 132, 255, 0.07) 19px, rgba(10, 132, 255, 0.07) 20px);
}

/* 表单顶部脉冲 */
.login-form::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 2px;
  animation: border-pulse 3s infinite linear;
  z-index: 1;
}

.dark-theme .login-form::after {
  background: linear-gradient(90deg, transparent, rgba(74, 220, 74, 0.8), transparent);
}

.light-theme .login-form::after {
  background: linear-gradient(90deg, transparent, rgba(10, 132, 255, 0.8), transparent);
}

@keyframes border-pulse {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.title {
  text-align: center;
  margin-bottom: 30px;
  color: var(--color-text);
  letter-spacing: 1px;
}

.submit-btn {
  width: 100%;
}

.form-footer {
  margin-top: 20px;
  text-align: center;
  font-size: 14px;
  color: var(--color-text);
}

.form-footer a {
  color: var(--color-primary);
  text-decoration: none;
}

/* 主题切换器和返回首页按钮 */
.theme-switch-container {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 11;
}

.back-home {
  margin-top: 20px;
  text-align: center;
}

/* 表单样式调整 */
:deep(.el-input__wrapper) {
  background-color: rgba(var(--color-background-rgb), 0.5);
  border: 1px solid rgba(var(--color-text-rgb), 0.2);
}

:deep(.el-input__inner) {
  color: var(--color-text);
}

:deep(.el-input__prefix-inner svg) {
  color: var(--color-text);
}

.mr-1 {
  margin-right: 5px;
}
</style>
