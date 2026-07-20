import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { ShieldCheck, Loader2, TrendingUp, Store, Users, DollarSign } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

export function SystemAdminOverview() {
  const [stats, setStats] = useState({ activeOrders: 0, approvedStoreCount: 0, grossTransactionValue: 0 });
  const [revenueTrend, setRevenueTrend] = useState([]);
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState(null);

  const fetchData = async () => {
    try {
      const [statsRes, trendRes, storesRes, deliveryRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/stats/revenue-trend?days=7'),
        api.get('/admin/stores/pending'),
        api.get('/admin/delivery-partners/pending')
      ]);

      setStats(statsRes.data);
      setRevenueTrend(trendRes.data.map(d => ({ date: d.date, amount: parseFloat(d.totalamount || d.totalAmount) })));

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
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
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
      setToastMessage(`${type.replace('_', ' ')} has been ${status.toLowerCase()} successfully!`);
      setTimeout(() => setToastMessage(null), 3000);
    } catch (err) {
      console.error('Action failed:', err);
      alert('Action failed');
    }
  };

  if (loading) {
    return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="flex flex-col gap-6">
      {toastMessage && (
        <div className="bg-primary text-white p-4 rounded-xl shadow-lg text-sm flex items-center justify-between">
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="opacity-80 hover:opacity-100">✕</button>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-ink-muted uppercase tracking-wider">Store Onboarding</p>
              <h3 className="text-2xl font-bold text-ink mt-1">{stats.approvedStoreCount}</h3>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-info/10 flex items-center justify-center text-info">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-ink-muted uppercase tracking-wider">Total Active Orders</p>
              <h3 className="text-2xl font-bold text-ink mt-1">{stats.activeOrders}</h3>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-warning/10 flex items-center justify-center text-warning">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-ink-muted uppercase tracking-wider">Gross Transaction Value</p>
              <h3 className="text-2xl font-bold text-ink mt-1">${(stats.grossTransactionValue || 0).toFixed(2)}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72 w-full">
            {revenueTrend.length === 0 ? (
              <div className="flex items-center justify-center h-full text-ink-muted">Not enough order history yet</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueTrend}>
                  <defs>
                    <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0F9D6E" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#0F9D6E" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} dx={-10} tickFormatter={(val) => '$'+val} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Area type="monotone" dataKey="amount" stroke="#0F9D6E" strokeWidth={2} fillOpacity={1} fill="url(#colorAmount)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Approval Queue */}
      <Card>
        <CardHeader>
          <CardTitle>Store Approval Queue</CardTitle>
        </CardHeader>
        <CardContent>
          {approvals.length === 0 ? (
            <div className="text-center py-12">
              <ShieldCheck className="w-12 h-12 text-ink-muted/30 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-ink-muted">All caught up!</h3>
              <p className="text-sm text-ink-muted mt-1">There are no pending approvals at this time.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border text-xs font-semibold text-ink-muted uppercase tracking-wider">
                    <th className="pb-3 px-4">Applicant</th>
                    <th className="pb-3 px-4">Type</th>
                    <th className="pb-3 px-4">Details</th>
                    <th className="pb-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {approvals.map(a => (
                    <tr key={`${a.type}-${a.id}`} className="border-b border-border last:border-0 hover:bg-background/50 transition-colors">
                      <td className="py-4 px-4 font-medium text-ink">{a.name}</td>
                      <td className="py-4 px-4">
                        <Badge variant="warning">{a.type.replace('_', ' ')}</Badge>
                      </td>
                      <td className="py-4 px-4 text-ink-muted">
                        {a.city} {a.type === 'DELIVERY_PARTNER' ? `• ${a.raw.vehicleType || 'N/A'}` : ''}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleAction(a.id, a.type, 'reject')}>Reject</Button>
                          <Button size="sm" onClick={() => handleAction(a.id, a.type, 'approve')}>Approve</Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
