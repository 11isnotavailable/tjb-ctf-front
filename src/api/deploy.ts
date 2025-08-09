import request from '@/utils/request';

interface ApiResponse<T> {
  code: number;
  data: T | null;
  message: string;
}

// 输入场景描述接口参数
export interface InputScenarioRequest {
  deploy_id: number;
  scenario: string;
}

// 输入设备信息接口参数
export interface InputDevicesRequest {
  deploy_id: number;
  devices: DeviceZone[];
}

// 设备分区接口
export interface DeviceZone {
  zone: string;
  subnet: string;
  target_machines: TargetMachine[];
}

// 目标机器接口
export interface TargetMachine {
  machine_type: string;
  system: string;
  ip_address: string;
  image: string;
}

// 生成拓扑图接口参数
export interface GenerateTopologyRequest {
  deploy_id: number;
}

// 漏洞注入接口参数
export interface VulnerabilityInjectionRequest {
  deploy_id: number;
  vulnerability_description: string;
}

// 输入场景描述
export function inputScenario(data: InputScenarioRequest) {
  return request.post<ApiResponse<null>>('/deploy/scenario', data);
}

// 输入设备信息
export function inputDevices(data: InputDevicesRequest) {
  return request.post<ApiResponse<null>>('/deploy/devices', data);
}

// 生成拓扑序列
export function generateTopology(data: GenerateTopologyRequest) {
  return request.post<ApiResponse<null>>('/deploy/topology', data);
}

// 生成拓扑图像响应数据
export interface TopologyImageResponse {
  deploy_id: number;
  topology_url: string;
}

// 生成拓扑图像
export function generateTopologyImage(data: GenerateTopologyRequest) {
  return request.post<ApiResponse<TopologyImageResponse>>('/deploy/topology_image', data);
}

// 生成Docker Compose文件
export function generateDockerCompose(data: GenerateTopologyRequest) {
  return request.post<ApiResponse<null>>('/deploy/docker', data);
}

// 漏洞注入
export function injectVulnerability(data: VulnerabilityInjectionRequest) {
  return request.post<ApiResponse<null>>('/deploy/vulnerability', data);
}

// 部署到题目接口参数
export interface DeployToQuestionRequest {
  deploy_id: number;
  question_id: number;
  docker_type: 'STATIC' | 'DYNAMIC' | 'ISOLATED';
  config: {
    extend_ports: Array<{
      name: string;
      frp_type: 'HTTP' | 'TCP' | 'UDP';
      description: string;
    }>;
  };
  frp_type: 'HTTP' | 'TCP' | 'UDP';
}

// 部署到题目
export function deployToQuestion(data: DeployToQuestionRequest) {
  return request.post<ApiResponse<null>>('/deploy/question', data);
}

// 获取拓扑图像URL
export function getTopologyImageUrl(deployId: number): string {
  return `${import.meta.env.VITE_API_BASE_URL}/deploy/topology_image/${deployId}`;
}

// compose文件响应数据
export interface ComposeFileResponse {
  compose_file: string;
}

// 获取compose文件内容
export function getComposeFile(deployId: number) {
  return request.get<ApiResponse<ComposeFileResponse>>(`/deploy/compose-file/${deployId}`);
}