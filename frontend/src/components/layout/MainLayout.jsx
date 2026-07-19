import React from 'react';
import { Outlet } from 'react-router';
import { TopAppBar } from './TopAppBar';
import { BottomNavBar } from './BottomNavBar';

export function MainLayout() {
  return (
    <div className="bg-background text-on-background font-body-md min-h-[max(884px,100dvh)]">
      <TopAppBar />
      <main className="pt-[120px] pb-24 px-margin-mobile md:px-margin-desktop max-w-screen-xl mx-auto flex flex-col gap-xl">
        <Outlet />
      </main>
      <BottomNavBar />
    </div>
  );
}
