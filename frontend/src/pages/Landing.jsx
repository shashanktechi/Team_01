import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { ShoppingBag, Store, Truck, ShieldCheck, ArrowRight, Zap, RefreshCw, Cpu, Award } from 'lucide-react';
import LanguageSwitcher from '../components/LanguageSwitcher';
import ThemeToggle from '../components/ThemeToggle';

const Landing = () => {
  const { t } = useTranslation();
  const { isAuthenticated, role } = useSelector((state) => state.auth);

  if (isAuthenticated) {
    switch (role) {
      case 'CUSTOMER': return <Navigate to="/" replace />;
      case 'STORE_ADMIN': return <Navigate to="/shopkeeper/dashboard" replace />;
      case 'DELIVERY_PARTNER': return <Navigate to="/delivery/dashboard" replace />;
      case 'SYSTEM_ADMIN': return <Navigate to="/admin/dashboard" replace />;
      default: break;
    }
  }

  const portals = [
    {
      title: 'Customer Portal',
      description: 'Order fresh groceries, organic items, and household essentials. Track deliveries in real-time.',
      icon: <ShoppingBag className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />,
      loginPath: '/login/customer',
      registerPath: '/register/customer',
      badge: 'Order Essentials'
    },
    {
      title: 'Shopkeeper Portal',
      description: 'Manage store inventories, update prices, track customer requests, and manage active swarms.',
      icon: <Store className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />,
      loginPath: '/login/seller',
      registerPath: '/register/seller',
      badge: 'Manage & Sell'
    },
    {
      title: 'Delivery Portal',
      description: 'Accept local order batch deliveries, optimize routes via swarms, and maximize your courier earnings.',
      icon: <Truck className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />,
      loginPath: '/login/delivery',
      registerPath: '/register/delivery',
      badge: 'Earn on Delivery'
    },
    {
      title: 'System Admin Portal',
      description: 'Verify store licenses, manage user profiles, audit daily logs, and oversee credit settlements.',
      icon: <ShieldCheck className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />,
      loginPath: '/login/admin',
      registerPath: null,
      badge: 'Platform Control'
    }
  ];

  const features = [
    {
      title: 'AI Shelf Inspection',
      description: 'Vivid real-time inventory checks using Gemini Vision model to detect product quantities automatically.',
      icon: <Cpu className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
    },
    {
      title: 'Swarm Routing',
      description: 'Optimized delivery routes that bundle nearby orders from multiple stores into a single fast run.',
      icon: <Zap className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
    },
    {
      title: 'Auto-Expiry Tracking',
      description: 'Smart triggers that automatically notify sellers about near-expiry goods to reduce store waste.',
      icon: <RefreshCw className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
    },
    {
      title: 'Micro-Credit Ledger',
      description: 'Secure, built-in borrowing facilities for trusted customers to purchase essentials on credit.',
      icon: <Award className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-950 dark:text-white transition-colors duration-300 flex flex-col justify-between">
      {/* Universal Floating Header */}
      <header className="sticky top-0 z-50 w-full bg-white/70 dark:bg-gray-950/70 backdrop-blur-md border-b border-gray-100 dark:border-gray-900/50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 dark:bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <span className="text-white font-extrabold text-xl">Q</span>
            </div>
            <span className="font-black text-2xl tracking-tight text-emerald-600 dark:text-emerald-400">QuickCart</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="hidden md:inline-block text-xs font-bold uppercase tracking-wider text-gray-400">Sign In As:</span>
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Hero section */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-12 md:py-16 space-y-16">
        {/* Intro */}
        <div className="text-center max-w-3xl mx-auto space-y-6">
          <span className="px-3.5 py-1.5 text-xs font-extrabold uppercase tracking-widest rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200/30">
            Welcome to QuickCart
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-none">
            Hyperlocal Delivery <br />
            <span className="text-emerald-600 dark:text-emerald-400">Made Instant & Intelligent</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-lg md:text-xl font-medium leading-relaxed">
            Order fresh items directly from local stores with real-time stock verifications, AI shelf analytics, and smart swarm courier routes.
          </p>
        </div>

        {/* Organized Role Selection Grid */}
        <div className="space-y-6">
          <div className="border-b border-gray-100 dark:border-gray-900 pb-3">
            <h2 className="text-xl font-black tracking-tight uppercase text-gray-450 dark:text-gray-500">Gateway Portals</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
            {portals.map((p, i) => (
              <div
                key={i}
                className="group flex flex-col justify-between p-6 bg-gray-50 dark:bg-gray-900/40 rounded-[28px] border border-gray-100 dark:border-gray-900 shadow-sm transition-all duration-300 hover:border-emerald-600/30 dark:hover:border-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/5 hover:-translate-y-1"
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="p-3 bg-white dark:bg-gray-900 rounded-2xl w-fit shadow-md group-hover:scale-105 transition-transform">
                      {p.icon}
                    </div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-100/60 dark:bg-emerald-950/40 px-2 py-1 rounded-md">
                      {p.badge}
                    </span>
                  </div>
                  <h3 className="text-lg font-extrabold tracking-tight text-gray-900 dark:text-white">{p.title}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium leading-relaxed">{p.description}</p>
                </div>

                <div className="mt-8 space-y-2">
                  <Link
                    to={p.loginPath}
                    className="w-full flex items-center justify-center gap-1.5 py-3 px-4 text-xs font-black rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/10 transition-all"
                  >
                    Sign In <ArrowRight size={14} />
                  </Link>
                  {p.registerPath ? (
                    <Link
                      to={p.registerPath}
                      className="w-full flex items-center justify-center py-3 px-4 text-xs font-black rounded-2xl bg-white dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 text-emerald-650 dark:text-emerald-400 border border-gray-200 dark:border-gray-800 transition-all"
                    >
                      Register
                    </Link>
                  ) : (
                    <div className="py-2.5 text-center text-[10px] text-gray-400 dark:text-gray-650 font-bold uppercase tracking-widest select-none">
                      Admin Access Only
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Highlight Section: Matter about our App */}
        <div className="space-y-6 pt-6">
          <div className="border-b border-gray-100 dark:border-gray-900 pb-3">
            <h2 className="text-xl font-black tracking-tight uppercase text-gray-450 dark:text-gray-500">Why QuickCart?</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <div
                key={i}
                className="p-6 bg-white dark:bg-gray-900 rounded-[24px] border border-gray-100 dark:border-gray-900/60 flex gap-4 items-start shadow-sm"
              >
                <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/20 rounded-xl text-emerald-600 dark:text-emerald-400">
                  {f.icon}
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-extrabold text-gray-900 dark:text-white">{f.title}</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium leading-relaxed">{f.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full text-center py-6 text-xs text-gray-500 dark:text-gray-500 border-t border-gray-100 dark:border-gray-900 max-w-7xl mx-auto">
        &copy; {new Date().getFullYear()} QuickCart. All rights reserved.
      </footer>
    </div>
  );
};

export default Landing;
