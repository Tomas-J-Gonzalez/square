import React from 'react';

const Icon = ({ 
  name, 
  style = 'solid', 
  size = 'md', 
  className = '', 
  'aria-label': ariaLabel,
  'aria-hidden': ariaHidden = true,
  ...props 
}) => {
  // Validate props
  if (!name) {
    console.warn('Icon component requires a name prop');
    return null;
  }

  // Size mapping
  const sizeMap = {
    xs: 'text-xs',
    sm: 'text-sm', 
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl',
    '3xl': 'text-3xl'
  };

  // Style mapping
  const styleMap = {
    solid: 'fas',
    regular: 'far',
    light: 'fal',
    brands: 'fab'
  };

  const iconClass = styleMap[style] || 'fas';
  const sizeClass = sizeMap[size] || 'text-base';

  // Generate aria-label if not provided but name is available
  const label = ariaLabel || `${name} icon`;

  return (
    <i
      className={`${iconClass} fa-${name} ${sizeClass} ${className}`}
      aria-label={ariaHidden ? undefined : label}
      aria-hidden={ariaHidden}
      role={ariaHidden ? 'presentation' : 'img'}
      {...props}
    />
  );
};

export default Icon;
