import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { ArrowLeft, Phone, MapPin, CheckCircle2, Clock, Package, Loader2 } from 'lucide-react';
import { api } from '../services/api';
import { TicketCard } from '../components/ui/TicketCard';
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
      <div className="bg-surface-dim min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="bg-surface-dim min-h-screen flex flex-col items-center justify-center p-4">
        <h2 className="text-xl font-bold mb-4">{error || 'Order not found'}</h2>
        <button onClick={() => navigate('/')} className="bg-primary text-on-primary px-4 py-2 rounded-lg">Go Home</button>
      </div>
    );
  }

  const getStatusIndex = (status) => {
    const statuses = ['PENDING', 'ACCEPTED', 'OUT_FOR_DELIVERY', 'DELIVERED'];
    return statuses.indexOf(status) >= 0 ? statuses.indexOf(status) : 0;
  };
  const currentIndex = getStatusIndex(order.status);

  return (
    <div className="bg-kraft font-body text-ink antialiased min-h-screen pb-6">
      <div className="max-w-[480px] mx-auto bg-kraft min-h-screen flex flex-col relative">
        {/* Header */}
        <header className="bg-chalk text-ink px-4 py-4 flex items-center gap-3 sticky top-0 z-10 border-b border-ink/10 shadow-sm">
          <button onClick={() => navigate('/')} className="p-2 -ml-2 rounded-full hover:bg-ink/5 transition-colors">
            <ArrowLeft className="h-6 w-6" />
          </button>
          <div>
            <h1 className="font-display font-black text-2xl tracking-tight">Track Order</h1>
            <p className="font-mono text-xs uppercase tracking-wider text-ink-muted mt-1">Order #{order.id}</p>
          </div>
        </header>

        {/* Map Area */}
        <div className="w-full h-64 bg-surface-variant relative flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://maps.googleapis.com/maps/api/staticmap?center=12.9716,77.5946&zoom=14&size=600x400&maptype=roadmap&style=feature:all|element:labels.text.fill|color:0x333333&style=feature:water|element:geometry|color:0x006c4a&sensor=false')] opacity-30 bg-cover bg-center mix-blend-multiply"></div>
          
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary flex flex-col items-center animate-bounce">
            <MapPin className="h-8 w-8" fill="currentColor" />
            <div className="w-4 h-1 bg-black/20 rounded-[100%] mt-1 shadow-sm"></div>
          </div>

          <TicketCard className="absolute top-4 left-4 right-4 bg-chalk shadow-sm p-4 flex items-center justify-between border-ink/10 z-10">
            <div className="flex flex-col">
              <span className="font-display font-black text-lg text-ink">Arriving in {order.estimatedDeliveryTime || 10} mins</span>
              <span className="font-mono text-xs uppercase tracking-wider text-ink-muted mt-1">Your order is {order.status.toLowerCase().replace('_', ' ')}!</span>
            </div>
            <div className="w-12 h-12 bg-marigold text-ink rounded-full border border-ink flex items-center justify-center shadow-sm">
              <Clock className="h-6 w-6" />
            </div>
          </TicketCard>
        </div>

        <div className="flex-1 p-4 flex flex-col gap-4">
          {/* Delivery Agent Info */}
          {order.deliveryAgent && (
            <TicketCard className="bg-chalk shadow-sm border-ink/10 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src={order.deliveryAgent.profilePhotoUrl || "https://i.pravatar.cc/150?img=11"} alt="Delivery Agent" className="w-12 h-12 rounded-full border-2 border-ink" />
                <div>
                  <h3 className="font-display font-black text-lg text-ink">{order.deliveryAgent.fullName || 'Agent'}</h3>
                  <span className="font-mono text-xs uppercase tracking-wider text-ink-muted">Delivery Partner</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" className="w-10 h-10 p-0 rounded-full border-ink text-ink hover:bg-ink hover:text-chalk">
                  <Phone className="h-5 w-5" />
                </Button>
              </div>
            </TicketCard>
          )}

          {/* Order Status Timeline */}
          <TicketCard className="bg-chalk shadow-sm border-ink/10 p-4">
            <h3 className="font-display font-black text-xl text-ink mb-4 uppercase tracking-tight border-b-2 border-dashed border-ink/20 pb-2">Order Status</h3>
            <div className="flex flex-col gap-4 relative mt-2">
              <div className="absolute left-[11px] top-3 bottom-3 w-[2px] bg-ink/10 border-l-2 border-dashed border-ink/20"></div>
              
              <div className="flex gap-4 relative z-10">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border border-ink ${currentIndex >= 0 ? 'bg-bazaar-green text-chalk' : 'bg-chalk text-transparent'}`}>
                  {currentIndex >= 0 && <CheckCircle2 className="h-4 w-4" />}
                </div>
                <div className="flex flex-col mt-0.5">
                  <span className={`font-mono text-sm uppercase tracking-wider ${currentIndex >= 0 ? 'text-ink font-bold' : 'text-ink-muted'}`}>Order Confirmed</span>
                </div>
              </div>

              <div className="flex gap-4 relative z-10">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border border-ink ${currentIndex >= 1 ? 'bg-bazaar-green text-chalk' : 'bg-chalk text-transparent'}`}>
                  {currentIndex >= 1 && <CheckCircle2 className="h-4 w-4" />}
                </div>
                <div className="flex flex-col mt-0.5">
                  <span className={`font-mono text-sm uppercase tracking-wider ${currentIndex >= 1 ? 'text-ink font-bold' : 'text-ink-muted'}`}>Order Accepted</span>
                </div>
              </div>

              <div className="flex gap-4 relative z-10">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border border-ink ${currentIndex >= 2 ? 'bg-bazaar-green text-chalk' : 'bg-chalk text-transparent'}`}>
                  {currentIndex >= 2 && <CheckCircle2 className="h-4 w-4" />}
                </div>
                <div className="flex flex-col mt-0.5">
                  <span className={`font-mono text-sm uppercase tracking-wider ${currentIndex >= 2 ? 'text-ink font-bold' : 'text-ink-muted'}`}>Out for Delivery</span>
                </div>
              </div>

              <div className="flex gap-4 relative z-10">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border border-ink ${currentIndex >= 3 ? 'bg-bazaar-green text-chalk' : 'bg-chalk text-transparent'}`}>
                  {currentIndex >= 3 && <CheckCircle2 className="h-4 w-4" />}
                </div>
                <div className="flex flex-col mt-0.5">
                  <span className={`font-mono text-sm uppercase tracking-wider ${currentIndex >= 3 ? 'text-ink font-bold' : 'text-ink-muted'}`}>Delivered</span>
                </div>
              </div>
            </div>
          </TicketCard>

          {/* Order Summary */}
          <TicketCard className="bg-chalk shadow-sm border-ink/10 p-4 flex items-center justify-between">
             <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-kraft rounded-lg border border-ink/10 flex items-center justify-center text-ink">
                 <Package className="h-6 w-6" />
               </div>
               <div>
                 <span className="font-mono text-sm uppercase tracking-wider font-bold text-ink block">{order.items?.length || 0} Items</span>
                 <span className="font-body text-sm text-ink-muted block mt-1">Total: ${order.totalAmount?.toFixed(2)}</span>
               </div>
             </div>
          </TicketCard>
        </div>
      </div>
    </div>
  );
}
