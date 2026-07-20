import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { ArrowLeft, Phone, MapPin, CheckCircle2, Clock, Package, Loader2, Navigation, MessageCircle } from 'lucide-react';
import { api } from '../services/api';
import { Button } from '../components/ui/Button';

export function TrackOrderPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const orderId = location.state?.orderId;

  useEffect(() => {
    if (!orderId) {
      setError('No order found to track');
      setLoading(false);
      return;
    }

    const fetchOrder = async () => {
      try {
        const response = await api.get(`/customer/orders/${orderId}`);
        setOrder(response.data);
      } catch (err) {
        console.error("Failed to fetch order", err);
        setError('Failed to load order details');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
    // In a real app, we'd poll or use WebSockets here for updates
    const interval = setInterval(fetchOrder, 10000);
    return () => clearInterval(interval);
  }, [orderId]);

  if (loading) {
    return (
      <div className="bg-chalk min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="bg-chalk min-h-screen flex flex-col items-center justify-center p-4">
        <h2 className="text-xl font-bold mb-4">{error || 'Order not found'}</h2>
        <Button onClick={() => navigate('/')}>Go Home</Button>
      </div>
    );
  }

  const getStatusIndex = (status) => {
    const statuses = ['PENDING', 'ACCEPTED', 'OUT_FOR_DELIVERY', 'DELIVERED'];
    return statuses.indexOf(status) >= 0 ? statuses.indexOf(status) : 0;
  };
  const currentIndex = getStatusIndex(order.status);
  
  const estimatedMins = order.estimatedDeliveryTime || 12;

  return (
    <div className="bg-chalk font-body text-ink antialiased min-h-screen pb-6">
      <div className="max-w-md mx-auto bg-chalk min-h-screen flex flex-col relative">
        {/* Header (Overlaid on map) */}
        <button onClick={() => navigate('/')} className="absolute top-4 left-4 z-20 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md text-ink hover:bg-white active:scale-95 transition-all">
          <ArrowLeft className="h-5 w-5" />
        </button>

        {/* Map Area */}
        <div className="w-full h-[40vh] bg-surface relative flex items-center justify-center overflow-hidden">
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url('https://maps.googleapis.com/maps/api/staticmap?center=${order.customerLat || 0},${order.customerLng || 0}&zoom=15&size=600x600&maptype=roadmap&style=feature:all|element:labels.text.fill|color:0x333333&style=feature:water|element:geometry|color:0x006c4a&sensor=false')` }}
          ></div>
          
          {/* Faded overlay for better text contrast at top */}
          <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/20 to-transparent"></div>

          {/* Delivery Marker */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary flex flex-col items-center drop-shadow-lg">
            <div className="bg-primary text-white p-2 rounded-full shadow-lg border-2 border-white animate-pulse">
              <Navigation className="h-5 w-5 fill-white" />
            </div>
            <div className="w-6 h-1.5 bg-black/30 rounded-[100%] mt-2 blur-[1px]"></div>
          </div>
        </div>

        {/* Content Sheet */}
        <div className="flex-1 bg-chalk -mt-6 rounded-t-3xl relative z-10 p-5 shadow-[0_-4px_15px_rgba(0,0,0,0.05)]">
          <div className="w-12 h-1.5 bg-ink/10 rounded-full mx-auto mb-6"></div>

          {/* ETA Card */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex flex-col">
              <span className="font-display font-black text-3xl text-ink">Arriving in</span>
              <span className="font-display font-black text-3xl text-primary">{estimatedMins} mins</span>
              <span className="font-body text-sm text-ink-muted mt-1">
                {order.status === 'PENDING' ? 'Waiting for store to confirm...' :
                 order.status === 'ACCEPTED' ? 'Order is being packed...' :
                 order.status === 'OUT_FOR_DELIVERY' ? 'Partner is on the way!' : 'Order delivered!'}
              </span>
            </div>
            <div className="w-16 h-16 bg-bazaar-green/10 text-bazaar-green rounded-full flex items-center justify-center">
              <Clock className="h-8 w-8" />
            </div>
          </div>

          {/* Delivery Agent Info */}
          {order.deliveryAgent && (
            <div className="bg-surface rounded-2xl p-4 flex items-center justify-between mb-6 shadow-sm border border-ink/5">
              <div className="flex items-center gap-4">
                <img src={order.deliveryAgent.profilePhotoUrl || "https://i.pravatar.cc/150?img=11"} alt="Delivery Agent" className="w-14 h-14 rounded-full border-2 border-primary object-cover" />
                <div>
                  <h3 className="font-display font-bold text-lg text-ink">{order.deliveryAgent.fullName || 'Raju K'}</h3>
                  <div className="flex items-center gap-1 text-ink-muted text-xs font-mono font-bold mt-1">
                    <span className="bg-ink/10 px-1.5 py-0.5 rounded">4.8 ★</span>
                    <span>• {order.deliveryAgent.vehicleType || 'Bike'}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary/20 transition-colors">
                  <MessageCircle className="h-5 w-5" />
                </button>
                <button className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary/90 transition-colors shadow-sm">
                  <Phone className="h-5 w-5 fill-current" />
                </button>
              </div>
            </div>
          )}

          {/* Order Status Timeline */}
          <div className="mb-8 pl-2">
            <h3 className="font-display font-black text-lg text-ink mb-5">Order Tracking</h3>
            <div className="flex flex-col gap-6 relative">
              <div className="absolute left-[11px] top-4 bottom-4 w-0.5 bg-ink/10"></div>
              
              {[
                { label: 'Order Confirmed', desc: 'We have received your order' },
                { label: 'Order Packed', desc: 'Store has packed your items' },
                { label: 'Out for Delivery', desc: 'Partner is on the way' },
                { label: 'Delivered', desc: 'Order delivered successfully' }
              ].map((step, idx) => {
                const isActive = currentIndex >= idx;
                const isCurrent = currentIndex === idx;
                return (
                  <div key={idx} className="flex gap-5 relative z-10">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border-2 mt-0.5 transition-colors ${isActive ? 'bg-primary border-primary text-white' : 'bg-chalk border-ink/20 text-transparent'}`}>
                      {isActive && <CheckCircle2 className="h-4 w-4" />}
                    </div>
                    <div className="flex flex-col">
                      <span className={`font-body font-bold ${isActive ? 'text-ink' : 'text-ink-muted'}`}>{step.label}</span>
                      <span className="font-body text-xs text-ink-muted mt-1">{step.desc}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Order Summary Summary */}
          <div className="bg-surface rounded-2xl p-4 flex items-center justify-between shadow-sm border border-ink/5 cursor-pointer hover:bg-ink/5 transition-colors" onClick={() => navigate('/orders')}>
             <div className="flex items-center gap-4">
               <div className="w-12 h-12 bg-marigold/20 text-marigold rounded-xl flex items-center justify-center">
                 <Package className="h-6 w-6" />
               </div>
               <div>
                 <span className="font-display font-bold text-ink block">Order Details</span>
                 <span className="font-body text-xs text-ink-muted block mt-1">{order.items?.length || 0} items • ₹{order.totalAmount?.toFixed(2)}</span>
               </div>
             </div>
             <ArrowLeft className="h-5 w-5 text-ink-muted rotate-180" />
          </div>
        </div>
      </div>
    </div>
  );
}
