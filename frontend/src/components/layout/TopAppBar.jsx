import React from 'react';
import { ChevronDown, Zap } from 'lucide-react';
import { useCity } from '../../context/CityContext';
import { useNavigate } from 'react-router';
import { BrandMark } from '../ui/BrandMark';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { Icon3D } from '../ui/Icon3D';

export function TopAppBar() {
  const { selectedCity, setIsCityModalOpen } = useCity();
  const navigate = useNavigate();
  const { getCartCount } = useCart();
  const { user } = useAuth();
  const cartCount = getCartCount();

  return (
    <header
      className="fixed top-0 w-full z-50"
      style={{
        background: 'rgba(255, 255, 255,0.88)',
        backdropFilter: 'blur(20px) saturate(1.8)',
        WebkitBackdropFilter: 'blur(20px) saturate(1.8)',
        borderBottom: '1px solid rgba(18,19,26,0.08)',
        boxShadow: '0 2px 16px rgba(18,19,26,0.05)',
      }}
    >
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3 w-full">

        {/* Left: Logo + City */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="hidden md:block hover:opacity-75 transition-opacity focus:outline-none"
          >
            <BrandMark />
          </button>

          <button
            className="flex items-center gap-2 group focus:outline-none rounded-xl px-2 py-1.5
              hover:bg-[#16A34A]/6 transition-colors"
            onClick={() => setIsCityModalOpen(true)}
            aria-label="Change location"
          >
            {/* 3D pin icon */}
            <div className="flex-shrink-0">
              <Icon3D name="pin" size={28} />
            </div>
            <div className="flex flex-col text-left">
              <div className="flex items-center gap-1">
                <span className="font-bold text-sm leading-tight" style={{ color: '#12131A' }}>
                  {selectedCity || 'Select Location'}
                </span>
                <ChevronDown className="w-3 h-3" style={{ color: '#6B6D76' }} />
              </div>
              {selectedCity && (
                <span
                  className="font-mono text-[10px] uppercase tracking-widest font-bold flex items-center gap-0.5"
                  style={{ color: '#16A34A' }}
                >
                  <Zap className="w-3 h-3 fill-current" />
                  Delivery in 12 mins
                </span>
              )}
            </div>
          </button>
        </div>

        {/* Right: Cart + Profile — Desktop */}
        <div className="hidden md:flex items-center gap-2">
          {/* Cart Button with 3D icon */}
          <button
            onClick={() => navigate('/cart')}
            className="relative p-2.5 rounded-xl hover:bg-[#16A34A]/8 transition-colors
              active:scale-95 focus:outline-none group"
            aria-label={`Cart, ${cartCount} items`}
          >
            <Icon3D name="cart" size={26} />
            {cartCount > 0 && (
              <span
                className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full
                  flex items-center justify-center font-mono text-[10px] font-bold text-white shadow-sm px-0.5"
                style={{ background: '#16A34A' }}
              >
                {cartCount}
              </span>
            )}
          </button>

          {/* Search */}
          <button
            className="p-2.5 rounded-xl hover:bg-[#16A34A]/8 transition-colors active:scale-95 focus:outline-none"
            aria-label="Search"
          >
            <Icon3D name="search" size={26} />
          </button>

          {/* Profile / Login */}
          {user ? (
            <button
              onClick={() => navigate('/profile')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl font-mono font-bold text-xs uppercase
                tracking-wider transition-all hover:-translate-y-0.5"
              style={{
                background: 'rgba(22, 163, 74,0.1)',
                color: '#16A34A',
              }}
            >
              {user.profilePhotoUrl ? (
                <img
                  src={user.profilePhotoUrl}
                  alt="avatar"
                  className="w-5 h-5 rounded-full object-cover"
                />
              ) : (
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-black"
                  style={{ background: '#16A34A' }}
                >
                  {user.fullName?.[0]?.toUpperCase() || 'U'}
                </div>
              )}
              {user.fullName ? user.fullName.split(' ')[0] : 'Profile'}
            </button>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="px-5 py-2.5 rounded-xl font-mono font-bold text-xs uppercase tracking-wider
                text-white transition-all hover:-translate-y-0.5
                shadow-[0_0_16px_rgba(22, 163, 74,0.3)] hover:shadow-[0_0_24px_rgba(22, 163, 74,0.45)]"
              style={{ background: '#16A34A' }}
            >
              Login
            </button>
          )}
        </div>

        {/* Right: Mobile icons */}
        <div className="flex md:hidden items-center gap-1">
          <button
            onClick={() => navigate('/cart')}
            className="relative p-2 rounded-xl focus:outline-none"
            aria-label={`Cart, ${cartCount} items`}
          >
            <Icon3D name="cart" size={24} />
            {cartCount > 0 && (
              <span
                className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center
                  justify-center font-mono text-[9px] font-bold text-white"
                style={{ background: '#16A34A' }}
              >
                {cartCount}
              </span>
            )}
          </button>

          <button
            onClick={() => navigate('/profile')}
            className="w-9 h-9 rounded-full flex items-center justify-center border-2 overflow-hidden focus:outline-none"
            style={{
              borderColor: 'rgba(22, 163, 74,0.3)',
              background: 'rgba(22, 163, 74,0.06)',
            }}
          >
            {user?.profilePhotoUrl ? (
              <img src={user.profilePhotoUrl} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-sm font-black" style={{ color: '#16A34A' }}>
                {user?.fullName?.[0]?.toUpperCase() || '?'}
              </span>
            )}
          </button>
        </div>

      </div>
    </header>
  );
}
