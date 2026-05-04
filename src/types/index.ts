export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  image_url: string;
  updated_at: number;
}

export interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  price_at_add: number;
  product?: Product; // Populated for UI
}

export type OperationType = 'ADD' | 'REMOVE' | 'UPDATE_QTY' | 'CLEAR';

export interface CartOperation {
  id: string;
  type: OperationType;
  product_id: string;
  quantity: number;
  price_at_op: number;
  timestamp: number;
  synced: number; // 0 or 1
  conflict?: string | null;
}

export interface Order {
  id: string;
  items_json: string;
  total: number;
  status: string;
  created_at: number;
  synced_at?: number;
}

export interface CartState {
  items: CartItem[];
  operations: CartOperation[];
  isOffline: boolean;
  isSyncing: boolean;
  onboardingComplete: boolean | null;
}
