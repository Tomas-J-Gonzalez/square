import React, { useState } from 'react';
import Icon from './Icon';

const PasswordInput = ({
  id,
  name,
  value,
  onChange,
  placeholder,
  className = '',
  error,
  'aria-describedby': ariaDescribedby,
  required = false,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="relative">
      <input
        type={showPassword ? 'text' : 'password'}
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full px-4 py-3 pr-12 border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent ${
          error ? 'border-red-300' : 'border-gray-300'
        } ${className}`}
        aria-describedby={ariaDescribedby}
        required={required}
        {...props}
      />
      <button
        type="button"
        onClick={togglePasswordVisibility}
        className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700 focus:outline-none focus:text-gray-700"
        aria-label={showPassword ? 'Hide password' : 'Show password'}
      >
        <Icon 
          name={showPassword ? 'eye-slash' : 'eye'} 
          style="solid" 
          size="sm" 
          aria-hidden="true"
        />
      </button>
    </div>
  );
};

export default PasswordInput;
