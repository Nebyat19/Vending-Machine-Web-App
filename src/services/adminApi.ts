import { VendingMachine, SalesData, InventoryAlert, DashboardStats, RevenueData, PopularItem, VendingMachineInventory } from '../types/admin';
import { VendingItem, ApiResponse } from '../types';
import { vendingItems } from '../data/mockData';

// Generate unique machine ID
const generateMachineId = (): string => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 5);
  return `VM-${timestamp}-${random}`.toUpperCase();
};

// Mock data for admin dashboard
const mockMachines: VendingMachine[] = [
  {
    id: 'VM-LX9K2M-A7B3F',
    name: 'Main Campus - Building A',
    location: {
      address: '123 University Ave',
      city: 'College Town',
      coordinates: { lat: 34.0522, lng: -118.2437 }
    },
    status: 'online',
    lastHeartbeat: new Date(),
    totalRevenue: 2450.75,
    totalSales: 1234,
    inventory: [
      { itemId: '1', stock: 12, capacity: 20, lastRestocked: new Date('2024-01-15'), salesCount: 45 },
      { itemId: '2', stock: 8, capacity: 15, lastRestocked: new Date('2024-01-15'), salesCount: 32 },
      { itemId: '3', stock: 3, capacity: 15, lastRestocked: new Date('2024-01-15'), salesCount: 67 },
    ]
  },
  {
    id: 'VM-LX9K2N-B8C4G',
    name: 'Student Center',
    location: {
      address: '456 Campus Drive',
      city: 'College Town',
      coordinates: { lat: 34.0522, lng: -118.2437 }
    },
    status: 'online',
    lastHeartbeat: new Date(Date.now() - 300000), // 5 minutes ago
    totalRevenue: 1890.25,
    totalSales: 892,
    inventory: [
      { itemId: '4', stock: 15, capacity: 20, lastRestocked: new Date('2024-01-14'), salesCount: 28 },
      { itemId: '5', stock: 6, capacity: 12, lastRestocked: new Date('2024-01-14'), salesCount: 41 },
    ]
  },
  {
    id: 'VM-LX9K2O-C9D5H',
    name: 'Library Entrance',
    location: {
      address: '789 Knowledge Blvd',
      city: 'College Town',
      coordinates: { lat: 34.0522, lng: -118.2437 }
    },
    status: 'offline',
    lastHeartbeat: new Date(Date.now() - 3600000), // 1 hour ago
    totalRevenue: 1234.50,
    totalSales: 567,
    inventory: []
  }
];

const mockSalesData: SalesData[] = [
  {
    id: 'S001',
    machineId: 'VM-LX9K2M-A7B3F',
    itemId: '1',
    itemName: 'Coca-Cola Classic',
    quantity: 2,
    price: 1.50,
    total: 3.00,
    timestamp: new Date(),
    paymentMethod: 'card'
  },
  {
    id: 'S002',
    machineId: 'VM-LX9K2N-B8C4G',
    itemId: '4',
    itemName: 'Lay\'s Classic Chips',
    quantity: 1,
    price: 2.25,
    total: 2.25,
    timestamp: new Date(Date.now() - 1800000),
    paymentMethod: 'mobile'
  }
];

const mockInventoryAlerts: InventoryAlert[] = [
  {
    id: 'A001',
    machineId: 'VM-LX9K2M-A7B3F',
    machineName: 'Main Campus - Building A',
    itemId: '3',
    itemName: 'Sprite',
    currentStock: 3,
    threshold: 5,
    severity: 'low',
    timestamp: new Date()
  },
  {
    id: 'A002',
    machineId: 'VM-LX9K2N-B8C4G',
    machineName: 'Student Center',
    itemId: '10',
    itemName: 'Red Bull',
    currentStock: 1,
    threshold: 3,
    severity: 'critical',
    timestamp: new Date()
  }
];

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

class AdminAPI {
  private machines: VendingMachine[] = [...mockMachines];
  private salesData: SalesData[] = [...mockSalesData];
  private inventoryAlerts: InventoryAlert[] = [...mockInventoryAlerts];
  private items: VendingItem[] = [...vendingItems];

  // Dashboard Stats
  async getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    await delay(300);
    
    const totalRevenue = this.machines.reduce((sum, machine) => sum + machine.totalRevenue, 0);
    const totalSales = this.machines.reduce((sum, machine) => sum + machine.totalSales, 0);
    const activeMachines = this.machines.filter(m => m.status === 'online').length;
    
