'use client';

import { ReactNode } from 'react';
import Link from 'next/link';

interface CardProps {
  children: ReactNode;
  href?: string;
  className?: string;
  onClick?: () => void;
}

export default function Card({ children, href, className = '', onClick }: CardProps) {
  const baseClasses = 'card';
  const classes = `${baseClasses} ${className}`;

  if (href) {
    return (
      <Link href={href} className={`${classes} card-link`}>
        <div className="card-content">
          {children}
        </div>
      </Link>
    );
  }

  if (onClick) {
    return (
      <button onClick={onClick} className={`${classes} card-link w-full text-left`}>
        <div className="card-content">
          {children}
        </div>
      </button>
    );
  }

  return (
    <div className={classes}>
      <div className="card-content">
        {children}
      </div>
    </div>
  );
}

interface CardIconProps {
  children: ReactNode;
  backgroundColor?: string;
  className?: string;
}

export function CardIcon({ children, backgroundColor = '#ec4899', className = '' }: CardIconProps) {
  return (
    <div 
      className={`card-icon ${className}`}
      style={{ backgroundColor }}
    >
      {children}
    </div>
  );
}

interface CardTitleProps {
  children: ReactNode;
  className?: string;
}

export function CardTitle({ children, className = '' }: CardTitleProps) {
  return (
    <h3 className={`card-title ${className}`}>
      {children}
    </h3>
  );
}

interface CardDescriptionProps {
  children: ReactNode;
  className?: string;
}

export function CardDescription({ children, className = '' }: CardDescriptionProps) {
  return (
    <p className={`card-description ${className}`}>
      {children}
    </p>
  );
}

interface CardActionProps {
  children: ReactNode;
  className?: string;
}

export function CardAction({ children, className = '' }: CardActionProps) {
  return (
    <div className={`card-action ${className}`}>
      {children}
    </div>
  );
}
