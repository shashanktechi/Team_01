import React from 'react';

export function Badge({ status, variant, className = '', children }) {
  let bgColor = 'bg-ink-muted/10';
  let textColor = 'text-ink-muted';
  
  if (variant === 'kraft' || variant === 'chalk' || variant === 'outline') {
    bgColor = 'bg-transparent border border-border';
    textColor = 'text-ink';
  } else if (variant === 'marigold' || variant === 'warning') {
    bgColor = 'bg-warning/10';
    textColor = 'text-warning';
  } else if (variant === 'primary' || variant === 'success') {
    bgColor = 'bg-primary/10';
    textColor = 'text-primary-dark';
  } else {
    const normalizedStatus = typeof status === 'string' ? status.toUpperCase() : '';
    if (['APPROVED', 'DELIVERED', 'COMPLETED', 'OPEN', 'ACCEPTED', 'READY'].includes(normalizedStatus)) {
      bgColor = 'bg-primary/10';
      textColor = 'text-primary-dark';
    } else if (['PENDING', 'PREPARING', 'PROCESSING', 'UNDER REVIEW', 'OUT_FOR_DELIVERY'].includes(normalizedStatus)) {
      bgColor = 'bg-warning/10';
      textColor = 'text-warning';
    } else if (['REJECTED', 'CANCELLED', 'CLOSED', 'OUT_OF_STOCK', 'REFUNDED'].includes(normalizedStatus)) {
      bgColor = 'bg-danger/10';
      textColor = 'text-danger';
    }
  }

  return (
    <span 
      className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor} ${textColor} ${className}`}
    >
      {children || status}
    </span>
  );
}
