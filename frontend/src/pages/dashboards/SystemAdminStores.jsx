import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Store, Loader2, CheckCircle, XCircle } from 'lucide-react';

export function SystemAdminStores() {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('All');

  const fetchStores = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/stores');
      setStores(response.data);
    } catch (err) {
      console.error('Error fetching stores:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

  const handleStoreVerify = async (storeId, status) => {
    try {
      await api.put(`/admin/stores/${storeId}/verify?status=${encodeURIComponent(status)}`);
      // Update local state
      setStores(stores.map(s => 
        s.id === storeId 
          ? { ...s, verificationStatus: status, isActive: status === 'APPROVED' }
          : s
      ));
    } catch (err) {
      console.error('Error verifying store:', err);
      alert('Failed to update store status');
    }
  };

  const filteredStores = stores.filter(s => filterStatus === 'All' || s.verificationStatus === filterStatus);

  if (loading) {
    return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-black text-2xl text-ink">Store Network</h2>
          <p className="font-mono text-sm text-ink-muted mt-1 uppercase tracking-wider">Monitor all active stores</p>
        </div>
      </div>

      <div className="flex gap-2 mb-2 overflow-x-auto pb-2">
        {['All', 'PENDING', 'APPROVED', 'REJECTED'].map(status => (
          <Button
            key={status}
            variant={filterStatus === status ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setFilterStatus(status)}
            className="whitespace-nowrap"
          >
            {status}
          </Button>
        ))}
      </div>

      {filteredStores.length === 0 ? (
        <div className="text-center py-12 text-ink-muted border border-dashed border-border rounded-xl">
          <p>No stores found for this filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredStores.map(store => (
            <Card key={store.id} className="bg-surface shadow-sm border-border p-6 flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-surface rounded-full flex items-center justify-center text-ink border border-border">
                  <Store className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-xl text-ink leading-tight flex items-center gap-2">
                    {store.name}
                    <Badge variant={
                      store.verificationStatus === 'APPROVED' ? 'bazaar-green' : 
                      store.verificationStatus === 'PENDING' ? 'warning' : 'chalk'
                    } className="text-xs">
                      {store.verificationStatus || 'PENDING'}
                    </Badge>
                  </h3>
                  <p className="font-body text-sm text-ink-muted">{store.address}, {store.city}</p>
                  <p className="font-body text-xs text-ink-muted mt-1 bg-ink/5 inline-block px-2 py-1 rounded">Owner: {store.owner?.fullName || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-dashed border-border pt-4 mt-2">
                <Badge variant={store.isOpen ? "bazaar-green" : "chalk"}>
                  {store.isOpen ? 'Open Now' : 'Closed'}
                </Badge>
                <span className="font-mono font-bold text-ink-muted text-sm">Score: {store.freshnessScore}%</span>
              </div>
              
              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 mt-2">
                {store.verificationStatus === 'PENDING' && (
                  <>
                    <Button variant="outline" size="sm" onClick={() => handleStoreVerify(store.id, 'REJECTED')} className="text-danger hover:text-danger hover:bg-danger/10 border-danger/20">
                      <XCircle className="w-4 h-4 mr-2" /> Reject
                    </Button>
                    <Button variant="primary" size="sm" onClick={() => handleStoreVerify(store.id, 'APPROVED')} className="bg-primary hover:bg-primary-dark">
                      <CheckCircle className="w-4 h-4 mr-2" /> Approve
                    </Button>
                  </>
                )}
                {store.verificationStatus !== 'PENDING' && (
                  <Button variant="outline" size="sm" onClick={() => handleStoreVerify(store.id, store.verificationStatus === 'APPROVED' ? 'REJECTED' : 'APPROVED')}>
                    {store.verificationStatus === 'APPROVED' ? 'Revoke Approval' : 'Re-Approve'}
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
