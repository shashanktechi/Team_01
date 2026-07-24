import React from 'react';
import { Box, Leaf } from 'lucide-react';

const VARIANTS = {
  crate: {
    Icon: Box,
  },
  leaf: {
    Icon: Leaf,
  },
};

export function EmptyState3D({
  variant = 'crate',
  title = 'Nothing here yet',
  description = '',
  action = null,
  className = '',
}) {
  const { Icon } = VARIANTS[variant] || VARIANTS.crate;

  return (
    <div className={`flex flex-col items-center justify-center py-12 px-6 text-center ${className}`}>
      <div className="text-6xl mb-6 flex items-center justify-center w-24 h-24 rounded-full bg-surface border border-border shadow-sm text-ink-muted">
        <Icon size={48} strokeWidth={1.5} />
      </div>

      <h3 className="font-display font-bold text-xl text-ink mb-2">{title}</h3>
      {description && (
        <p className="font-body text-sm text-ink-muted mb-6 max-w-xs">{description}</p>
      )}
      {action && action}
    </div>
  );
}

export default EmptyState3D;
