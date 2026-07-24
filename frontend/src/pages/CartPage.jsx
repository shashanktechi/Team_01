import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { X, Home, Clock, Plus, Minus, Info, ArrowRight, Loader2, Sparkles, AlertCircle, Banknote, CreditCard, MapPin } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Button } from '../components/ui/Button';
import { getUserLocation, haversineDistance, formatDistance } from '../utils/geo';
import { AddressMapModal } from '../components/ui/AddressMapModal';
import { useEnvironment } from '../context/EnvironmentContext';

export function CartPage() {
  const navigate = useNavigate();
  const { cartItems, addToCart, removeFromCart, getCartTotal, clearCart, currentStoreName } = useCart();
  const { user } = useAuth();
  const { setMode, triggerOrderSuccess } = useEnvironment();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setMode('storefront');
  }, [setMode]);

  // Delivery & Location States
  const [deliveryAddress, setDeliveryAddress] = useState(user?.address || '');
  const [customerPos, setCustomerPos] = useState({ lat: 13.5532, lng: 78.5028 });
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);

  // Tip & Payment States
  const [tipAmount, setTipAmount] = useState(20);
  const [customTip, setCustomTip] = useState('');
  const [isCustomTipActive, setIsCustomTipActive] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('COD');

  // Category Tax Rates from Admin
  const [categoryTaxes, setCategoryTaxes] = useState({});

  useEffect(() => {
    // Attempt auto-location detection on load
    getUserLocation()
      .then((loc) => setCustomerPos({ lat: loc.lat, lng: loc.lng }))
      .catch((e) => console.warn('Geo detection skipped in CartPage', e));

    // Fetch Admin Category Taxes with silent default fallback
    const defaultTaxMap = {
      vegetables: 0.0,
      fruits: 0.0,
      dairy: 5.0,
      'non-veg': 5.0,
      snacks: 12.0,
      beverages: 18.0,
      household: 18.0
    };
    setCategoryTaxes(defaultTaxMap);

    api.get('/public/category-taxes')
      .then((res) => {
        if (Array.isArray(res.data) && res.data.length > 0) {
          const map = { ...defaultTaxMap };
          res.data.forEach((t) => {
            if (t.categoryName) {
              map[t.categoryName.toLowerCase()] = parseFloat(t.taxPercentage) || 0;
            }
          });
          setCategoryTaxes(map);
        }
      })
      .catch(() => {
        // Silent fallback without logging console error
      });
  }, []);

  const itemTotal = getCartTotal();

  // Store coordinates (default Madanapalle store fallback)
  const storeLat = cartItems[0]?.product?.storeLat || 13.5532;
  const storeLng = cartItems[0]?.product?.storeLng || 78.5028;

  // Distance driven in Km
  const distanceKm = useMemo(() => {
    return haversineDistance(storeLat, storeLng, customerPos.lat, customerPos.lng);
  }, [storeLat, storeLng, customerPos]);

  // Distance-Based Delivery Fee Slabs:
  // 0 - 1 km: ₹10
  // 1 - 2 km: ₹15
  // 2 - 3 km: ₹20
  // 3 - 5 km: ₹30
  // > 5 km: ₹50 + ₹10/km
  const deliveryFee = useMemo(() => {
    if (itemTotal >= 500) return 0; // Free delivery threshold
    if (distanceKm <= 1) return 10;
    if (distanceKm <= 2) return 15;
    if (distanceKm <= 3) return 20;
    if (distanceKm <= 5) return 30;
    return 50 + Math.ceil(distanceKm - 5) * 10;
  }, [distanceKm, itemTotal]);

  const freeDeliveryThreshold = 500;
  const isFreeDelivery = itemTotal >= freeDeliveryThreshold;
  const remainingForFreeDelivery = isFreeDelivery ? 0 : freeDeliveryThreshold - itemTotal;

  const handlingFee = 5;

  // Category-based Item Taxes Calculation
  const itemTaxes = useMemo(() => {
    let totalTax = 0;
    cartItems.forEach((item) => {
      const cat = (item.product.category || 'General').toLowerCase();
      const taxRate = categoryTaxes[cat] !== undefined ? categoryTaxes[cat] : 5.0; // fallback 5%
      const itemSubtotal = (item.product.price || 0) * item.quantity;
      totalTax += (itemSubtotal * taxRate) / 100;
    });
    return totalTax;
  }, [cartItems, categoryTaxes]);

  // 5% Delivery Tax
  const deliveryTax = (deliveryFee * 0.05);

  const activeTip = isCustomTipActive ? (parseFloat(customTip) || 0) : tipAmount;

  const grandTotal = itemTotal + deliveryFee + handlingFee + itemTaxes + deliveryTax + activeTip;

  const handleLocationConfirm = (location) => {
    setCustomerPos({ lat: location.lat, lng: location.lng });
    setDeliveryAddress(location.address);
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) return;

    setLoading(true);
    setError(null);
    try {
      // Group items by storeId to support multi-vendor carts
      const itemsByStore = cartItems.reduce((acc, item) => {
        const storeId = item.product.storeId || 'unknown';
        if (!acc[storeId]) acc[storeId] = [];
        acc[storeId].push(item);
        return acc;
      }, {});

      let firstOrderId = null;

      // Create an order for each store concurrently
      const orderPromises = Object.values(itemsByStore).map(async (storeItems) => {
        const orderRequest = {
          items: storeItems.map((item) => ({
            productId: item.product.id,
            qty: item.quantity
          })),
          deliveryAddress: deliveryAddress || 'Selected Address',
          customerLat: customerPos.lat,
          customerLng: customerPos.lng,
          paymentMethod: paymentMethod
        };
        const response = await api.post('/customer/orders', orderRequest);
        return response.data.id;
      });

      const results = await Promise.all(orderPromises);
      if (results.length > 0) {
        firstOrderId = results[0];
      }

      if (paymentMethod === 'RAZORPAY' && firstOrderId) {
        const rzpRes = await api.post('/payment/create-razorpay-order', { orderId: firstOrderId });
        const options = {
          key: "rzp_test_TG4Dgisjo7B8Wa",
          amount: Math.round(grandTotal * 100),
          currency: "INR",
          name: "QuickCart",
          description: "Multi-Vendor Order Payment",
          order_id: rzpRes.data.razorpayOrderId,
          handler: async function (res) {
            await api.post('/payment/verify', {
              razorpayOrderId: res.razorpay_order_id,
              razorpayPaymentId: res.razorpay_payment_id,
              razorpaySignature: res.razorpay_signature,
              orderId: firstOrderId.toString()
            });
            clearCart();
            triggerOrderSuccess();
            setTimeout(() => {
              navigate(`/track/${firstOrderId}`);
            }, 2500);
          },
          prefill: {
            name: user?.name || "Customer",
            email: user?.email || "",
            contact: user?.phone || ""
          },
          theme: { color: "#16A34A" }
        };
        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function () {
          alert('Payment failed. Please try again.');
          setLoading(false);
        });
        rzp.open();
      } else {
        clearCart();
        triggerOrderSuccess();
        setTimeout(() => {
          navigate(`/track/${orderId}`);
        }, 2500);
      }
    } catch (err) {
      console.error('Checkout failed', err);
      setError('Checkout failed. Please try again.');
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="bg-transparent font-body text-ink antialiased min-h-screen flex items-center justify-center p-8 w-full">
        <div className="bg-[var(--color-surface)]/90 backdrop-blur-md p-8 rounded-2xl border border-border shadow-night-lg text-center max-w-sm w-full">
          <div className="text-6xl mb-6 opacity-80">🛒</div>
          <h2 className="font-display font-black text-2xl text-ink mb-2">Your cart is empty</h2>
          <p className="font-body text-ink-muted mb-8 text-center">
            Looks like you haven't added anything yet. Explore top categories to find what you need!
          </p>
          <Button onClick={() => navigate('/')} className="w-full text-lg h-12 bg-primary text-white">
            Start Shopping
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-transparent font-body text-ink antialiased flex flex-col lg:flex-row w-full max-w-7xl mx-auto">
      {/* Map Address Selector Modal */}
      <AddressMapModal
        isOpen={isMapModalOpen}
        onClose={() => setIsMapModalOpen(false)}
        onConfirm={handleLocationConfirm}
        initialLat={customerPos.lat}
        initialLng={customerPos.lng}
      />

      <div className="w-full bg-transparent min-h-screen flex flex-col relative z-10">
        <div className="px-4 py-4 flex justify-between items-center shrink-0 border-b border-border sticky top-0 bg-[var(--color-night)]/80 backdrop-blur-md z-20 shadow-night">
          <div className="flex flex-col">
            <h2 className="font-display font-black text-2xl text-ink tracking-tight text-depth">Checkout</h2>
            {currentStoreName && (
              <span className="font-mono text-xs text-ink-muted">From {currentStoreName}</span>
            )}
          </div>
          <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-ink/5 transition-colors">
            <X className="h-6 w-6 text-ink" />
          </button>
        </div>

        <div className="flex-grow overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 pb-32 lg:pb-8 relative z-10">
          {error && (
            <div className="mx-4 mt-4 bg-danger/10 text-danger p-3 rounded-lg text-sm flex items-start gap-2">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Delivery Details & Map Option */}
          <div className="px-4 mt-4 flex flex-col gap-3">
            <div className="flex items-center justify-between bg-surface rounded-xl p-4 shadow-sm border border-ink/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <span className="font-display font-bold text-sm block text-ink">Delivery in 10-15 mins</span>
                  <span className="font-body text-xs text-ink-muted">Distance: {formatDistance(distanceKm) || '1.2 km'}</span>
                </div>
              </div>
            </div>

            <div className="bg-surface rounded-xl p-4 shadow-sm border border-ink/5">
              <div className="flex items-center justify-between mb-2">
                <label className="font-body font-bold text-sm flex items-center gap-2 text-ink">
                  <Home className="h-4 w-4 text-primary" /> Delivery Address
                </label>
                <button
                  type="button"
                  onClick={() => setIsMapModalOpen(true)}
                  className="flex items-center gap-1.5 text-xs font-bold text-primary bg-primary/10 hover:bg-primary/20 px-3 py-1.5 rounded-lg transition-all"
                >
                  <MapPin className="w-3.5 h-3.5" /> Select on Map
                </button>
              </div>
              <textarea
                className="w-full bg-background border border-border rounded-lg p-3 font-body text-sm outline-none focus:border-primary resize-none"
                placeholder="Enter or select your delivery address"
                rows={2}
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
              />
              <div className="mt-2 text-[11px] font-mono text-ink-muted flex items-center gap-1">
                <MapPin className="w-3 h-3 text-primary" /> Pin Coordinates: {customerPos.lat.toFixed(4)}, {customerPos.lng.toFixed(4)}
              </div>
            </div>
          </div>

          {/* Cart Items */}
          <div className="mt-6 px-4">
            <h3 className="font-display font-black text-lg mb-3">Items ({cartItems.length})</h3>
            <div className="bg-surface rounded-xl shadow-sm border border-ink/5 overflow-hidden">
              {cartItems.map((item, idx) => {
                const catName = (item.product.category || 'General');
                const catTaxRate = categoryTaxes[catName.toLowerCase()] !== undefined ? categoryTaxes[catName.toLowerCase()] : 5.0;

                return (
                  <div key={item.product.id} className={`flex items-start gap-3 p-4 ${idx !== cartItems.length - 1 ? 'border-b border-ink/5' : ''}`}>
                    <div className="w-16 h-16 bg-background border border-border rounded-lg flex items-center justify-center shrink-0 p-1">
                      <img className="w-full h-full object-contain" alt={item.product.name} src={item.product.image} />
                    </div>
                    <div className="flex-1 flex flex-col justify-between h-16">
                      <div>
                        <div className="flex items-center justify-between">
                          <h4 className="font-body text-sm font-medium text-ink line-clamp-1">{item.product.name}</h4>
                          <span className="text-[10px] font-mono font-bold bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                            {catName} ({catTaxRate}%)
                          </span>
                        </div>
                        <span className="font-mono text-xs text-ink-muted">{item.product.size}</span>
                      </div>
                      <div className="flex items-center justify-between w-full">
                        <span className="font-mono font-bold text-sm">₹{item.product.price?.toFixed(2) || item.product.price}</span>
                        <div className="flex items-center border border-primary bg-primary/5 rounded-lg h-7 overflow-hidden">
                          <button onClick={() => removeFromCart(item.product.id)} className="w-7 h-full flex items-center justify-center text-primary">
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-6 text-center font-mono font-bold text-xs text-primary">{item.quantity}</span>
                          <button onClick={() => addToCart(item.product)} className="w-7 h-full flex items-center justify-center text-primary">
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Delivery Tip */}
          <div className="px-4 mt-6">
            <h3 className="font-display font-black text-lg mb-3">Tip your delivery partner</h3>
            <div className="bg-surface rounded-xl p-4 shadow-sm border border-ink/5">
              <p className="font-body text-xs text-ink-muted mb-3">100% of the tip goes directly to your driver.</p>
              <div className="flex gap-2 mb-3">
                {[10, 20, 30, 50].map((amount) => (
                  <button
                    key={amount}
                    type="button"
                    onClick={() => {
                      setIsCustomTipActive(false);
                      setTipAmount(tipAmount === amount && !isCustomTipActive ? 0 : amount);
                    }}
                    className={`flex-1 py-2 rounded-lg font-mono text-xs font-bold border transition-colors ${
                      tipAmount === amount && !isCustomTipActive ? 'bg-primary text-white border-primary' : 'bg-surface border-border text-ink hover:bg-ink/5'
                    }`}
                  >
                    ₹{amount}
                  </button>
                ))}
              </div>

              {/* Custom Tip Option */}
              <div className="flex items-center gap-2 pt-1 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsCustomTipActive(!isCustomTipActive)}
                  className={`text-xs font-mono font-bold px-3 py-2 rounded-lg border transition-colors ${
                    isCustomTipActive ? 'bg-primary text-white border-primary' : 'bg-background border-border text-ink'
                  }`}
                >
                  Custom Tip
                </button>
                {isCustomTipActive && (
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-xs text-ink-muted font-bold">₹</span>
                    <input
                      type="number"
                      min="0"
                      value={customTip}
                      onChange={(e) => setCustomTip(e.target.value)}
                      placeholder="Enter amount..."
                      className="w-full h-9 pl-7 pr-3 bg-background border border-border rounded-lg font-mono text-xs outline-none focus:border-primary"
                    />
                  </div>
                )}
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
                    Delivery Fee ({formatDistance(distanceKm) || '1 km'}) <Info className="h-3.5 w-3.5" />
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
                  <span className="font-body text-sm text-ink-muted">Category Product Taxes</span>
                  <span className="font-mono text-sm">₹{itemTaxes.toFixed(2)}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="font-body text-sm text-ink-muted">Delivery Tax (5%)</span>
                  <span className="font-mono text-sm">₹{deliveryTax.toFixed(2)}</span>
                </div>

                {activeTip > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="font-body text-sm text-ink-muted">Delivery Partner Tip</span>
                    <span className="font-mono text-sm">₹{activeTip.toFixed(2)}</span>
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

export default CartPage;
