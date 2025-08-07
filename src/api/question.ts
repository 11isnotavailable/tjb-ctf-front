import request from '@/utils/request';

interface ApiResponse<T> {
  code: number;
  data: T | null;
  message: string;
}

export interface QuestionItem {
  question_id: number;
  user_id: number;
  title: string;
  introduction: string;
  is_active: boolean;
  flag_prefix?: string;
  topology: any;
  valid_time: number;
  create_time: string;
  star: number;
  try_number: number;
  solved_number: number;
}

export interface QuestionListResponse {
  items: QuestionItem[];
  total: number;
  offset: number;
  limit: number;
  has_more: boolean;
}

// 获取题目列表
export function getQuestionList(params: { page?: number; page_size?: number; offset?: number; limit?: number }) {
  return request.get<ApiResponse<QuestionListResponse>>('/question/list', { params });
}

// 获取题目详情
export function getQuestionDetail(question_id: number) {
  return request.get<ApiResponse<QuestionItem>>(`/question/${question_id}`);
}

// 创建题目接口参数
export interface CreateQuestionRequest {
  title: string;
  introduction: string;
  tag_id: number;
  is_active: boolean;
  flag_prefix: string;
  topology?: string | null; // 与后端Opt[str]保持一致
  valid_time: number;
  star: number;
}

// 创建题目
export function createQuestion(data: CreateQuestionRequest) {
  return request.post<ApiResponse<QuestionItem>>('/question/insert', data);
}

// 更新题目接口参数
export interface UpdateQuestionRequest {
  title?: string;
  introduction?: string;
  is_active?: boolean;
  flag_prefix?: string;
  topology?: any;
  valid_time?: number;
  star?: number;
}

// 更新题目
export function updateQuestion(question_id: number, data: UpdateQuestionRequest) {
  return request.post<ApiResponse<null>>(`/question/${question_id}/update`, data);
}

// 提交Flag接口参数
export interface SubmitFlagRequest {
  flag: string;
}

// 提交Flag
export function submitFlag(question_id: number, data: SubmitFlagRequest) {
  return request.post<ApiResponse<null>>(`/question/${question_id}/attempt`, data);
} 