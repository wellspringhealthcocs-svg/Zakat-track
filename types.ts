
export enum AssetType {
  GOLD = 'Gold',
  SILVER = 'Silver',
  MONEY = 'Money',
  BUSINESS = 'Business'
}

export interface Asset {
  id: number;
  user_id: string;
  name: string;
  type: AssetType;
  weight?: number;
  currency?: string;
  value: number; // For metals, this might be 0 until calculated
  created_at: string;
}

export interface Payment {
  id: number;
  user_id: string;
  name: string;
  amount: number;
  date: string;
  method: string;
  created_at: string;
}

export interface User {
  id: string;
  username: string;
}
