import React from 'react';
import { Outlet, Navigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import LanguageSwitcher from '../components/LanguageSwitcher';
import ThemeToggle from '../components/ThemeToggle';
import { ShoppingBag, Sparkles, Zap, Cpu } from 'lucide-react';

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

  // Logo routing target: if authenticated -> dashboard, else -> landing page /login
  const logoTarget = isAuthenticated 
    ? (role === 'CUSTOMER' ? '/' : role === 'STORE_ADMIN' ? '/shopkeeper/dashboard' : role === 'DELIVERY_PARTNER' ? '/delivery/dashboard' : '/admin/dashboard')
    : '/login';

  return (
    <div className="min-h-screen w-full bg-white dark:bg-gray-950 text-gray-950 dark:text-white flex transition-colors duration-300">
      
      {/* Left Column: Premium Marketing Sidebar (Hidden on mobile/tablet) */}
      <div className="hidden lg:flex lg:w-[40%] bg-emerald-600 dark:bg-emerald-900 p-12 flex-col justify-between relative overflow-hidden">
        {/* Abstract background shapes */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/20 dark:bg-emerald-800/20 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-700/30 dark:bg-emerald-950/40 rounded-full blur-3xl -ml-20 -mb-20"></div>

        {/* Brand/Logo */}
        <div className="relative z-10">
          <Link to={logoTarget} className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-xl shadow-emerald-700/20">
              <span className="text-emerald-600 font-black text-2xl">Q</span>
            </div>
            <span className="font-black text-3xl tracking-tight text-white">QuickCart</span>
          </Link>
        </div>

        {/* Feature Teasers */}
        <div className="relative z-10 my-auto space-y-8 w-full">
          <h2 className="text-3xl font-black text-white leading-tight">
            Freshness Verified, <br />
            Delivered in Swarms.
          </h2>
          <p className="text-emerald-100/90 text-sm font-medium leading-relaxed">
            QuickCart utilizes advanced local swarm agents to dispatch, bundle, and deliver organic groceries directly from stores to your doorstep instantly.
          </p>
          
          <div className="space-y-4 pt-4">
            <div className="flex gap-3 items-start text-white">
              <div className="p-1.5 bg-white/10 rounded-lg"><Zap size={16} /></div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider">Hyperlocal Swarms</h4>
                <p className="text-[11px] text-emerald-100/80">Bundled routes save delivery partner miles and your time.</p>
              </div>
            </div>
            <div className="flex gap-3 items-start text-white">
              <div className="p-1.5 bg-white/10 rounded-lg"><Cpu size={16} /></div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider">AI Shelf Check</h4>
                <p className="text-[11px] text-emerald-100/80">Google Gemini analyzes store inventory photos instantly.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Info footer */}
        <div className="relative z-10 text-xs text-emerald-200/80 font-medium">
          &copy; {new Date().getFullYear()} QuickCart Inc. Hyperlocal Logistics.
        </div>
      </div>

      {/* Right Column: Full Window Auth Forms (100% on Mobile, 60% on Desktop) */}
      <div className="flex-1 min-h-screen flex flex-col justify-between bg-white dark:bg-gray-950">
        
        {/* Floating Top Header bar */}
        <header className="w-full px-6 py-4 flex justify-between items-center border-b border-gray-100 dark:border-gray-900/60 bg-white/50 dark:bg-gray-950/50 backdrop-blur-md sticky top-0 z-50">
          <div className="lg:hidden flex items-center gap-2">
            <Link to={logoTarget} className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 dark:bg-emerald-500 flex items-center justify-center shadow-md">
                <span className="text-white font-extrabold text-sm">Q</span>
              </div>
              <span className="font-bold text-lg text-emerald-600 dark:text-emerald-400">QuickCart</span>
            </Link>
          </div>
          <div className="hidden lg:block text-xs font-extrabold text-gray-400 uppercase tracking-widest">
            Secure Platform Gateway
          </div>

          <div className="flex items-center gap-3 ml-auto">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </header>

        {/* Center Panel (Full width, padded, vertically centered) */}
        <main className="flex-1 w-full mx-auto px-6 py-12 md:py-20 flex flex-col justify-center">
          <div className="w-full">
            <Outlet />
          </div>
        </main>

        {/* Right Section Footer (Visible on mobile/tablet primarily) */}
        <footer className="w-full text-center py-6 text-xs text-gray-400 dark:text-gray-650 border-t border-gray-150/40 dark:border-gray-900 lg:hidden">
          &copy; {new Date().getFullYear()} QuickCart. All rights reserved.
        </footer>
      </div>

    </div>
  );
};

export default AuthLayout;
