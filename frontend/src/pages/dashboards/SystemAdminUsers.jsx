import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { TicketCard } from '../../components/ui/TicketCard';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { User, Shield, Loader2 } from 'lucide-react';

export function SystemAdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get('/admin/users');
        setUsers(response.data);
      } catch (err) {
        console.error('Error fetching users:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  if (loading) {
    return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-bazaar-green" /></div>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-black text-2xl text-ink">Platform Users</h2>
          <p className="font-mono text-sm text-ink-muted mt-1 uppercase tracking-wider">Manage all accounts</p>
        </div>
        <Button>Export CSV</Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {users.map(u => (
          <TicketCard key={u.id} className="bg-chalk shadow-sm border-ink/10 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-surface rounded-full flex items-center justify-center text-ink/50">
                {u.role === 'SYSTEM_ADMIN' ? <Shield className="w-6 h-6" /> : <User className="w-6 h-6" />}
              </div>
              <div>
                <h3 className="font-display font-bold text-lg text-ink leading-tight">{u.fullName}</h3>
                <p className="font-body text-sm text-ink-muted">{u.email} • {u.city || 'No City'}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <Badge variant={u.isActive ? "bazaar-green" : "chalk"} className="uppercase">
                {u.role}
              </Badge>
              <Button variant="outline" size="sm" className="w-full sm:w-auto">
                {u.isActive ? 'Suspend' : 'Activate'}
              </Button>
            </div>
          </TicketCard>
        ))}
      </div>
    </div>
  );
}
