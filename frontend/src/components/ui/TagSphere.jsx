import React, { useEffect, useRef, useCallback } from 'react';
import { Badge } from './Badge';

// Expanded premium daily essentials list (Fruits, Vegetables, Snacks/Bakery, Household Needs)
const items = [
  // Fresh Fruits
  { icon: '🍎', type: 'fruit', id: 'apple', text: 'Apple' },
  { icon: '🍏', type: 'fruit', id: 'greenapple', text: 'Green Apple' },
  { icon: '🍌', type: 'fruit', id: 'banana', text: 'Banana' },
  { icon: '🍉', type: 'fruit', id: 'watermelon', text: 'Watermelon' },
  { icon: '🍇', type: 'fruit', id: 'grapes', text: 'Grapes' },
  { icon: '🍓', type: 'fruit', id: 'strawberry', text: 'Strawberry' },
  { icon: '🥭', type: 'fruit', id: 'mango', text: 'Mango' },
  { icon: ' Pineapple', icon: '🍍', type: 'fruit', id: 'pineapple', text: 'Pineapple' },
  { icon: '🍒', type: 'fruit', id: 'cherry', text: 'Cherry' },
  { icon: '🫐', type: 'fruit', id: 'blueberry', text: 'Blueberry' },
  { icon: '🍊', type: 'fruit', id: 'orange', text: 'Orange' },
  { icon: '🥑', type: 'fruit', id: 'avocado', text: 'Avocado' },
  { icon: '🥝', type: 'fruit', id: 'kiwi', text: 'Kiwi' },
  { icon: '🍑', type: 'fruit', id: 'peach', text: 'Peach' },
  { icon: '🍋', type: 'fruit', id: 'lemon', text: 'Lemon' },
  { icon: '🥥', type: 'fruit', id: 'coconut', text: 'Coconut' },

  // Fresh Vegetables
  { icon: '🍅', type: 'veg', id: 'tomato', text: 'Tomato' },
  { icon: '🧅', type: 'veg', id: 'onion', text: 'Onion' },
  { icon: '🥔', type: 'veg', id: 'potato', text: 'Potato' },
  { icon: '🥕', type: 'veg', id: 'carrot', text: 'Carrot' },
  { icon: '🍆', type: 'veg', id: 'brinjal', text: 'Brinjal' },
  { icon: '🥬', type: 'veg', id: 'spinach', text: 'Spinach' },
  { icon: '🌶️', type: 'veg', id: 'chili', text: 'Chili' },
  { icon: '🥦', type: 'veg', id: 'broccoli', text: 'Broccoli' },
  { icon: '🥒', type: 'veg', id: 'cucumber', text: 'Cucumber' },
  { icon: '🧄', type: 'veg', id: 'garlic', text: 'Garlic' },
  { icon: '🫚', type: 'veg', id: 'ginger', text: 'Ginger' },
  { icon: '🌽', type: 'veg', id: 'corn', text: 'Corn' },
  { icon: '🍄', type: 'veg', id: 'mushroom', text: 'Mushroom' },
  { icon: '🫑', type: 'veg', id: 'capsicum', text: 'Capsicum' },

  // Bakery, Snacks & Brands
  { icon: '🍪', text: 'Oreo', type: 'snack', id: 'oreo' },
  { icon: '🥨', text: 'Pretzel', type: 'snack', id: 'pretzel' },
  { icon: '🍟', text: 'Lays Chips', type: 'snack', id: 'lays' },
  { icon: '🍿', text: 'Act II Popcorn', type: 'snack', id: 'act2' },
  { icon: '🍫', text: 'Cadbury', type: 'snack', id: 'cadbury' },
  { icon: '🍬', text: 'Candyfloss', type: 'snack', id: 'candy' },
  { icon: '🍞', text: 'Daily Bread', type: 'snack', id: 'bread' },
  { icon: '🥚', text: 'Farm Eggs', type: 'snack', id: 'eggs' },
  { icon: '🧀', text: 'Amul Cheese', type: 'snack', id: 'cheese' },
  { icon: '🥛', text: 'Mother Dairy', type: 'snack', id: 'milk' },
  { icon: '🥤', text: 'Coca-Cola', type: 'snack', id: 'soda' },
  { icon: '☕', text: 'Nescafe', type: 'snack', id: 'nescafe' },
  { icon: '🍵', text: 'Tata Tea', type: 'snack', id: 'tea' },
  { icon: '🥣', text: 'Kellogg\'s', type: 'snack', id: 'cereal' },
  { icon: '🥫', text: 'Maggi', type: 'snack', id: 'maggi' },
  { icon: '🧃', text: 'Real Juice', type: 'snack', id: 'juice' },

  // Household & Daily Needs (HomeNeedy)
  { icon: '🧼', text: 'Vim Soap', type: 'household', id: 'soap' },
  { icon: '🧻', text: 'Tissue Roll', type: 'household', id: 'tissue' },
  { icon: '🧴', text: 'Dettol Lotion', type: 'household', id: 'lotion' },
  { icon: '🪥', text: 'Toothbrush', type: 'household', id: 'brush' },
  { icon: '🪮', text: 'Hair Comb', type: 'household', id: 'comb' },
  { icon: '🧺', text: 'Laundry Basket', type: 'household', id: 'laundry' },
  { icon: '🧹', text: 'Broom Clean', type: 'household', id: 'broom' },
  { icon: '🧽', text: 'Scrub Sponge', type: 'household', id: 'sponge' },
  { icon: '🕯️', text: 'Candle Light', type: 'household', id: 'candle' },
  { icon: '🔋', text: 'Duracell', type: 'household', id: 'battery' },
  { icon: '🍽️', text: 'Tableware', type: 'household', id: 'plates' },
  { icon: '🧂', text: 'Catch Salt', type: 'household', id: 'salt' },
  { icon: '🍯', text: 'Dabur Honey', type: 'household', id: 'honey' },
  { icon: '🌻', text: 'Fortune Oil', type: 'household', id: 'oil' },
];

