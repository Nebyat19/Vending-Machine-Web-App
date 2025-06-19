import { useState } from 'react';
import { CreditCard, Smartphone, Coins, ArrowLeft, Lock } from 'lucide-react';
import { CartItem, Order } from '../types';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { api } from '../services/api';

interface CheckoutProps {
  cartItems: CartItem[];
  total: number;
  onOrderCreated: (order: Order) => void;
  onBack: () => void;
}

export const Checkout = ({ cartItems, total, onOrderCreated, onBack }: CheckoutProps) => {
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: '',
  });

  const handlePayment = async () => {
    setIsProcessing(true);
    
    try {
      // Create order
      const orderResponse = await api.createOrder(cartItems, paymentMethod);
      
      if (!orderResponse.success) {
        alert(orderResponse.message);
        return;
      }

      // Process payment
      const paymentResponse = await api.processPayment(
        orderResponse.data.id,
        total,
        paymentMethod
      );

      if (paymentResponse.success) {
        // Update order status to processing
        await api.updateOrderStatus(orderResponse.data.id, 'processing');
        onOrderCreated(orderResponse.data);
      } else {
        alert(paymentResponse.message);
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const paymentMethods = [
    { id: 'card', name: 'Credit/Debit Card', icon: CreditCard },
    { id: 'mobile', name: 'Mobile Payment', icon: Smartphone },
    { id: 'cash', name: 'Cash', icon: Coins },
  ];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center space-x-4 mb-8">
        <Button variant="outline" onClick={onBack} className="flex items-center space-x-2 bg-white/90 backdrop-blur-sm border-white/20 hover:bg-white text-gray-700 px-6 py-3 rounded-2xl font-semibold">
          <ArrowLeft size={20} />
          <span>Back to Cart</span>
        </Button>
        <h1 className="text-3xl font-black text-white">Checkout</h1>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="space-y-6">
          {/* Order Summary */}
          <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-gray-800">Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-14 h-14 object-cover rounded-xl"
                      />
                      <div>
                        <p className="font-bold text-gray-800">{item.name}</p>
                        <p className="text-sm text-gray-600 font-medium">
                          ${item.price.toFixed(2)} × {item.quantity}
                        </p>
                      </div>
                    </div>
                    <span className="font-bold text-lg text-gray-800">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
                
                <div className="border-t pt-4 flex items-center justify-between text-2xl font-black">
                  <span>Total:</span>
                  <span className="text-emerald-600">${total.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Payment Method */}
          <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-3 text-2xl font-bold text-gray-800">
                <Lock size={24} />
                <span>Payment Method</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                {paymentMethods.map((method) => {
                  const Icon = method.icon;
                  return (
                    <div key={method.id} className="flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                      <RadioGroupItem value={method.id} id={method.id} />
                      <Label htmlFor={method.id} className="flex items-center space-x-3 cursor-pointer font-medium text-lg">
                        <Icon size={20} />
                        <span>{method.name}</span>
                      </Label>
                    </div>
                  );
                })}
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Card Details */}
          {paymentMethod === 'card' && (
            <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-800">Card Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div>
                  <Label htmlFor="cardName" className="text-base font-semibold">Cardholder Name</Label>
                  <Input
                    id="cardName"
                    placeholder="John Doe"
                    value={cardDetails.name}
                    onChange={(e) => setCardDetails(prev => ({ ...prev, name: e.target.value }))}
                    className="mt-2 h-12 text-lg rounded-xl"
                  />
                </div>
                
                <div>
                  <Label htmlFor="cardNumber" className="text-base font-semibold">Card Number</Label>
                  <Input
                    id="cardNumber"
                    placeholder="1234 5678 9012 3456"
                    value={cardDetails.number}
                    onChange={(e) => setCardDetails(prev => ({ ...prev, number: e.target.value }))}
                    className="mt-2 h-12 text-lg rounded-xl"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="expiry" className="text-base font-semibold">Expiry Date</Label>
                    <Input
                      id="expiry"
                      placeholder="MM/YY"
                      value={cardDetails.expiry}
                      onChange={(e) => setCardDetails(prev => ({ ...prev, expiry: e.target.value }))}
                      className="mt-2 h-12 text-lg rounded-xl"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cvv" className="text-base font-semibold">CVV</Label>
                    <Input
                      id="cvv"
                      placeholder="123"
                      value={cardDetails.cvv}
                      onChange={(e) => setCardDetails(prev => ({ ...prev, cvv: e.target.value }))}
                      className="mt-2 h-12 text-lg rounded-xl"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Mobile Payment */}
          {paymentMethod === 'mobile' && (
            <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
              <CardContent className="pt-8">
                <div className="text-center space-y-6">
                  <Smartphone size={64} className="mx-auto text-blue-600" />
                  <p className="text-gray-600 text-lg font-medium">
                    Touch your phone to the payment terminal when prompted
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Cash Payment */}
          {paymentMethod === 'cash' && (
            <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
              <CardContent className="pt-8">
                <div className="text-center space-y-6">
                  <Coins size={64} className="mx-auto text-green-600" />
                  <p className="text-gray-600 text-lg font-medium">
                    Insert exact cash amount: <strong className="text-2xl text-green-600">${total.toFixed(2)}</strong>
                  </p>
                  <p className="text-sm text-gray-500">
                    Note: This machine does not provide change
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Pay Button */}
          <Button
            onClick={handlePayment}
            disabled={isProcessing}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white h-16 text-xl font-bold rounded-2xl shadow-2xl"
          >
            {isProcessing ? (
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Processing Payment...</span>
              </div>
            ) : (
              `Pay $${total.toFixed(2)}`
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};