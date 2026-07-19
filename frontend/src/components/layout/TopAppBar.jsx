import React from 'react';
import { ShoppingCart, MapPin, Search, Mic } from 'lucide-react';
import { useCity } from '../../context/CityContext';
import { useNavigate } from 'react-router';
import { BrandMark } from '../ui/BrandMark';

export function TopAppBar() {
  const { selectedCity, setIsCityModalOpen } = useCity();
  const navigate = useNavigate();

  return (
    <header className="fixed top-0 w-full z-50 shadow-md bg-surface/90 backdrop-blur-md">
      <div className="flex flex-col gap-2 px-4 sm:px-6 lg:px-8 py-3 w-full">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BrandMark />
            <div 
              className="flex items-center gap-1 cursor-pointer bg-surface-container-low hover:bg-surface-container px-2 py-1 rounded-md transition-colors"
              onClick={() => setIsCityModalOpen(true)}
            >
              <MapPin className="w-3.5 h-3.5 text-primary" />
              <span className="font-mono font-bold text-xs text-ink-muted">
                {selectedCity ? selectedCity : 'Select City'}
              </span>
            </div>
          </div>
          <button 
            onClick={() => navigate('/cart')}
            className="relative p-2 text-primary hover:bg-surface-container-high transition-colors active:scale-95 duration-200 rounded-full"
          >
            <ShoppingCart className="h-6 w-6" />
            <span className="absolute top-1 right-1 bg-tertiary-container text-on-tertiary-container text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
              3
            </span>
          </button>
        </div>
        
        {/* Search Bar */}
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant h-5 w-5" />
          <input 
            className="w-full bg-surface-container-low border-outline-variant rounded-lg pl-10 pr-10 py-2 font-body-md focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none" 
            placeholder="Search for products..." 
            type="text"
          />
          <Mic className="absolute right-3 top-1/2 -translate-y-1/2 text-primary h-5 w-5" />
        </div>
      </div>
    </header>
  );
}
