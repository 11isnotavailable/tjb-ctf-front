import request from '@/utils/request';

interface ApiResponse<T> {
  code: number;
  data: T | null;
  message: string;
}

// 启动攻击请求参数
export interface StartAttackReq {
  ip: string;
  port: number;
  username: string;
  password: string;
  is_white: boolean;
  deploy_id?: number;
}

// 启动攻击响应数据
export interface StartAttackResp {
  attack_id: string;
  status: string;
  message: string;
}

// 攻击日志响应数据
export interface AttackLogsResp {
  attack_id: string;
  logs: string[];
  is_finished: boolean;
  flag: string | null;
}

// 启动攻击服务
export function startAttack(data: StartAttackReq) {
  return request.post<ApiResponse<StartAttackResp>>('/attacker/start', data);
}

// 获取攻击日志（轮询）
export function getAttackLogs(attackId: string) {
  return request.get<ApiResponse<AttackLogsResp>>(`/attacker/logs/${attackId}`);
}

// 停止攻击服务
export function stopAttack(attackId: string) {
  return request.delete<ApiResponse<string>>(`/attacker/${attackId}`);
}