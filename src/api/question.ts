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