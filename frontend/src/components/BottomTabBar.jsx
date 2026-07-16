import React from 'react';
import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import {
  Home,
  ShoppingBag,
  User,
  LayoutDashboard,
  Layers,
  Inbox,
  Store,
  Truck,
  Coins,
  Shield,
  CheckSquare,
  Users
} from 'lucide-react';

const BottomTabBar = () => {
  const { role } = useSelector((state) => state.auth);
  const { t } = useTranslation();

  const getNavItems = () => {
    let activeRole = role;
    if (role === 'SYSTEM_ADMIN') {
      const path = window.location.pathname;
      if (path.startsWith('/shopkeeper')) {
        activeRole = 'STORE_ADMIN';
      } else if (path.startsWith('/delivery')) {
        activeRole = 'DELIVERY_PARTNER';
      } else if (path.startsWith('/admin')) {
        activeRole = 'SYSTEM_ADMIN';
      } else {
        activeRole = 'CUSTOMER';
      }
    }

    switch (activeRole) {
      case 'CUSTOMER':
        return [
          { to: '/', label: t('nav.home'), icon: Home },
          { to: '/customer/orders', label: t('nav.history'), icon: ShoppingBag },
          { to: '/customer/profile', label: t('nav.profile'), icon: User },
        ];
      case 'STORE_ADMIN':
        return [
          { to: '/shopkeeper/dashboard', label: t('nav.dashboard'), icon: LayoutDashboard },
          { to: '/shopkeeper/orders', label: t('nav.orders'), icon: Inbox },
          { to: '/shopkeeper/inventory', label: t('nav.inventory'), icon: Layers },
          { to: '/shopkeeper/profile', label: t('nav.profile'), icon: Store },
        ];
      case 'DELIVERY_PARTNER':
        return [
          { to: '/delivery/dashboard', label: t('nav.dashboard'), icon: Truck },
          { to: '/delivery/earnings', label: t('nav.earnings'), icon: Coins },
          { to: '/delivery/profile', label: t('nav.profile'), icon: User },
        ];
      case 'SYSTEM_ADMIN':
        return [
          { to: '/admin/dashboard', label: t('nav.dashboard'), icon: Shield },
          { to: '/admin/approvals', label: t('nav.approvals'), icon: CheckSquare },
          { to: '/admin/users', label: t('nav.users'), icon: Users },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  if (navItems.length === 0) return null;

  return (
    <div className="md:hidden fixed bottom-0 inset-x-0 border-t border-gray-200/60 dark:border-gray-800/80 bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg flex justify-around py-2 z-40 transition-colors duration-200">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-150 ${
                isActive
                  ? 'text-teal dark:text-teal-light font-bold scale-105'
                  : 'text-gray-500 dark:text-gray-400'
              }`
            }
          >
            <Icon size={20} />
            <span className="text-[10px] mt-0.5 tracking-tight">{item.label}</span>
          </NavLink>
        );
      })}
    </div>
  );
};

export default BottomTabBar;
