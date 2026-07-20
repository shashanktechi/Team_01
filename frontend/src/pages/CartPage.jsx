import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { X, Home, Clock, Plus, Minus, ChevronRight, Info, Wallet, ArrowRight, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Button } from '../components/ui/Button';
import { TicketCard } from '../components/ui/TicketCard';

export function CartPage() {
  const navigate = useNavigate();
  const { cartItems, addToCart, removeFromCart, getCartTotal, clearCart, currentStoreName } = useCart();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tipAmount, setTipAmount] = useState(20);

  const itemTotal = getCartTotal();
  const freeDeliveryThreshold = 500;
  const isFreeDelivery = itemTotal >= freeDeliveryThreshold;
  const remainingForFreeDelivery = isFreeDelivery ? 0 : freeDeliveryThreshold - itemTotal;
  
  const deliveryFee = isFreeDelivery ? 0 : 40;
  const handlingFee = 5;
  const taxes = itemTotal * 0.05; // 5% tax

  const grandTotal = itemTotal + deliveryFee + handlingFee + taxes + tipAmount;

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
        <div className="max-w-3xl mx-auto bg-chalk h-full min-h-screen flex flex-col relative items-center justify-center p-8">
          <div className="text-6xl mb-6 opacity-80">🛒</div>
          <h2 className="font-display font-black text-2xl text-ink mb-2">Your cart is empty</h2>
          <p className="font-body text-ink-muted mb-8 text-center max-w-sm">
            Looks like you haven't added anything yet. Explore top categories to find what you need!
          </p>
          <Button onClick={() => navigate('/')} className="w-full max-w-xs text-lg h-12">
            Start Shopping
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-kraft font-body text-ink antialiased min-h-screen">
      <div className="max-w-3xl mx-auto bg-kraft h-full min-h-screen flex flex-col relative">
        <div className="px-4 py-4 flex justify-between items-center shrink-0 border-b border-ink/10 sticky top-0 bg-kraft/90 backdrop-blur-md z-10">
          <div className="flex flex-col">
            <h2 className="font-display font-black text-2xl text-ink tracking-tight">Checkout</h2>
            {currentStoreName && (
              <span className="font-mono text-xs text-ink-muted">From {currentStoreName}</span>
            )}
          </div>
          <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-ink/5 transition-colors">
            <X className="h-6 w-6 text-ink" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pb-32">
          {error && (
            <div className="mx-4 mt-4 bg-error-container text-on-error-container p-3 rounded-lg text-sm flex items-start gap-2">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Delivery Details Section */}
          <div className="px-4 mt-4 flex flex-col gap-3">
            <div className="flex items-center justify-between bg-surface rounded-xl p-4 shadow-sm border border-ink/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-bazaar-green/10 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-bazaar-green" />
                </div>
                <div>
                  <span className="font-display font-bold text-sm block text-ink">Delivery in 12 mins</span>
                  <span className="font-body text-xs text-ink-muted">To Home</span>
                </div>
              </div>
            </div>

            <div className="bg-surface rounded-xl p-4 shadow-sm border border-ink/5 flex items-start justify-between cursor-pointer hover:bg-ink/5 transition-colors">
              <div className="flex gap-3">
                <Home className="h-5 w-5 text-ink-muted mt-0.5" />
                <div>
                  <span className="font-body font-bold text-sm block">Home</span>
                  <span className="font-body text-xs text-ink-muted block mt-1 leading-relaxed max-w-[200px] truncate">
                    {user?.address || '123 Emerald Street, Block B, Apt 4G'}
                  </span>
                </div>
              </div>
              <span className="font-mono text-[10px] font-bold text-primary uppercase tracking-widest mt-1">Change</span>
            </div>
          </div>

          {/* Cart Items */}
          <div className="mt-6 px-4">
            <h3 className="font-display font-black text-lg mb-3">Items ({cartItems.length})</h3>
            <div className="bg-surface rounded-xl shadow-sm border border-ink/5 overflow-hidden">
              {cartItems.map((item, idx) => (
                <div key={item.product.id} className={`flex items-start gap-3 p-4 ${idx !== cartItems.length - 1 ? 'border-b border-ink/5' : ''}`}>
                  <div className="w-16 h-16 bg-kraft border border-ink/10 rounded-lg flex items-center justify-center mix-blend-multiply shrink-0 p-1">
                    <img className="w-full h-full object-contain" alt={item.product.name} src={item.product.image} />
                  </div>
                  <div className="flex-1 flex flex-col justify-between h-16">
                    <div>
                      <h4 className="font-body text-sm font-medium text-ink line-clamp-1">{item.product.name}</h4>
                      <span className="font-mono text-xs text-ink-muted">{item.product.size}</span>
                    </div>
                    <div className="flex items-center justify-between w-full">
                      <span className="font-mono font-bold text-sm">₹{item.product.price?.toFixed(2) || item.product.price}</span>
                      <div className="flex items-center border border-primary bg-primary/5 rounded-lg h-7 overflow-hidden">
                        <button onClick={() => removeFromCart(item.product.id)} className="w-7 h-full flex items-center justify-center active:bg-primary/20 transition-colors text-primary">
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-6 text-center font-mono font-bold text-xs text-primary">{item.quantity}</span>
                        <button onClick={() => addToCart(item.product)} className="w-7 h-full flex items-center justify-center active:bg-primary/20 transition-colors text-primary">
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Tip */}
          <div className="px-4 mt-6">
            <h3 className="font-display font-black text-lg mb-3">Tip your delivery partner</h3>
            <div className="bg-surface rounded-xl p-4 shadow-sm border border-ink/5">
              <p className="font-body text-xs text-ink-muted mb-3">100% of the tip goes to the partner.</p>
              <div className="flex gap-2">
                {[10, 20, 30, 50].map((amount) => (
                  <button
                    key={amount}
                    onClick={() => setTipAmount(tipAmount === amount ? 0 : amount)}
                    className={`flex-1 py-2 rounded-lg font-mono text-xs font-bold border transition-colors ${
                      tipAmount === amount ? 'bg-primary text-white border-primary' : 'bg-surface border-ink/20 text-ink hover:bg-ink/5'
                    }`}
                  >
                    ₹{amount}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Bill Summary */}
          <div className="px-4 mt-6 mb-8">
            <div className="bg-surface rounded-xl shadow-sm border border-ink/5 p-4">
              <h3 className="font-display font-black text-lg mb-4">Bill Summary</h3>
              
              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <span className="font-body text-sm text-ink-muted">Item Total</span>
                  <span className="font-mono text-sm font-bold">₹{itemTotal.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="font-body text-sm text-ink-muted flex items-center gap-1">
                    Delivery Fee <Info className="h-3.5 w-3.5" />
                  </span>
                  <div className="flex items-center gap-2">
                    {deliveryFee === 0 ? (
                      <>
                        <span className="font-mono text-sm line-through opacity-50">₹40.00</span>
                        <span className="font-mono text-[10px] font-bold text-bazaar-green bg-bazaar-green/10 px-1.5 py-0.5 rounded-sm">FREE</span>
                      </>
                    ) : (
                      <span className="font-mono text-sm">₹{deliveryFee.toFixed(2)}</span>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="font-body text-sm text-ink-muted">Handling Fee</span>
                  <span className="font-mono text-sm">₹{handlingFee.toFixed(2)}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="font-body text-sm text-ink-muted">Taxes</span>
                  <span className="font-mono text-sm">₹{taxes.toFixed(2)}</span>
                </div>

                {tipAmount > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="font-body text-sm text-ink-muted">Delivery Partner Tip</span>
                    <span className="font-mono text-sm">₹{tipAmount.toFixed(2)}</span>
                  </div>
                )}
              </div>

              {remainingForFreeDelivery > 0 && (
                <div className="mt-4 bg-bazaar-green/10 rounded-lg p-3 flex items-center gap-2 border border-bazaar-green/20">
                  <Sparkles className="h-4 w-4 text-bazaar-green" />
                  <span className="font-body text-xs font-medium text-bazaar-green">
                    Add ₹{remainingForFreeDelivery.toFixed(2)} more to get FREE delivery!
                  </span>
                </div>
              )}

              <div className="border-t border-ink/10 mt-4 pt-4 flex justify-between items-center">
                <span className="font-display font-black text-xl text-ink">Grand Total</span>
                <span className="font-mono font-bold text-xl">₹{grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Bottom Bar */}
        <div className="absolute bottom-0 w-full bg-chalk border-t border-ink/10 p-4 pb-safe z-20 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
          <Button 
            onClick={handleCheckout} 
            disabled={loading}
            className="w-full h-14 flex justify-between items-center px-6 rounded-xl text-lg font-bold bg-primary text-on-primary hover:opacity-90 active:scale-[0.98] transition-all"
          >
            <div className="flex flex-col text-left">
              <span className="font-mono text-lg leading-tight">₹{grandTotal.toFixed(2)}</span>
              <span className="font-mono text-[9px] uppercase tracking-widest opacity-80">TOTAL</span>
            </div>
            <div className="flex items-center gap-2">
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Processing</span>
                </>
              ) : (
                <>
                  <span>Place Order</span>
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
