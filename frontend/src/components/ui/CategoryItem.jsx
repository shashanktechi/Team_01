import React from 'react';
import { Icon3D } from './Icon3D';

// Maps category name to Icon3D name
const CATEGORY_ICON_MAP = {
  'fruits': 'fruits',
  'vegetables': 'fruits',
  'dairy': 'dairy',
  'snacks': 'snacks',
  'beverages': 'beverages',
  'non-veg': 'dairy',
  'household': 'household',
  'bakery': 'bakery',
  'see all': 'star',
  'all': 'star',
};

function getIconName(name) {
  return CATEGORY_ICON_MAP[name?.toLowerCase()] || 'star';
}

export function CategoryItem({ image, name, onClick }) {
  const iconName = getIconName(name);

  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-2 min-w-[80px] shrink-0 group focus:outline-none"
    >
      {/* 3D icon container — floating glass chip */}
      <div
        className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl fm-panel flex items-center justify-center
          group-hover:-translate-y-1.5 group-hover:shadow-[0_8px_32px_rgba(22, 163, 74,0.2)]
          transition-all duration-300 cursor-pointer"
        style={{ background: 'rgba(255,255,255,0.25)' }}
      >
        <Icon3D name={iconName} size={36} />
      </div>
      <span
        className="font-mono text-[10px] uppercase tracking-wider text-center max-w-[72px] truncate font-bold"
        style={{ color: '#000000' }}
      >
        {name}
      </span>
    </button>
  );
}
