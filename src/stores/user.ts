import { defineStore } from 'pinia';
import { ref } from 'vue';
import { 
  login, 
  register, 
  getUserInfo, 
  getUserInfoById,
  updateUserInfo,
  updateUserPassword,
  sendVerificationCode 
} from '@/api/user';
import { setToken, removeToken, getToken } from '@/utils/auth';
import { ElMessage } from 'element-plus';

export interface UserInfo {
  user_id?: number;
  username?: string;
  email?: string;
  is_admin?: boolean;
  register_time?: string;
}

export const useUserStore = defineStore('user', () => {
  const token = ref(getToken() || '');
  const userInfo = ref<UserInfo>({});
  const isAuthenticated = ref(!!token.value);

  // 初始化 - 如果已有令牌，自动获取用户信息
  const init = async () => {
    if (token.value) {
      isAuthenticated.value = true;
      try {
        await getUserInfoAction();
      } catch (error) {
        // 获取用户信息失败，清除令牌
        console.error('初始化用户信息失败:', error);
        logout();
      }
    }
  };

  // 登录
  const loginAction = async (credentials: { email: string; password: string }) => {
    try {
      const response = await login(credentials);
      if (response.code === 200 && response.data) {
        token.value = response.data.token;
        userInfo.value = response.data.user;
        isAuthenticated.value = true;
        setToken(response.data.token);
        return response.data;
      } else {
        throw new Error(response.message || '登录失败');
      }
    } catch (error) {
      console.error('登录失败:', error);
      throw error;
    }
  };

  // 发送验证码
  const sendVerificationCodeAction = async (email: string) => {
    try {
      const response = await sendVerificationCode({ email });
      if (response.code === 200) {
        return response.data;
      } else {
        throw new Error(response.message || '发送验证码失败');
      }
    } catch (error) {
      console.error('发送验证码失败:', error);
      throw error;
    }
  };

  // 注册
  const registerAction = async (userData: { 
    email: string; 
    password: string; 
    verification_code: string | number 
  }) => {
    try {
      console.log('开始注册:', userData);
      const response = await register(userData);
      console.log('注册响应:', response);
      if (response.code === 200) {
        return response.data;
      } else {
        throw new Error(response.message || '注册失败');
      }
    } catch (error) {
      console.error('注册失败:', error);
      throw error;
    }
  };

  // 获取用户信息
  const getUserInfoAction = async () => {
    if (!token.value) return null;
    
    try {
      const response = await getUserInfo();
      if (response.code === 200 && response.data) {
        userInfo.value = response.data;
        return response.data;
      } else {
        throw new Error(response.message || '获取用户信息失败');
      }
    } catch (error) {
      console.error('获取用户信息失败:', error);
      removeToken();
      isAuthenticated.value = false;
      throw error;
    }
  };

  // 获取指定用户信息
  const getUserInfoByIdAction = async (userId: number) => {
    try {
      const response = await getUserInfoById(userId);
      if (response.code === 200 && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || '获取用户信息失败');
      }
    } catch (error) {
      console.error(`获取用户 ${userId} 信息失败:`, error);
      throw error;
    }
  };

  // 更新用户信息
  const updateUserInfoAction = async (data: { username?: string; avatar?: string; signature?: string; }) => {
    try {
      const response = await updateUserInfo(data);
      if (response.code === 200 && response.data) {
        userInfo.value = { ...userInfo.value, ...data };
        return response.data;
      } else {
        throw new Error(response.message || '更新用户信息失败');
      }
    } catch (error) {
      console.error('更新用户信息失败:', error);
      throw error;
    }
  };

  // 更新用户密码
  const updatePasswordAction = async (data: { old_password: string; new_password: string; }) => {
    try {
      const response = await updateUserPassword(data);
      if (response.code === 200) {
        return true;
      } else {
        throw new Error(response.message || '更新密码失败');
      }
    } catch (error) {
      console.error('更新密码失败:', error);
      throw error;
    }
  };

  // 登出
  const logout = () => {
    token.value = '';
    userInfo.value = {};
    isAuthenticated.value = false;
    removeToken();
    ElMessage.success('已成功登出');
  };

  return {
    token,
    userInfo,
    isAuthenticated,
    init,
    loginAction,
    registerAction,
    getUserInfoAction,
    getUserInfoByIdAction,
    updateUserInfoAction,
    updatePasswordAction,
    sendVerificationCodeAction,
    logout
  };
}); 