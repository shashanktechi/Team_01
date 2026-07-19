import React from 'react';
import { Badge } from './Badge';

export function CategoryItem({ image, name }) {
  // Select variant randomly or deterministically based on name length
  const variants = ['kraft', 'chalk', 'marigold'];
  const variant = variants[name.length % variants.length];

  return (
    <div className="flex flex-col items-center gap-1 min-w-[80px] shrink-0 cursor-pointer group">
      <Badge variant={variant} className="p-2 transition-transform duration-200 group-hover:-translate-y-1">
        <div className="flex flex-col items-center gap-2">
          <div className="w-12 h-12 flex items-center justify-center overflow-hidden mix-blend-multiply">
            <img className="w-full h-full object-contain" alt={name} src={image} />
          </div>
          <span className="font-label-sm text-[10px] uppercase tracking-wider text-center max-w-[64px] truncate">
            {name}
          </span>
        </div>
      </Badge>
    </div>
  );
}