const N = items.length;
const variants = ['kraft', 'chalk', 'marigold'];

// Pre-compute Fibonacci sphere positions (static, never changes)
const spherePoints = items.map((item, i) => {
  const y = 1 - (i / (N - 1)) * 2;
  const radiusAtY = Math.sqrt(1 - y * y);
  const theta = i * 2.399963; // Golden angle
  return {
    ...item,
    x: Math.cos(theta) * radiusAtY,
    y,
    z: Math.sin(theta) * radiusAtY,
    variant: variants[i % variants.length],
  };
});

// Dynamic Price tags for daily essential tracking
const prices = {
  tomato: '₹40/kg', potato: '₹30/kg', cucumber: '₹20/kg',
  tea: '₹120', mango: '₹80/kg', milk: '₹33/pkt', 
  bread: '₹45', eggs: '₹75/dz', soap: '₹35', oil: '₹145/L'
};

export function TagSphere() {
  const containerRef = useRef(null);
  const itemRefs = useRef([]);
  const animFrameRef = useRef(null);

  // All mutable animation state lives in a single ref — zero re-renders
  const state = useRef({
    rotX: 0,
    rotY: 0,
    velX: 0,
    velY: 0.0003,
    targetVelX: 0,
    targetVelY: 0.0003,
    sphereRadius: 0,
    isDragging: false,
    lastPointerX: 0,
    lastPointerY: 0,
    containerW: 0,
    containerH: 0,
  });

  const setItemRef = useCallback((el, i) => {
    itemRefs.current[i] = el;
  }, []);

  // Core render loop — writes directly to the DOM, no React setState
  const tick = useCallback(() => {
    const s = state.current;

    // Ease velocity toward target
    s.velX += (s.targetVelX - s.velX) * 0.08;
    s.velY += (s.targetVelY - s.velY) * 0.08;

    s.rotX += s.velX;
    s.rotY += s.velY;

    const cosRX = Math.cos(s.rotX);
    const sinRX = Math.sin(s.rotX);
    const cosRY = Math.cos(s.rotY);
    const sinRY = Math.sin(s.rotY);
    const r = s.sphereRadius;

    for (let i = 0; i < spherePoints.length; i++) {
      const el = itemRefs.current[i];
      if (!el) continue;

      const pt = spherePoints[i];

      // Rotate around X axis
      const y1 = pt.y * cosRX - pt.z * sinRX;
      const z1 = pt.z * cosRX + pt.y * sinRX;

      // Rotate around Y axis
      const x2 = pt.x * cosRY - z1 * sinRY;
      const z2 = z1 * cosRY + pt.x * sinRY;

      const zNorm = (z2 + 1) / 2; // 0 (back) → 1 (front)
      const scale = 0.35 + zNorm * 0.75;
      const opacity = 0.12 + zNorm * 0.88;

      const sx = x2 * r;
      const sy = y1 * r;

      el.style.transform = `translate3d(${sx}px, ${sy}px, 0) scale(${scale})`;
      el.style.opacity = opacity;
      el.style.zIndex = Math.round(z2 * 1000) + 1000;
    }

    animFrameRef.current = requestAnimationFrame(tick);
  }, []);

  // Resize observer — updates sphereRadius without re-render
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateSize = () => {
      const rect = container.getBoundingClientRect();
      state.current.containerW = rect.width;
      state.current.containerH = rect.height;
      state.current.sphereRadius = Math.min(rect.width, rect.height) / 2 * 0.68;
    };

    const observer = new ResizeObserver(updateSize);
    observer.observe(container);
    updateSize();

    return () => observer.disconnect();
  }, []);

  // Start animation loop
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mq.matches) return;

    animFrameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [tick]);

  // Mouse interactivity — hover to steer
  const onMouseMove = useCallback((e) => {
    const s = state.current;
    const container = containerRef.current;
    if (!container) return;

    if (s.isDragging) {
      const dx = e.clientX - s.lastPointerX;
      const dy = e.clientY - s.lastPointerY;
      s.targetVelY = dx * 0.002;
      s.targetVelX = -dy * 0.002;
      s.lastPointerX = e.clientX;
      s.lastPointerY = e.clientY;
    } else {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = ((e.clientY - rect.top) / rect.height) * 2 - 1;
      s.targetVelY = x * 0.0012;
      s.targetVelX = -y * 0.0012;
    }
  }, []);

  const onMouseDown = useCallback((e) => {
    state.current.isDragging = true;
    state.current.lastPointerX = e.clientX;
    state.current.lastPointerY = e.clientY;
  }, []);

  const onPointerUp = useCallback(() => {
    state.current.isDragging = false;
    setTimeout(() => {
      if (!state.current.isDragging) {
        state.current.targetVelX = 0;
        state.current.targetVelY = 0.0003;
      }
    }, 1500);
  }, []);

  const onMouseLeave = useCallback(() => {
    state.current.isDragging = false;
    state.current.targetVelX = 0;
    state.current.targetVelY = 0.0003;
  }, []);

  const onTouchStart = useCallback((e) => {
    if (e.touches.length !== 1) return;
    state.current.isDragging = true;
    state.current.lastPointerX = e.touches[0].clientX;
    state.current.lastPointerY = e.touches[0].clientY;
  }, []);

  const onTouchMove = useCallback((e) => {
    if (!state.current.isDragging || e.touches.length !== 1) return;
    const s = state.current;
    const dx = e.touches[0].clientX - s.lastPointerX;
    const dy = e.touches[0].clientY - s.lastPointerY;
    s.targetVelY = dx * 0.003;
    s.targetVelX = -dy * 0.003;
    s.lastPointerX = e.touches[0].clientX;
    s.lastPointerY = e.touches[0].clientY;
  }, []);

  const onTouchEnd = useCallback(() => {
    state.current.isDragging = false;
    setTimeout(() => {
      if (!state.current.isDragging) {
        state.current.targetVelX = 0;
        state.current.targetVelY = 0.0003;
      }
    }, 2000);
  }, []);

  useEffect(() => {
    window.addEventListener('mouseup', onPointerUp);
    window.addEventListener('touchend', onTouchEnd);
    return () => {
      window.removeEventListener('mouseup', onPointerUp);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [onPointerUp, onTouchEnd]);

  return (
    <div
      ref={containerRef}
      onMouseMove={onMouseMove}
      onMouseDown={onMouseDown}
      onMouseLeave={onMouseLeave}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      className="relative w-full max-w-[420px] sm:max-w-[540px] md:max-w-[660px] lg:max-w-[780px] aspect-square flex items-center justify-center mx-auto cursor-grab active:cursor-grabbing select-none touch-none"
    >
      {spherePoints.map((point, i) => {
        const price = prices[point.id];
        return (
          <div
            key={point.id}
            ref={(el) => setItemRef(el, i)}
            className="absolute flex flex-col items-center justify-center pointer-events-none will-change-transform"
            style={{ opacity: 0 }}
          >
            <Badge variant={point.variant} className="px-2 py-1 shadow-sm pointer-events-auto whitespace-nowrap">
              <div className="flex items-center gap-1.5">
                <span className="text-base sm:text-lg leading-none">{point.icon}</span>
                {point.text && <span className="text-[9px] sm:text-[10px] uppercase tracking-wider font-bold">{point.text}</span>}
              </div>
            </Badge>
            {price && (
              <div className="mt-0.5 font-mono text-[8px] sm:text-[9px] font-bold text-ink-muted rotate-[-3deg] bg-chalk px-1 border border-ink/10 shadow-sm pointer-events-auto">
                {price}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}