import React from 'react';

/**
 * Font Awesome Icon component
 * @param {Object} props - Component props
 * @param {string} props.name - Icon name (e.g., 'home', 'user', 'envelope')
 * @param {string} props.style - Icon style: 'solid', 'regular', 'light', 'thin', 'duotone', 'brands'
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.size - Icon size: 'xs', 'sm', 'md', 'lg', 'xl', '2xl'
 * @param {Object} props...rest - Additional props
 */
const Icon = ({ 
  name, 
  style = 'solid', 
  className = '', 
  size = 'md',
  ...rest 
}) => {
  const sizeClasses = {
    'xs': 'w-12 h-12',
    'sm': 'w-16 h-16',
    'md': 'w-20 h-20',
    'lg': 'w-24 h-24',
    'xl': 'w-32 h-32',
    '2xl': 'w-40 h-40',
  };

  const baseClasses = [
    'inline-block',
    'flex',
    'items-center',
    'justify-center',
    sizeClasses[size] || sizeClasses.md,
    className
  ].join(' ');

  // For now, we'll use a simple approach with Font Awesome classes
  // In a production app, you'd want to import the actual SVG files
  const iconClass = `fa-${style} fa-${name}`;

  return (
    <i className={`${iconClass} ${baseClasses}`} {...rest}></i>
  );
};

export default Icon;
