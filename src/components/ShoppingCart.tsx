import { useState } from 'react';
import { ShoppingCart as ShoppingCartIcon, Plus, Minus, Trash2, X } from 'lucide-react';
import { CartItem } from '../types';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';

interface ShoppingCartProps {
  cartItems: CartItem[];
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemoveItem: (itemId: string) => void;
  onCheckout: () => void;
  total: number;
  itemCount: number;
}

export const ShoppingCart = ({
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
  total,
  itemCount,
}: ShoppingCartProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleCheckout = () => {
    setIsOpen(false);
    onCheckout();
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button className="relative bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-xl border-0 px-6 py-3 rounded-2xl text-lg font-semibold">
          <ShoppingCartIcon size={24} />
          <span className="ml-3 hidden sm:inline">Cart</span>
          {itemCount > 0 && (
            <Badge className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-pink-500 text-white text-sm px-3 py-1 rounded-full border-2 border-white shadow-lg">
              {itemCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>

      <SheetContent className="w-full sm:max-w-lg bg-white">
        <SheetHeader>
          <SheetTitle className="flex items-center space-x-3 text-2xl font-bold text-gray-800">
            <ShoppingCartIcon size={28} />
            <span>Shopping Cart ({itemCount} items)</span>
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-col h-full">
          {cartItems.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <ShoppingCartIcon size={80} className="mx-auto mb-6 opacity-30" />
                <p className="text-xl font-semibold mb-2">Your cart is empty</p>
                <p className="text-base">Add some items to get started!</p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto py-6 space-y-4">
                {cartItems.map((item) => (
                  <Card key={item.id} className="overflow-hidden shadow-lg border-0">
                    <CardContent className="p-5">
                      <div className="flex items-start space-x-4">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded-xl"
                        />
                        
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-gray-800 truncate text-lg">{item.name}</h4>
                          <p className="text-sm text-gray-600 mb-3 font-medium">${item.price.toFixed(2)} each</p>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2 bg-gray-100 rounded-xl p-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                                className="h-8 w-8 p-0 rounded-lg"
                              >
                                <Minus size={14} />
                              </Button>
                              <span className="text-sm font-bold min-w-[2rem] text-center">
                                {item.quantity}
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                                disabled={item.quantity >= item.stock}
                                className="h-8 w-8 p-0 rounded-lg"
                              >
                                <Plus size={14} />
                              </Button>
                            </div>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onRemoveItem(item.id)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0 rounded-lg"
                            >
                              <Trash2 size={14} />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <p className="font-bold text-gray-800 text-lg">
                            ${(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="border-t pt-6 space-y-6">
                <div className="flex items-center justify-between text-2xl font-bold">
                  <span>Total:</span>
                  <span className="text-emerald-600">${total.toFixed(2)}</span>
                </div>
                
                <Button
                  onClick={handleCheckout}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white h-14 text-xl font-bold rounded-2xl shadow-xl"
                >
                  Proceed to Checkout
                </Button>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};