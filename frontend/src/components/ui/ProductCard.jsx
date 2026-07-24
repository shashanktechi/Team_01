import React, { useRef, useState, useCallback } from 'react';
import { Heart, Plus, Minus } from 'lucide-react';
import { useCart } from '../../context/CartContext';

export function ProductCard({
  id, image, name, size, price, mrp, discountPercent,
  storeId, storeName, isOutOfStock, onConflict
}) {
  const { getProductQuantity, addToCart, removeFromCart } = useCart();
  const quantity = getProductQuantity(id);

  // Parallax state
  const cardRef = useRef(null);
  const [tx, setTx] = useState(0);
  const [ty, setTy] = useState(0);
  const prefersReduced = useRef(
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false
  );

  const onMouseMove = useCallback((e) => {
    if (prefersReduced.current || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setTx((x / rect.width) * 4);
    setTy((y / rect.height) * 4);
  }, []);

  const onMouseLeave = useCallback(() => {
    setTx(0); setTy(0);
  }, []);

  const handleAdd = () => {
    if (isOutOfStock) return;
    const product = { id, image, name, size, price, storeId, storeName, mrp };
    const result = addToCart(product, storeId, storeName);
    if (result && !result.success && onConflict) {
      onConflict(result.conflictStoreName, storeName, () => {
        addToCart(product, storeId, storeName);
      });
    }
  };

  const handleRemove = () => removeFromCart(id);

  return (
    <div
      ref={cardRef}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      className="shrink-0 min-w-[150px] max-w-[165px] group relative"
      style={{
        transform: `translate(${tx}px, ${ty}px)`,
        transition: 'transform 0.25s ease-out',
        willChange: 'transform',
      }}
    >
      <div
        className="fm-panel rounded-2xl p-3 w-full flex flex-col
          group-hover:-translate-y-1
          transition-transform duration-300 relative overflow-hidden"
      >
        {/* Sold-out overlay */}
        {isOutOfStock && (
          <div
            className="absolute inset-0 z-20 flex items-center justify-center"
            style={{ background: 'rgba(255, 255, 255,0.7)', backdropFilter: 'blur(2px)' }}
          >
            <span
              className="font-mono text-xs font-black uppercase tracking-wider px-3 py-1.5 rounded-lg -rotate-12"
              style={{
                background: '#12131A',
                color: '#FFFFFF',
                boxShadow: '0 4px 12px rgba(18,19,26,0.3)',
              }}
            >
              Sold Out
            </span>
          </div>
        )}

        {/* Discount Badge */}
        {discountPercent > 0 && (
          <div
            className="absolute top-0 left-0 font-mono text-[10px] font-black px-2.5 py-1 rounded-br-xl z-10"
            style={{ background: '#16A34A', color: '#FFFFFF' }}
          >
            {discountPercent}% OFF
          </div>
        )}

        {/* Product Image Container */}
        <div
          className="aspect-square w-full overflow-hidden relative rounded-xl mb-3 flex items-center justify-center"
          style={{
            background: 'rgba(255, 255, 255,0.4)',
            border: '1px solid rgba(18,19,26,0.06)',
          }}
        >
          {/* Real 2D product photo — never distorted/3D transformed */}
          <img
            className="w-full h-full object-contain p-2"
            alt={name}
            src={image}
            loading="lazy"
          />
          {/* Wishlist button */}
          <button
            className="absolute top-1.5 right-1.5 p-1.5 rounded-full transition-all
              hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#16A34A]"
            style={{
              background: 'rgba(255,255,255,0.6)',
              backdropFilter: 'blur(4px)',
              border: '1px solid rgba(18,19,26,0.08)',
              boxShadow: '0 2px 8px rgba(18,19,26,0.08)',
            }}
            aria-label={`Add ${name} to wishlist`}
          >
            <Heart className="h-3.5 w-3.5" style={{ color: '#6B6D76' }} />
          </button>
        </div>

        {/* Product info */}
        <div className="flex flex-col flex-grow">
          <h3
            className="font-body text-sm line-clamp-2 min-h-[40px] leading-tight font-bold"
            style={{ color: '#000000' }}
          >
            {name}
          </h3>
          <span className="font-mono text-xs font-bold mt-1" style={{ color: '#6B6D76' }}>
            {size}
          </span>

          {storeName && (
            <span className="font-body text-[10px] mt-0.5 line-clamp-1" style={{ color: '#6B6D76' }}>
              By{' '}
              <span className="font-bold" style={{ color: '#000000' }}>
                {storeName}
              </span>
            </span>
          )}
        </div>

        {/* Price + CTA */}
        <div className="flex flex-col mt-3 gap-2">
          <div className="flex flex-col">
            {mrp && mrp > price && (
              <span className="font-mono text-[10px] line-through" style={{ color: '#6B6D76' }}>
                ₹{mrp.toFixed(2)}
              </span>
            )}
            <span className="font-mono text-sm font-black" style={{ color: '#000000' }}>
              ₹{price?.toFixed(2) || price}
            </span>
          </div>

          {/* Stepper / Add button */}
          {quantity > 0 ? (
            <div
              className="flex items-center justify-between rounded-xl h-9 overflow-hidden z-10 relative"
              style={{
                border: '1.5px solid #16A34A',
                background: 'rgba(22, 163, 74,0.06)',
              }}
            >
              <button
                onClick={handleRemove}
                className="w-9 h-full flex items-center justify-center
                  active:bg-[#16A34A]/20 transition-colors focus:outline-none"
                aria-label="Remove one"
              >
                <Minus className="h-3.5 w-3.5" style={{ color: '#16A34A' }} />
              </button>
              <span className="font-mono font-black text-sm" style={{ color: '#16A34A' }}>
                {quantity}
              </span>
              <button
                onClick={handleAdd}
                className="w-9 h-full flex items-center justify-center
                  active:bg-[#16A34A]/20 transition-colors focus:outline-none"
                aria-label="Add one more"
              >
                <Plus className="h-3.5 w-3.5" style={{ color: '#16A34A' }} />
              </button>
            </div>
          ) : (
            <button
              onClick={handleAdd}
              disabled={isOutOfStock}
              className="w-full h-9 rounded-xl font-mono text-xs font-black uppercase tracking-wider z-10 relative
                transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.97] active:translate-y-0
                disabled:opacity-50 disabled:pointer-events-none focus:outline-none
                focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#16A34A]"
              style={{
                border: '1.5px solid #16A34A',
                color: '#16A34A',
                background: 'transparent',
                boxShadow: isOutOfStock ? 'none' : '0 0 0 0 rgba(22, 163, 74,0)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#16A34A';
                e.currentTarget.style.color = '#FFFFFF';
                e.currentTarget.style.boxShadow = '0 0 20px rgba(22, 163, 74,0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = '#16A34A';
                e.currentTarget.style.boxShadow = '0 0 0 0 rgba(22, 163, 74,0)';
              }}
            >
              ADD
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
