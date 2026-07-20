import React, { useState } from 'react';
import { Package, MapPin, Loader2 } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { api } from '../../services/api';
import { ImageUploader } from '../../components/ui/ImageUploader';

export function DeliveryTasks({ tasks, onTaskUpdate }) {
  const hasActiveTasks = tasks?.orders?.length > 0;
  const [updating, setUpdating] = useState(null); // stores orderId currently being updated

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
     // Once the photo is uploaded, mark as delivered
     await handleUpdateStatus(orderId, 'DELIVERED');
  };

  return (
    <div className="flex flex-col gap-4">
      {!hasActiveTasks ? (
        <Card className="bg-surface shadow-sm border-border p-12 text-center flex flex-col items-center justify-center">
          <Package className="h-12 w-12 text-ink/20 mb-4" />
          <h3 className="font-display font-bold text-xl text-ink-muted">No active deliveries</h3>
          <p className="font-body text-sm text-ink-muted/80 mt-2">Hang tight, we're routing orders to you.</p>
          <Button className="mt-6" onClick={() => window.location.href = '/dashboard/delivery-dashboard/batch'}>Find New Batch</Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tasks.orders.map(order => (
            <Card key={order.id} className="bg-surface shadow-sm border-border p-4 hover:-translate-y-1 transition-transform duration-200 flex flex-col justify-between">
              <div>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-mono font-bold text-lg text-ink">Order #{order.id}</h3>
                      <p className="font-body text-sm font-bold text-primary flex items-center gap-1 mt-1">
                        <MapPin className="h-4 w-4" /> {order.deliveryAddress || '123 Delivery St'}
                      </p>
                    </div>
                    <Badge variant={order.status === 'DELIVERED' ? 'bazaar-green' : 'marigold'} className="uppercase tracking-widest text-[10px]">
                        {order.status}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between border-t border-dashed border-border pt-4 mt-2">
                    <div className="flex flex-col">
                      <span className="font-mono text-xs uppercase tracking-wider text-ink-muted">Estimated Payout</span>
                      <span className="font-mono text-lg font-bold">${(order.totalAmount * 0.1).toFixed(2)}</span>
                    </div>
                  </div>
              </div>

              <div className="mt-4 pt-4 border-t border-border">
                 {order.status === 'PENDING' || order.status === 'READY_FOR_PICKUP' ? (
                     <Button 
                        className="w-full" 
                        disabled={updating === order.id} 
                        onClick={() => handleUpdateStatus(order.id, 'OUT_FOR_DELIVERY')}
                     >
                         {updating === order.id ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Mark Out for Delivery'}
                     </Button>
                 ) : order.status === 'OUT_FOR_DELIVERY' ? (
                     <div className="flex flex-col items-center">
                         <span className="text-xs text-ink-muted font-bold mb-2">Upload Proof of Delivery to complete</span>
                         {updating === order.id ? (
                            <div className="flex justify-center p-2"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
                         ) : (
                            <ImageUploader 
                                uploadEndpoint={`/media/orders/${order.id}/proof-of-delivery/upload-url`}
                                confirmEndpoint={`/media/orders/${order.id}/proof-of-delivery`}
                                onUploadSuccess={(url) => handleProofOfDeliverySuccess(url, order.id)}
                                label="Upload Photo & Complete"
                                className="w-full flex-col-reverse"
                            />
                         )}
                     </div>
                 ) : order.status === 'DELIVERED' ? (
                     <div className="bg-primary/10 text-primary text-center py-2 rounded-lg font-bold text-sm">
                         Delivery Completed
                     </div>
                 ) : (
                     <Button className="w-full" disabled>Cannot Update</Button>
                 )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
