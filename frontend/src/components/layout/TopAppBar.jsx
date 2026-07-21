import React from 'react';
import { ShoppingCart, MapPin, ChevronDown, Zap, User } from 'lucide-react';
import { useCity } from '../../context/CityContext';
import { useNavigate } from 'react-router';
import { BrandMark } from '../ui/BrandMark';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

export function TopAppBar() {
  const { selectedCity, setIsCityModalOpen } = useCity();
  const navigate = useNavigate();
  const { getCartCount } = useCart();
  const { user } = useAuth();
  const cartCount = getCartCount();

  return (
    <header className="fixed top-0 w-full z-50 shadow-sm bg-surface border-b border-border">
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4 w-full">
        <div className="flex items-center gap-4">
          <BrandMark className="hidden md:block" />
          
          <div 
            className="flex items-center gap-2 cursor-pointer group"
            onClick={() => setIsCityModalOpen(true)}
          >
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary/20 transition-colors">
              <MapPin className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1">
                <span className="font-bold text-sm text-ink leading-tight">
                  {selectedCity ? selectedCity : 'Select Location'}
                </span>
                <ChevronDown className="w-3 h-3 text-ink-muted" />
              </div>
              {selectedCity && (
                <span className="font-mono text-[10px] uppercase tracking-widest text-primary font-bold flex items-center gap-0.5">
                  <Zap className="w-3 h-3 fill-primary" /> Delivery in 12 mins
                </span>
              )}
            </div>
          </div>
        </div>
        
        {/* Desktop-only Account/Cart icons */}
        <div className="hidden md:flex items-center gap-4">
          <button 
            onClick={() => navigate('/cart')}
            className="relative p-2 text-ink hover:bg-ink/5 transition-colors active:scale-95 duration-200 rounded-full"
          >
            <ShoppingCart className="h-6 w-6" />
            {cartCount > 0 && (
              <span className="absolute top-1 right-1 bg-error text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                {cartCount}
              </span>
            )}
          </button>
          {user ? (
            <button 
              onClick={() => navigate('/profile')}
              className="flex items-center gap-2 bg-primary/10 text-primary font-mono font-bold text-xs uppercase tracking-wider px-4 py-2 rounded-lg hover:bg-primary/20 transition-colors"
            >
              <User className="w-4 h-4" />
              {user.fullName ? user.fullName.split(' ')[0] : 'Profile'}
            </button>
          ) : (
            <button 
              onClick={() => navigate('/login')}
              className="bg-ink text-white font-mono font-bold text-xs uppercase tracking-wider px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
            >
              Login
            </button>
          )}
        </div>
        
        {/* Mobile Profile Icon */}
        <div className="md:hidden flex gap-3 items-center">
           <button 
             onClick={() => navigate('/cart')}
             className="relative text-ink p-1"
           >
             <ShoppingCart className="h-6 w-6" />
             {cartCount > 0 && (
               <span className="absolute -top-1 -right-1 bg-error text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                 {cartCount}
               </span>
             )}
           </button>
           <button 
             onClick={() => navigate('/profile')} 
             className="w-8 h-8 rounded-full bg-background flex items-center justify-center border border-border overflow-hidden"
           >
             {user?.profilePhotoUrl ? (
               <img src={user.profilePhotoUrl} alt="avatar" className="w-full h-full object-cover" />
             ) : (
               <span className="text-sm font-bold text-ink">{user?.fullName?.[0]?.toUpperCase() || 'U'}</span>
             )}
           </button>
        </div>
      </div>
    </header>
  );
}
