import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { X, Home, Clock, Plus, Minus, ChevronRight, Info, Wallet, ArrowRight, Loader2, Sparkles, AlertCircle, Banknote, CreditCard } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { getUserLocation } from '../utils/geo';

export function CartPage() {
  const navigate = useNavigate();
  const { cartItems, addToCart, removeFromCart, getCartTotal, clearCart, currentStoreName } = useCart();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tipAmount, setTipAmount] = useState(20);
  const [deliveryAddress, setDeliveryAddress] = useState(user?.address || '');
  const [paymentMethod, setPaymentMethod] = useState('COD');

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
      let lat = 0.0;
      let lng = 0.0;
      try {
        const loc = await getUserLocation();
        lat = loc.lat;
        lng = loc.lng;
      } catch (e) {
        console.warn('Could not fetch location for checkout, using defaults', e);
      }

      const orderRequest = {
        items: cartItems.map(item => ({
          productId: item.product.id,
          qty: item.quantity
        })),
        deliveryAddress: deliveryAddress || 'Address not provided',
        customerLat: lat,
        customerLng: lng,
        paymentMethod: paymentMethod
      };
      
      const response = await api.post('/customer/orders', orderRequest);
      const orderId = response.data.id;

      if (paymentMethod === 'RAZORPAY') {
        const rzpRes = await api.post('/payment/create-razorpay-order', { orderId });
        const options = {
            key: "rzp_test_TG4Dgisjo7B8Wa",
            amount: Math.round(grandTotal * 100), // in paise
            currency: "INR",
            name: "QuickCart",
            description: "Order Payment",
            order_id: rzpRes.data.razorpayOrderId,
            handler: async function (response) {
                await api.post('/payment/verify', {
                    razorpayOrderId: response.razorpay_order_id,
                    razorpayPaymentId: response.razorpay_payment_id,
                    razorpaySignature: response.razorpay_signature,
                    orderId: orderId.toString()
                });
                clearCart();
                navigate('/track', { state: { orderId } });
            },
            prefill: {
                name: user?.name || "Customer",
                email: user?.email || "",
                contact: user?.phone || ""
            },
            theme: {
                color: "#16A34A"
            }
        };
        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (response){
            alert('Payment failed. Please try again.');
            setLoading(false);
        });
        rzp.open();
      } else {
        clearCart();
        navigate('/track', { state: { orderId } });
      }
    } catch (err) {
      console.error('Checkout failed', err);
      setError('Checkout failed. Please try again.');
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="bg-background font-body text-ink antialiased min-h-screen">
        <div className="w-full bg-surface h-full min-h-screen flex flex-col relative items-center justify-center p-8">
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
    <div className="bg-background font-body text-ink antialiased min-h-screen">
      <div className="w-full bg-background h-full min-h-screen flex flex-col relative">
        <div className="px-4 py-4 flex justify-between items-center shrink-0 border-b border-border sticky top-0 bg-background/90 backdrop-blur-md z-10">
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
            <div className="mx-4 mt-4 bg-danger/10 text-danger p-3 rounded-lg text-sm flex items-start gap-2">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Delivery Details Section */}
          <div className="px-4 mt-4 flex flex-col gap-3">
            <div className="flex items-center justify-between bg-surface rounded-xl p-4 shadow-sm border border-ink/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <span className="font-display font-bold text-sm block text-ink">Delivery in 12 mins</span>
                  <span className="font-body text-xs text-ink-muted">To Home</span>
                </div>
              </div>
            </div>

            <div className="bg-surface rounded-xl p-4 shadow-sm border border-ink/5">
              <label className="font-body font-bold text-sm block mb-2 flex items-center gap-2">
                <Home className="h-4 w-4" /> Delivery Address
              </label>
              <textarea 
                className="w-full bg-background border border-border rounded-lg p-3 font-body text-sm outline-none focus:border-primary resize-none"
                placeholder="Enter your full delivery address"
                rows={2}
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
              />
            </div>
          </div>

          {/* Cart Items */}
          <div className="mt-6 px-4">
            <h3 className="font-display font-black text-lg mb-3">Items ({cartItems.length})</h3>
            <div className="bg-surface rounded-xl shadow-sm border border-ink/5 overflow-hidden">
              {cartItems.map((item, idx) => (
                <div key={item.product.id} className={`flex items-start gap-3 p-4 ${idx !== cartItems.length - 1 ? 'border-b border-ink/5' : ''}`}>
                  <div className="w-16 h-16 bg-background border border-border rounded-lg flex items-center justify-center mix-blend-multiply shrink-0 p-1">
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
                      tipAmount === amount ? 'bg-primary text-white border-primary' : 'bg-surface border-border text-ink hover:bg-ink/5'
                    }`}
                  >
                    ₹{amount}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="px-4 mt-6">
            <h3 className="font-display font-black text-lg mb-3">Payment Method</h3>
            <div className="flex flex-col gap-3">
              <label className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === 'RAZORPAY' ? 'bg-primary/5 border-primary shadow-sm' : 'bg-surface border-border hover:bg-ink/5'}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${paymentMethod === 'RAZORPAY' ? 'bg-primary text-white' : 'bg-background border border-border text-ink'}`}>
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-ink">Online Payment (Razorpay)</p>
                    <p className="text-xs text-ink-muted">UPI, Cards, NetBanking</p>
                  </div>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'RAZORPAY' ? 'border-primary' : 'border-ink/20'}`}>
                  {paymentMethod === 'RAZORPAY' && <div className="w-2.5 h-2.5 bg-primary rounded-full" />}
                </div>
                <input type="radio" name="payment" value="RAZORPAY" className="hidden" checked={paymentMethod === 'RAZORPAY'} onChange={() => setPaymentMethod('RAZORPAY')} />
              </label>

              <label className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === 'COD' ? 'bg-primary/5 border-primary shadow-sm' : 'bg-surface border-border hover:bg-ink/5'}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${paymentMethod === 'COD' ? 'bg-primary text-white' : 'bg-background border border-border text-ink'}`}>
                    <Banknote className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-ink">Cash on Delivery</p>
                    <p className="text-xs text-ink-muted">Pay at your doorstep</p>
                  </div>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'COD' ? 'border-primary' : 'border-ink/20'}`}>
                  {paymentMethod === 'COD' && <div className="w-2.5 h-2.5 bg-primary rounded-full" />}
                </div>
                <input type="radio" name="payment" value="COD" className="hidden" checked={paymentMethod === 'COD'} onChange={() => setPaymentMethod('COD')} />
              </label>
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
                        <span className="font-mono text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded-sm">FREE</span>
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
                <div className="mt-4 bg-primary/10 rounded-lg p-3 flex items-center gap-2 border border-bazaar-green/20">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="font-body text-xs font-medium text-primary">
                    Add ₹{remainingForFreeDelivery.toFixed(2)} more to get FREE delivery!
                  </span>
                </div>
              )}

              <div className="border-t border-border mt-4 pt-4 flex justify-between items-center">
                <span className="font-display font-black text-xl text-ink">Grand Total</span>
                <span className="font-mono font-bold text-xl">₹{grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Bottom Bar */}
        <div className="absolute bottom-0 w-full bg-surface border-t border-border p-4 pb-safe z-20 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
          <Button 
            onClick={handleCheckout} 
            disabled={loading}
            className="w-full h-14 flex justify-between items-center px-6 rounded-xl text-lg font-bold bg-primary text-white hover:opacity-90 active:scale-[0.98] transition-all"
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
