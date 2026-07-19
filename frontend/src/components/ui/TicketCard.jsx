import React from 'react';

export function TicketCard({ 
  children, 
  className = '', 
  expiryTime, 
  ...props 
}) {
  // Calculate tear percentage (0 to 100) based on expiryTime
  let tearPercent = 0;
  
  if (expiryTime) {
    const now = new Date().getTime();
    const expiry = new Date(expiryTime).getTime();
    const hoursLeft = (expiry - now) / (1000 * 60 * 60);
    
    if (hoursLeft <= 6) {
      tearPercent = 100;
    } else if (hoursLeft <= 48) {
      // Linear tear from 48h (0%) to 6h (100%)
      tearPercent = 100 - ((hoursLeft - 6) / 42) * 100;
    } else {
      tearPercent = 0;
    }
    // Clamp between 0 and 100
    tearPercent = Math.max(0, Math.min(100, tearPercent));
  }

  return (
    <div 
      className={`relative bg-surface rounded-lg border border-ink/10 shadow-sm flex flex-col ${className}`}
      {...props}
    >
      <div className="flex-grow">
        {children}
      </div>
      
      {/* Perforated bottom edge */}
      <div className="h-3 w-full relative overflow-hidden mt-auto">
        {/* The intact perforation (transparent circles letting background through) */}
        <div 
          className="absolute inset-0 w-full h-full"
          style={{
            backgroundImage: 'radial-gradient(circle at 6px 100%, transparent 4px, var(--color-surface) 4.5px)',
            backgroundSize: '12px 100%',
            backgroundPosition: 'bottom',
            backgroundRepeat: 'repeat-x',
          }}
        />
        
        {/* The torn edge animation overlay - visually removes the bottom edge as it tears */}
        {expiryTime && (
          <div 
            className="absolute top-0 right-0 h-full bg-background transition-all duration-1000 ease-in-out border-t border-dashed border-ink/20"
            style={{
              width: `${tearPercent}%`,
            }}
          />
        )}
      </div>
    </div>
  );
}
