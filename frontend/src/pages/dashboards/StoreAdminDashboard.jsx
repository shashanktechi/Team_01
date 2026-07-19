import React, { useEffect, useState } from 'react';
import { useNavigate, Routes, Route, NavLink, Navigate, useLocation } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { BrandMark } from '../../components/ui/BrandMark';
import { Button } from '../../components/ui/Button';
import { Store, ListOrdered, Package, LogOut, Loader2, Plus, User } from 'lucide-react';

import { StoreAdminOverview } from './StoreAdminOverview';
import { StoreAdminOrders } from './StoreAdminOrders';

export function StoreAdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [store, setStore] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const profileRes = await api.get('/store/profile');
      setStore(profileRes.data.store);
      
      const ordersRes = await api.get('/store/orders/incoming');
      setOrders(ordersRes.data);
    } catch (err) {
      console.error("Failed to load dashboard", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getTabClass = (path) => {
    const isActive = location.pathname.includes(path) || (path === 'overview' && location.pathname.endsWith('/store-dashboard'));
    if (path === 'overview' && isActive) return 'bg-bazaar-green text-chalk';
    if (path === 'orders' && isActive) return 'bg-marigold text-ink';
    if (path === 'inventory' && isActive) return 'bg-clay text-chalk';
    if (path === 'profile' && isActive) return 'bg-ink text-chalk';
    return 'bg-transparent text-ink-muted hover:bg-ink/5';
  };

  if (loading) {
    return (
      <div className="bg-kraft min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-bazaar-green" />
      </div>
    );
  }

  return (
    <div className="bg-kraft font-body text-ink min-h-screen pb-12">
      <header className="fixed top-0 w-full z-50 bg-kraft/90 backdrop-blur-md border-b border-ink/10 shadow-sm">
        <div className="flex items-center justify-between px-6 py-4 w-full">
          <BrandMark />
          <div className="flex items-center gap-4">
            <span className="font-mono text-xs font-bold uppercase tracking-wider hidden sm:block">
              {store?.name || 'Store Admin'}
            </span>
            <Button variant="outline" onClick={handleLogout} className="flex items-center gap-2">
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="pt-24 w-full px-4 sm:px-6">
        <div className="mb-8">
          <h1 className="font-display font-black text-3xl sm:text-4xl text-ink tracking-tight">Store Admin Dashboard</h1>
        </div>

        {/* Tabs Nav */}
        <div className="flex overflow-x-auto hide-scrollbar gap-2 mb-8 border-b border-ink/10 pb-4">
          <NavLink 
            to="overview"
            className={`flex items-center gap-2 px-4 py-2 font-mono text-sm font-bold uppercase tracking-wider rounded-lg transition-colors ${getTabClass('overview')}`}
          >
            <Store className="w-4 h-4" /> Overview
          </NavLink>
          <NavLink 
            to="orders"
            className={`flex items-center gap-2 px-4 py-2 font-mono text-sm font-bold uppercase tracking-wider rounded-lg transition-colors ${getTabClass('orders')}`}
          >
            <ListOrdered className="w-4 h-4" /> Orders
          </NavLink>
          <NavLink 
            to="inventory"
            className={`flex items-center gap-2 px-4 py-2 font-mono text-sm font-bold uppercase tracking-wider rounded-lg transition-colors ${getTabClass('inventory')}`}
          >
            <Package className="w-4 h-4" /> Inventory
          </NavLink>
          <NavLink 
            to="profile"
            className={`flex items-center gap-2 px-4 py-2 font-mono text-sm font-bold uppercase tracking-wider rounded-lg transition-colors ${getTabClass('profile')}`}
          >
            <User className="w-4 h-4" /> Profile
          </NavLink>
        </div>

        {/* Nested Routes */}
        <div className="mt-4">
          <Routes>
            <Route index element={<Navigate to="overview" replace />} />
            <Route path="overview" element={<StoreAdminOverview store={store} orders={orders} />} />
            <Route path="orders" element={<StoreAdminOrders orders={orders} onOrderUpdate={fetchDashboardData} />} />
            <Route path="inventory" element={<div className="p-8 text-center bg-chalk rounded-xl border border-ink/10 shadow-sm"><Package className="w-12 h-12 mx-auto text-ink/20 mb-4"/><p className="font-mono text-ink-muted">Inventory tracking coming soon</p></div>} />
            <Route path="profile" element={<div className="p-8 text-center bg-chalk rounded-xl border border-ink/10 shadow-sm"><User className="w-12 h-12 mx-auto text-ink/20 mb-4"/><p className="font-mono text-ink-muted">Profile editing coming soon</p></div>} />
          </Routes>
        </div>
      </main>
    </div>
  );
}
