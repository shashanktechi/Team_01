import React, { useState } from 'react';
import { api } from '../../services/api';
import { Button } from '../../components/ui/Button';
import { TicketCard } from '../../components/ui/TicketCard';
import { MapPin, Navigation, Package, Loader2, Navigation2 } from 'lucide-react';

export function DeliveryBatch() {
  const [loading, setLoading] = useState(false);
  const [batch, setBatch] = useState(null);
  const [error, setError] = useState(null);

  const handleFindBatch = () => {
    setLoading(true);
    setError(null);
    setBatch(null);

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          await fetchBatch(position.coords.latitude, position.coords.longitude);
        },
        async (err) => {
          console.warn("Geolocation failed or denied, using fallback", err);
          // Fallback to a default location (e.g., center of delivery zone) if permission denied
          await fetchBatch(12.9716, 77.5946);
        }
      );
    } else {
      fetchBatch(12.9716, 77.5946);
    }
  };

  const fetchBatch = async (lat, lng) => {
    try {
      const res = await api.post('/delivery/batch', { lat, lng });
      if (res.status === 204 || !res.data) {
        setError('No batches available near your location right now. Try again soon.');
      } else {
        setBatch(res.data);
      }
    } catch (err) {
      console.error('Failed to claim batch', err);
      setError('Failed to find batch. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-black text-2xl text-ink">Find Nearby Batch</h2>
          <p className="font-mono text-sm text-ink-muted mt-1 uppercase tracking-wider">Claim active orders in your zone</p>
        </div>
      </div>

      {!batch && !loading && (
        <TicketCard className="bg-chalk shadow-sm border-ink/10 p-12 text-center flex flex-col items-center justify-center">
          <Navigation2 className="h-16 w-16 text-bazaar-green mb-6" />
          <h3 className="font-display font-black text-2xl text-ink mb-2">Ready to Deliver?</h3>
          <p className="font-body text-ink-muted/80 max-w-md mx-auto mb-8">
            Click below to broadcast your location and claim a batch of orders optimized for your current position.
          </p>
          <Button onClick={handleFindBatch} size="lg" className="w-full sm:w-auto font-bold tracking-wider text-lg">
            Broadcast Location
          </Button>
          {error && <p className="text-clay mt-4 font-bold">{error}</p>}
        </TicketCard>
      )}

      {loading && (
        <TicketCard className="bg-chalk shadow-sm border-ink/10 p-12 flex flex-col items-center justify-center">
          <Loader2 className="h-12 w-12 text-bazaar-green animate-spin mb-4" />
          <p className="font-mono text-ink-muted uppercase tracking-wider font-bold">Scanning Delivery Zone...</p>
        </TicketCard>
      )}

      {batch && (
        <TicketCard className="bg-chalk shadow-sm border-bazaar-green border-2 p-6 overflow-hidden relative">
          <div className="absolute top-0 right-0 bg-bazaar-green text-white font-mono font-bold text-xs uppercase tracking-widest px-4 py-1 rounded-bl-lg">
            Batch Claimed
          </div>
          <h3 className="font-display font-black text-2xl text-ink mb-6 mt-2">Optimized Route</h3>
          <div className="relative border-l-2 border-dashed border-ink/20 ml-3 pl-6 flex flex-col gap-8">
            {batch.orders?.map((order, index) => (
              <div key={order.id} className="relative">
                <div className="absolute -left-[35px] top-1 w-6 h-6 rounded-full bg-kraft border-2 border-bazaar-green flex items-center justify-center font-bold text-xs">
                  {index + 1}
                </div>
                <div className="bg-white rounded-lg p-4 border border-ink/10 shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-mono font-bold text-ink">Order #{order.id}</span>
                    <span className="font-mono text-sm text-ink-muted">Payout: ${(order.totalAmount * 0.1).toFixed(2)}</span>
                  </div>
                  <div className="flex flex-col gap-2 mt-3">
                    <div className="flex items-start gap-2">
                       <Package className="w-4 h-4 text-marigold shrink-0 mt-0.5" />
                       <div className="flex flex-col">
                         <span className="text-xs uppercase tracking-wider text-ink-muted font-bold font-mono">Pickup</span>
                         <span className="text-sm font-bold">{order.store?.name} - {order.store?.address}</span>
                       </div>
                    </div>
                    <div className="flex items-start gap-2 mt-2">
                       <MapPin className="w-4 h-4 text-bazaar-green shrink-0 mt-0.5" />
                       <div className="flex flex-col">
                         <span className="text-xs uppercase tracking-wider text-ink-muted font-bold font-mono">Dropoff</span>
                         <span className="text-sm font-bold">{order.deliveryAddress}</span>
                       </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 pt-6 border-t border-dashed border-ink/20">
            <Button className="w-full" onClick={() => window.location.href = '/dashboard/delivery-dashboard/tasks'}>
              View in Active Tasks
            </Button>
          </div>
        </TicketCard>
      )}
    </div>
  );
}
