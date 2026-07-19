import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { X, Home, Clock, Plus, Minus, ChevronRight, Tag, Info, Wallet, ArrowRight, Loader2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Button } from '../components/ui/Button';
import { TicketCard } from '../components/ui/TicketCard';

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
      <div className="bg-kraft font-body text-ink antialiased min-h-screen">
        <div className="max-w-[480px] mx-auto bg-kraft h-full min-h-screen flex flex-col relative items-center justify-center p-8">
          <TicketCard className="w-full p-8 text-center bg-chalk shadow-sm border-ink/10">
            <h2 className="font-display font-black text-2xl text-ink mb-6">Your cart is empty</h2>
            <Button onClick={() => navigate('/')} className="w-full text-lg h-12">
              Start Shopping
            </Button>
          </TicketCard>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-kraft font-body text-ink antialiased min-h-screen">
      <div className="max-w-[480px] mx-auto bg-kraft h-full min-h-screen flex flex-col relative">
        <div className="px-4 py-4 flex justify-between items-center shrink-0 border-b border-ink/10 sticky top-0 bg-kraft/90 backdrop-blur-md z-10">
          <h2 className="font-display font-black text-2xl text-ink tracking-tight">My Cart ({cartItems.length})</h2>
          <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-ink/5 transition-colors">
            <X className="h-6 w-6 text-ink" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pb-32">
          {error && (
            <div className="mx-margin-mobile mt-4 bg-error-container text-on-error-container p-3 rounded-lg text-sm">
              {error}
            </div>
          )}
          {/* Delivery Address */}
          <div className="px-4 mt-4">
            <TicketCard className="bg-chalk border-ink/10 shadow-sm p-0 overflow-hidden">
              <button className="w-full px-4 py-3 flex items-center justify-between hover:bg-ink/5 transition-colors">
                <div className="flex items-center gap-3">
                  <Home className="h-6 w-6 text-marigold" />
                  <div className="text-left">
                    <span className="font-mono text-xs uppercase tracking-wider font-bold block">Delivering to Home</span>
                    <span className="font-body text-sm text-ink-muted block truncate w-48">{user?.address || '123 Emerald Street, Block B, Apt 4G'}</span>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-ink-muted" />
              </button>
            </TicketCard>
          </div>

          {/* Estimated Delivery */}
          <div className="px-4 mt-4">
            <div className="flex items-center gap-2 bg-bazaar-green/10 text-bazaar-green p-3 border border-bazaar-green/20">
              <Clock className="h-5 w-5" />
              <span className="font-display font-bold text-lg">Delivery in 10-15 mins</span>
            </div>
          </div>

          {/* Cart Items */}
          <div className="mt-4 px-4 flex flex-col gap-4">
            {cartItems.map(item => (
              <TicketCard key={item.product.id} className="flex items-start gap-4 p-3 bg-chalk shadow-sm border-ink/10">
                <div className="w-16 h-16 bg-kraft border border-ink/10 flex items-center justify-center mix-blend-multiply shrink-0 p-1">
                  <img className="w-full h-full object-contain" alt={item.product.name} src={item.product.image} />
                </div>
                <div className="flex-1">
                  <h3 className="font-body font-bold text-ink line-clamp-2 leading-snug">{item.product.name}</h3>
                  <span className="font-mono text-xs uppercase tracking-wider text-ink-muted block mt-1">{item.product.size}</span>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="font-mono font-bold text-lg text-ink">${item.product.price.toFixed(2)}</span>
                    <div className="flex items-center border-2 border-ink bg-chalk h-8">
                      <button onClick={() => removeFromCart(item.product.id)} className="w-8 h-full flex items-center justify-center hover:bg-ink/10 active:bg-ink/20 transition-colors border-r-2 border-ink">
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-8 text-center font-mono font-bold text-ink">{item.quantity}</span>
                      <button onClick={() => addToCart(item.product)} className="w-8 h-full flex items-center justify-center hover:bg-ink/10 active:bg-ink/20 transition-colors border-l-2 border-ink">
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </TicketCard>
            ))}
          </div>

          {/* Bill Summary */}
          <div className="px-4 mt-8">
            <TicketCard className="bg-chalk shadow-sm border-ink/10 p-4">
              <h3 className="font-display font-black text-xl text-ink mb-3 border-b-2 border-dashed border-ink/20 pb-2 uppercase tracking-tight">Bill Details</h3>
              <div className="flex justify-between items-center py-2">
                <span className="font-mono text-sm uppercase tracking-wider text-ink-muted">Item Total</span>
                <span className="font-mono text-sm font-bold">${getCartTotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="font-mono text-sm uppercase tracking-wider text-ink-muted flex items-center gap-1">
                  Delivery Fee <Info className="h-3.5 w-3.5" />
                </span>
                <div className="flex items-center gap-2">
                  {deliveryFee === 0 ? (
                    <>
                      <span className="font-mono text-sm line-through opacity-50">$40.00</span>
                      <span className="font-mono text-[10px] font-bold text-ink bg-marigold px-1.5 py-0.5 border border-ink">FREE</span>
                    </>
                  ) : (
                    <span className="font-mono text-sm font-bold">${deliveryFee.toFixed(2)}</span>
                  )}
                </div>
              </div>
              <div className="border-t-2 border-dashed border-ink/20 mt-3 pt-3 flex justify-between items-center">
                <span className="font-display font-black text-xl text-ink">Grand Total</span>
                <span className="font-mono font-bold text-xl">${grandTotal.toFixed(2)}</span>
              </div>
            </TicketCard>
          </div>

          {/* Payment Method */}
          <div className="px-4 mt-4 mb-8">
            <TicketCard className="bg-chalk shadow-sm border-ink/10 p-0 overflow-hidden">
              <button className="w-full px-4 py-3 flex items-center justify-between hover:bg-ink/5 transition-colors">
                <div className="flex items-center gap-3">
                  <Wallet className="h-6 w-6 text-bazaar-green" />
                  <div className="text-left">
                    <span className="font-mono text-xs uppercase tracking-wider font-bold block">Pay via</span>
                    <span className="font-body text-sm text-ink-muted block">Credit/Debit Card</span>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-ink-muted rotate-90" />
              </button>
            </TicketCard>
          </div>
        </div>

        {/* Sticky Bottom Bar */}
        <div className="absolute bottom-0 w-full bg-kraft border-t border-ink/10 p-4 z-20">
          <Button 
            onClick={handleCheckout} 
            disabled={loading}
            className="w-full h-16 flex justify-between items-center px-4"
          >
            <div className="flex flex-col text-left">
              <span className="font-mono font-bold text-lg leading-tight">${grandTotal.toFixed(2)}</span>
              <span className="font-mono text-[10px] uppercase tracking-widest opacity-80">TOTAL</span>
            </div>
            <div className="flex items-center gap-2">
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span className="font-mono uppercase tracking-widest text-sm">Processing...</span>
                </>
              ) : (
                <>
                  <span className="font-mono uppercase tracking-widest text-sm font-bold">Proceed to Pay</span>
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </div>
          </Button>
        </div>
      </div>
    </div>
  );
}
