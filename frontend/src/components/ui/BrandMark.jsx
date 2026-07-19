import React from 'react';
import { Link } from 'react-router';
import { BrandStamp } from './BrandStamp';

export function BrandMark({ className = '' }) {
  return (
    <Link 
      to="/" 
      className={`group flex items-center gap-2 cursor-pointer transition-all duration-200 hover:opacity-90 active:scale-[0.98] ${className}`}
    >
      <BrandStamp className="w-8 h-8 md:w-9 md:h-9 shrink-0 transition-transform duration-200 group-hover:-rotate-3" animateThump={false} />
      <span className="font-display font-black text-ink text-xl md:text-2xl leading-none tracking-tight">
        Quick Cart
      </span>
    </Link>
  );
}
