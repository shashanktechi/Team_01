import React from 'react';

const Card = React.forwardRef(({ className = '', ...props }, ref) => (
  <div
    ref={ref}
    className={`bg-surface rounded-xl border border-border shadow-sm ${className}`}
    {...props}
  />
));
Card.displayName = "Card";

const CardHeader = React.forwardRef(({ className = '', ...props }, ref) => (
  <div
    ref={ref}
    className={`flex flex-col space-y-1.5 p-6 ${className}`}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef(({ className = '', ...props }, ref) => (
  <h3
    ref={ref}
    className={`font-display font-bold text-2xl text-ink tracking-tight ${className}`}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef(({ className = '', ...props }, ref) => (
  <p
    ref={ref}
    className={`font-body text-sm text-ink-muted ${className}`}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef(({ className = '', ...props }, ref) => (
  <div ref={ref} className={`p-6 pt-0 ${className}`} {...props} />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef(({ className = '', ...props }, ref) => (
  <div
    ref={ref}
    className={`flex items-center p-6 pt-0 ${className}`}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
