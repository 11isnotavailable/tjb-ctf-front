import request from '@/utils/request';

interface ApiResponse<T> {
  code: number;
  data: T | null;
  message: string;
}

interface LoginResponseData {
  token: string;
  user: {
    user_id: number;
    username: string;
    email: string;
    is_admin: boolean;
    register_time: string;
  }
}

interface RegisterResponseData {
  email: string;
  is_admin: boolean;
  register_time: string;
  user_id: number;
  username: string;
}

interface VerificationCodeResponse {
  expire_time: number;
  resend_interval: number;
}

// 发送邮箱验证码
export function sendVerificationCode(data: { email: string }) {
  return request.post<ApiResponse<VerificationCodeResponse>>('/user/send_verification_code', data);
}

// 用户登录
export function login(data: { email: string; password: string }) {
  return request.post<ApiResponse<LoginResponseData>>('/user/login', data);
}

// 用户注册
export function register(data: { email: string; password: string; verification_code: string | number }) {
  // 确保verification_code是整数类型
  const payload = {
    ...data,
    verification_code: parseInt(String(data.verification_code)),
    // 如果没有提供username，则默认使用email
    username: data.email
  };
  
  console.log('注册请求数据:', payload);
  
  return request.post<ApiResponse<RegisterResponseData>>('/user/register', payload);
}

// 获取用户信息
export function getUserInfo() {
  return request.get<ApiResponse<any>>('/user/profile');
}

// 获取指定用户信息
export function getUserInfoById(userId: number) {
  return request.get<ApiResponse<any>>(`/user/profile/${userId}`);
}

// 更新用户信息
export function updateUserInfo(data: {
  username?: string;
  avatar?: string;
  signature?: string;
}) {
  return request.put<ApiResponse<any>>('/user/profile/update_profile', data);
}

// 更新用户密码
export function updateUserPassword(data: {
  old_password: string;
  new_password: string;
}) {
  return request.post<ApiResponse<null>>('/user/profile/update_password', data);
}

// 获取用户统计数据
export function getUserStats(userId: number) {
  return request.get<ApiResponse<any>>(`/api/user/profile/${userId}/stats`);
}

// 获取用户解题记录
export function getUserRecords(userId: number, params?: {
  page?: number;
  page_size?: number;
}) {
  return request.get<ApiResponse<any>>(`/api/user/profile/${userId}/records`, { params });
}

// 获取分析报告（下载Word文件）
export function getEvaluationReport() {
  return request.get('/api/user/profile/evaluation', {
    responseType: 'blob', // 设置响应类型为blob以处理文件下载
  });
} 