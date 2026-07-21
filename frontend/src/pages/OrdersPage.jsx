import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Package, Clock, ChevronRight, Star, Loader2 } from 'lucide-react';
import { api } from '../services/api';
import { Button } from '../components/ui/Button';

export function OrdersPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await api.get('/customer/orders');
        setOrders(response.data);
      } catch (err) {
        console.error("Failed to fetch orders", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  return (
    <div className="bg-background text-ink font-body min-h-[100dvh]">
      <div className="w-full bg-background h-full min-h-screen flex flex-col relative pb-24">
        {/* Header */}
        <header className="bg-surface text-ink px-4 py-4 flex items-center gap-3 sticky top-0 z-10 border-b border-border shadow-sm">
          <button onClick={() => navigate('/stores')} className="p-2 -ml-2 rounded-full hover:bg-ink/5 transition-colors">
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h1 className="font-display font-black text-2xl tracking-tight">Your Orders</h1>
        </header>

        <div className="flex-1 p-4">
          {loading ? (
            <div className="flex justify-center mt-12">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
            </div>
          ) : orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center mt-20">
              <div className="text-6xl mb-4 opacity-50">📦</div>
              <h3 className="font-display font-bold text-xl text-ink">No orders yet</h3>
              <p className="font-body text-ink-muted text-center mt-2">When you place an order, it will appear here.</p>
              <Button onClick={() => navigate('/stores')} className="mt-6">Start Shopping</Button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {orders.map(order => (
                <div key={order.id} className="bg-surface rounded-2xl shadow-sm border border-ink/5 p-4 relative overflow-hidden">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-warning/10 text-warning rounded-xl flex items-center justify-center">
                        <Package className="h-5 w-5" />
                      </div>
                      <div>
                        <span className="font-display font-bold text-ink block">Order #{order.id}</span>
                        <span className="font-body text-xs text-ink-muted block mt-1">{new Date(order.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <span className="font-mono text-[10px] font-bold uppercase tracking-widest bg-ink/5 px-2 py-1 rounded-sm text-ink-muted">
                      {order.status}
                    </span>
                  </div>
                  
                  <div className="border-t border-ink/5 pt-3 pb-3 mb-3 border-b">
                    <p className="font-body text-sm text-ink-muted line-clamp-1">
                      {order.items?.length || 0} items • ${order.totalAmount?.toFixed(2)}
                    </p>
                  </div>

                  <div className="flex justify-between items-center">
                    <button 
                      onClick={() => navigate('/track', { state: { orderId: order.id } })}
                      className="font-mono font-bold text-xs uppercase tracking-wider text-primary flex items-center gap-1 active:opacity-70"
                    >
                      Track Order <ChevronRight className="h-4 w-4" />
                    </button>
                    {order.status === 'DELIVERED' ? (
                      <Button variant="outline" className="h-8 text-xs px-4" onClick={() => alert('Review Modal Coming Soon')}>Rate</Button>
                    ) : (
                      <div className="flex items-center gap-1 text-primary font-mono text-xs font-bold bg-primary/10 px-2 py-1 rounded-sm">
                        <Clock className="h-3 w-3" /> In Progress
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
