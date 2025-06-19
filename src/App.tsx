import { useState, useEffect } from 'react';
import { VendingItem, Order } from './types';
import { Banner } from './components/Banner';
import { CategoryFilter } from './components/CategoryFilter';
import { ItemCard } from './components/ItemCard';
import { ShoppingCart } from './components/ShoppingCart';
import { Checkout } from './components/Checkout';
import { OrderStatus } from './components/OrderStatus';
import { useCart } from './hooks/useCart';
import { api } from './services/api';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner';

type AppView = 'shopping' | 'checkout' | 'order-status';

function App() {
  const [view, setView] = useState<AppView>('shopping');
  const [items, setItems] = useState<VendingItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<VendingItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  const {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartItemCount,
  } = useCart();

  // Load items on mount
  useEffect(() => {
    const loadItems = async () => {
      try {
        const response = await api.getItems();
        if (response.success) {
          setItems(response.data);
          setFilteredItems(response.data);
        }
      } catch (error) {
        console.error('Error loading items:', error);
        toast.error('Failed to load items. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    };

    loadItems();
  }, []);

  // Filter items by category
  useEffect(() => {
    const filterItems = async () => {
      try {
        const response = await api.getItemsByCategory(selectedCategory);
        if (response.success) {
          setFilteredItems(response.data);
        }
      } catch (error) {
        console.error('Error filtering items:', error);
      }
    };

    filterItems();
  }, [selectedCategory]);

  const handleAddToCart = (item: VendingItem, quantity: number) => {
    addToCart(item, quantity);
    toast.success(`${item.name} added to cart!`, {
      description: `${quantity} item(s) added`,
    });
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      toast.error('Your cart is empty!');
      return;
    }
    setView('checkout');
  };

  const handleOrderCreated = (order: Order) => {
    setCurrentOrder(order);
    clearCart();
    setView('order-status');
    toast.success('Order placed successfully!');
  };

  const handleNewOrder = () => {
    setCurrentOrder(null);
    setView('shopping');
  };

  const handleBackToShopping = () => {
    setView('shopping');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-white text-xl font-medium">Loading vending machine...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-white mb-3 tracking-tight">
              Smart Vending
            </h1>
            <p className="text-emerald-100 text-lg font-medium">Fresh snacks and drinks, available 24/7</p>
          </div>
          
          {view === 'shopping' && (
            <ShoppingCart
              cartItems={cartItems}
              onUpdateQuantity={updateQuantity}
              onRemoveItem={removeFromCart}
              onCheckout={handleCheckout}
              total={getCartTotal()}
              itemCount={getCartItemCount()}
            />
          )}
        </header>

        {/* Main Content */}
        {view === 'shopping' && (
          <>
            <Banner />
            
            <CategoryFilter
              selectedCategory={selectedCategory}
              onCategoryChange={handleCategoryChange}
            />

            {/* Items Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredItems.map((item) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>

            {filteredItems.length === 0 && (
              <div className="text-center py-16">
                <p className="text-white text-xl font-medium">No items found in this category.</p>
              </div>
            )}
          </>
        )}

        {view === 'checkout' && (
          <Checkout
            cartItems={cartItems}
            total={getCartTotal()}
            onOrderCreated={handleOrderCreated}
            onBack={handleBackToShopping}
          />
        )}

        {view === 'order-status' && currentOrder && (
          <OrderStatus
            order={currentOrder}
            onNewOrder={handleNewOrder}
          />
        )}
      </div>

      <Toaster position="top-right" />
    </div>
  );
}

export default App;