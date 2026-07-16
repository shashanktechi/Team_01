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
  FolderOpen,
  Store,
  Truck,
  Coins,
  Shield,
  CheckSquare,
  Users
} from 'lucide-react';

const Sidebar = () => {
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
          { to: '/shopkeeper/products', label: t('nav.inventory') + ' Items', icon: FolderOpen },
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

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-gray-900 border-r border-gray-200/50 dark:border-gray-800/50 h-[calc(100vh-3.5rem)] sticky top-14 transition-colors duration-200">
      <div className="flex-1 py-6 px-4 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-teal text-white shadow-md shadow-teal/10'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-teal dark:hover:text-teal-light'
                }`
              }
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </aside>
  );
};

export default Sidebar;
