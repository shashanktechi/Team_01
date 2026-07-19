import React from 'react';
import { Outlet } from 'react-router';
import { TopAppBar } from './TopAppBar';
import { BottomNavBar } from './BottomNavBar';

export function MainLayout() {
  return (
    <div className="bg-background text-on-background font-body-md min-h-[max(884px,100dvh)] w-full">
      <TopAppBar />
      <main className="pt-[120px] pb-24 px-4 sm:px-6 lg:px-8 w-full flex flex-col gap-6">
        <Outlet />
      </main>
      <BottomNavBar />
    </div>
  );
}
