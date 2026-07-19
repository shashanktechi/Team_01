import React, { useEffect, useRef, useCallback } from 'react';
import { Badge } from './Badge';

const items = [
  // Vegetables
  { icon: '🍅', type: 'veg', id: 'tomato', text: 'Tomato' }, { icon: '🧅', type: 'veg', id: 'onion', text: 'Onion' },
  { icon: '🥔', type: 'veg', id: 'potato', text: 'Potato' }, { icon: '🥕', type: 'veg', id: 'carrot', text: 'Carrot' },
  { icon: '🍆', type: 'veg', id: 'brinjal', text: 'Brinjal' }, { icon: '🥬', type: 'veg', id: 'spinach', text: 'Spinach' },
  { icon: '🌶️', type: 'veg', id: 'chili', text: 'Chili' }, { icon: '🥦', type: 'veg', id: 'cauliflower', text: 'Cauliflower' },
  { icon: '🥒', type: 'veg', id: 'cucumber', text: 'Cucumber' }, { icon: '🎃', type: 'veg', id: 'pumpkin', text: 'Pumpkin' },
  { icon: '🧄', type: 'veg', id: 'garlic', text: 'Garlic' }, { icon: '🫚', type: 'veg', id: 'ginger', text: 'Ginger' },
  { icon: '🌽', type: 'veg', id: 'corn', text: 'Corn' }, { icon: '🍄', type: 'veg', id: 'mushroom', text: 'Mushroom' },
  { icon: '🥬', type: 'veg', id: 'cabbage', text: 'Cabbage' }, { icon: '🍠', type: 'veg', id: 'sweetpotato', text: 'Sweet Potato' },
  { icon: '🌿', type: 'veg', id: 'celery', text: 'Celery' },

  // Fruits
  { icon: '🍌', type: 'veg', id: 'banana', text: 'Banana' }, { icon: '🍎', type: 'veg', id: 'apple', text: 'Apple' },
  { icon: '🍉', type: 'veg', id: 'watermelon', text: 'Watermelon' }, { icon: '🍇', type: 'veg', id: 'grapes', text: 'Grapes' },
  { icon: '🍓', type: 'veg', id: 'strawberry', text: 'Strawberry' }, { icon: '🥭', type: 'veg', id: 'mango', text: 'Mango' },
  { icon: '🍍', type: 'veg', id: 'pineapple', text: 'Pineapple' }, { icon: '🥥', type: 'veg', id: 'coconut', text: 'Coconut' },
  { icon: '🥝', type: 'veg', id: 'kiwi', text: 'Kiwi' }, { icon: '🍋', type: 'veg', id: 'lemon', text: 'Lemon' },
  { icon: '🥑', type: 'veg', id: 'avocado', text: 'Avocado' }, { icon: '🍈', type: 'veg', id: 'melon', text: 'Melon' },
  { icon: '🍒', type: 'veg', id: 'cherry', text: 'Cherry' }, { icon: '🍑', type: 'veg', id: 'peach', text: 'Peach' },
  { icon: '🍐', type: 'veg', id: 'pear', text: 'Pear' }, { icon: '🫐', type: 'veg', id: 'blueberry', text: 'Blueberry' },
  { icon: '🍏', type: 'veg', id: 'greenapple', text: 'Green Apple' }, { icon: '🍊', type: 'veg', id: 'orange', text: 'Orange' },

  // Brands & Snacks
  { icon: '🥨', text: 'Haldiram\'s', type: 'snack', id: 'haldirams' },
  { icon: '🍪', text: 'Oreo', type: 'snack', id: 'oreo' },
  { icon: '🍘', text: 'Lays', type: 'snack', id: 'lays' },
  { icon: '🧂', text: 'Kurkure', type: 'snack', id: 'kurkure' },
  { icon: '🍵', text: 'Tata Tea', type: 'snack', id: 'tea' },
  { icon: '🍬', text: 'Cadbury', type: 'snack', id: 'cadbury' },
  { icon: '🥤', text: 'Coca-Cola', type: 'snack', id: 'soda' },
  { icon: '🥣', text: 'Kellogg\'s', type: 'snack', id: 'cereal' },
  { icon: '🥫', text: 'Maggi', type: 'snack', id: 'maggi' },
  { icon: '🧃', text: 'Real Juice', type: 'snack', id: 'juice' },
  { icon: '🍫', text: 'Amul', type: 'snack', id: 'amul' },
  { icon: '🍦', text: 'Kwality', type: 'snack', id: 'kwality' },
  { icon: '☕', text: 'Nescafe', type: 'snack', id: 'nescafe' },
  { icon: '🥛', text: 'Mother Dairy', type: 'snack', id: 'motherdairy' },
  { icon: '🍿', text: 'Act II', type: 'snack', id: 'act2' },
  { icon: '🥜', text: 'Haldiram Nuts', type: 'snack', id: 'haldiram_nuts' },
  { icon: '🍯', text: 'Dabur', type: 'snack', id: 'dabur' },
  { icon: '🍫', text: 'Snickers', type: 'snack', id: 'snickers' },
  { icon: '🍪', text: 'Parle-G', type: 'snack', id: 'parleg' },
  { icon: '🥤', text: 'Pepsi', type: 'snack', id: 'pepsi' },
  { icon: '🧃', text: 'Tropicana', type: 'snack', id: 'tropicana' },
  { icon: '🍮', text: 'Dairy Milk', type: 'snack', id: 'dairymilk' },
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

const prices = {
  tomato: '₹40/kg', potato: '₹30/kg', cucumber: '₹20/kg',
  tea: '₹120', mango: '₹80/kg', amul: '₹20',
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

  // Build item refs array
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
      // Drag: use delta from last pointer position
      const dx = e.clientX - s.lastPointerX;
      const dy = e.clientY - s.lastPointerY;
      s.targetVelY = dx * 0.002;
      s.targetVelX = -dy * 0.002;
      s.lastPointerX = e.clientX;
      s.lastPointerY = e.clientY;
    } else {
      // Hover: use position relative to center
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
    // Let it coast, then slowly decay back to idle spin
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

  // Touch interactivity — drag to spin on mobile
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

  // Attach window-level mouseup so drag doesn't stick
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
