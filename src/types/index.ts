export interface VendingItem {
  id: string;
  name: string;
  price: number;
  category: string;
  description: string;
  image: string;
  stock: number;
  isLowStock: boolean;
  isPopular?: boolean;
}

export interface CartItem extends VendingItem {
  quantity: number;
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'processing' | 'dispensing' | 'completed' | 'failed';
  timestamp: Date;
  paymentMethod: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}