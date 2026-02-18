export interface User {
  id: string;
  username: string;
  password: string;
  name: string;
  role: 'admin' | 'staff' | 'customer';
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface Customer {
  id: string;
  userId?: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  points: number;
  password?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  category?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface Order {
  id: string;
  customerId: string;
  productId: string;
  quantity: number;
  totalAmount: number;
  pointsEarned: number;
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt?: string;
}

export interface Prize {
  id: string;
  name: string;
  type: 'coupon' | 'redpacket' | 'item' | 'none';
  value?: number;
  probability: number;
  remainingQuantity: number;
  totalQuantity: number;
  createdAt: string;
  updatedAt?: string;
}

export interface Coupon {
  id: string;
  customerId: string;
  prizeId?: string;
  code: string;
  status: 'unused' | 'claimed' | 'used';
  usedAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface LotteryRecord {
  id: string;
  customerId: string;
  prizeId?: string;
  activityId?: string;
  isWon: boolean;
  result: string;
  isPointsDraw?: boolean;
  pointsConsumed?: number;
  createdAt: string;
}

export interface PointsRule {
  id: string;
  name: string;
  calculationType: 'fixed' | 'rate';
  pointsPerUnit?: number;
  unitAmount?: number;
  rate?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface LotterySetting {
  id: string;
  name: string;
  freeDrawsPerDay: number;
  pointsPerDraw: number;
  enablePointsDraw: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface Activity {
  id: string;
  name: string;
  description?: string;
  gameType: 'wheel' | 'blindbox' | 'slotmachine' | 'scratchcard' | 'lotterybox';
  status: 'draft' | 'active' | 'ended';
  startTime: string;
  endTime: string;
  dailyFreeDraws: number;
  pointsPerDraw: number;
  pointsEnabled: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface ApiResponse<T = any> {
  code: number;
  msg: string;
  data: T;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  name: string;
  role: string;
  phone?: string;
}

export interface LoginResponse {
  token: string;
  user: Omit<User, 'password'>;
}

export interface DrawRequest {
  customerId: string;
  activityId?: string;
  usePoints?: boolean;
}

export interface DrawResponse {
  record: LotteryRecord;
  prize: Prize | null;
  isWon: boolean;
  isPointsDraw?: boolean;
  pointsConsumed?: number;
}
