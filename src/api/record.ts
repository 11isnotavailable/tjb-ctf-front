import request from '@/utils/request';

interface ApiResponse<T> {
  code: number;
  data: T | null;
  message: string;
}

// 提交记录接口
export interface SubmitRecord {
  record_id: number;
  user_id: number;
  question_id: number;
  tag_id: number;
  ip: string;
  provided: string;
  correction: boolean;
  create_time: string;
  rank?: number;
}

// 用户提交记录接口（用于profile页面）
export interface UserSubmitRecord {
  record_id: number;
  question_id: number;
  question_title: string;
  tag: string;
  difficulty: number;
  status: number;
  submit_time: string;
  score: number;
}

// 提交记录列表响应
export interface RecordListResponse {
  items: SubmitRecord[];
  total: number;
  offset: number;
  limit: number;
  has_more: boolean;
}

// 用户提交记录列表响应
export interface UserRecordListResponse {
  items: UserSubmitRecord[];
  total: number;
  page: number;
  page_size: number;
}

// 提交Flag
export function submitFlag(data: {
  question_id: number;
  provided: string;
}) {
  return request.post<ApiResponse<{
    correction: boolean;
    rank?: number;
    message: string;
  }>>('/record/submit', data);
}

// 获取用户提交记录
export function getUserRecords(params?: {
  page?: number;
  page_size?: number;
}) {
  // 如果params为空或undefined，不传参数让后端使用默认值
  return request.get<ApiResponse<UserRecordListResponse>>('/user/profile/records', params ? { params } : {});
}

// 获取题目提交记录（管理员）
export function getQuestionRecords(question_id: number, params: {
  page?: number;
  page_size?: number;
}) {
  return request.get<ApiResponse<RecordListResponse>>(`/record/question/${question_id}`, { params });
}

// 获取排行榜
export function getRankings(params: {
  question_id?: number;
  limit?: number;
}) {
  return request.get<ApiResponse<SubmitRecord[]>>('/record/rankings', { params });
}