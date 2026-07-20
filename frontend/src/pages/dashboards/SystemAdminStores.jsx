import React, { useState, useEffect } from 'react';
import { TicketCard } from '../../components/ui/TicketCard';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Store, Loader2 } from 'lucide-react';

export function SystemAdminStores() {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStores = async () => {
      try {
        const response = await api.get('/admin/stores');
        setStores(response.data);
      } catch (err) {
        console.error('Error fetching stores:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStores();
  }, []);

  if (loading) {
    return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-bazaar-green" /></div>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-black text-2xl text-ink">Store Network</h2>
          <p className="font-mono text-sm text-ink-muted mt-1 uppercase tracking-wider">Monitor all active stores</p>
        </div>
        <Button>Add Store</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {stores.map(store => (
          <TicketCard key={store.id} className="bg-chalk shadow-sm border-ink/10 p-6 flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-marigold rounded-full flex items-center justify-center text-ink">
                <Store className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-display font-bold text-xl text-ink leading-tight">{store.name}</h3>
                <p className="font-body text-sm text-ink-muted">Owner: {store.owner?.fullName || 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-center justify-between border-t border-dashed border-ink/20 pt-4 mt-2">
              <Badge variant={store.isOpen ? "bazaar-green" : "chalk"}>
                {store.isOpen ? 'Open Now' : 'Closed'}
              </Badge>
              <span className="font-mono font-bold">Score: {store.freshnessScore}%</span>
            </div>
          </TicketCard>
        ))}
      </div>
    </div>
  );
}
