import { VendingItem, CartItem, Order, ApiResponse } from '../types';
import { vendingItems } from '../data/mockData';

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

class VendingMachineAPI {
  private items: VendingItem[] = [...vendingItems];
  private orders: Order[] = [];

  // Get all items
  async getItems(): Promise<ApiResponse<VendingItem[]>> {
    await delay(300);
    return {
      data: this.items,
      success: true,
      message: 'Items retrieved successfully'
    };
  }

  // Get items by category
  async getItemsByCategory(category: string): Promise<ApiResponse<VendingItem[]>> {
    await delay(200);
    const filteredItems = category === 'all' 
      ? this.items 
      : this.items.filter(item => item.category === category);
    
    return {
      data: filteredItems,
      success: true,
      message: `Items in ${category} category retrieved successfully`
    };
  }

  // Get item by ID
  async getItemById(id: string): Promise<ApiResponse<VendingItem | null>> {
    await delay(150);
    const item = this.items.find(item => item.id === id);
    
    return {
      data: item || null,
      success: !!item,
      message: item ? 'Item found' : 'Item not found'
    };
  }

  // Create order
  async createOrder(items: CartItem[], paymentMethod: string): Promise<ApiResponse<Order>> {
    await delay(500);
    
    // Check stock availability
    for (const cartItem of items) {
      const item = this.items.find(i => i.id === cartItem.id);
      if (!item || item.stock < cartItem.quantity) {
        return {
          data: {} as Order,
          success: false,
          message: `Insufficient stock for ${cartItem.name}`
        };
      }
    }

    // Calculate total
    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Create order
    const order: Order = {
      id: `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      items,
      total,
      status: 'pending',
      timestamp: new Date(),
      paymentMethod
    };

    // Update stock
    items.forEach(cartItem => {
      const item = this.items.find(i => i.id === cartItem.id);
      if (item) {
        item.stock -= cartItem.quantity;
        item.isLowStock = item.stock <= 3;
      }
    });

    this.orders.push(order);

    return {
      data: order,
      success: true,
      message: 'Order created successfully'
    };
  }

  // Get order status
  async getOrderStatus(orderId: string): Promise<ApiResponse<Order | null>> {
    await delay(200);
    const order = this.orders.find(o => o.id === orderId);
    
    return {
      data: order || null,
      success: !!order,
      message: order ? 'Order found' : 'Order not found'
    };
  }

  // Update order status
  async updateOrderStatus(orderId: string, status: Order['status']): Promise<ApiResponse<Order | null>> {
    await delay(300);
    const order = this.orders.find(o => o.id === orderId);
    
    if (order) {
      order.status = status;
      return {
        data: order,
        success: true,
        message: 'Order status updated successfully'
      };
    }
    
    return {
      data: null,
      success: false,
      message: 'Order not found'
    };
  }

  // Process payment (mock)
  async processPayment(orderId: string, amount: number, method: string): Promise<ApiResponse<{ transactionId: string }>> {
    await delay(1000);
    
    // Simulate payment processing
    const success = Math.random() > 0.1; // 90% success rate
    
    if (success) {
      return {
        data: { transactionId: `TXN-${Date.now()}` },
        success: true,
        message: 'Payment processed successfully'
      };
    } else {
      return {
        data: { transactionId: '' },
        success: false,
        message: 'Payment failed. Please try again.'
      };
    }
  }

  // Submit feedback
  async submitFeedback(orderId: string, rating: number, comment: string): Promise<ApiResponse<{ message: string }>> {
    await delay(400);
    
    return {
      data: { message: 'Thank you for your feedback!' },
      success: true,
      message: 'Feedback submitted successfully'
    };
  }
}

export const api = new VendingMachineAPI();