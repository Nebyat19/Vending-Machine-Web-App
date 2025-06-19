export interface VendingMachine {
  id: string;
  name: string;
  location: {
    address: string;
    city: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  status: 'online' | 'offline' | 'maintenance';
  lastHeartbeat: Date;
  totalRevenue: number;
  totalSales: number;
  inventory: VendingMachineInventory[];
}

export interface VendingMachineInventory {
  itemId: string;
  stock: number;
  capacity: number;
  lastRestocked: Date;
  salesCount: number;
}

export interface SalesData {
  id: string;
  machineId: string;
  itemId: string;
  itemName: string;
  quantity: number;
  price: number;
  total: number;
  timestamp: Date;
  paymentMethod: string;
}

export interface InventoryAlert {
  id: string;
  machineId: string;
  machineName: string;
  itemId: string;
  itemName: string;
  currentStock: number;
  threshold: number;
  severity: 'low' | 'critical' | 'out';
  timestamp: Date;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'technician';
  permissions: string[];
}

export interface DashboardStats {
  totalRevenue: number;
  totalSales: number;
  activeMachines: number;
  totalMachines: number;
  lowStockAlerts: number;
  revenueGrowth: number;
  salesGrowth: number;
}

export interface RevenueData {
  date: string;
  revenue: number;
  sales: number;
}

export interface PopularItem {
  itemId: string;
  itemName: string;
  totalSales: number;
  revenue: number;
  image: string;
}