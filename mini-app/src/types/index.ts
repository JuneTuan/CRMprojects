export interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  points: number;
  createdAt: string;
  updatedAt: string;
}

export interface Coupon {
  id: string;
  customerId?: string;
  code: string;
  type: 'discount' | 'gift';
  value: number;
  status: 'unused' | 'used' | 'expired';
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  customerId: string;
  productId: string;
  productName: string;
  quantity: number;
  totalAmount: number;
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface LotteryRecord {
  id: string;
  customerId: string;
  prizeId: string;
  prizeName: string;
  prizeValue: number;
  prizeType: 'coupon' | 'points' | 'gift';
  createdAt: string;
}

export interface PointsHistory {
  id: string;
  customerId: string;
  type: 'earn' | 'redeem';
  amount: number;
  reason: string;
  createdAt: string;
}

export interface Prize {
  id: string;
  name: string;
  type: 'coupon' | 'points' | 'gift';
  value: number;
  probability: number;
  stock: number;
  createdAt: string;
  updatedAt: string;
}
