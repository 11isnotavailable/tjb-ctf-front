import request from '@/utils/request';

interface ApiResponse<T> {
  code: number;
  data: T | null;
  message: string;
}

// 启动防御请求参数
export interface StartDefenseReq {
  question_id: number;
  report: string
}

// 启动防御响应数据
export interface StartDefenseResp {
  defense_id: string;
  status: string;
  message: string;
}

// 防御日志响应数据
export interface DefenseLogsResp {
  defense_id: string;
  logs: string[];
  is_finished: boolean;
  flag: string | null;
}

// 启动防御服务
export function startDefense(data: StartDefenseReq) {
  return request.post<ApiResponse<StartDefenseResp>>('/defender/start', data);
}

// 获取防御日志（轮询）
export function getDefenseLogs(defenseId: string) {
  return request.get<ApiResponse<DefenseLogsResp>>(`/defender/logs/${defenseId}`);
}

// 停止防御服务
export function stopDefense(defenseId: string) {
  return request.delete<ApiResponse<string>>(`/defender/${defenseId}`);
}

