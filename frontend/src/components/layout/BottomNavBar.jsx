import React from 'react';
import { Link, useLocation } from 'react-router';
import { useCart } from '../../context/CartContext';
import { Icon3D } from '../ui/Icon3D';

const NAV_ITEMS = [
  { name: 'Home', path: '/stores', icon3d: 'fruits' },
  { name: 'Search', path: '/search', icon3d: 'search' },
  { name: 'Cart', path: '/cart', icon3d: 'cart', hasBadge: true },
  { name: 'Orders', path: '/orders', icon3d: 'delivery' },
  { name: 'Profile', path: '/profile', icon3d: 'pin' },
];

export function BottomNavBar() {
  const location = useLocation();
  const { getCartCount } = useCart();
  const cartCount = getCartCount();

  return (
    <nav
      className="fixed bottom-0 w-full z-50 md:hidden"
      style={{
        background: 'rgba(255, 255, 255,0.92)',
        backdropFilter: 'blur(20px) saturate(1.8)',
        WebkitBackdropFilter: 'blur(20px) saturate(1.8)',
        borderTop: '1px solid rgba(18,19,26,0.08)',
        boxShadow: '0 -4px 24px rgba(18,19,26,0.06)',
      }}
    >
      <div className="flex justify-around items-end px-2 pb-safe pt-2 min-h-[64px]">
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.path ||
            (item.path === '/stores' && location.pathname === '/');
          const badge = item.hasBadge ? cartCount : 0;

          return (
            <Link
              key={item.name}
              to={item.path}
              className="relative flex flex-col items-center justify-center transition-all duration-200 active:scale-90 px-2 py-1 w-14 focus:outline-none"
              aria-label={item.name}
              aria-current={isActive ? 'page' : undefined}
            >
              <div className="relative">
                {/* Active glow ring */}
                {isActive && (
                  <div
                    className="absolute inset-0 rounded-xl -m-1"
                    style={{
                      background: 'rgba(22, 163, 74,0.1)',
                      boxShadow: '0 0 12px rgba(22, 163, 74,0.2)',
                    }}
                  />
                )}
                <div
                  className="relative z-10 transition-transform duration-200"
                  style={{ transform: isActive ? 'translateY(-2px)' : 'none' }}
                >
                  <Icon3D name={item.icon3d} size={28} />
                </div>
                {badge > 0 && (
                  <span
                    className="absolute -top-1 -right-2 min-w-[16px] h-4 rounded-full flex items-center
                      justify-center font-mono text-[9px] font-black text-white shadow-sm px-0.5"
                    style={{ background: '#16A34A' }}
                  >
                    {badge}
                  </span>
                )}
              </div>
              <span
                className="font-mono text-[9px] uppercase tracking-wider mt-1 transition-all font-bold"
                style={{ color: isActive ? '#16A34A' : '#6B6D76' }}
              >
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
