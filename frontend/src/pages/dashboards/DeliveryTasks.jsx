import React, { useState, useEffect } from 'react';
import { Package, MapPin, Loader2, CheckCircle, Clock, User, Home } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { api } from '../../services/api';
import { ImageUploader } from '../../components/ui/ImageUploader';

export function DeliveryTasks({ tasks, onTaskUpdate }) {
  const hasActiveTasks = tasks?.orders?.length > 0;
  const [updating, setUpdating] = useState(null);
  const [pendingOrders, setPendingOrders] = useState([]);
  const [loadingPending, setLoadingPending] = useState(true);
  const [accepting, setAccepting] = useState(null);

  // Fetch orders waiting for a delivery partner
  useEffect(() => {
    const fetchPending = async () => {
      try {
        const res = await api.get('/delivery/pending-orders');
        setPendingOrders(res.data || []);
      } catch (err) {
        console.warn('Could not fetch pending orders', err);
      } finally {
        setLoadingPending(false);
      }
    };
    fetchPending();
    const interval = setInterval(fetchPending, 15000); // poll every 15s
    return () => clearInterval(interval);
  }, []);

  const handleAcceptOrder = async (orderId) => {
    try {
      setAccepting(orderId);
      await api.post(`/delivery/accept-order/${orderId}`);
      // Remove from pending, refresh tasks
      setPendingOrders(prev => prev.filter(o => o.id !== orderId));
      if (onTaskUpdate) onTaskUpdate();
    } catch (err) {
      console.error('Failed to accept order', err);
      alert('Failed to accept order. Please try again.');
    } finally {
      setAccepting(null);
    }
  };

  const handleUpdateStatus = async (orderId, status) => {
    try {
      setUpdating(orderId);
      await api.patch('/delivery/status', { orderId, status });
      if (onTaskUpdate) onTaskUpdate();
    } catch (err) {
      console.error('Failed to update status', err);
      alert('Failed to update status');
    } finally {
      setUpdating(null);
    }
  };

  const handleProofOfDeliverySuccess = async (url, orderId) => {
    await handleUpdateStatus(orderId, 'DELIVERED');
  };

  const statusColor = (status) => {
    switch (status) {
      case 'ACCEPTED': return 'bg-blue-100 text-blue-700';
      case 'OUT_FOR_DELIVERY': return 'bg-warning/20 text-amber-700';
      case 'DELIVERED': return 'bg-primary/10 text-primary';
      default: return 'bg-ink/10 text-ink';
    }
  };

  return (
    <div className="flex flex-col gap-6">

      {/* ── NEW ORDERS WAITING FOR ACCEPTANCE ─────────────────────────────── */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Clock className="w-5 h-5 text-warning" />
          <h2 className="font-bold text-lg text-ink">New Orders – Accept to Deliver</h2>
          {pendingOrders.length > 0 && (
            <span className="bg-error text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {pendingOrders.length}
            </span>
          )}
        </div>

        {loadingPending ? (
          <Card className="p-8 flex justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </Card>
        ) : pendingOrders.length === 0 ? (
          <Card className="p-6 text-center bg-surface border-border">
            <Package className="h-10 w-10 text-ink/20 mx-auto mb-2" />
            <p className="text-sm text-ink-muted">No new orders waiting. Check back soon.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingOrders.map(order => (
              <Card key={order.id} className="bg-warning/5 border-2 border-warning/40 p-4 flex flex-col gap-3 hover:-translate-y-1 transition-transform">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-mono font-bold text-base text-ink">Order #{order.id}</h3>
                    <p className="text-xs text-ink-muted mt-0.5">
                      {order.items?.length || 0} item(s) • ₹{order.totalAmount?.toFixed(2) || '—'}
                    </p>
                  </div>
                  <span className="bg-warning/20 text-amber-700 text-xs font-bold px-2 py-1 rounded-full uppercase">
                    New
                  </span>
                </div>

                {/* Delivery Address */}
                <div className="bg-surface rounded-lg p-3 border border-border">
                  <div className="flex items-start gap-2">
                    <Home className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-ink-muted uppercase tracking-wider mb-0.5">Deliver To</p>
                      <p className="text-sm font-medium text-ink leading-snug">
                        {order.deliveryAddress || 'Address not specified'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Customer info */}
                {order.customer && (
                  <div className="flex items-center gap-2 text-xs text-ink-muted">
                    <User className="w-3.5 h-3.5" />
                    <span>{order.customer.fullName || 'Customer'}</span>
                    {order.customer.phone && <span>• {order.customer.phone}</span>}
                  </div>
                )}

                <Button
                  className="w-full"
                  disabled={accepting === order.id}
                  onClick={() => handleAcceptOrder(order.id)}
                >
                  {accepting === order.id
                    ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Accepting...</>
                    : <><CheckCircle className="w-4 h-4 mr-2" /> Accept Order</>
                  }
                </Button>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* ── MY ACTIVE DELIVERIES ───────────────────────────────────────────── */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Package className="w-5 h-5 text-primary" />
          <h2 className="font-bold text-lg text-ink">My Active Deliveries</h2>
        </div>

        {!hasActiveTasks ? (
          <Card className="bg-surface shadow-sm border-border p-10 text-center flex flex-col items-center justify-center">
            <Package className="h-12 w-12 text-ink/20 mb-4" />
            <h3 className="font-display font-bold text-xl text-ink-muted">No active deliveries</h3>
            <p className="font-body text-sm text-ink-muted/80 mt-2">Accept new orders above to start delivering.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tasks.orders.map(order => (
              <Card key={order.id} className="bg-surface shadow-sm border-border p-4 hover:-translate-y-1 transition-transform duration-200 flex flex-col justify-between gap-3">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-mono font-bold text-lg text-ink">Order #{order.id}</h3>
                      <p className="text-xs text-ink-muted mt-0.5">₹{order.totalAmount?.toFixed(2)}</p>
                    </div>
                    <span className={`text-xs font-bold px-2 py-1 rounded-full uppercase ${statusColor(order.status)}`}>
                      {order.status?.replace(/_/g, ' ')}
                    </span>
                  </div>

                  {/* Delivery Address – prominently displayed */}
                  <div className="bg-primary/5 rounded-lg p-3 border border-primary/20 mb-2">
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      <div>
                        <p className="text-[10px] font-bold text-primary uppercase tracking-wider mb-0.5">Delivery Address</p>
                        <p className="text-sm font-medium text-ink leading-snug">
                          {order.deliveryAddress || 'Address not provided'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Customer info */}
                  {order.customer && (
                    <div className="flex items-center gap-2 text-xs text-ink-muted">
                      <User className="w-3.5 h-3.5" />
                      <span>{order.customer.fullName || 'Customer'}</span>
                      {order.customer.phone && <span>• 📞 {order.customer.phone}</span>}
                    </div>
                  )}

                  <div className="flex items-center justify-between border-t border-dashed border-border pt-3 mt-3">
                    <div className="flex flex-col">
                      <span className="font-mono text-xs uppercase tracking-wider text-ink-muted">Est. Payout</span>
                      <span className="font-mono text-base font-bold">₹{((order.totalAmount || 0) * 0.1).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-border">
                  {order.status === 'ACCEPTED' || order.status === 'READY_FOR_PICKUP' ? (
                    <Button
                      className="w-full"
                      disabled={updating === order.id}
                      onClick={() => handleUpdateStatus(order.id, 'OUT_FOR_DELIVERY')}
                    >
                      {updating === order.id ? <Loader2 className="w-4 h-4 animate-spin" /> : '🚴 Mark Out for Delivery'}
                    </Button>
                  ) : order.status === 'OUT_FOR_DELIVERY' ? (
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-xs text-ink-muted font-bold">Upload Proof of Delivery to complete</span>
                      {updating === order.id ? (
                        <div className="flex justify-center p-2"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
                      ) : (
                        <ImageUploader
                          uploadEndpoint={`/media/orders/${order.id}/proof-of-delivery/upload-url`}
                          confirmEndpoint={`/media/orders/${order.id}/proof-of-delivery`}
                          onUploadSuccess={(url) => handleProofOfDeliverySuccess(url, order.id)}
                          label="📷 Upload Photo & Complete"
                          className="w-full flex-col-reverse"
                        />
                      )}
                    </div>
                  ) : order.status === 'DELIVERED' ? (
                    <div className="bg-primary/10 text-primary text-center py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2">
                      <CheckCircle className="w-4 h-4" /> Delivery Completed
                    </div>
                  ) : (
                    <Button className="w-full" disabled>Cannot Update</Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
