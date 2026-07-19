import React from 'react';
import { Home, Grid, Search, User } from 'lucide-react';
import { Link, useLocation } from 'react-router';

export function BottomNavBar() {
  const location = useLocation();

  const navItems = [
    { name: 'Home', path: '/stores', icon: Home },
    { name: 'Categories', path: '/categories', icon: Grid },
    { name: 'Search', path: '/search', icon: Search },
    { name: 'Account', path: '/account', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 w-full z-50 rounded-t-xl bg-surface shadow-[0_-4px_12px_rgba(0,0,0,0.08)] max-w-screen-xl mx-auto md:hidden">
      <div className="flex justify-around items-center px-4 pb-4 pt-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <Link 
              key={item.name}
              to={item.path}
              className={`flex flex-col items-center justify-center transition-all duration-200 active:scale-90 px-4 py-1 ${
                isActive 
                  ? 'bg-secondary-container text-on-secondary-container rounded-full' 
                  : 'text-on-surface-variant hover:bg-surface-variant/50 rounded-xl'
              }`}
            >
              <Icon className="h-6 w-6" />
              <span className="font-label-md text-label-md mt-1">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
