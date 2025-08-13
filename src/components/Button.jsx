import React from 'react';

/**
 * Button component that uses design tokens via Tailwind classes
 * @param {Object} props - Component props
 * @param {string} props.variant - Button variant: 'primary', 'secondary', 'disabled'
 * @param {string} props.size - Button size: 'sm', 'md', 'lg'
 * @param {boolean} props.disabled - Whether the button is disabled
 * @param {React.ReactNode} props.children - Button content
 * @param {string} props.className - Additional CSS classes
 * @param {React.ElementType} props.as - Element type to render (default: 'button')
 * @param {Object} props...rest - Additional props to pass to the button element
 */
const Button = ({ 
  variant = 'primary', 
  size = 'md', 
  disabled = false, 
  children, 
  className = '', 
  as: Component = 'button',
  ...rest 
}) => {
  // Base button classes
  const baseClasses = [
    'inline-flex',
    'items-center',
    'justify-center',
    'font-semibold',
    'transition-all',
    'duration-200',
    'ease-in-out',
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-offset-2',
    'disabled:cursor-not-allowed',
    'disabled:opacity-50'
  ];

  // Size classes
  const sizeClasses = {
    sm: [
      'px-16',
      'py-8',
      'text-body-sm',
      'rounded-full'
    ],
    md: [
      'px-24',
      'py-12',
      'text-body-md',
      'rounded-full'
    ],
    lg: [
      'px-32',
      'py-16',
      'text-body-lg',
      'rounded-full'
    ]
  };

  // Variant classes
  const variantClasses = {
    primary: [
      'bg-background-brand-brand-primary',
      'text-content-knockout',
      'hover:bg-background-brand-brand-primary-hover',
      'active:bg-background-brand-brand-primary-active',
      'focus:ring-background-brand-brand-primary-focus',
      'shadow-sm'
    ],
    secondary: [
      'bg-background-surface',
      'text-content-default',
      'border',
      'border-border-default',
      'hover:bg-background-surface-hover',
      'hover:border-border-strong',
      'focus:ring-border-focus',
      'shadow-xs'
    ],
    disabled: [
      'bg-background-surface-disabled',
      'text-white',
      'border',
      'border-border-utility-deactivated',
      'cursor-not-allowed'
    ]
  };

  // Determine which variant to use
  const effectiveVariant = disabled ? 'disabled' : variant;

  // Combine all classes
  const combinedClasses = [
    ...baseClasses,
    ...sizeClasses[size],
    ...variantClasses[effectiveVariant],
    className
  ].join(' ');

  return (
    <Component
      className={combinedClasses}
      disabled={disabled}
      {...rest}
    >
      {children}
    </Component>
  );
};

export default Button;
