import React from 'react';
import { Zap, Star, MapPin } from 'lucide-react';
import { Card } from './Card';
import { useNavigate } from 'react-router';

export function StoreCard({ id, bannerImage, logoImage, name, rating, categories, status, deliveryTime, distance, rawStore }) {
  const navigate = useNavigate();
  const isOpen = status === 'Open Now';

  return (
    <div onClick={() => navigate(`/store/${id}`, { state: { storeDetails: rawStore || { id, name, bannerUrl: bannerImage, logoUrl: logoImage, freshnessScore: rating } } })} className="cursor-pointer">
      <Card className={`overflow-hidden flex flex-col relative group hover:-translate-y-1 transition-transform duration-300 ${!isOpen ? 'opacity-70 grayscale-[30%]' : ''}`}>
        <div className="h-32 w-full relative bg-background/20">
          <img className="w-full h-full object-cover" alt={`${name} banner`} src={bannerImage} />
          {isOpen ? (
            <div className="absolute top-2 left-2 bg-primary text-white font-mono text-xs font-bold px-2 py-1 rounded-sm flex items-center gap-1 shadow-sm">
              <Zap className="h-3.5 w-3.5" fill="currentColor" /> {deliveryTime}
            </div>
          ) : (
            <div className="absolute top-2 left-2 bg-error text-white font-mono text-xs font-bold px-2 py-1 rounded-sm shadow-sm">
              CLOSED
            </div>
          )}
          {distance && (
            <div className="absolute bottom-2 right-2 bg-surface/90 backdrop-blur-sm text-ink-muted font-mono text-[10px] font-bold px-2 py-1 rounded-sm flex items-center gap-1 shadow-sm">
              <MapPin className="h-3 w-3" /> {distance}
            </div>
          )}
        </div>
        <div className="p-4 pt-6 relative bg-surface">
          {/* Overlapping Logo */}
          <div className="absolute -top-6 left-4 w-12 h-12 rounded border border-border bg-surface overflow-hidden shadow-sm flex items-center justify-center p-1">
            <img className="w-full h-full object-contain" alt={`${name} logo`} src={logoImage} />
          </div>
          
          <div className="flex justify-between items-start mb-1">
            <h3 className="font-body font-bold text-base text-ink line-clamp-1">{name}</h3>
            <div className="flex items-center gap-1 bg-warning/10 border border-marigold/30 px-1.5 py-0.5 rounded text-xs font-bold text-ink">
              <span>{rating}</span>
              <Star className="text-warning h-3 w-3" fill="currentColor" />
            </div>
          </div>
          
          <p className="font-body text-xs text-ink-muted line-clamp-1">{categories}</p>
          
        </div>
      </Card>
    </div>
  );
}
