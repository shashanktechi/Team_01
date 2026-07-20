import React from 'react';
import { ShoppingCart, MapPin, Search, Mic, ChevronDown, Zap } from 'lucide-react';
import { useCity } from '../../context/CityContext';
import { useNavigate } from 'react-router';
import { BrandMark } from '../ui/BrandMark';
import { useCart } from '../../context/CartContext';

export function TopAppBar() {
  const { selectedCity, setIsCityModalOpen } = useCity();
  const navigate = useNavigate();
  const { getCartCount } = useCart();
  const cartCount = getCartCount();

  return (
    <header className="fixed top-0 w-full z-50 shadow-sm bg-chalk border-b border-ink/5">
      <div className="flex flex-col gap-3 px-4 sm:px-6 lg:px-8 py-3 w-full max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <BrandMark className="hidden md:block" />
            
            <div 
              className="flex items-center gap-2 cursor-pointer group"
              onClick={() => setIsCityModalOpen(true)}
            >
              <div className="w-8 h-8 rounded-full bg-bazaar-green/10 flex items-center justify-center text-bazaar-green group-hover:bg-bazaar-green/20 transition-colors">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1">
                  <span className="font-display font-bold text-sm text-ink leading-tight">
                    {selectedCity ? selectedCity : 'Select Location'}
                  </span>
                  <ChevronDown className="w-3 h-3 text-ink-muted" />
                </div>
                {selectedCity && (
                  <span className="font-mono text-[10px] uppercase tracking-widest text-bazaar-green font-bold flex items-center gap-0.5">
                    <Zap className="w-3 h-3 fill-bazaar-green" /> Delivery in 12 mins
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
            <button 
              onClick={() => navigate('/profile')}
              className="bg-ink text-chalk font-mono font-bold text-xs uppercase tracking-wider px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
            >
              Login
            </button>
          </div>
          
          {/* Mobile Profile Icon placeholder */}
          <div className="md:hidden">
             <button onClick={() => navigate('/profile')} className="w-8 h-8 rounded-full bg-kraft flex items-center justify-center border border-ink/10">
               <span className="text-sm font-bold text-ink">U</span>
             </button>
          </div>
        </div>
        
        {/* Search Bar */}
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/40 h-5 w-5" />
          <input 
            className="w-full h-12 bg-surface border border-ink/10 rounded-xl pl-10 pr-10 font-body focus:border-bazaar-green focus:ring-1 focus:ring-bazaar-green transition-all outline-none text-ink shadow-inner-sm" 
            placeholder='Search "milk"' 
            type="text"
          />
          <Mic className="absolute right-3 top-1/2 -translate-y-1/2 text-bazaar-green h-5 w-5" />
        </div>
      </div>
    </header>
  );
}
