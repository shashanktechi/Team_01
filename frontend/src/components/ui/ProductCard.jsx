import React from 'react';
import { Heart, Plus } from 'lucide-react';

export function ProductCard({ image, name, size, price, onAdd }) {
  return (
    <div className="bg-surface-container-lowest rounded-xl shadow-[0px_2px_8px_rgba(0,0,0,0.05)] p-3 min-w-[140px] max-w-[140px] flex flex-col gap-2 shrink-0 group hover:-translate-y-1 transition-transform duration-300">
      <div className="aspect-square w-full rounded-lg bg-surface-container-low overflow-hidden relative">
        <img className="w-full h-full object-cover" alt={name} src={image} />
        <button className="absolute top-1 right-1 p-1 bg-surface-container-lowest rounded-full shadow-sm text-on-surface-variant hover:text-primary transition-colors">
          <Heart className="h-[18px] w-[18px]" />
        </button>
      </div>
      <div className="flex flex-col flex-grow">
        <span className="font-body-sm text-body-sm line-clamp-2 min-h-[32px]">{name}</span>
        <span className="font-label-md text-label-md text-on-surface-variant mt-1">{size}</span>
      </div>
      <div className="flex items-center justify-between mt-auto pt-2">
        <span className="font-price-sm text-price-sm">{typeof price === 'number' ? `$${price.toFixed(2)}` : price}</span>
        <button 
          onClick={onAdd}
          className="w-8 h-8 rounded bg-primary text-on-primary flex items-center justify-center hover:bg-primary-container active:scale-95 transition-all"
        >
          <Plus className="h-[18px] w-[18px]" />
        </button>
      </div>
    </div>
  );
}
