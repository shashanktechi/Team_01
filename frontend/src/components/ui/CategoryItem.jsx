import React from 'react';

export function CategoryItem({ image, name }) {
  return (
    <div className="flex flex-col items-center gap-1 min-w-[72px] shrink-0 cursor-pointer group">
      <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center overflow-hidden transition-transform duration-200 group-hover:scale-105 group-active:scale-95">
        <img className="w-full h-full object-cover" alt={name} src={image} />
      </div>
      <span className="font-label-md text-label-md text-center">{name}</span>
    </div>
  );
}
