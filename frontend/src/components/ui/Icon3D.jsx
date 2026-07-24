import React from 'react';
import { 
  ShoppingCart, Search, Truck, Check, MapPin, 
  Apple, Milk, Croissant, Cookie, CupSoda, 
  Sparkles, Box, Leaf, Star
} from 'lucide-react';

const ICON_MAP = {
  cart: ShoppingCart,
  search: Search,
  delivery: Truck,
  check: Check,
  pin: MapPin,
  fruits: Apple,
  dairy: Milk,
  bakery: Croissant,
  snacks: Cookie,
  beverages: CupSoda,
  household: Sparkles,
  crate: Box,
  leaf: Leaf,
  star: Star,
};

export function Icon3D({
  name = 'star',
  size = 36,
  className = '',
  style,
}) {
  const IconComponent = ICON_MAP[name] || Star;
  
  return (
    <span
      className={`inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size, flexShrink: 0, ...style }}
    >
      <IconComponent size={Math.max(16, size * 0.7)} className="stroke-current" />
    </span>
  );
}

export default Icon3D;