    return {
      data: {
        totalRevenue,
        totalSales,
        activeMachines,
        totalMachines: this.machines.length,
        lowStockAlerts: this.inventoryAlerts.length,
        revenueGrowth: 12.5,
        salesGrowth: 8.3
      },
      success: true,
      message: 'Dashboard stats retrieved successfully'
    };
  }

  // Vending Machines
  async getMachines(): Promise<ApiResponse<VendingMachine[]>> {
    await delay(400);
    return {
      data: this.machines,
      success: true,
      message: 'Machines retrieved successfully'
    };
  }

  async getMachine(id: string): Promise<ApiResponse<VendingMachine | null>> {
    await delay(200);
    const machine = this.machines.find(m => m.id === id);
    return {
      data: machine || null,
      success: !!machine,
      message: machine ? 'Machine found' : 'Machine not found'
    };
  }

  async addMachine(machine: Omit<VendingMachine, 'id' | 'totalRevenue' | 'totalSales' | 'inventory'>): Promise<ApiResponse<VendingMachine>> {
    await delay(500);
    
    const newMachine: VendingMachine = {
      ...machine,
      id: generateMachineId(),
      totalRevenue: 0,
      totalSales: 0,
      inventory: []
    };
    
    this.machines.push(newMachine);
    
    return {
      data: newMachine,
      success: true,
      message: 'Machine added successfully'
    };
  }

  async updateMachine(id: string, updates: Partial<VendingMachine>): Promise<ApiResponse<VendingMachine | null>> {
    await delay(400);
    
    const machineIndex = this.machines.findIndex(m => m.id === id);
    if (machineIndex === -1) {
      return {
        data: null,
        success: false,
        message: 'Machine not found'
      };
    }
    
    this.machines[machineIndex] = { ...this.machines[machineIndex], ...updates };
    
    return {
      data: this.machines[machineIndex],
      success: true,
      message: 'Machine updated successfully'
    };
  }

  async deleteMachine(id: string): Promise<ApiResponse<boolean>> {
    await delay(300);
    
    const machineIndex = this.machines.findIndex(m => m.id === id);
    if (machineIndex === -1) {
      return {
        data: false,
        success: false,
        message: 'Machine not found'
      };
    }
    
    this.machines.splice(machineIndex, 1);
    
    return {
      data: true,
      success: true,
      message: 'Machine deleted successfully'
    };
  }

  // Remote Control
  async restartMachine(id: string): Promise<ApiResponse<boolean>> {
    await delay(2000); // Simulate restart time
    
    const machine = this.machines.find(m => m.id === id);
    if (!machine) {
      return {
        data: false,
        success: false,
        message: 'Machine not found'
      };
    }
    
    machine.status = 'online';
    machine.lastHeartbeat = new Date();
    
    return {
      data: true,
      success: true,
      message: 'Machine restarted successfully'
    };
  }

  async releaseItem(machineId: string, itemId: string): Promise<ApiResponse<boolean>> {
    await delay(1500);
    
    const machine = this.machines.find(m => m.id === machineId);
    if (!machine) {
      return {
        data: false,
        success: false,
        message: 'Machine not found'
      };
    }
    
    const inventoryItem = machine.inventory.find(i => i.itemId === itemId);
    if (!inventoryItem || inventoryItem.stock === 0) {
      return {
        data: false,
        success: false,
        message: 'Item not available'
      };
    }
    
    inventoryItem.stock -= 1;
    
    return {
      data: true,
      success: true,
      message: 'Item released successfully'
    };
  }

  // Inventory Management
  async getInventoryAlerts(): Promise<ApiResponse<InventoryAlert[]>> {
    await delay(300);
    return {
      data: this.inventoryAlerts,
      success: true,
      message: 'Inventory alerts retrieved successfully'
    };
  }

  async updateInventory(machineId: string, itemId: string, stock: number): Promise<ApiResponse<boolean>> {
    await delay(400);
    
    const machine = this.machines.find(m => m.id === machineId);
    if (!machine) {
      return {
        data: false,
        success: false,
        message: 'Machine not found'
      };
    }
    
    const inventoryItem = machine.inventory.find(i => i.itemId === itemId);
    if (inventoryItem) {
      inventoryItem.stock = stock;
      inventoryItem.lastRestocked = new Date();
    } else {
      machine.inventory.push({
        itemId,
        stock,
        capacity: stock,
        lastRestocked: new Date(),
        salesCount: 0
      });
    }
    
    return {
      data: true,
      success: true,
      message: 'Inventory updated successfully'
    };
  }

  // Items Management
  async getItems(): Promise<ApiResponse<VendingItem[]>> {
    await delay(300);
    return {
      data: this.items,
      success: true,
      message: 'Items retrieved successfully'
    };
  }

  async addItem(item: Omit<VendingItem, 'id'>): Promise<ApiResponse<VendingItem>> {
    await delay(400);
    
    const newItem: VendingItem = {
      ...item,
      id: String(this.items.length + 1)
    };
    
    this.items.push(newItem);
    
    return {
      data: newItem,
      success: true,
      message: 'Item added successfully'
    };
  }

  async updateItem(id: string, updates: Partial<VendingItem>): Promise<ApiResponse<VendingItem | null>> {
    await delay(400);
    
    const itemIndex = this.items.findIndex(i => i.id === id);
    if (itemIndex === -1) {
      return {
        data: null,
        success: false,
        message: 'Item not found'
      };
    }
    
    this.items[itemIndex] = { ...this.items[itemIndex], ...updates };
    
    return {
      data: this.items[itemIndex],
      success: true,
      message: 'Item updated successfully'
    };
  }

  async deleteItem(id: string): Promise<ApiResponse<boolean>> {
    await delay(300);
    
    const itemIndex = this.items.findIndex(i => i.id === id);
    if (itemIndex === -1) {
      return {
        data: false,
        success: false,
        message: 'Item not found'
      };
    }
    
    this.items.splice(itemIndex, 1);
    
    return {
      data: true,
      success: true,
      message: 'Item deleted successfully'
    };
  }

  // Sales & Analytics
  async getSalesData(period: 'daily' | 'weekly' | 'monthly' = 'daily'): Promise<ApiResponse<SalesData[]>> {
    await delay(400);
    return {
      data: this.salesData,
      success: true,
      message: 'Sales data retrieved successfully'
    };
  }

  async getRevenueData(period: 'daily' | 'weekly' | 'monthly' = 'daily'): Promise<ApiResponse<RevenueData[]>> {
    await delay(400);
    
    // Generate mock revenue data for the last 7 days
    const revenueData: RevenueData[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      revenueData.push({
        date: date.toISOString().split('T')[0],
        revenue: Math.random() * 500 + 200,
        sales: Math.floor(Math.random() * 50 + 20)
      });
    }
    
    return {
      data: revenueData,
      success: true,
      message: 'Revenue data retrieved successfully'
    };
  }

  async getPopularItems(): Promise<ApiResponse<PopularItem[]>> {
    await delay(300);
    
    const popularItems: PopularItem[] = [
      {
        itemId: '1',
        itemName: 'Coca-Cola Classic',
        totalSales: 145,
        revenue: 217.50,
        image: 'https://images.pexels.com/photos/50593/coca-cola-cold-drink-soft-drink-coke-50593.jpeg?auto=compress&cs=tinysrgb&w=400'
      },
      {
        itemId: '4',
        itemName: 'Lay\'s Classic Chips',
        totalSales: 98,
        revenue: 220.50,
        image: 'https://images.pexels.com/photos/1583884/pexels-photo-1583884.jpeg?auto=compress&cs=tinysrgb&w=400'
      },
      {
        itemId: '3',
        itemName: 'Sprite',
        totalSales: 87,
        revenue: 130.50,
        image: 'https://images.pexels.com/photos/1292294/pexels-photo-1292294.jpeg?auto=compress&cs=tinysrgb&w=400'
      }
    ];
    
    return {
      data: popularItems,
      success: true,
      message: 'Popular items retrieved successfully'
    };
  }

  // Export functionality
  async exportSalesReport(format: 'csv' | 'excel' | 'pdf', period: string): Promise<ApiResponse<{ downloadUrl: string }>> {
    await delay(2000); // Simulate report generation
    
    return {
      data: { downloadUrl: `#report-${format}-${period}-${Date.now()}` },
      success: true,
      message: `${format.toUpperCase()} report generated successfully`
    };
  }
}

export const adminApi = new AdminAPI();