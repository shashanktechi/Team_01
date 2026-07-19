import React from 'react';
import { Heart, Plus } from 'lucide-react';
import { TicketCard } from './TicketCard';
import { Button } from './Button';

export function ProductCard({ image, name, size, price, onAdd, expiryTime }) {
  return (
    <TicketCard 
      expiryTime={expiryTime}
      className="p-3 min-w-[140px] max-w-[140px] shrink-0 group hover:-translate-y-1 transition-transform duration-300"
    >
      <div className="aspect-square w-full bg-background overflow-hidden relative border border-ink/5">
        <img className="w-full h-full object-cover" alt={name} src={image} />
        <button className="absolute top-1 right-1 p-1 bg-surface/80 rounded-sm border border-ink/10 text-ink-muted hover:text-error transition-colors">
          <Heart className="h-[18px] w-[18px]" />
        </button>
      </div>
      <div className="flex flex-col flex-grow mt-2">
        <span className="font-body-sm text-sm line-clamp-2 min-h-[40px] leading-tight font-medium text-ink">{name}</span>
        <span className="font-mono text-xs text-ink-muted mt-1">{size}</span>
      </div>
      <div className="flex items-center justify-between mt-auto pt-2">
        <span className="font-mono text-sm font-bold text-ink">{typeof price === 'number' ? `₹${price.toFixed(2)}` : price}</span>
        <Button 
          onClick={onAdd}
          size="sm"
          className="w-8 h-8 p-0 flex items-center justify-center rounded-sm"
        >
          <Plus className="h-[18px] w-[18px]" />
        </Button>
      </div>
    </TicketCard>
  );
}
