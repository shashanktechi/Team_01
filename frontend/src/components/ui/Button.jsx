import React from 'react';

export const Button = React.forwardRef(({ 
  className = '', 
  variant = 'primary', 
  size = 'default', 
  isLoading = false, 
  children, 
  disabled, 
  ...props 
}, ref) => {
  
  const baseStyles = [
    'relative inline-flex items-center justify-center font-bold transition-all duration-200',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    'disabled:opacity-50 disabled:pointer-events-none rounded-xl',
    'active:scale-[0.97] active:translate-y-px',
  ].join(' ');
  
  const variants = {
    primary: [
      'bg-[#16A34A] text-white',
      'shadow-[0_0_24px_rgba(22, 163, 74,0.35),0_4px_16px_rgba(22, 163, 74,0.25)]',
      'hover:bg-[#E04B12] hover:shadow-[0_0_32px_rgba(22, 163, 74,0.5),0_8px_24px_rgba(22, 163, 74,0.35)]',
      'hover:-translate-y-0.5',
      'focus-visible:ring-[#16A34A]',
    ].join(' '),
    secondary: [
      'bg-[#22C55E] text-white',
      'shadow-[0_0_20px_rgba(34, 197, 94,0.3)]',
      'hover:bg-[#00B898] hover:shadow-[0_0_28px_rgba(34, 197, 94,0.45)]',
      'hover:-translate-y-0.5',
      'focus-visible:ring-[#22C55E]',
    ].join(' '),
    outline: [
      'border-2 border-[#16A34A] text-[#16A34A] bg-transparent',
      'hover:bg-[#16A34A]/8 hover:-translate-y-0.5',
      'focus-visible:ring-[#16A34A]',
    ].join(' '),
    ghost: [
      'text-ink bg-transparent hover:bg-ink/6',
      'focus-visible:ring-ink',
    ].join(' '),
    danger: [
      'bg-[#E53E3E] text-white',
      'shadow-[0_4px_16px_rgba(229,62,62,0.3)]',
      'hover:bg-[#C53030] hover:-translate-y-0.5',
      'focus-visible:ring-[#E53E3E]',
    ].join(' '),
    // Legacy aliases
    'secondary-outline': 'border-2 border-ink text-ink hover:bg-ink/5 focus-visible:ring-ink',
  };

  const sizes = {
    default: 'h-12 px-6 py-3 text-sm',
    sm: 'h-9 px-4 py-2 text-xs',
    lg: 'h-14 px-8 py-4 text-base',
    icon: 'h-10 w-10 p-0',
  };

  return (
    <button
      ref={ref}
      disabled={disabled || isLoading}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : null}
      {children}
    </button>
  );
});

Button.displayName = 'Button';
