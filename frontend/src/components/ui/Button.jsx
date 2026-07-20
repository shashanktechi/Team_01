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
  
  const baseStyles = "relative inline-flex items-center justify-center font-bold transition-colors duration-150 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none rounded";
  
  // Custom price-tag clip path for primary/danger buttons
  const tagClipPath = {
    clipPath: "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 0 100%)"
  };

  const variants = {
    primary: "bg-primary text-surface hover:brightness-95",
    secondary: "border-2 border-ink text-ink hover:bg-ink/5",
    danger: "bg-error text-surface hover:brightness-95",
    outline: "border border-border text-ink hover:bg-ink/5",
    ghost: "text-ink hover:bg-ink/5"
  };

  const sizes = {
    default: "h-12 px-6 py-3",
    sm: "h-9 px-4 py-2 text-sm",
    lg: "h-14 px-8 py-4 text-lg",
    icon: "h-10 w-10"
  };

  const isTagShape = variant === 'primary' || variant === 'danger';

  return (
    <button
      ref={ref}
      disabled={disabled || isLoading}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      style={isTagShape ? tagClipPath : {}}
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
