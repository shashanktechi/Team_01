import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { User, Loader2, MapPin, Phone, Star } from 'lucide-react';

export function SystemAdminUsers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get('/admin/users');
        // Filter ONLY customers as requested
        setCustomers(response.data.filter(u => u.role === 'ROLE_CUSTOMER' || u.role === 'CUSTOMER'));
      } catch (err) {
        console.error('Error fetching users:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleStatusChange = async (userId, newStatus) => {
    try {
      await api.patch(`/admin/users/${userId}/status`, { active: newStatus });
      setCustomers(customers.map(u => u.id === userId ? { ...u, isActive: newStatus } : u));
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Failed to update status');
    }
  };

  if (loading) {
    return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-black text-2xl text-ink">Registered Customers</h2>
          <p className="font-mono text-sm text-ink-muted mt-1 uppercase tracking-wider">Manage all customer accounts</p>
        </div>
        <Badge variant="surface" className="text-sm px-3 py-1">
          Total: {customers.length}
        </Badge>
      </div>

      {customers.length === 0 ? (
        <div className="text-center py-12 text-ink-muted border border-dashed border-border rounded-xl">
          <p>No customers found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {customers.map(u => (
            <Card key={u.id} className="bg-surface shadow-sm border-border p-6 flex flex-col justify-between gap-4">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center text-primary border border-primary/20">
                    <User className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-lg text-ink leading-tight">{u.fullName}</h3>
                    <p className="font-body text-sm text-ink-muted">{u.email}</p>
                  </div>
                </div>

                <div className="flex flex-col gap-2 mt-2 border-t border-dashed border-border pt-4">
                  <div className="flex items-start gap-2 text-sm text-ink-muted">
                    <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                    <span>
                      {u.address ? (
                        <>
                          {u.address}
                          {u.city ? `, ${u.city}` : ''}
                          {u.state ? `, ${u.state}` : ''}
                          {u.pincode ? ` - ${u.pincode}` : ''}
                        </>
                      ) : 'No address provided'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-ink-muted">
                    <Phone className="w-4 h-4 shrink-0" />
                    <span>{u.phone || 'No phone number'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-ink-muted">
                    <Star className="w-4 h-4 shrink-0 text-warning" />
                    <span>Trust Score: {u.trustScore !== undefined && u.trustScore !== null ? `${u.trustScore}/100` : 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                <Badge variant={u.isActive ? "bazaar-green" : "chalk"} className="uppercase">
                  {u.isActive ? 'Active' : 'Suspended'}
                </Badge>
                <Button 
                  variant={u.isActive ? "outline" : "primary"} 
                  size="sm" 
                  onClick={() => handleStatusChange(u.id, !u.isActive)}
                  className={u.isActive ? "text-danger hover:text-danger border-danger/20 hover:bg-danger/10" : ""}
                >
                  {u.isActive ? 'Suspend Account' : 'Reactivate'}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
