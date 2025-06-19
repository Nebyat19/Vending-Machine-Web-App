import { useState } from 'react';
import { Plus, Minus, ShoppingCart as ShoppingCartIcon, Star, AlertTriangle } from 'lucide-react';
import { VendingItem } from '../types';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';

interface ItemCardProps {
  item: VendingItem;
  onAddToCart: (item: VendingItem, quantity: number) => void;
}

export const ItemCard = ({ item, onAddToCart }: ItemCardProps) => {
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = async () => {
    setIsAdding(true);
    onAddToCart(item, quantity);
    
    // Reset quantity and show feedback
    setTimeout(() => {
      setQuantity(1);
      setIsAdding(false);
    }, 500);
  };

  const incrementQuantity = () => {
    if (quantity < item.stock) {
      setQuantity(prev => prev + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  return (
    <Card className="group overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 bg-white/95 backdrop-blur-sm border-0 shadow-xl">
      <div className="relative">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
        />
        
        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {item.isPopular && (
            <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0 shadow-lg">
              <Star size={12} className="mr-1" />
              Popular
            </Badge>
          )}
          {item.isLowStock && (
            <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white border-0 shadow-lg">
              <AlertTriangle size={12} className="mr-1" />
              Low Stock
            </Badge>
          )}
        </div>

        {/* Stock indicator */}
        <div className="absolute top-4 right-4 bg-black/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium">
          {item.stock} left
        </div>
      </div>

      <CardContent className="p-6">
        <div className="mb-4">
          <h3 className="font-bold text-xl text-gray-800 mb-2">{item.name}</h3>
          <p className="text-gray-600 text-sm mb-3 leading-relaxed">{item.description}</p>
          <div className="flex items-center justify-between">
            <span className="text-3xl font-black text-emerald-600">${item.price.toFixed(2)}</span>
            {item.isLowStock && (
              <span className="text-red-500 text-sm font-semibold">Only {item.stock} left!</span>
            )}
          </div>
        </div>

        {/* Quantity selector */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3 bg-gray-100 rounded-xl p-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={decrementQuantity}
              disabled={quantity <= 1}
              className="h-10 w-10 p-0 hover:bg-gray-200 rounded-lg"
            >
              <Minus size={18} />
            </Button>
            <span className="text-xl font-bold min-w-[3rem] text-center">{quantity}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={incrementQuantity}
              disabled={quantity >= item.stock}
              className="h-10 w-10 p-0 hover:bg-gray-200 rounded-lg"
            >
              <Plus size={18} />
            </Button>
          </div>
          <span className="text-sm text-gray-600 font-medium">
            Total: <span className="font-bold text-emerald-600">${(item.price * quantity).toFixed(2)}</span>
          </span>
        </div>

        {/* Add to cart button */}
        <Button
          onClick={handleAddToCart}
          disabled={item.stock === 0 || isAdding}
          className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white transition-all duration-200 transform hover:scale-105 h-12 text-lg font-semibold rounded-xl shadow-lg"
        >
          {isAdding ? (
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Adding...</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <ShoppingCartIcon size={20} />
              <span>Add to Cart</span>
            </div>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};