import React from 'react';
import Icon from './Icon';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  type = 'button',
  onClick,
  className = '',
  'aria-label': ariaLabel,
  ...props
}) => {
  // Base classes
  const baseClasses = [
    'inline-flex',
    'items-center',
    'justify-center',
    'font-semibold',
    'text-decoration-none',
    'border',
    'border-radius-50',
    'cursor-pointer',
    'transition-all',
    'duration-200',
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-offset-2',
    'disabled:cursor-not-allowed',
    'disabled:opacity-50',
    fullWidth ? 'w-full' : '',
    className
  ].filter(Boolean).join(' ');

  // Variant classes
  const variantClasses = {
    primary: [
      'bg-pink-500',
      'text-white',
      'border-pink-500',
      'hover:bg-pink-600',
      'hover:border-pink-600',
      'focus:ring-pink-500',
      'disabled:bg-pink-300',
      'disabled:border-pink-300'
    ],
    secondary: [
      'bg-gray-100',
      'text-gray-900',
      'border-gray-300',
      'hover:bg-gray-200',
      'hover:border-gray-400',
      'focus:ring-gray-500',
      'disabled:bg-gray-50',
      'disabled:border-gray-200'
    ],
    danger: [
      'bg-red-600',
      'text-white',
      'border-red-600',
      'hover:bg-red-700',
      'hover:border-red-700',
      'focus:ring-red-500',
      'disabled:bg-red-300',
      'disabled:border-red-300'
    ],
    outline: [
      'bg-transparent',
      'text-pink-600',
      'border-pink-600',
      'hover:bg-pink-50',
      'focus:ring-pink-500',
      'disabled:bg-transparent',
      'disabled:text-pink-300',
      'disabled:border-pink-300'
    ]
  };

  // Size classes
  const sizeClasses = {
    sm: ['px-3', 'py-1.5', 'text-sm'],
    md: ['px-4', 'py-2', 'text-sm'],
    lg: ['px-6', 'py-3', 'text-base'],
    xl: ['px-8', 'py-4', 'text-lg']
  };

  const allClasses = [
    baseClasses,
    ...variantClasses[variant] || variantClasses.primary,
    ...sizeClasses[size] || sizeClasses.md
  ].join(' ');

  // Handle loading state
  const isDisabled = disabled || loading;

  // Generate aria-label for better accessibility
  const buttonAriaLabel = ariaLabel || (typeof children === 'string' ? children : undefined);

  return (
    <button
      type={type}
      className={allClasses}
      disabled={isDisabled}
      onClick={onClick}
      aria-label={buttonAriaLabel}
      aria-busy={loading}
      {...props}
    >
      {loading && (
        <Icon 
          name="spinner" 
          style="solid" 
          size="sm" 
          className="animate-spin mr-2" 
          aria-hidden="true"
        />
      )}
      
      {!loading && icon && iconPosition === 'left' && (
        <Icon 
          name={icon} 
          style="solid" 
          size="sm" 
          className="mr-2" 
          aria-hidden="true"
        />
      )}
      
      <span className={loading ? 'opacity-0' : ''}>
        {children}
      </span>
      
      {!loading && icon && iconPosition === 'right' && (
        <Icon 
          name={icon} 
          style="solid" 
          size="sm" 
          className="ml-2" 
          aria-hidden="true"
        />
      )}
    </button>
  );
};

export default Button;
