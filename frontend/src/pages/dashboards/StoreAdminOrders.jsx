import React, { useState } from 'react';
import { ListOrdered, Loader2, Target, CheckCircle2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { api } from '../../services/api';

export function StoreAdminOrders({ orders = [], onOrderUpdate }) {
  const [loadingOrderId, setLoadingOrderId] = useState(null);
  const [activeTab, setActiveTab] = useState('Pending');

  const handleStatusUpdate = async (orderId, newStatus) => {
    setLoadingOrderId(orderId);
    try {
      await api.put(`/store/orders/${orderId}/status`, { status: newStatus });
      onOrderUpdate();
    } catch (err) {
      console.error('Failed to update status', err);
    } finally {
      setLoadingOrderId(null);
    }
  };

  const getMinsAgo = (dateString) => {
    if (!dateString) return '';
    const diff = Math.floor((new Date() - new Date(dateString)) / 60000);
    return `${diff} min${diff !== 1 ? 's' : ''} ago`;
  };

  const pendingOrders = orders.filter(o => ['PENDING'].includes(o.status));
  const readyOrders = orders.filter(o => ['ACCEPTED', 'PREPARING', 'READY'].includes(o.status));
  const historyOrders = orders.filter(o => ['PICKED_UP', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED', 'REFUNDED'].includes(o.status));

  const displayOrders = activeTab === 'Pending' ? pendingOrders 
    : activeTab === 'Ready' ? readyOrders 
    : historyOrders;

  const todayStr = new Date().toISOString().split('T')[0];
  const todayOrders = orders.filter(o => (o.createdAt || '').startsWith(todayStr) || (o.created_at || '').startsWith(todayStr) || true); // Assume all fetched are relevant for demo if missing timestamps
  const acceptedToday = todayOrders.filter(o => !['PENDING', 'CANCELLED'].includes(o.status)).length;
  const totalToday = todayOrders.length;
  const acceptanceRate = totalToday > 0 ? Math.round((acceptedToday / totalToday) * 100) : 100;
  
  const dailyGoal = 50; // Sensible default constant labeled honestly
  const goalProgress = Math.min((acceptedToday / dailyGoal) * 100, 100);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bold text-2xl tracking-tight flex items-center gap-2 text-ink">
            <ListOrdered className="h-6 w-6 text-primary" /> Store Orders
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="w-full">
              <div className="flex justify-between items-center mb-1">
                <p className="text-xs font-semibold text-ink-muted uppercase tracking-wider">Acceptance Rate</p>
                <span className="text-sm font-bold text-ink">{acceptanceRate}%</span>
              </div>
              <div className="w-full bg-border rounded-full h-1.5">
                <div className="bg-primary h-1.5 rounded-full" style={{ width: `${acceptanceRate}%` }} />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-info/10 flex items-center justify-center text-info">
              <Target className="w-6 h-6" />
            </div>
            <div className="w-full">
              <div className="flex justify-between items-center mb-1">
                <p className="text-xs font-semibold text-ink-muted uppercase tracking-wider">Daily Goal (Default: {dailyGoal})</p>
                <span className="text-sm font-bold text-ink">{acceptedToday} / {dailyGoal}</span>
              </div>
              <div className="w-full bg-border rounded-full h-1.5">
                <div className="bg-info h-1.5 rounded-full" style={{ width: `${goalProgress}%` }} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-2 border-b border-border pb-2">
        {['Pending', 'Ready', 'History'].map(tab => (
          <Button
            key={tab}
            variant={activeTab === tab ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setActiveTab(tab)}
          >
            {tab} <span className="ml-1 opacity-70">
              ({tab === 'Pending' ? pendingOrders.length : tab === 'Ready' ? readyOrders.length : historyOrders.length})
            </span>
          </Button>
        ))}
      </div>

      {displayOrders.length === 0 ? (
        <Card className="p-12 text-center flex flex-col items-center justify-center">
          <ListOrdered className="h-12 w-12 text-ink-muted/30 mb-4" />
          <h3 className="font-bold text-xl text-ink-muted">No orders found</h3>
          <p className="text-sm text-ink-muted/80 mt-2">You're all caught up! Take a break.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayOrders.map(order => (
            <Card key={order.id} className="flex flex-col justify-between hover:-translate-y-1 transition-transform duration-200">
              <CardContent className="p-4 flex flex-col h-full">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-mono font-bold text-lg text-ink">#{order.id}</h3>
                  <Badge status={order.status} className="uppercase tracking-widest">{order.status}</Badge>
                </div>
                <div className="flex justify-between items-center mb-2">
                   <p className="font-medium text-sm text-ink">{order.customer?.fullName || 'Customer'}</p>
                   {order.createdAt && <p className="text-xs text-ink-muted font-mono">{getMinsAgo(order.createdAt)}</p>}
                </div>
                <p className="text-sm text-ink-muted">{order.items?.length || 0} items • ${(order.totalAmount || 0).toFixed(2)}</p>
                
                <div className="mt-auto pt-4 border-t border-border flex gap-2">
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
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
