// src/components/common/Button.jsx
import React from 'react';

const Button = ({ 
  children, 
  onClick, 
  type = 'button', 
  variant = 'primary', 
  size = 'md',
  fullWidth = false,
  disabled = false,
  loading = false,
  icon = null,
  className = ''
}) => {
  const baseClasses = 'font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2';
  
  const variantClasses = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800 disabled:bg-indigo-300',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 active:bg-gray-400 disabled:bg-gray-100',
    danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 disabled:bg-red-300',
    success: 'bg-green-600 text-white hover:bg-green-700 active:bg-green-800 disabled:bg-green-300',
    outline: 'border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 active:bg-indigo-100 disabled:border-indigo-300 disabled:text-indigo-300',
    ghost: 'text-gray-700 hover:bg-gray-100 active:bg-gray-200 disabled:text-gray-400'
  };
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };
  
  const widthClass = fullWidth ? 'w-full' : '';
  const disabledClass = disabled || loading ? 'cursor-not-allowed opacity-60' : 'cursor-pointer';
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${disabledClass} ${className}`}
    >
      {loading && (
        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {!loading && icon && <span>{icon}</span>}
      {children}
    </button>
  );
};

export default Button;