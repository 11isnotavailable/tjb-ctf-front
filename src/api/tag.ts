import request from '@/utils/request';

interface ApiResponse<T> {
  code: number;
  data: T | null;
  message: string;
}

export interface Tag {
  tag_id: number;
  tag: string;
}

// 获取所有标签列表
export function getAllTags() {
  return request.get<ApiResponse<Tag[]>>('/tag/list');
}



