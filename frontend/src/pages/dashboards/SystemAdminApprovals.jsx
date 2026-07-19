import React, { useState, useEffect } from 'react';
import { TicketCard } from '../../components/ui/TicketCard';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { ShieldCheck, Loader2 } from 'lucide-react';

export function SystemAdminApprovals() {
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data for approvals
    setTimeout(() => {
      setApprovals([
        { id: 1, name: 'Dave Delivery', type: 'DELIVERY_PARTNER', date: 'Oct 24, 2026', city: 'Seattle' },
        { id: 2, name: 'Eve Store Owner', type: 'STORE_ADMIN', date: 'Oct 24, 2026', city: 'Portland' },
      ]);
      setLoading(false);
    }, 500);
  }, []);

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
            <TicketCard key={a.id} className="bg-chalk shadow-sm border-ink/10 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="font-display font-bold text-lg text-ink leading-tight">{a.name}</h3>
                <p className="font-body text-sm text-ink-muted mt-1">Applied: {a.date} • {a.city}</p>
              </div>
              <div className="flex items-center gap-3 w-full md:w-auto">
                <Badge variant="marigold" className="uppercase">{a.type.replace('_', ' ')}</Badge>
                <div className="flex gap-2">
                  <Button variant="outline">Reject</Button>
                  <Button>Approve</Button>
                </div>
              </div>
            </TicketCard>
          ))}
        </div>
      )}
    </div>
  );
}
