import request from './index';

export interface MemberLevel {
  levelId: number;
  levelName: string;
  levelCode: string;
  minConsumption: number;
  iconCode: string;
  benefitsConfig: any;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MemberLevelLog {
  logId: number;
  customerId: number;
  oldLevelId: number | null;
  newLevelId: number;
  changeType: 'auto_upgrade' | 'manual_adjust' | 'manual_downgrade';
  oldConsumption: number | null;
  newConsumption: number | null;
  remark: string | null;
  operatorId: number | null;
  ipAddress: string | null;
  createdAt: string;
  customer?: any;
  oldLevel?: any;
  newLevel?: any;
  operator?: any;
}

export interface CustomerLevelInfo {
  customerId: number;
  customerName: string;
  totalConsumption: number;
  currentLevel: {
    levelId: number;
    levelName: string;
    levelCode: string;
    iconCode: string;
    benefitsConfig: any;
  } | null;
  nextLevel: {
    levelId: number;
    levelName: string;
    levelCode: string;
    minConsumption: number;
  } | null;
  needConsumption: number;
  progressPercent: number;
}

export const memberLevelApi = {
  getAll: () => request.get<MemberLevel[]>('/member-level'),
  
  getById: (id: number) => request.get<MemberLevel>(`/member-level/${id}`),
  
  create: (data: Partial<MemberLevel>) => request.post<MemberLevel>('/member-level', data),
  
  update: (id: number, data: Partial<MemberLevel>) => request.put<MemberLevel>(`/member-level/${id}`, data),
  
  delete: (id: number) => request.delete(`/member-level/${id}`),
  
  getCustomerLevel: (customerId: number) => request.get<CustomerLevelInfo>(`/member-level/customer/${customerId}`),
  
  adjustCustomerLevel: (customerId: number, data: { newLevelId: number; remark: string }) => 
    request.post(`/member-level/customer/${customerId}/adjust`, data),
  
  getLogs: (customerId?: number, limit?: number) => 
    request.get<MemberLevelLog[]>('/member-level/logs/list', { params: { customerId, limit } }),
  
  getBenefit: (levelId: number, key: string, defaultValue?: any) => 
    request.get(`/member-level/benefit/${levelId}/${key}`, { params: { defaultValue } }),
  
  getCustomerBenefit: (customerId: number, key: string, defaultValue?: any) => 
    request.get(`/member-level/customer/${customerId}/benefit/${key}`, { params: { defaultValue } }),
};
