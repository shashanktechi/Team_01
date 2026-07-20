import React from 'react';
import quickcartLogo from '../../assets/quickcart-logo.png';

export function BrandStamp({ 
  className = '', 
  animateThump = false 
}) {
  return (
    <div className={`relative inline-flex items-center justify-center ${animateThump ? 'animate-thump' : ''} ${className}`}>
      <img 
        src={quickcartLogo} 
        alt="QuickCart for local" 
        className="w-full h-full object-contain"
      />
      
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
