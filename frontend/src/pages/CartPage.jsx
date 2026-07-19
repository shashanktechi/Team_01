import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { X, Home, Clock, Plus, Minus, ChevronRight, Tag, Info, Wallet, ArrowRight, Loader2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export function CartPage() {
  const navigate = useNavigate();
  const { cartItems, addToCart, removeFromCart, getCartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const deliveryFee = getCartTotal() > 500 ? 0 : 40;
  const grandTotal = getCartTotal() + deliveryFee;

  const handleCheckout = async () => {
    if (cartItems.length === 0) return;
    
    setLoading(true);
    setError(null);
    try {
      const orderRequest = {
        items: cartItems.map(item => ({
          productId: item.product.id,
          qty: item.quantity
        })),
        deliveryAddress: user?.address || '123 Emerald Street, Block B, Apt 4G',
        customerLat: 12.9716,
        customerLng: 77.5946
      };
      
      const response = await api.post('/customer/orders', orderRequest);
      clearCart();
      navigate('/track', { state: { orderId: response.data.id } });
    } catch (err) {
      console.error('Checkout failed', err);
      setError('Checkout failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="bg-surface-dim font-body-md text-on-surface antialiased min-h-screen">
        <div className="max-w-[480px] mx-auto bg-surface-container-lowest h-full min-h-screen flex flex-col shadow-lg relative items-center justify-center p-8">
          <h2 className="font-headline-md text-headline-md text-on-surface mb-4">Your cart is empty</h2>
          <button onClick={() => navigate('/')} className="bg-primary text-on-primary px-6 py-2 rounded-full hover:bg-primary-container transition-colors">
            Start Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface-dim font-body-md text-on-surface antialiased min-h-screen">
      <div className="max-w-[480px] mx-auto bg-surface-container-lowest h-full min-h-screen flex flex-col shadow-lg relative">
        <div className="px-margin-mobile py-4 flex justify-between items-center shrink-0 border-b border-surface-variant sticky top-0 bg-surface-container-lowest z-10">
          <h2 className="font-headline-md text-headline-md text-on-surface">My Cart ({cartItems.length} Items)</h2>
          <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-surface-variant/50 transition-colors">
            <X className="h-6 w-6 text-on-surface-variant" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pb-32">
          {error && (
            <div className="mx-margin-mobile mt-4 bg-error-container text-on-error-container p-3 rounded-lg text-sm">
              {error}
            </div>
          )}
          {/* Delivery Address */}
          <div className="mx-margin-mobile mt-4 bg-surface rounded-xl shadow-[0px_2px_8px_rgba(0,0,0,0.05)] border border-surface-variant overflow-hidden">
            <button className="w-full px-4 py-3 flex items-center justify-between bg-surface-container-low hover:bg-surface-container transition-colors">
              <div className="flex items-center gap-3">
                <Home className="h-6 w-6 text-primary" />
                <div className="text-left">
                  <span className="font-label-md text-label-md text-on-surface block">Delivering to Home</span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant block truncate w-48">{user?.address || '123 Emerald Street, Block B, Apt 4G'}</span>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-on-surface-variant" />
            </button>
          </div>

          {/* Estimated Delivery */}
          <div className="mx-margin-mobile mt-4 flex items-center gap-2 text-primary-container bg-primary-container/10 p-3 rounded-lg">
            <Clock className="h-5 w-5" />
            <span className="font-headline-sm text-headline-sm">Delivery in 10-15 mins</span>
          </div>

          {/* Cart Items */}
          <div className="mt-4 px-margin-mobile flex flex-col gap-4">
            {cartItems.map(item => (
              <div key={item.product.id} className="flex items-start gap-4 p-3 bg-surface rounded-xl shadow-[0px_2px_8px_rgba(0,0,0,0.05)] border border-surface-variant">
                <img className="w-16 h-16 object-cover rounded-lg bg-surface-container" alt={item.product.name} src={item.product.image} />
                <div className="flex-1">
                  <h3 className="font-headline-sm text-headline-sm text-on-surface line-clamp-2">{item.product.name}</h3>
                  <span className="font-body-sm text-body-sm text-on-surface-variant block mt-0.5">{item.product.size}</span>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="font-price-sm text-price-sm text-on-surface">${item.product.price.toFixed(2)}</span>
                    <div className="flex items-center border border-outline-variant rounded-lg bg-surface-container-lowest overflow-hidden h-8">
                      <button onClick={() => removeFromCart(item.product.id)} className="w-8 h-full flex items-center justify-center text-on-surface-variant hover:bg-surface-variant/50 active:scale-95 transition-all">
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-6 text-center font-label-md text-label-md text-primary">{item.quantity}</span>
                      <button onClick={() => addToCart(item.product)} className="w-8 h-full flex items-center justify-center text-primary hover:bg-surface-variant/50 active:scale-95 transition-all">
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Bill Summary */}
          <div className="mx-margin-mobile mt-8 bg-surface rounded-xl shadow-[0px_2px_8px_rgba(0,0,0,0.05)] border border-surface-variant p-4">
            <h3 className="font-headline-sm text-headline-sm text-on-surface mb-3 border-b border-surface-variant pb-2">Bill Details</h3>
            <div className="flex justify-between items-center py-1.5">
              <span className="font-body-md text-body-md text-on-surface-variant">Item Total</span>
              <span className="font-body-md text-body-md text-on-surface">${getCartTotal().toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center py-1.5">
              <span className="font-body-md text-body-md text-on-surface-variant flex items-center gap-1">
                Delivery Fee <Info className="h-3.5 w-3.5" />
              </span>
              <div className="flex items-center gap-2">
                {deliveryFee === 0 ? (
                  <>
                    <span className="font-body-md text-body-md text-on-surface-variant line-through">$40.00</span>
                    <span className="font-label-md text-label-md text-primary bg-primary-container/10 px-1.5 py-0.5 rounded text-primary-container">FREE</span>
                  </>
                ) : (
                  <span className="font-body-md text-body-md text-on-surface">${deliveryFee.toFixed(2)}</span>
                )}
              </div>
            </div>
            <div className="border-t border-surface-variant mt-3 pt-3 flex justify-between items-center">
              <span className="font-headline-md text-headline-md text-on-surface">Grand Total</span>
              <span className="font-price-lg text-price-lg text-on-surface">${grandTotal.toFixed(2)}</span>
            </div>
          </div>

          {/* Payment Method */}
          <div className="mx-margin-mobile mt-4 mb-8 bg-surface rounded-xl shadow-[0px_2px_8px_rgba(0,0,0,0.05)] border border-surface-variant overflow-hidden">
            <button className="w-full px-4 py-3 flex items-center justify-between bg-surface-container-low hover:bg-surface-container transition-colors">
              <div className="flex items-center gap-3">
                <Wallet className="h-6 w-6 text-on-surface" />
                <div className="text-left">
                  <span className="font-label-md text-label-md text-on-surface block">Pay via</span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant block">Credit/Debit Card</span>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-on-surface-variant rotate-90" />
            </button>
          </div>
        </div>

        {/* Sticky Bottom Bar */}
        <div className="absolute bottom-0 w-full bg-surface-container-lowest border-t border-surface-variant p-margin-mobile shadow-[0_-4px_12px_rgba(0,0,0,0.08)] z-20">
          <button 
            onClick={handleCheckout} 
            disabled={loading}
            className="w-full bg-primary hover:bg-primary-container text-on-primary font-headline-sm text-headline-sm py-3 px-4 rounded-xl flex justify-between items-center transition-all active:scale-[0.98] shadow-md disabled:opacity-70 disabled:active:scale-100"
          >
            <div className="flex flex-col text-left">
              <span className="font-price-lg text-price-lg leading-tight">${grandTotal.toFixed(2)}</span>
              <span className="font-label-md text-label-md opacity-90 font-normal">TOTAL</span>
            </div>
            <div className="flex items-center gap-1">
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>Proceed to Pay</span>
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
