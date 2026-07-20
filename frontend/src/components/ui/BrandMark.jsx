import React from 'react';
import { Link } from 'react-router';
import quickcartLogo from '../../assets/quickcart-logo.png';

export function BrandMark({ className = '' }) {
  return (
    <Link 
      to="/" 
      className={`group flex items-center gap-2 cursor-pointer transition-all duration-200 hover:opacity-90 active:scale-[0.98] ${className}`}
    >
      <img 
        src={quickcartLogo} 
        alt="QuickCart for local" 
        className="h-9 md:h-10 w-auto object-contain transition-transform duration-200 group-hover:-rotate-1" 
      />
    </Link>
  );
}
