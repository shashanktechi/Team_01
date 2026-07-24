import React from 'react';
import { Share2, Phone, Plus, Clock, ExternalLink } from 'lucide-react';
import { Link } from 'react-router';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Icon3D } from '../../components/ui/Icon3D';

export function StoreAdminOverview({ store, orders }) {
  return (
    <div className="flex flex-col gap-6">
      <Card className="bg-surface shadow-sm border-border p-6 flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-lg bg-surface border border-border overflow-hidden flex items-center justify-center">
            <img src={store?.logoUrl || "/placeholder-store-logo.svg"} alt="Logo" className="w-12 h-12 object-contain" />
          </div>
          <div>
            <h2 className="font-display font-black text-xl text-ink leading-tight">{store?.name || 'Your Store'}</h2>
            <Badge variant={store?.isOpen ? "marigold" : "chalk"} className="mt-2">
              {store?.isOpen ? 'Open Now' : 'Closed'}
            </Badge>
          </div>
        </div>
        <div className="flex items-center justify-between border-t border-dashed border-border pt-4 mt-2">
          <span className="font-mono text-sm text-ink-muted uppercase tracking-wider">Freshness Score</span>
          <span className="font-mono text-lg font-bold">{store?.freshnessScore || 98}%</span>
        </div>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 flex flex-col items-start justify-center gap-2">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: 'rgba(245,158,11,0.1)' }}>
            <Icon3D name="cart" size={30} />
          </div>
          <div>
            <p className="font-display text-2xl font-black" style={{ color: '#12131A' }}>{orders?.length || 0}</p>
            <p className="font-mono text-xs uppercase tracking-wider font-bold" style={{ color: '#6B6D76' }}>Orders</p>
          </div>
        </Card>
        <Card className="p-4 flex flex-col items-start justify-center gap-2">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: 'rgba(22, 163, 74,0.1)' }}>
            <Icon3D name="snacks" size={30} />
          </div>
          <div>
            <p className="font-display text-2xl font-black" style={{ color: '#12131A' }}>12</p>
            <p className="font-mono text-xs uppercase tracking-wider font-bold" style={{ color: '#6B6D76' }}>Low Stock</p>
          </div>
        </Card>
        <Card className="p-4 flex flex-col items-start justify-center gap-2">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: 'rgba(34, 197, 94,0.1)' }}>
            <Icon3D name="star" size={30} />
          </div>
          <div>
            <p className="font-display text-2xl font-black" style={{ color: '#12131A' }}>₹450</p>
            <p className="font-mono text-xs uppercase tracking-wider font-bold" style={{ color: '#6B6D76' }}>Today</p>
          </div>
        </Card>
        <Card className="p-4 flex flex-col items-start justify-center gap-2">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: 'rgba(22, 163, 74,0.08)' }}>
            <Icon3D name="check" size={30} />
          </div>
          <div>
            <p className="font-display text-2xl font-black" style={{ color: '#12131A' }}>{store?.freshnessScore || 98}</p>
            <p className="font-mono text-xs uppercase tracking-wider font-bold" style={{ color: '#6B6D76' }}>Score</p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 bg-surface shadow-sm border-border p-6">
          <div className="flex items-center justify-between mb-4 border-b border-border pb-2">
            <h3 className="font-display font-bold text-lg flex items-center gap-2">
              <Clock className="w-5 h-5 text-ink-muted" /> Recent Activity
            </h3>
          </div>
          <div className="flex flex-col gap-4">
            {orders && orders.length > 0 ? orders.slice(0, 3).map((order) => (
              <div key={order.id} className="flex items-center justify-between p-3 rounded-lg bg-background border border-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-warning/20 flex items-center justify-center">
                    <Package className="w-5 h-5 text-warning" />
                  </div>
                  <div>
                    <p className="font-bold text-sm">New Order #{order.id}</p>
                    <p className="text-xs text-ink-muted">From {order.customer?.fullName || 'Customer'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-sm text-primary">${order.totalAmount?.toFixed(2) || '0.00'}</p>
                  <p className="text-xs text-ink-muted">Just now</p>
                </div>
              </div>
            )) : (
              <div className="text-center py-8 text-ink-muted">
                <p className="font-mono text-sm">No recent activity.</p>
              </div>
            )}
          </div>
        </Card>

        <Card className="bg-surface shadow-sm border-border p-6 flex flex-col gap-4">
          <h3 className="font-display font-bold text-lg mb-2 border-b border-border pb-2 flex items-center gap-2">
            <ExternalLink className="w-5 h-5 text-ink-muted" /> Quick Actions
          </h3>
          <Link to="/store-dashboard/inventory" className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 hover:bg-primary/10 text-primary transition-colors font-bold text-sm">
            <Plus className="w-4 h-4" /> Add New Product
          </Link>
          <button className="flex items-center gap-3 p-3 rounded-lg bg-ink/5 hover:bg-ink/10 text-ink transition-colors font-bold text-sm text-left">
            <Share2 className="w-4 h-4" /> Share Store Link
          </button>
          <button className="flex items-center gap-3 p-3 rounded-lg bg-ink/5 hover:bg-ink/10 text-ink transition-colors font-bold text-sm text-left">
            <Phone className="w-4 h-4" /> Contact Support
          </button>
        </Card>
      </div>
    </div>
  );
}
