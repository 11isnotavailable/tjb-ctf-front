import request from '@/utils/request'

// 排行榜相关的类型定义
export interface UserBoardItemDTO {
  user_id: number
  rank: number
  email: string
  username: string
  solve_count: number
  score: number
  last_solve_time: string
}

export interface ScoreRankDTO {
  score: number
  rank: number | null
  total: number
}

export interface PagedResponse<T> {
  items: T[]
  total: number
  offset: number
  limit: number
  has_more: boolean
}

export interface UserBoardRequest {
  tag_id: number
  order_type: 'score' | 'solve_count' | 'submit'
  page?: number
  size?: number
}

// 获取用户排行榜
export const getUserBoard = async (params: UserBoardRequest): Promise<PagedResponse<UserBoardItemDTO>> => {
  const { data } = await request.get('/userboard', { params })
  return data
}

// 获取个人排名详情
export const getPersonalRank = async (tagId: number): Promise<ScoreRankDTO[]> => {
  const { data } = await request.get(`/tag/${tagId}/rank`)
  return data
}

// 排序方式选项
export const ORDER_TYPE_OPTIONS = [
  { value: 'score', label: '按分数', description: '按总分降序排列' },
  { value: 'solve_count', label: '按解题数', description: '按解题数量降序排列' },
  { value: 'submit', label: '按提交时间', description: '按最后解题时间降序排列' }
] as const

// 获取排序方式的显示文本
export const getOrderTypeText = (orderType: string): string => {
  const option = ORDER_TYPE_OPTIONS.find(opt => opt.value === orderType)
  return option?.label || orderType
}

// 获取排序方式的描述
export const getOrderTypeDescription = (orderType: string): string => {
  const option = ORDER_TYPE_OPTIONS.find(opt => opt.value === orderType)
  return option?.description || ''
}
