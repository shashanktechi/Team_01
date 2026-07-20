import React, { useState } from 'react';
import { Heart, Plus, Minus } from 'lucide-react';
import { Card } from './Card';
import { Button } from './Button';
import { useCart } from '../../context/CartContext';

export function ProductCard({ 
  id, image, name, size, price, mrp, discountPercent, 
  storeId, storeName, isOutOfStock, onConflict 
}) {
  const { getProductQuantity, addToCart, removeFromCart } = useCart();
  const quantity = getProductQuantity(id);

  const handleAdd = () => {
    if (isOutOfStock) return;
    const product = { id, image, name, size, price, storeId, storeName, mrp };
    const result = addToCart(product, storeId, storeName);
    
    if (result && !result.success && onConflict) {
      onConflict(result.conflictStoreName, storeName, () => {
        // Callback if they choose to clear cart
        addToCart(product, storeId, storeName);
      });
    }
  };

  const handleRemove = () => {
    removeFromCart(id);
  };

  return (
    <Card 
      className="p-3 min-w-[150px] max-w-[160px] shrink-0 group hover:-translate-y-1 transition-transform duration-300 relative bg-surface border border-border shadow-sm rounded-xl overflow-hidden"
    >
      {/* Out of stock overlay */}
      {isOutOfStock && (
        <div className="absolute inset-0 bg-ink/10 backdrop-blur-[1px] z-20 flex items-center justify-center">
          <span className="bg-ink text-white font-mono text-xs font-bold px-3 py-1 uppercase tracking-wider shadow-md -rotate-12">
            Sold Out
          </span>
        </div>
      )}

      {/* Discount Badge */}
      {discountPercent && (
        <div className="absolute top-0 left-0 bg-error text-white font-mono text-[10px] font-bold px-2 py-1 rounded-br-lg z-10 shadow-sm">
          {discountPercent}% OFF
        </div>
      )}

      <div className="aspect-square w-full bg-background/20 overflow-hidden relative rounded-lg border border-ink/5 mb-2 flex items-center justify-center">
        <img className="w-full h-full object-contain mix-blend-multiply p-2" alt={name} src={image} />
        <button className="absolute top-1 right-1 p-1.5 bg-surface/80 rounded-full border border-border text-ink-muted hover:text-error transition-colors z-10">
          <Heart className="h-4 w-4" />
        </button>
      </div>

      <div className="flex flex-col flex-grow">
        <h3 className="font-body text-sm line-clamp-2 min-h-[40px] leading-tight font-medium text-ink">{name}</h3>
        <span className="font-mono text-xs text-ink-muted mt-1 font-bold">{size}</span>
        
        {/* Store attribution */}
        {storeName && (
          <span className="font-body text-[10px] text-ink-muted/80 mt-1 line-clamp-1">
            Sold by: <span className="font-medium text-ink/80">{storeName}</span>
          </span>
        )}
      </div>

      <div className="flex flex-col mt-2 gap-2">
        <div className="flex flex-col">
          {mrp && <span className="font-mono text-[10px] text-ink-muted line-through">₹{mrp.toFixed(2)}</span>}
          <span className="font-mono text-sm font-bold text-ink">₹{price?.toFixed(2) || price}</span>
        </div>
        
        {/* Inline Stepper / Add Button */}
        {quantity > 0 ? (
          <div className="flex items-center justify-between border border-primary bg-primary/5 rounded-lg h-8 overflow-hidden z-10 relative">
            <button 
              onClick={handleRemove} 
              className="w-8 h-full flex items-center justify-center active:bg-primary/20 transition-colors text-primary"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="font-mono font-bold text-sm text-primary">{quantity}</span>
            <button 
              onClick={handleAdd} 
              className="w-8 h-full flex items-center justify-center active:bg-primary/20 transition-colors text-primary"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <Button 
            onClick={handleAdd}
            variant="outline"
            className="w-full h-8 px-0 border-primary text-primary hover:bg-primary hover:text-white font-mono text-xs uppercase tracking-wider rounded-lg z-10 relative"
            disabled={isOutOfStock}
          >
            ADD
          </Button>
        )}
      </div>
    </Card>
  );
}
