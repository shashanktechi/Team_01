import React from 'react';

export function BrandStamp({ 
  className = '', 
  animateThump = false 
}) {
  return (
    <div className={`relative inline-flex items-center justify-center ${animateThump ? 'animate-thump' : ''} ${className}`}>
      <svg 
        viewBox="0 0 100 100" 
        className="w-full h-full text-primary" 
        fill="currentColor"
        style={{
          filter: animateThump ? 'drop-shadow(0px 0px 2px currentColor)' : 'none'
        }}
      >
        {/* Slightly irregular outer ring (wobble) */}
        <path 
          d="M 50,5 C 23,4 3,24 5,50 C 4,77 24,97 50,95 C 76,96 97,76 95,50 C 96,23 77,3 50,5 Z M 50,12 C 72,10 88,27 88,50 C 89,72 73,88 50,88 C 28,89 12,73 12,50 C 11,28 27,12 50,12 Z" 
        />
        
        {/* Wheat/basket center silhouette */}
        <path d="M40 65 L45 75 L55 75 L60 65 Z" />
        <path d="M45 60 C35 50 30 40 45 40 C45 40 50 50 45 60 Z" />
        <path d="M55 60 C65 50 70 40 55 40 C55 40 50 50 55 60 Z" />
        <path d="M50 63 C45 45 50 30 50 30 C50 30 55 45 50 63 Z" />

        {/* Curved stencil text QUICK CART */}
        <path id="curve" d="M 20 50 A 30 30 0 0 1 80 50" fill="transparent" />
        <text className="font-display font-black text-[14px] tracking-wider" fill="currentColor">
          <textPath href="#curve" startOffset="50%" textAnchor="middle">
            QUICK CART
          </textPath>
        </text>

        {/* Faint offset/double-print effect for the rubber stamp realism */}
        <g opacity="0.3" transform="translate(1, 1)">
          <path 
            d="M 50,5 C 23,4 3,24 5,50 C 4,77 24,97 50,95 C 76,96 97,76 95,50 C 96,23 77,3 50,5 Z M 50,12 C 72,10 88,27 88,50 C 89,72 73,88 50,88 C 28,89 12,73 12,50 C 11,28 27,12 50,12 Z" 
          />
        </g>
      </svg>
      
      {/* CSS Animation for thump */}
      <style>{`
        @keyframes thump {
          0% { transform: scale(2) rotate(-15deg); opacity: 0; }
          40% { transform: scale(0.9) rotate(5deg); opacity: 1; }
          60% { transform: scale(1.05) rotate(-2deg); }
          100% { transform: scale(1) rotate(0deg); }
        }
        @media (prefers-reduced-motion: no-preference) {
          .animate-thump {
            animation: thump 0.4s cubic-bezier(0.25, 1, 0.5, 1) forwards;
          }
        }
      `}</style>
    </div>
  );
}
