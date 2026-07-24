import React, { useEffect } from 'react';
import { useNavigate, Routes, Route, NavLink, Navigate, useLocation } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import { BrandMark } from '../../components/ui/BrandMark';
import { Button } from '../../components/ui/Button';
import { useEnvironment } from '../../context/EnvironmentContext';
import { LayoutDashboard, Users, Store, DollarSign, LogOut, Shield } from 'lucide-react';

import { SystemAdminOverview } from './SystemAdminOverview';
import { SystemAdminUsers } from './SystemAdminUsers';
import { SystemAdminStores } from './SystemAdminStores';
import { SystemAdminDelivery } from './SystemAdminDelivery';
import { SystemAdminTaxSettings } from './SystemAdminTaxSettings';

export function SystemAdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { setMode } = useEnvironment();

  useEffect(() => {
    setMode('dashboard');
  }, [setMode]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getTabClass = (path) => {
    const isActive = location.pathname.includes(path) || (path === 'dashboard' && location.pathname.endsWith('/admin'));
    if (isActive) return 'bg-primary text-white';
    return 'bg-transparent text-ink-muted hover:bg-ink/5';
  };

  return (
    <div className="bg-transparent font-body text-ink min-h-screen">
      <header className="fixed top-0 w-full z-50 bg-[var(--color-surface)]/90 backdrop-blur-md border-b border-border shadow-night">
        <div className="flex items-center justify-between px-6 py-4 w-full">
          <BrandMark />
          <div className="flex items-center gap-4">
            <span className="font-medium text-sm text-ink-muted hidden sm:block">
              {user?.fullName || 'System Admin'}
            </span>
            <Button variant="outline" onClick={handleLogout} className="flex items-center gap-2">
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="pt-24 pb-12 w-full px-4 sm:px-6">
        <div className="mb-8">
          <h1 className="font-bold text-3xl sm:text-4xl text-ink tracking-tight">System Admin Console</h1>
        </div>

        {/* Tabs Nav */}
        <div className="flex overflow-x-auto hide-scrollbar gap-2 mb-8 border-b border-border pb-4">
          <NavLink 
            to="/admin-dashboard/dashboard"
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${getTabClass('dashboard')}`}
          >
            <LayoutDashboard className="w-4 h-4" /> Dashboard
          </NavLink>
          <NavLink 
            to="/admin-dashboard/stores"
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${getTabClass('stores')}`}
          >
            <Store className="w-4 h-4" /> Stores
          </NavLink>
          <NavLink 
            to="/admin-dashboard/taxes"
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${getTabClass('taxes')}`}
          >
            <DollarSign className="w-4 h-4" /> Taxes & Delivery
          </NavLink>
          <NavLink 
            to="/admin-dashboard/users"
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${getTabClass('users')}`}
          >
            <Users className="w-4 h-4" /> Users
          </NavLink>
          <NavLink 
            to="/admin-dashboard/delivery"
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${getTabClass('delivery')}`}
          >
            <Shield className="w-4 h-4" /> Delivery Agents
          </NavLink>
        </div>

        {/* Nested Routes */}
        <div className="mt-4">
          <Routes>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<SystemAdminOverview />} />
            <Route path="stores" element={<SystemAdminStores />} />
            <Route path="taxes" element={<SystemAdminTaxSettings />} />
            <Route path="users" element={<SystemAdminUsers />} />
            <Route path="delivery" element={<SystemAdminDelivery />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}
