import React from 'react';
import { Zap, Star } from 'lucide-react';
import { TicketCard } from './TicketCard';

export function StoreCard({ bannerImage, logoImage, name, rating, categories, status, deliveryTime }) {
  return (
    <TicketCard className="overflow-hidden flex flex-col relative group hover:-translate-y-1 transition-transform duration-300">
      <div className="h-32 w-full relative">
        <img className="w-full h-full object-cover" alt={`${name} banner`} src={bannerImage} />
        <div className="absolute top-2 left-2 bg-primary text-on-primary font-mono text-sm px-2 py-1 flex items-center gap-1 shadow-sm border border-primary/20">
          <Zap className="h-3.5 w-3.5" fill="currentColor" /> {deliveryTime}
        </div>
      </div>
      <div className="p-4 pt-8 relative">
        {/* Overlapping Logo */}
        <div className="absolute -top-6 left-4 w-12 h-12 rounded border border-ink/10 bg-surface overflow-hidden shadow-sm">
          <img className="w-full h-full object-contain p-1" alt={`${name} logo`} src={logoImage} />
        </div>
        
        <div className="flex justify-between items-start mb-1">
          <h3 className="font-headline-sm text-headline-sm">{name}</h3>
          <div className="flex items-center gap-1 bg-background border border-ink/10 px-2 py-0.5 rounded text-sm font-bold text-ink">
            <span>{rating}</span>
            <Star className="text-secondary h-3.5 w-3.5" fill="currentColor" />
          </div>
        </div>
        
        <p className="font-body-sm text-body-sm text-ink-muted">{categories}</p>
        
        <div className="mt-2 inline-flex items-center gap-1 text-primary font-mono text-xs border border-primary/20 bg-primary/5 px-2 py-1">
          <span className="w-2 h-2 rounded-full bg-primary"></span> {status}
        </div>
      </div>
    </TicketCard>
  );
}
