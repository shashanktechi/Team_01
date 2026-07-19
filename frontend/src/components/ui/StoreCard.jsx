import React from 'react';
import { Zap, Star } from 'lucide-react';

export function StoreCard({ bannerImage, logoImage, name, rating, categories, status, deliveryTime }) {
  return (
    <div className="bg-surface-container-lowest rounded-xl shadow-[0px_2px_8px_rgba(0,0,0,0.05)] overflow-hidden flex flex-col relative group hover:-translate-y-1 transition-transform duration-300">
      <div className="h-32 w-full relative">
        <img className="w-full h-full object-cover" alt={`${name} banner`} src={bannerImage} />
        <div className="absolute top-2 left-2 bg-primary text-on-primary font-label-md text-label-md px-2 py-1 rounded-full flex items-center gap-1">
          <Zap className="h-3.5 w-3.5" fill="currentColor" /> {deliveryTime}
        </div>
      </div>
      <div className="p-4 pt-8 relative">
        {/* Overlapping Logo */}
        <div className="absolute -top-6 left-4 w-12 h-12 rounded-lg border-2 border-surface-container-lowest bg-surface-container-lowest overflow-hidden shadow-sm">
          <img className="w-full h-full object-contain" alt={`${name} logo`} src={logoImage} />
        </div>
        
        <div className="flex justify-between items-start mb-1">
          <h3 className="font-headline-sm text-headline-sm">{name}</h3>
          <div className="flex items-center gap-1 bg-surface-container-high px-2 py-0.5 rounded text-sm font-bold text-on-surface">
            <span>{rating}</span>
            <Star className="text-secondary-container h-3.5 w-3.5" fill="currentColor" />
          </div>
        </div>
        
        <p className="font-body-sm text-body-sm text-on-surface-variant">{categories}</p>
        
        <div className="mt-2 inline-flex items-center gap-1 text-primary-container font-label-md text-label-md bg-primary-fixed/20 px-2 py-1 rounded">
          <span className="w-2 h-2 rounded-full bg-primary-container"></span> {status}
        </div>
      </div>
    </div>
  );
}
