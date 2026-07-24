import React, { Suspense, useMemo, useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { TagSphere as TagSphereFallback } from './TagSphere';

const items = [
  { icon: '🍎', id: 'apple' },
  { icon: '🍏', id: 'greenapple' },
  { icon: '🍌', id: 'banana' },
  { icon: '🍉', id: 'watermelon' },
  { icon: '🍇', id: 'grapes' },
  { icon: '🍓', id: 'strawberry' },
  { icon: '🥭', id: 'mango' },
  { icon: '🍍', id: 'pineapple' },
  { icon: '🍒', id: 'cherry' },
  { icon: '🫐', id: 'blueberry' },
  { icon: '🍊', id: 'orange' },
  { icon: '🥑', id: 'avocado' },
  { icon: '🥝', id: 'kiwi' },
  { icon: '🍑', id: 'peach' },
  { icon: '🍋', id: 'lemon' },
  { icon: '🥥', id: 'coconut' },
  { icon: '🍅', id: 'tomato' },
  { icon: '🧅', id: 'onion' },
  { icon: '🥔', id: 'potato' },
  { icon: '🥕', id: 'carrot' },
  { icon: '🍆', id: 'brinjal' },
  { icon: '🥬', id: 'spinach' },
  { icon: '🌶️', id: 'chili' },
  { icon: '🥦', id: 'broccoli' },
  { icon: '🥒', id: 'cucumber' },
  { icon: '🧄', id: 'garlic' },
  { icon: '🫚', id: 'ginger' },
  { icon: '🌽', id: 'corn' },
  { icon: '🍄', id: 'mushroom' },
  { icon: '🫑', id: 'capsicum' },
  { icon: '🍪', id: 'oreo' },
  { icon: '🥨', id: 'pretzel' },
  { icon: '🍟', id: 'lays' },
  { icon: '🍿', id: 'act2' },
  { icon: '🍫', id: 'cadbury' },
  { icon: '🍬', id: 'candy' },
  { icon: '🍞', id: 'bread' },
  { icon: '🥚', id: 'eggs' },
  { icon: '🧀', id: 'cheese' },
  { icon: '🥛', id: 'milk' },
  { icon: '🥤', id: 'soda' },
  { icon: '☕', id: 'nescafe' },
  { icon: '🍵', id: 'tea' },
  { icon: '🥣', id: 'cereal' },
  { icon: '🥫', id: 'maggi' },
  { icon: '🧃', id: 'juice' },
  { icon: '🧼', id: 'soap' },
  { icon: '🧻', id: 'tissue' },
  { icon: '🧴', id: 'lotion' },
  { icon: '🪥', id: 'brush' },
  { icon: '🪮', id: 'comb' },
  { icon: '🧺', id: 'laundry' },
  { icon: '🧹', id: 'broom' },
  { icon: '🧽', id: 'sponge' },
  { icon: '🕯️', id: 'candle' },
  { icon: '🔋', id: 'battery' },
  { icon: '🍽️', id: 'plates' },
  { icon: '🧂', id: 'salt' },
  { icon: '🍯', id: 'honey' },
  { icon: '🌻', id: 'oil' }
];

// Creates an emoji texture via canvas for performance vs loading 50+ images
function createEmojiTexture(emoji) {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  
  // Background
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.roundRect(0, 0, 128, 128, 32);
  ctx.fill();
  
  // Outline/Shadow for depth
  ctx.strokeStyle = '#e5e7eb';
  ctx.lineWidth = 4;
  ctx.stroke();
  
  // Emoji
  ctx.font = '72px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", "Twemoji Mozilla", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(emoji, 64, 72); // Offset y slightly for better visual centering

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function Chip({ position, emoji, index }) {
  const texture = useMemo(() => createEmojiTexture(emoji), [emoji]);
  const ref = useRef();
  
  // Make chips always face somewhat outwards like a billboard
  useFrame(({ camera }) => {
    if (ref.current) {
      ref.current.lookAt(camera.position);
    }
  });

  return (
    <mesh position={position} ref={ref}>
      <planeGeometry args={[1, 1]} />
      <meshStandardMaterial 
        map={texture} 
        transparent={true} 
        roughness={0.4}
        metalness={0.1}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

function SphereScene({ isMobile }) {
  const groupRef = useRef();
  const { viewport } = useThree();
  
  // Dynamic scale based on viewport to fit the window perfectly
  const scale = Math.min(Math.max(viewport.width / 10, 0.8), 2.2);
  
  // Generate Fibonacci sphere points
  const points = useMemo(() => {
    // Reduce items on mobile to save performance
    const activeItems = isMobile ? items.slice(0, Math.floor(items.length * 0.6)) : items;
    const N = activeItems.length;
    const radius = 4.8; // Base radius, scale will handle the responsive sizing
    
    return activeItems.map((item, i) => {
      const y = 1 - (i / (N - 1)) * 2;
      const radiusAtY = Math.sqrt(1 - y * y);
      const theta = i * 2.399963; // Golden angle
      return {
        ...item,
        position: new THREE.Vector3(
          Math.cos(theta) * radiusAtY * radius,
          y * radius,
          Math.sin(theta) * radiusAtY * radius
        )
      };
    });
  }, [isMobile]);

  useFrame((state, delta) => {
    if (groupRef.current) {
      // Auto-rotate slowly
      groupRef.current.rotation.y += delta * 0.15;
      
      // Map scroll to 3D rotation for interactivity
      const scrollY = window.scrollY;
      const targetRotationX = scrollY * 0.0015;
      const targetRotationY = scrollY * 0.0025;
      
      // Smoothly lerp towards the target scroll rotation
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRotationX, 0.08);
      // We don't lerp Y completely because we want the auto-rotation to persist, 
      // but we can add the scroll velocity to it. We'll stick to lerping X for the scroll effect.
    }
  });

  return (
    <group ref={groupRef} scale={scale}>
      {points.map((point, i) => (
        <Chip key={point.id} position={point.position} emoji={point.icon} index={i} />
      ))}
    </group>
  );
}

export function HeroSphere3D() {
  const [isWebGLSupported, setIsWebGLSupported] = useState(true);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check WebGL support
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) setIsWebGLSupported(false);
    } catch (e) {
      setIsWebGLSupported(false);
    }

    // Check reduced motion
    const motionMq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(motionMq.matches);
    const motionListener = (e) => setPrefersReducedMotion(e.matches);
    motionMq.addEventListener('change', motionListener);

    // Check mobile
    const mobileMq = window.matchMedia('(max-width: 768px)');
    setIsMobile(mobileMq.matches);
    const mobileListener = (e) => setIsMobile(e.matches);
    mobileMq.addEventListener('change', mobileListener);

    return () => {
      motionMq.removeEventListener('change', motionListener);
      mobileMq.removeEventListener('change', mobileListener);
    };
  }, []);

  if (!isWebGLSupported || prefersReducedMotion) {
    return <TagSphereFallback />;
  }

  return (
    <div className="relative w-full h-full touch-none">
      <Suspense fallback={<div className="w-full h-full flex items-center justify-center opacity-50">Loading 3D Experience...</div>}>
        <Canvas camera={{ position: [0, 0, 9], fov: 45 }} gl={{ antialias: true, alpha: true }}>
          <ambientLight intensity={1.5} />
          <directionalLight position={[10, 10, 10]} intensity={1} castShadow />
          <Environment preset="city" />
          
          {/* Subtle depth-of-field fog effect for far chips */}
          <fog attach="fog" args={['#F7F8FA', 7, 14]} />
          
          <SphereScene isMobile={isMobile} />
          
          <OrbitControls 
            enableZoom={false} 
            enablePan={false}
            enableDamping={true}
            dampingFactor={0.05}
            rotateSpeed={0.5}
          />
        </Canvas>
      </Suspense>
    </div>
  );
}
