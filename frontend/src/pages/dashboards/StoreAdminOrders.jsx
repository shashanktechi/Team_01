import React, { useState } from 'react';
import { ListOrdered, Loader2 } from 'lucide-react';
import { TicketCard } from '../../components/ui/TicketCard';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { api } from '../../services/api';

export function StoreAdminOrders({ orders, onOrderUpdate }) {
  const [loadingOrderId, setLoadingOrderId] = useState(null);

  const handleStatusUpdate = async (orderId, newStatus) => {
    setLoadingOrderId(orderId);
    try {
      await api.put(`/store/orders/${orderId}/status`, { status: newStatus });
      onOrderUpdate(); // trigger refresh
    } catch (err) {
      console.error('Failed to update status', err);
    } finally {
      setLoadingOrderId(null);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display font-black text-2xl tracking-tight flex items-center gap-2 text-ink">
          <ListOrdered className="h-6 w-6 text-bazaar-green" /> Store Orders
        </h2>
        <Badge variant="chalk" className="font-mono text-xs">{orders?.length || 0} Total</Badge>
      </div>

      {!orders || orders.length === 0 ? (
        <TicketCard className="bg-chalk shadow-sm border-ink/10 p-12 text-center flex flex-col items-center justify-center">
          <ListOrdered className="h-12 w-12 text-ink/20 mb-4" />
          <h3 className="font-display font-bold text-xl text-ink-muted">No orders found</h3>
          <p className="font-body text-sm text-ink-muted/80 mt-2">You're all caught up! Take a break.</p>
        </TicketCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {orders.map(order => (
            <TicketCard key={order.id} className="bg-chalk shadow-sm border-ink/10 p-4 flex flex-col justify-between gap-4 hover:-translate-y-1 transition-transform duration-200">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-mono font-bold text-lg text-ink">Order #{order.id}</h3>
                  <Badge status={order.status} className="uppercase text-[10px] tracking-widest">{order.status}</Badge>
                </div>
                <p className="font-body text-sm text-ink-muted mt-1">{order.items?.length || 0} items • ${order.totalAmount?.toFixed(2)}</p>
                <p className="font-mono text-xs text-ink-muted mt-2 truncate text-ellipsis">{order.deliveryAddress}</p>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-2 mt-4 pt-4 border-t border-dashed border-ink/20 w-full">
                {order.status === 'PENDING' && (
                  <>
                    <Button variant="outline" className="w-full text-xs" onClick={() => handleStatusUpdate(order.id, 'CANCELLED')} disabled={loadingOrderId === order.id}>Reject</Button>
                    <Button className="w-full text-xs" onClick={() => handleStatusUpdate(order.id, 'ACCEPTED')} disabled={loadingOrderId === order.id}>
                      {loadingOrderId === order.id ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Accept'}
                    </Button>
                  </>
                )}
                {order.status === 'ACCEPTED' && (
                  <Button className="w-full text-xs" onClick={() => handleStatusUpdate(order.id, 'OUT_FOR_DELIVERY')} disabled={loadingOrderId === order.id}>
                    {loadingOrderId === order.id ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Dispatch'}
                  </Button>
                )}
              </div>
            </TicketCard>
          ))}
        </div>
      )}
    </div>
  );
}
