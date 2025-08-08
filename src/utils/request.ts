import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { getToken } from '@/utils/auth';
import router from '@/router';
import { ElMessage } from 'element-plus';
import { API_BASE_URL } from '@/utils/config';

interface ApiResponse<T = any> {
  code: number;
  data: T | null;
  message: string;
}

class Request {
  private instance: AxiosInstance;

  constructor(config: AxiosRequestConfig) {
    this.instance = axios.create(config);
    this.setupInterceptors();
  }

  private setupInterceptors() {
    // 请求拦截器
    this.instance.interceptors.request.use(
      (config) => {
        const token = getToken();
        
        if (token && config.headers) {
          config.headers['Authorization'] = `Bearer ${token}`;
        }
        
        console.log('请求URL:', config.url);
        console.log('请求方法:', config.method);
        console.log('请求基础路径:', config.baseURL);
        console.log('完整请求路径:', `${config.baseURL}${config.url}`);
        
        return config;
      },
      (error) => Promise.reject(error)
    );

    // 响应拦截器
    this.instance.interceptors.response.use(
      (response): any => {
        // 检查是否是文件下载请求（响应类型为blob）
        if (response.config.responseType === 'blob') {
          console.log('文件下载响应:', {
            url: response.config?.url,
            status: response.status,
            contentType: response.headers['content-type'],
            dataSize: response.data?.size || 'unknown'
          });
          
          // 对于文件下载，直接返回原始响应
          return response;
        }
        
        const res: ApiResponse = response.data;
        
        console.log('API响应详情:', {
          url: response.config?.url,
          status: response.status,
          data: res
        });
        
        // 请求成功
        if (res.code === 200) {
          return res;
        }
        
        // 业务层面的错误处理
        console.error('业务逻辑错误:', res);
        console.error('错误码:', res.code);
        console.error('错误消息:', res.message);
        
        // 不要弹出错误提示，让业务层面决定如何处理
        // ElMessage.error(res.message || '请求失败');
        
        // 特定错误处理
        if (res.code === 401) {
          ElMessage.error('登录已过期，请重新登录');
          router.push('/login');
        }
        
        // 创建一个包含完整响应信息的错误对象
        const error = new Error(res.message || '请求失败');
        (error as any).response = {
          status: response.status,
          data: res
        };
        (error as any).businessError = true; // 标记这是业务逻辑错误，不是HTTP错误
        
        return Promise.reject(error);
      },
      (error) => {
        console.error('请求错误详情:', error);
        
        if (error.response) {
          const { status, data } = error.response;
          const message = data?.message || `请求失败 (${status})`;
          
          // 更详细的错误日志
          console.error('响应状态:', status);
          console.error('响应数据:', data);
          
          // 处理常见HTTP错误
          switch (status) {
            case 400:
              ElMessage.error(`请求参数错误: ${message}`);
              break;
            case 401:
              router.push('/login');
              ElMessage.error('登录已过期，请重新登录');
              break;
            case 403:
              ElMessage.error('无访问权限');
              break;
            case 404:
              ElMessage.error('请求的资源不存在');
              break;
            case 409:
              ElMessage.error(message); // 邮箱已被注册等冲突错误
              break;
            case 422:
              ElMessage.error(message); // 表单验证错误
              break;
            case 500:
              ElMessage.error('服务器内部错误');
              break;
            default:
              ElMessage.error(`请求失败 (${status}): ${message}`);
          }
        } else if (error.request) {
          console.error('请求无响应:', error.request);
          ElMessage.error('网络错误，请检查网络连接');
        } else {
          console.error('请求配置错误:', error.message);
          ElMessage.error('请求配置错误');
        }
        
        return Promise.reject(error);
      }
    );
  }

  request<T = any>(config: AxiosRequestConfig): Promise<T> {
    return this.instance.request(config);
  }

  get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.instance.get(url, config);
  }

  post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.instance.post(url, data, config);
  }

  put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.instance.put(url, data, config);
  }

  delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.instance.delete(url, config);
  }
}

export default new Request({
  baseURL: API_BASE_URL,
  timeout: 3000000, // 5分钟超时，适应后端长时间处理
  headers: {
    'Content-Type': 'application/json'
  }
}); 