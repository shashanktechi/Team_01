import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import LanguageSwitcher from '../components/LanguageSwitcher';

const AuthLayout = () => {
  const { isAuthenticated, role } = useSelector((state) => state.auth);

  if (isAuthenticated) {
    switch (role) {
      case 'CUSTOMER':
        return <Navigate to="/" replace />;
      case 'STORE_ADMIN':
        return <Navigate to="/shopkeeper/dashboard" replace />;
      case 'DELIVERY_PARTNER':
        return <Navigate to="/delivery/dashboard" replace />;
      case 'SYSTEM_ADMIN':
        return <Navigate to="/admin/dashboard" replace />;
      default:
        break;
    }
  }

  return (
    <div className="min-h-screen flex-1 bg-radial from-teal/10 via-surface to-surface dark:from-teal-dark/10 dark:via-surface-dark dark:to-surface-dark flex flex-col justify-between transition-colors duration-200">
      <header className="w-full max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-teal flex items-center justify-center shadow-md">
            <span className="text-white font-bold text-xl">Q</span>
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-teal dark:text-teal-light">QuickCart</span>
        </div>
        <LanguageSwitcher />
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700/50 p-8 transition-all duration-300 transform hover:scale-[1.01]">
          <Outlet />
        </div>
      </main>

      <footer className="w-full text-center py-6 text-sm text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-850">
        &copy; {new Date().getFullYear()} QuickCart. All rights reserved.
      </footer>
    </div>
  );
};

export default AuthLayout;
