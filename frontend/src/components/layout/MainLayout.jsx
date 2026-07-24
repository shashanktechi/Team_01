import React from 'react';
import { Outlet } from 'react-router';
import { TopAppBar } from './TopAppBar';
import { BottomNavBar } from './BottomNavBar';
import { ConflictModal } from '../ui/ConflictModal';
import { AiAssistantWidget } from '../ui/AiAssistantWidget';
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router';

export function MainLayout() {
  // Since we don't have a global App-level conflict state right now, 
  // the HomePage and StorePage will handle their own ConflictModals,
  // but if we needed it globally, we'd add it here.
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user && user.role !== 'CUSTOMER') {
      if (user.role === 'SYSTEM_ADMIN') navigate('/admin-dashboard', { replace: true });
      else if (user.role === 'STORE_ADMIN') navigate('/store-dashboard', { replace: true });
      else if (user.role === 'DELIVERY_PARTNER') navigate('/delivery-dashboard', { replace: true });
    }
  }, [user, loading, navigate]);
  
  return (
    <div className="text-ink font-body min-h-[100dvh] w-full" style={{ background: '#FFFFFF' }}>
      <TopAppBar />
      <main className="pt-[72px] pb-[80px] md:pb-8 w-full flex flex-col md:px-6 lg:px-8">
        <Outlet />
      </main>
      <BottomNavBar />
      <AiAssistantWidget />
    </div>
  );
}
