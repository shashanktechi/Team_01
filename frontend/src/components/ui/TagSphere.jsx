import React, { useEffect, useState, useRef } from 'react';
import { Badge } from './Badge';

const items = [
  // 16 Veg & Fruits
  { icon: '🍅', type: 'veg', id: 'tomato', text: 'Tomato' }, { icon: '🧅', type: 'veg', id: 'onion', text: 'Onion' }, { icon: '🥔', type: 'veg', id: 'potato', text: 'Potato' }, { icon: '🥕', type: 'veg', id: 'carrot', text: 'Carrot' },
  { icon: '🍆', type: 'veg', id: 'brinjal', text: 'Brinjal' }, { icon: '🥬', type: 'veg', id: 'spinach', text: 'Spinach' }, { icon: '🌶️', type: 'veg', id: 'chili', text: 'Chili' }, { icon: '🥦', type: 'veg', id: 'cauliflower', text: 'Cauliflower' },
  { icon: '🥒', type: 'veg', id: 'cucumber', text: 'Cucumber' }, { icon: '🎃', type: 'veg', id: 'pumpkin', text: 'Pumpkin' }, { icon: '🧄', type: 'veg', id: 'garlic', text: 'Garlic' }, { icon: '🫚', type: 'veg', id: 'ginger', text: 'Ginger' },
  { icon: '🍌', type: 'veg', id: 'banana', text: 'Banana' }, { icon: '🍎', type: 'veg', id: 'apple', text: 'Apple' }, { icon: '🌽', type: 'veg', id: 'corn', text: 'Corn' }, { icon: '🍄', type: 'veg', id: 'mushroom', text: 'Mushroom' },
  
  // 10 Brands & Snacks
  { icon: '🥨', text: 'Haldiram\'s', type: 'snack', id: 'haldirams' },
  { icon: '🍪', text: 'Oreo', type: 'snack', id: 'oreo' },
  { icon: '🍘', text: 'Lays', type: 'snack', id: 'lays' },
  { icon: '🧂', text: 'Kurkure', type: 'snack', id: 'kurkure' },
  { icon: '🍵', text: 'Tata Tea', type: 'snack', id: 'tea' },
  { icon: '🍬', text: 'Cadbury', type: 'snack', id: 'cadbury' },
  { icon: '🥤', text: 'Coca-Cola', type: 'snack', id: 'soda' },
  { icon: '🥣', text: 'Kellogg\'s', type: 'snack', id: 'cereal' },
  { icon: '🥫', text: 'Maggi', type: 'snack', id: 'maggi' },
  { icon: '🧃', text: 'Real Juice', type: 'snack', id: 'juice' }
];

// Price map for specific tags
const prices = {
  'tomato': '₹40/kg',
  'potato': '₹30/kg',
  'cucumber': '₹20/kg',
  'spice': '₹50',
  'tea': '₹120'
};

const variants = ['kraft', 'chalk', 'marigold'];

export function TagSphere() {
  const containerRef = useRef(null);
  const requestRef = useRef();
  const [rotation, setRotation] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  // Fibonacci sphere points for all 26 items
  const N = 26; // Exact count
  const points = items.slice(0, N).map((item, i) => {
    // y goes from 1 to -1
    const y = 1 - (i / (N - 1)) * 2; 
    const radiusAtY = Math.sqrt(1 - y * y);
    const theta = i * 2.399963; // Golden angle

    return {
      ...item,
      x: Math.cos(theta) * radiusAtY,
      y: y,
      z: Math.sin(theta) * radiusAtY,
      variant: variants[i % variants.length]
    };
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsReducedMotion(mediaQuery.matches);
    
    if (mediaQuery.matches) return;

    let previousTime = performance.now();
    const animate = (time) => {
      const deltaTime = time - previousTime;
      
      setRotation(prev => {
        if (isHovered) return prev;
        return (prev + deltaTime * 0.0002618) % (Math.PI * 2);
      });

      previousTime = time;
      requestRef.current = requestAnimationFrame(animate);
    };
    
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, [isHovered]);

  const handleMouseMove = (e) => {
    if (isReducedMotion || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    setMousePos({ x, y });
  };

  return (
    <div 
      ref={containerRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => { setIsHovered(false); setMousePos({ x: 0, y: 0 }); }}
      onMouseMove={handleMouseMove}
      className="relative w-full max-w-[320px] md:max-w-[520px] aspect-square flex items-center justify-center group mx-auto"
    >
      {points.map((point, i) => {
        const containerWidth = typeof window !== 'undefined' && window.innerWidth < 768 ? 320 : 520;
        const sphereRadius = containerWidth * 0.45; // 45% of container width
        
        // Rotate around Y axis
        const rotX = point.x * Math.cos(rotation) - point.z * Math.sin(rotation);
        const rotZ = point.z * Math.cos(rotation) + point.x * Math.sin(rotation);
        const rotY = point.y; // Y remains same

        const zNormalized = (rotZ + 1) / 2; // 0 to 1
        const scale = 0.45 + (zNormalized * 0.75); 
        const opacity = 0.3 + (zNormalized * 0.7);

        // Subtle mouse parallax (shift max 4px based on depth)
        const parallaxX = mousePos.x * rotZ * 4;
        const parallaxY = mousePos.y * rotZ * 4;

        const screenX = rotX * sphereRadius + parallaxX;
        const screenY = rotY * sphereRadius + parallaxY;
        
        const price = prices[point.id];

        return (
          <div
            key={point.id || i}
            className="absolute flex flex-col items-center justify-center pointer-events-none transition-none"
            style={{
              transform: `translate3d(${screenX}px, ${screenY}px, 0) scale(${scale})`,
              opacity: opacity,
              zIndex: Math.round(rotZ * 100)
            }}
          >
            <Badge variant={point.variant} className="px-3 py-1.5 shadow-sm text-base pointer-events-auto">
              <div className="flex items-center gap-1.5">
                <span className="text-xl leading-none" style={{ textShadow: '0 0 0 #1F2A24' }}>{point.icon}</span>
                {point.text && <span className="text-xs uppercase tracking-wider">{point.text}</span>}
              </div>
            </Badge>
            {price && (
              <div className="mt-1 font-mono text-[10px] font-bold text-ink-muted rotate-[-3deg] bg-chalk px-1 border border-ink/10 shadow-sm pointer-events-auto">
                {price}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
