import React from 'react';
import { Package, ListOrdered, TrendingUp, User } from 'lucide-react';
import { TicketCard } from '../../components/ui/TicketCard';
import { Badge } from '../../components/ui/Badge';

export function StoreAdminOverview({ store, orders }) {
  return (
    <div className="flex flex-col gap-6">
      <TicketCard className="bg-chalk shadow-sm border-ink/10 p-6 flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-lg bg-surface border border-ink/10 overflow-hidden flex items-center justify-center">
            <img src={store?.logoUrl || "/placeholder-store-logo.svg"} alt="Logo" className="w-12 h-12 object-contain" />
          </div>
          <div>
            <h2 className="font-display font-black text-xl text-ink leading-tight">{store?.name || 'Your Store'}</h2>
            <Badge variant={store?.isOpen ? "marigold" : "chalk"} className="mt-2">
              {store?.isOpen ? 'Open Now' : 'Closed'}
            </Badge>
          </div>
        </div>
        <div className="flex items-center justify-between border-t border-dashed border-ink/20 pt-4 mt-2">
          <span className="font-mono text-sm text-ink-muted uppercase tracking-wider">Freshness Score</span>
          <span className="font-mono text-lg font-bold">{store?.freshnessScore || 98}%</span>
        </div>
      </TicketCard>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <TicketCard className="bg-chalk shadow-sm border-ink/10 p-4 text-center flex flex-col items-center justify-center">
          <ListOrdered className="h-6 w-6 text-marigold mb-2" />
          <span className="font-body font-bold">{orders?.length || 0} Orders</span>
        </TicketCard>
        <TicketCard className="bg-chalk shadow-sm border-ink/10 p-4 text-center flex flex-col items-center justify-center">
          <Package className="h-6 w-6 text-bazaar-green mb-2" />
          <span className="font-body font-bold">12 Low Stock</span>
        </TicketCard>
        <TicketCard className="bg-chalk shadow-sm border-ink/10 p-4 text-center flex flex-col items-center justify-center">
          <TrendingUp className="h-6 w-6 text-ink mb-2" />
          <span className="font-body font-bold">$450 Today</span>
        </TicketCard>
        <TicketCard className="bg-chalk shadow-sm border-ink/10 p-4 text-center flex flex-col items-center justify-center">
          <User className="h-6 w-6 text-ink-muted mb-2" />
          <span className="font-body font-bold">Profile</span>
        </TicketCard>
      </div>
    </div>
  );
}
