import React from 'react';

/**
 * Section component that uses design tokens via Tailwind classes
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Section content
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.title - Optional section title
 * @param {string} props.subtitle - Optional section subtitle
 * @param {Object} props...rest - Additional props to pass to the section element
 */
const Section = ({ 
  children, 
  className = '', 
  title, 
  subtitle, 
  ...rest 
}) => {
  const baseClasses = [
    'py-64',
    'px-16',
    'sm:px-40',
    'md:px-80',
    'lg:px-80',
    'xl:px-80',
    'xxl:px-128'
  ];

  const combinedClasses = [...baseClasses, className].join(' ');

  return (
    <section className={combinedClasses} {...rest}>
      <div className="container mx-auto">
        {(title || subtitle) && (
          <div className="text-center mb-48">
            {title && (
              <h2 className="text-heading-2 text-content-default mb-16">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-body-lg text-content-subtle max-w-3xl mx-auto">
                {subtitle}
              </p>
            )}
          </div>
        )}
        {children}
      </div>
    </section>
  );
};

export default Section;
