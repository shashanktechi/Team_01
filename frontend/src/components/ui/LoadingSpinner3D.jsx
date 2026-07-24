import React from 'react';
import { Loader2 } from 'lucide-react';

export function LoadingSpinner3D({ size = 48, className = '' }) {
  return (
    <div
      className={`flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
      role="status"
      aria-label="Loading"
    >
      <Loader2 
        size={size * 0.8} 
        className="animate-spin"
        style={{ color: 'var(--color-primary)' }} 
      />
    </div>
  );
}

export default LoadingSpinner3D;
