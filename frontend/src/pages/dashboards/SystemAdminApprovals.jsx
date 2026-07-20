import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { TicketCard } from '../../components/ui/TicketCard';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { ShieldCheck, Loader2 } from 'lucide-react';

export function SystemAdminApprovals() {
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchApprovals = async () => {
    try {
      const [storesRes, deliveryRes] = await Promise.all([
        api.get('/admin/stores/pending'),
        api.get('/admin/delivery-partners/pending')
      ]);

      const formattedStores = storesRes.data.map(store => ({
        id: store.id,
        name: store.name,
        type: 'STORE_ADMIN',
        date: 'Recent',
        city: store.city,
        raw: store
      }));

      const formattedDelivery = deliveryRes.data.map(user => ({
        id: user.id,
        name: user.fullName,
        type: 'DELIVERY_PARTNER',
        date: 'Recent',
        city: user.city || 'N/A',
        raw: user
      }));

      setApprovals([...formattedStores, ...formattedDelivery]);
    } catch (err) {
      console.error('Error fetching approvals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, []);

  const handleAction = async (approvalId, type, action) => {
    try {
      const status = action === 'approve' ? 'APPROVED' : 'REJECTED';
      if (type === 'STORE_ADMIN') {
        await api.put(`/admin/stores/${approvalId}/verify`, { status });
      } else {
        await api.put(`/admin/delivery-partners/${approvalId}/verify`, { status });
      }
      setApprovals(approvals.filter(a => !(a.id === approvalId && a.type === type)));
    } catch (err) {
      console.error('Action failed:', err);
      alert('Action failed');
    }
  };

  if (loading) {
    return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-bazaar-green" /></div>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-black text-2xl text-ink">Pending Approvals</h2>
          <p className="font-mono text-sm text-ink-muted mt-1 uppercase tracking-wider">Review new registrations</p>
        </div>
      </div>

      {approvals.length === 0 ? (
        <TicketCard className="bg-chalk p-12 text-center flex flex-col items-center">
          <ShieldCheck className="w-12 h-12 text-ink/20 mb-4" />
          <h3 className="font-display text-xl text-ink-muted font-bold">All caught up!</h3>
          <p className="font-body text-sm mt-2 text-ink-muted/80">There are no pending approvals at this time.</p>
        </TicketCard>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {approvals.map(a => (
            <TicketCard key={`${a.type}-${a.id}`} className="bg-chalk shadow-sm border-ink/10 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="font-display font-bold text-lg text-ink leading-tight">{a.name}</h3>
                <p className="font-body text-sm text-ink-muted mt-1">Applied: {a.date} • {a.city}</p>
                {a.type === 'DELIVERY_PARTNER' && (
                  <p className="font-body text-sm text-ink-muted mt-1">
                    Vehicle: {a.raw.vehicleType || 'N/A'} - {a.raw.vehicleNumber || 'N/A'}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-3 w-full md:w-auto">
                <Badge variant="marigold" className="uppercase">{a.type.replace('_', ' ')}</Badge>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => handleAction(a.id, a.type, 'reject')}>Reject</Button>
                  <Button onClick={() => handleAction(a.id, a.type, 'approve')}>Approve</Button>
                </div>
              </div>
            </TicketCard>
          ))}
        </div>
      )}
    </div>
  );
}
