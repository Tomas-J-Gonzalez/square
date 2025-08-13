import React from 'react';

/**
 * Card component that uses design tokens via Tailwind classes
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Card content
 * @param {string} props.className - Additional CSS classes
 * @param {Object} props...rest - Additional props to pass to the card element
 */
const Card = ({ children, className = '', ...rest }) => {
  const baseClasses = [
    'bg-background-surface',
    'border',
    'border-border-default',
    'rounded-md',
    'shadow-sm',
    'p-24',
    'transition-all',
    'duration-200',
    'hover:shadow-md',
    'hover:border-border-strong'
  ];

  const combinedClasses = [...baseClasses, className].join(' ');

  return (
    <div className={combinedClasses} {...rest}>
      {children}
    </div>
  );
};

export default Card;
