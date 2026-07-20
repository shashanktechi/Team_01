import React, { useEffect, useState } from 'react';
import { useNavigate, Routes, Route, NavLink, Navigate, useLocation } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { BrandMark } from '../../components/ui/BrandMark';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { MapPin, Navigation, Package, LogOut, Loader2 } from 'lucide-react';

import { User } from 'lucide-react';
import { DeliveryTasks } from './DeliveryTasks';
import { DeliveryBatch } from './DeliveryBatch';
import { DeliveryProfile } from './DeliveryProfile';

export function DeliveryDashboard() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState({ swarms: [], orders: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const tasksRes = await api.get('/delivery/tasks');
        setTasks(tasksRes.data);
      } catch (err) {
        console.error("Failed to load tasks", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="bg-background min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const hasActiveTasks = tasks.swarms.length > 0 || tasks.orders.length > 0;

  return (
    <div className="bg-background font-body text-ink min-h-screen pb-12">
      <header className="fixed top-0 w-full z-50 bg-background/90 backdrop-blur-md border-b border-border shadow-sm">
        <div className="flex items-center justify-between px-6 py-4 w-full">
          <BrandMark />
          <div className="flex items-center gap-4">
            <span className="font-mono text-xs font-bold uppercase tracking-wider hidden sm:block">
              {user?.fullName || 'Delivery Partner'}
            </span>
            <Button variant="outline" onClick={handleLogout} className="flex items-center gap-2">
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="pt-24 w-full px-4 sm:px-6 flex flex-col gap-6">
        {/* Profile Card */}
        <Card className="bg-surface shadow-sm border-border p-6 flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <img src={user?.profilePhotoUrl || "https://i.pravatar.cc/150?img=11"} alt="Profile" className="w-16 h-16 rounded-full border-2 border-ink shadow-sm" />
            <div>
              <h2 className="font-display font-black text-2xl text-ink leading-tight">{user?.fullName || 'Partner'}</h2>
              <p className="font-mono text-xs text-ink-muted uppercase tracking-wider mt-1">Trust Score: {user?.trustScore || 100}</p>
            </div>
          </div>
          <Badge variant="marigold" className="hidden sm:inline-flex">Online</Badge>
        </Card>

        {/* Tabs Nav */}
        <div className="flex overflow-x-auto hide-scrollbar gap-2 mb-8 border-b border-border pb-4">
          <NavLink 
            to="/delivery-dashboard/tasks"
            className={({ isActive }) => `flex items-center gap-2 px-4 py-2 font-mono text-sm font-bold uppercase tracking-wider rounded-lg transition-colors ${isActive || location.pathname.endsWith('/delivery-dashboard') ? 'bg-primary text-white' : 'bg-transparent text-ink-muted hover:bg-ink/5'}`}
          >
            <Navigation className="w-4 h-4" /> Active Tasks
          </NavLink>
          <NavLink 
            to="/delivery-dashboard/batch"
            className={({ isActive }) => `flex items-center gap-2 px-4 py-2 font-mono text-sm font-bold uppercase tracking-wider rounded-lg transition-colors ${isActive ? 'bg-warning text-ink' : 'bg-transparent text-ink-muted hover:bg-ink/5'}`}
          >
            <Package className="w-4 h-4" /> Batch Finding
          </NavLink>
          <NavLink 
            to="/delivery-dashboard/profile"
            className={({ isActive }) => `flex items-center gap-2 px-4 py-2 font-mono text-sm font-bold uppercase tracking-wider rounded-lg transition-colors ${isActive ? 'bg-ink text-white' : 'bg-transparent text-ink-muted hover:bg-ink/5'}`}
          >
            <User className="w-4 h-4" /> Profile
          </NavLink>
        </div>

        {/* Nested Routes */}
        <div className="mt-4">
          <Routes>
            <Route index element={<Navigate to="tasks" replace />} />
            <Route path="tasks" element={<DeliveryTasks tasks={tasks} onTaskUpdate={() => {
                 api.get('/delivery/tasks').then(res => setTasks(res.data)).catch(console.error);
            }} />} />
            <Route path="batch" element={<DeliveryBatch />} />
            <Route path="profile" element={<DeliveryProfile />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}
