import { useState, useEffect } from 'react';
import { CheckCircle, Clock, Package, AlertCircle, Star } from 'lucide-react';
import { Order } from '../types';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { api } from '../services/api';

interface OrderStatusProps {
  order: Order;
  onNewOrder: () => void;
}

export const OrderStatus = ({ order, onNewOrder }: OrderStatusProps) => {
  const [currentOrder, setCurrentOrder] = useState(order);
  const [showFeedback, setShowFeedback] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  useEffect(() => {
    if (currentOrder.status === 'processing') {
      // Simulate order progression
      const timer1 = setTimeout(() => {
        setCurrentOrder(prev => ({ ...prev, status: 'dispensing' }));
      }, 3000);

      const timer2 = setTimeout(() => {
        setCurrentOrder(prev => ({ ...prev, status: 'completed' }));
        setShowFeedback(true);
      }, 6000);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    }
  }, [currentOrder.status]);

  const handleFeedbackSubmit = async () => {
    if (rating === 0) return;
    
    setIsSubmittingFeedback(true);
    
    try {
      await api.submitFeedback(currentOrder.id, rating, comment);
      setShowFeedback(false);
    } catch (error) {
      console.error('Error submitting feedback:', error);
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="text-yellow-600" size={40} />;
      case 'processing':
        return <Package className="text-blue-600 animate-pulse" size={40} />;
      case 'dispensing':
        return <Package className="text-green-600 animate-bounce" size={40} />;
      case 'completed':
        return <CheckCircle className="text-green-600" size={40} />;
      case 'failed':
        return <AlertCircle className="text-red-600" size={40} />;
      default:
        return <Clock className="text-gray-600" size={40} />;
    }
  };

  const getStatusMessage = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'Order received. Processing payment...';
      case 'processing':
        return 'Payment confirmed. Preparing your items...';
      case 'dispensing':
        return 'Dispensing your items. Please collect them below.';
      case 'completed':
        return 'Order completed! Thank you for your purchase.';
      case 'failed':
        return 'Order failed. Please try again or contact support.';
      default:
        return 'Processing your order...';
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <Card className="mb-8 shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center space-x-4">
            {getStatusIcon(currentOrder.status)}
            <div>
              <h1 className="text-3xl font-black text-gray-800">Order Status</h1>
              <p className="text-base text-gray-600 font-medium">Order ID: {currentOrder.id}</p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-6">
            <p className="text-xl text-gray-700 font-semibold">{getStatusMessage(currentOrder.status)}</p>
            
            {/* Progress bar */}
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-emerald-600 to-teal-600 h-3 rounded-full transition-all duration-1000 ease-in-out"
                style={{
                  width: 
                    currentOrder.status === 'pending' ? '25%' :
                    currentOrder.status === 'processing' ? '50%' :
                    currentOrder.status === 'dispensing' ? '75%' :
                    currentOrder.status === 'completed' ? '100%' : '0%'
                }}
              />
            </div>

            {/* Dispensing animation */}
            {currentOrder.status === 'dispensing' && (
              <div className="my-10">
                <div className="relative mx-auto w-40 h-40 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl border-4 border-dashed border-gray-300">
                  <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
                    {currentOrder.items.map((item, index) => (
                      <div
                        key={item.id}
                        className="w-8 h-8 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-full animate-bounce mb-2 shadow-lg"
                        style={{ animationDelay: `${index * 0.5}s` }}
                      />
                    ))}
                  </div>
                  <p className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-sm text-gray-600 font-semibold">
                    Collection Area
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Order items */}
          <div className="mt-8 space-y-4">
            <h3 className="font-bold text-xl text-gray-800">Your Items:</h3>
            {currentOrder.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-2xl">
                <div className="flex items-center space-x-4">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-14 h-14 object-cover rounded-xl"
                  />
                  <div>
                    <p className="font-bold text-gray-800">{item.name}</p>
                    <p className="text-sm text-gray-600 font-medium">Quantity: {item.quantity}</p>
                  </div>
                </div>
                <span className="font-bold text-lg text-gray-800">
                  ${(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
            
            <div className="flex justify-between items-center pt-4 border-t border-gray-200">
              <span className="text-2xl font-black text-gray-800">Total:</span>
              <span className="text-2xl font-black text-emerald-600">
                ${currentOrder.total.toFixed(2)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feedback Form */}
      {showFeedback && (
        <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-800">How was your experience?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Rating stars */}
            <div>
              <Label className="text-base font-semibold">Rating</Label>
              <div className="flex space-x-2 mt-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className={`transition-colors hover:scale-110 transform ${
                      star <= rating ? 'text-yellow-500' : 'text-gray-300'
                    }`}
                  >
                    <Star size={32} fill={star <= rating ? 'currentColor' : 'none'} />
                  </button>
                ))}
              </div>
            </div>

            {/* Comment */}
            <div>
              <Label htmlFor="comment" className="text-base font-semibold">Comments (optional)</Label>
              <Textarea
                id="comment"
                placeholder="Tell us about your experience..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                className="mt-2 text-base rounded-xl"
              />
            </div>

            <div className="flex space-x-4">
              <Button
                onClick={handleFeedbackSubmit}
                disabled={rating === 0 || isSubmittingFeedback}
                className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 h-12 text-lg font-semibold rounded-xl"
              >
                {isSubmittingFeedback ? 'Submitting...' : 'Submit Feedback'}
              </Button>
              <Button
                onClick={() => setShowFeedback(false)}
                variant="outline"
                className="flex-1 h-12 text-lg font-semibold rounded-xl bg-white/90 backdrop-blur-sm border-gray-200"
              >
                Skip
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* New Order Button */}
      {currentOrder.status === 'completed' && !showFeedback && (
        <div className="text-center">
          <Button
            onClick={onNewOrder}
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-10 py-4 text-xl font-bold rounded-2xl shadow-2xl"
          >
            Place New Order
          </Button>
        </div>
      )}
    </div>
  );
};