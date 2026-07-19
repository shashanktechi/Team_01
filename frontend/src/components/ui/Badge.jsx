import React from 'react';

export function Badge({ status, variant, className = '', children }) {
  let bgColor = 'bg-ink/10';
  let textColor = 'text-ink';
  
  if (variant === 'kraft') {
    bgColor = 'bg-kraft';
    textColor = 'text-ink';
  } else if (variant === 'chalk') {
    bgColor = 'bg-kraft';
    textColor = 'text-ink';
  } else if (variant === 'marigold') {
    bgColor = 'bg-[#E8A33D]'; // Marigold
    textColor = 'text-ink';
  } else {
    const normalizedStatus = typeof status === 'string' ? status.toUpperCase() : '';
    if (['APPROVED', 'DELIVERED', 'COMPLETED', 'OPEN'].includes(normalizedStatus)) {
      bgColor = 'bg-primary';
      textColor = 'text-surface';
    } else if (['PENDING', 'PREPARING', 'PROCESSING'].includes(normalizedStatus)) {
      bgColor = 'bg-secondary';
      textColor = 'text-ink';
    } else if (['REJECTED', 'CANCELLED', 'CLOSED', 'OUT_OF_STOCK'].includes(normalizedStatus)) {
      bgColor = 'bg-error';
      textColor = 'text-surface';
    }
  }

  return (
    <span 
      className={`inline-flex items-center justify-center px-2 py-0.5 text-xs font-mono font-bold ${bgColor} ${textColor} border border-ink/15 shadow-sm ${className}`}
      style={{
        clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%, 6px 50%)'
      }}
    >
      <span className="w-1.5" />
      {children || status}
    </span>
  );
}
