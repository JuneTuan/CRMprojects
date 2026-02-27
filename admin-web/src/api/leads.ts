import request from './index';

// 销售线索API
const leadsApi = {
  // 创建线索
  create: (data: any) => request.post('/api/v6/leads', data),
  
  // 获取线索列表
  list: (params: any) => request.get('/api/v6/leads', { params }),
  
  // 获取线索详情
  detail: (id: number) => request.get(`/api/v6/leads/${id}`),
  
  // 更新线索
  update: (id: number, data: any) => request.patch(`/api/v6/leads/${id}`, data),
  
  // 删除线索
  delete: (id: number) => request.delete(`/api/v6/leads/${id}`),
  
  // 批量删除线索
  batchDelete: (ids: number[]) => request.delete('/api/v6/leads/batch', { data: { ids } }),
  
  // 分配线索
  assign: (id: number, data: any) => request.post(`/api/v6/leads/${id}/assign`, data),
  
  // 批量分配线索
  batchAssign: (data: any) => request.post('/api/v6/leads/batch-assign', data),
  
  // 转化线索
  convert: (id: number, data: any) => request.post(`/api/v6/leads/${id}/convert`, data),
  
  // 关闭线索
  close: (id: number, data: any) => request.post(`/api/v6/leads/${id}/close`, data),
  
  // 添加跟进记录
  addFollowup: (id: number, data: any) => request.post(`/api/v6/leads/${id}/followups`, data),
  
  // 获取跟进记录
  getFollowups: (id: number) => request.get(`/api/v6/leads/${id}/followups`),
  
  // 获取分配历史
  getAssignments: (id: number) => request.get(`/api/v6/leads/${id}/assignments`),
  
  // 获取线索统计
  statistics: (params: any) => request.get('/api/v6/leads/statistics', { params }),
  
  // 获取线索趋势
  trends: (params: any) => request.get('/api/v6/leads/trends', { params }),
  
  // 获取来源分析
  sourceAnalysis: (params: any) => request.get('/api/v6/leads/source-analysis', { params }),
  
  // 获取销售人员分析
  salespersonAnalysis: (params: any) => request.get('/api/v6/leads/salesperson-analysis', { params }),
};

export default leadsApi;
