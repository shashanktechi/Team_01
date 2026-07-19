import React from 'react';
import { Package, MapPin } from 'lucide-react';
import { TicketCard } from '../../components/ui/TicketCard';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

export function DeliveryTasks({ tasks }) {
  const hasActiveTasks = tasks?.orders?.length > 0;

  return (
    <div className="flex flex-col gap-4">
      {!hasActiveTasks ? (
        <TicketCard className="bg-chalk shadow-sm border-ink/10 p-12 text-center flex flex-col items-center justify-center">
          <Package className="h-12 w-12 text-ink/20 mb-4" />
          <h3 className="font-display font-bold text-xl text-ink-muted">No active deliveries</h3>
          <p className="font-body text-sm text-ink-muted/80 mt-2">Hang tight, we're routing orders to you.</p>
          <Button className="mt-6">Find New Batch</Button>
        </TicketCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tasks.orders.map(order => (
            <TicketCard key={order.id} className="bg-chalk shadow-sm border-ink/10 p-4 hover:-translate-y-1 transition-transform duration-200">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-mono font-bold text-lg text-ink">Order #{order.id}</h3>
                  <p className="font-body text-sm font-bold text-bazaar-green flex items-center gap-1 mt-1">
                    <MapPin className="h-4 w-4" /> {order.deliveryAddress || '123 Delivery St'}
                  </p>
                </div>
                <Badge variant="chalk" className="uppercase tracking-widest text-[10px]">{order.status}</Badge>
              </div>
              
              <div className="flex items-center justify-between border-t border-dashed border-ink/20 pt-4 mt-2">
                <div className="flex flex-col">
                  <span className="font-mono text-xs uppercase tracking-wider text-ink-muted">Estimated Payout</span>
                  <span className="font-mono text-lg font-bold">${(order.totalAmount * 0.1).toFixed(2)}</span>
                </div>
                <Button>Navigate</Button>
              </div>
            </TicketCard>
          ))}
        </div>
      )}
    </div>
  );
}
