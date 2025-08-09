import request from '@/utils/request.ts'

interface ApiResponse<T> {
  code: number
  data: T | null
  message: string
}

export interface AcquireAnalyzerRequest {
  enable_reasoner: boolean
}

export interface AcquireAnalyzerResponse {
  analyzer_id: string
}

export function acquireAnalyzer(data: AcquireAnalyzerRequest) {
  // 获取一个分析器实例
  return request.post<ApiResponse<AcquireAnalyzerResponse>>('/analyzer/acquire', data)
}

export interface AnalyzerAddFilesRequest {
  files: string[]
}

export function addPcapFilesToAnalyzer(analyzer_id: string, data: AnalyzerAddFilesRequest) {
  // 把pcap文件id列表加入分析器
  return request.put<ApiResponse<string>>(`/analyzer/${analyzer_id}/files`, data)
}

export function startAnalyzePcap(analyzer_id: string) {
  // 启动分析器并返回分析报告（Markdown）
  return request.post<ApiResponse<{ result: string }>>(`/analyzer/${analyzer_id}/analyze`)
}

export function addLogFilesToAnalyzer(analyzer_id: string, data: AnalyzerAddFilesRequest) {
  // 把log文件id列表加入分析器
  return request.put<ApiResponse<string>>(`/analyzer/${analyzer_id}/logs`, data)
}

export function startAnalyzeLogs(analyzer_id: string) {
  // 启动日志分析器并返回分析报告（Markdown）
  return request.post<ApiResponse<{ result: string }>>(`/analyzer/${analyzer_id}/analyze-logs`)
}
