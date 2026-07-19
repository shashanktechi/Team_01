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
  
  const baseStyles = "inline-flex items-center justify-center rounded-xl font-headline-sm transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none";
  
  const variants = {
    primary: "bg-primary text-on-primary hover:bg-primary-container hover:text-on-primary-container shadow-sm",
    secondary: "bg-secondary-container text-on-secondary-container hover:bg-secondary-container/80",
    outline: "border-2 border-outline-variant text-primary hover:bg-surface-container-low",
    ghost: "text-primary hover:bg-surface-container-low"
  };

  const sizes = {
    default: "h-12 px-6 py-3",
    sm: "h-9 px-4 py-2 text-sm",
    lg: "h-14 px-8 py-4 text-lg",
    icon: "h-10 w-10"
  };

  return (
    <button
      ref={ref}
      disabled={disabled || isLoading}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
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
