import request from '@/utils/request';

interface ApiResponse<T> {
  code: number;
  data: T | null;
  message: string;
}

// 容器状态枚举
export enum ContainerStatus {
  CREATING = 'CREATING',
  RUNNING = 'RUNNING',
  CLOSING = 'CLOSING',
  CLOSED = 'CLOSED'
}

// 容器类型枚举
export enum DockerType {
  STATIC = 'STATIC',
  DYNAMIC = 'DYNAMIC',
  ISOLATED = 'ISOLATED'
}

export enum PcapStatusEnum {
  RUNNING = 'running',
  STOPPED = 'stopped',
  STOPPED_WITH_FILES = 'stopped_with_files',
  FAILED = 'failed',
}

// 容器信息接口
export interface ContainerInfo {
  docker_id: number;
  access: string;
  flag?: string;
  status: ContainerStatus;
  create_time: string;
  timeout: number;
  refresh_count: number;
  type: DockerType;
  local_port: string;
  question_id: number;
  user_id: number;
  question_name?: string;
  username?: string;
}

export interface PcapStatus {
  status: PcapStatusEnum
}

export interface PcapFilesResponse {
  pcap_files: string[]
}

export interface LogFilesResponse {
  log_files: string[]
}

// 容器列表响应接口（管理员用）
export interface ContainerListResponse {
  items: ContainerInfo[];
  total: number;
  offset: number;
  limit: number;
  has_more: boolean;
}

// 启动容器
export function startContainer(data: { question_id: number }) {
  return request.post<ApiResponse<{ container: ContainerInfo }>>('/docker/container', data);
}

// 获取容器信息
export function getContainerInfo(container_id: number) {
  return request.get<ApiResponse<ContainerInfo>>(`/docker/container/${container_id}`);
}

// 获取用户容器列表
export function getUserContainerList() {
  return request.get<ApiResponse<Array<ContainerInfo>>>('/docker/containers');
}

// 刷新容器
export function refreshContainer(container_id: number) {
  return request.put<ApiResponse<{ container: ContainerInfo; message: string }>>(`/docker/container/${container_id}`);
}

// 停止容器
export function stopContainer(container_id: number) {
  return request.delete<ApiResponse<{ message: string }>>(`/docker/container/${container_id}`);
}

// pcap 相关接口
export function getPcapStatus(container_id: number) {
  return request.get<ApiResponse<PcapStatus>>(`/docker/pcap/${container_id}`);
}

export function stopPcapWithFiles(container_id: number) {
  return request.post<ApiResponse<PcapFilesResponse>>(`/docker/pcap/${container_id}/stop`);
}

export function getContainerLogs(container_id: number) {
  return request.get<ApiResponse<LogFilesResponse>>(`/docker/logs/${container_id}`);
}

// 获取容器列表（管理员接口）
export function getContainerList(params: {
  question_id?: number;
  available?: boolean;
  page?: number;
  size?: number;
}) {
  return request.get<ApiResponse<ContainerListResponse>>('/docker/admin/container', { params });
}
