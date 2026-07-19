import React from 'react';
import { useNavigate, Routes, Route, NavLink, Navigate, useLocation } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import { BrandMark } from '../../components/ui/BrandMark';
import { Button } from '../../components/ui/Button';
import { Users, Store, ShieldCheck, LogOut } from 'lucide-react';

import { SystemAdminUsers } from './SystemAdminUsers';
import { SystemAdminStores } from './SystemAdminStores';
import { SystemAdminApprovals } from './SystemAdminApprovals';

export function SystemAdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getTabClass = (path) => {
    const isActive = location.pathname.includes(path);
    if (path === 'users' && isActive) return 'bg-bazaar-green text-chalk';
    if (path === 'stores' && isActive) return 'bg-marigold text-ink';
    if (path === 'approvals' && isActive) return 'bg-clay text-chalk';
    return 'bg-transparent text-ink-muted hover:bg-ink/5';
  };

  return (
    <div className="bg-kraft font-body text-ink min-h-screen">
      <header className="fixed top-0 w-full z-50 bg-kraft/90 backdrop-blur-md border-b border-ink/10 shadow-sm">
        <div className="flex items-center justify-between px-6 py-4 w-full">
          <BrandMark />
          <div className="flex items-center gap-4">
            <span className="font-mono text-xs font-bold uppercase tracking-wider hidden sm:block">
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
          <h1 className="font-display font-black text-3xl sm:text-4xl text-ink tracking-tight">System Admin Console</h1>
        </div>

        {/* Tabs Nav */}
        <div className="flex overflow-x-auto hide-scrollbar gap-2 mb-8 border-b border-ink/10 pb-4">
          <NavLink 
            to="users"
            className={`flex items-center gap-2 px-4 py-2 font-mono text-sm font-bold uppercase tracking-wider rounded-lg transition-colors ${getTabClass('users')}`}
          >
            <Users className="w-4 h-4" /> Users
          </NavLink>
          <NavLink 
            to="stores"
            className={`flex items-center gap-2 px-4 py-2 font-mono text-sm font-bold uppercase tracking-wider rounded-lg transition-colors ${getTabClass('stores')}`}
          >
            <Store className="w-4 h-4" /> Stores
          </NavLink>
          <NavLink 
            to="approvals"
            className={`flex items-center gap-2 px-4 py-2 font-mono text-sm font-bold uppercase tracking-wider rounded-lg transition-colors ${getTabClass('approvals')}`}
          >
            <ShieldCheck className="w-4 h-4" /> Approvals
          </NavLink>
        </div>

        {/* Nested Routes */}
        <div className="mt-4">
          <Routes>
            <Route index element={<Navigate to="users" replace />} />
            <Route path="users" element={<SystemAdminUsers />} />
            <Route path="stores" element={<SystemAdminStores />} />
            <Route path="approvals" element={<SystemAdminApprovals />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}
