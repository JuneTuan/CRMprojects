import request from './index';

export interface Dictionary {
  id: number;
  dictType: string;
  dictValue: string;
  dictLabel: string;
  dictSort: number;
  status: number;
  remark: string;
  createdAt: Date;
  updatedAt: Date;
}

export const dictionaryApi = {
  getAll: (params?: any) => request.get<{ data: Dictionary[]; total: number }>('/api/v6/dictionary', { params }),
  
  getTypes: () => request.get<string[]>('/api/v6/dictionary/types'),
  
  getByType: (dictType: string) => request.get<Dictionary[]>(`/api/v6/dictionary/type/${dictType}`),
  
  getById: (id: number) => request.get<Dictionary>(`/api/v6/dictionary/${id}`),
  
  create: (data: Partial<Dictionary>) => request.post<Dictionary>('/api/v6/dictionary', data),
  
  update: (id: number, data: Partial<Dictionary>) => request.patch<Dictionary>(`/api/v6/dictionary/${id}`, data),
  
  delete: (id: number) => request.delete(`/api/v6/dictionary/${id}`),
};
