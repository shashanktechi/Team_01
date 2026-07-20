import React from 'react';
import { Home, Grid, ShoppingBag, Receipt, User } from 'lucide-react';
import { Link, useLocation } from 'react-router';
import { useCart } from '../../context/CartContext';

export function BottomNavBar() {
  const location = useLocation();
  const { getCartCount } = useCart();
  const cartCount = getCartCount();

  const navItems = [
    { name: 'Home', path: '/stores', icon: Home },
    { name: 'Categories', path: '/categories', icon: Grid },
    { name: 'Cart', path: '/cart', icon: ShoppingBag, badge: cartCount },
    { name: 'Orders', path: '/orders', icon: Receipt },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 w-full z-50 bg-surface shadow-[0_-4px_12px_rgba(0,0,0,0.08)] border-t border-border md:hidden">
      <div className="flex justify-around items-end px-2 pb-safe pt-2 min-h-[60px]">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <Link 
              key={item.name}
              to={item.path}
              className={`relative flex flex-col items-center justify-center transition-all duration-200 active:scale-90 px-2 py-1 w-16 ${
                isActive ? 'text-primary' : 'text-ink-muted hover:text-ink'
              }`}
            >
              <div className="relative">
                <Icon className={`h-6 w-6 transition-all ${isActive ? 'stroke-[2.5px] drop-shadow-sm' : ''}`} />
                {item.badge > 0 && (
                  <span className="absolute -top-1 -right-2 bg-error text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className={`font-mono text-[10px] uppercase tracking-wider mt-1 transition-all ${isActive ? 'font-bold' : ''}`}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
