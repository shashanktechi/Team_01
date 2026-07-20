import React from 'react';
import { Outlet } from 'react-router';
import { TopAppBar } from './TopAppBar';
import { BottomNavBar } from './BottomNavBar';
import { ConflictModal } from '../ui/ConflictModal';
import { useState } from 'react';

export function MainLayout() {
  // Since we don't have a global App-level conflict state right now, 
  // the HomePage and StorePage will handle their own ConflictModals,
  // but if we needed it globally, we'd add it here.
  
  return (
    <div className="bg-kraft text-ink font-body min-h-[100dvh] w-full">
      <TopAppBar />
      <main className="pt-[130px] pb-[80px] md:pb-8 w-full max-w-7xl mx-auto flex flex-col">
        <Outlet />
      </main>
      <BottomNavBar />
    </div>
  );
}
