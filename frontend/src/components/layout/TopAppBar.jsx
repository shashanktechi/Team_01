import React from 'react';
import { ShoppingCart, MapPin, Search, Mic } from 'lucide-react';

export function TopAppBar() {
  return (
    <header className="fixed top-0 w-full z-50 shadow-md bg-surface/90 backdrop-blur-md max-w-screen-xl mx-auto">
      <div className="flex flex-col gap-2 px-4 py-3 w-full">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-primary font-bold">
            <MapPin className="text-primary h-6 w-6" />
            <div className="flex flex-col">
              <span className="font-headline-sm text-headline-sm">Quick_Cart</span>
              <span className="font-body-sm text-body-sm text-on-surface-variant line-clamp-1">
                Home - 12th Main, Indiranagar
              </span>
            </div>
          </div>
          <button className="relative p-2 text-primary hover:bg-surface-container-high transition-colors active:scale-95 duration-200 rounded-full">
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
