import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { ArrowLeft, Phone, MessageSquare, MapPin, CheckCircle2, Clock, Package, Loader2 } from 'lucide-react';
import { api } from '../services/api';

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
    <div className="bg-surface-dim font-body-md text-on-surface antialiased min-h-screen pb-6">
      <div className="max-w-[480px] mx-auto bg-background min-h-screen flex flex-col shadow-lg">
        {/* Header */}
        <header className="bg-primary text-on-primary px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
          <button onClick={() => navigate('/')} className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors">
            <ArrowLeft className="h-6 w-6" />
          </button>
          <div>
            <h1 className="font-headline-md text-headline-md">Track Order</h1>
            <p className="font-label-md text-label-md opacity-90">Order #{order.id}</p>
          </div>
        </header>

        {/* Map Area */}
        <div className="w-full h-64 bg-surface-variant relative flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://maps.googleapis.com/maps/api/staticmap?center=12.9716,77.5946&zoom=14&size=600x400&maptype=roadmap&style=feature:all|element:labels.text.fill|color:0x333333&style=feature:water|element:geometry|color:0x006c4a&sensor=false')] opacity-30 bg-cover bg-center mix-blend-multiply"></div>
          
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary flex flex-col items-center animate-bounce">
            <MapPin className="h-8 w-8" fill="currentColor" />
            <div className="w-4 h-1 bg-black/20 rounded-[100%] mt-1 shadow-sm"></div>
          </div>

          <div className="absolute top-4 left-4 right-4 bg-surface rounded-xl shadow-md p-4 flex items-center justify-between border border-surface-variant">
            <div className="flex flex-col">
              <span className="font-headline-sm text-headline-sm text-on-surface">Arriving in {order.estimatedDeliveryTime || 10} mins</span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">Your order is {order.status.toLowerCase().replace('_', ' ')}!</span>
            </div>
            <div className="w-12 h-12 bg-primary-container text-on-primary-container rounded-full flex items-center justify-center">
              <Clock className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="flex-1 p-margin-mobile flex flex-col gap-4">
          {/* Delivery Agent Info */}
          {order.deliveryAgent && (
            <div className="bg-surface rounded-xl shadow-sm border border-surface-variant p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src={order.deliveryAgent.profilePhotoUrl || "https://i.pravatar.cc/150?img=11"} alt="Delivery Agent" className="w-12 h-12 rounded-full border-2 border-primary" />
                <div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface">{order.deliveryAgent.fullName || 'Agent'}</h3>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">Delivery Partner</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center hover:bg-primary-container transition-colors">
                  <Phone className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}

          {/* Order Status Timeline */}
          <div className="bg-surface rounded-xl shadow-sm border border-surface-variant p-4">
            <h3 className="font-headline-sm text-headline-sm text-on-surface mb-4">Order Status</h3>
            <div className="flex flex-col gap-4 relative">
              <div className="absolute left-[11px] top-3 bottom-3 w-[2px] bg-surface-container-highest"></div>
              
              <div className="flex gap-4 relative z-10">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${currentIndex >= 0 ? 'bg-primary text-on-primary' : 'bg-surface-container-high border-2 border-surface-container-highest text-transparent'}`}>
                  {currentIndex >= 0 && <CheckCircle2 className="h-4 w-4" />}
                </div>
                <div className="flex flex-col">
                  <span className={`font-label-md text-label-md ${currentIndex >= 0 ? 'text-on-surface font-bold' : 'text-on-surface opacity-50'}`}>Order Confirmed</span>
                </div>
              </div>

              <div className="flex gap-4 relative z-10">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${currentIndex >= 1 ? 'bg-primary text-on-primary' : 'bg-surface-container-high border-2 border-surface-container-highest text-transparent'}`}>
                  {currentIndex >= 1 && <CheckCircle2 className="h-4 w-4" />}
                </div>
                <div className="flex flex-col">
                  <span className={`font-label-md text-label-md ${currentIndex >= 1 ? 'text-on-surface font-bold' : 'text-on-surface opacity-50'}`}>Order Accepted</span>
                </div>
              </div>

              <div className="flex gap-4 relative z-10">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${currentIndex >= 2 ? 'bg-primary text-on-primary' : 'bg-surface-container-high border-2 border-surface-container-highest text-transparent'}`}>
                  {currentIndex >= 2 && <CheckCircle2 className="h-4 w-4" />}
                </div>
                <div className="flex flex-col">
                  <span className={`font-label-md text-label-md ${currentIndex >= 2 ? 'text-on-surface font-bold' : 'text-on-surface opacity-50'}`}>Out for Delivery</span>
                </div>
              </div>

              <div className="flex gap-4 relative z-10">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${currentIndex >= 3 ? 'bg-primary text-on-primary' : 'bg-surface-container-high border-2 border-surface-container-highest text-transparent'}`}>
                  {currentIndex >= 3 && <CheckCircle2 className="h-4 w-4" />}
                </div>
                <div className="flex flex-col">
                  <span className={`font-label-md text-label-md ${currentIndex >= 3 ? 'text-on-surface font-bold' : 'text-on-surface opacity-50'}`}>Delivered</span>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-surface rounded-xl shadow-sm border border-surface-variant p-4 flex items-center justify-between">
             <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-surface-container rounded-lg flex items-center justify-center text-on-surface-variant">
                 <Package className="h-6 w-6" />
               </div>
               <div>
                 <span className="font-label-md text-label-md text-on-surface block">{order.items?.length || 0} Items</span>
                 <span className="font-body-sm text-body-sm text-on-surface-variant block">Total: ${order.totalAmount?.toFixed(2)}</span>
               </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
