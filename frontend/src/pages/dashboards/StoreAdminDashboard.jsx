import React, { useEffect, useState } from 'react';
import { useNavigate, Routes, Route, NavLink, Navigate, useLocation } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { BrandMark } from '../../components/ui/BrandMark';
import { Button } from '../../components/ui/Button';
import { useEnvironment } from '../../context/EnvironmentContext';
import { Store, ListOrdered, Package, LogOut, Loader2, Plus, User } from 'lucide-react';

import { StoreAdminOverview } from './StoreAdminOverview';
import { StoreAdminOrders } from './StoreAdminOrders';
import { StoreAdminInventory } from './StoreAdminInventory';
import { StoreAdminProfile } from './StoreAdminProfile';

export function StoreAdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { setMode } = useEnvironment();
  const [store, setStore] = useState(null);
  const [storeUser, setStoreUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMode('dashboard');
  }, [setMode]);

  const fetchDashboardData = async () => {
    try {
      const profileRes = await api.get('/store/profile');
      setStore(profileRes.data.store);
      setStoreUser(profileRes.data.user);
      
      const ordersRes = await api.get('/store/orders');
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
    if (path === 'overview' && isActive) return 'bg-primary text-white';
    if (path === 'orders' && isActive) return 'bg-warning text-ink';
    if (path === 'inventory' && isActive) return 'bg-danger text-white';
    if (path === 'profile' && isActive) return 'bg-ink text-white';
    return 'bg-transparent text-ink-muted hover:bg-ink/5';
  };

  if (loading) {
    return (
      <div className="bg-background min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="bg-transparent font-body text-ink min-h-screen pb-12">
      <header className="fixed top-0 w-full z-50 bg-[var(--color-surface)]/90 backdrop-blur-md border-b border-border shadow-night">
        <div className="flex items-center justify-between px-6 py-4 w-full">
          <div className="flex items-center gap-6">
            <BrandMark />
            {storeUser && (
              <div className="hidden sm:flex items-center gap-3 pl-6 border-l border-border">
                {storeUser.profilePhotoUrl ? (
                  <img src={storeUser.profilePhotoUrl} alt="Profile" className="w-8 h-8 rounded-full object-cover border border-border" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                    {storeUser.fullName ? storeUser.fullName.charAt(0).toUpperCase() : 'U'}
                  </div>
                )}
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-ink-muted">
                  {storeUser.fullName || 'Admin'}
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-4">
            <span className="font-mono text-xs font-bold uppercase tracking-wider hidden sm:block">
              {store?.name || 'Store Pending'}
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
        <div className="flex overflow-x-auto hide-scrollbar gap-2 mb-8 border-b border-border pb-4">
          <NavLink 
            to="/store-dashboard/overview"
            className={`flex items-center gap-2 px-4 py-2 font-mono text-sm font-bold uppercase tracking-wider rounded-lg transition-colors ${getTabClass('overview')}`}
          >
            <Store className="w-4 h-4" /> Overview
          </NavLink>
          <NavLink 
            to="/store-dashboard/orders"
            className={`flex items-center gap-2 px-4 py-2 font-mono text-sm font-bold uppercase tracking-wider rounded-lg transition-colors ${getTabClass('orders')}`}
          >
            <ListOrdered className="w-4 h-4" /> Orders
          </NavLink>
          <NavLink 
            to="/store-dashboard/inventory"
            className={`flex items-center gap-2 px-4 py-2 font-mono text-sm font-bold uppercase tracking-wider rounded-lg transition-colors ${getTabClass('inventory')}`}
          >
            <Package className="w-4 h-4" /> Inventory
          </NavLink>
          <NavLink 
            to="/store-dashboard/profile"
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
            <Route path="inventory" element={<StoreAdminInventory />} />
            <Route path="profile" element={<StoreAdminProfile storeId={store?.id} />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}
