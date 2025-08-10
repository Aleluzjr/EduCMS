import React from 'react';
import { AlertCircle } from 'lucide-react';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ 
    label, 
    error, 
    helperText, 
    leftIcon, 
    rightIcon, 
    size = 'md', 
    fullWidth = true,
    className = '', 
    id,
    ...props 
  }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    
    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-3 py-2 text-sm',
      lg: 'px-4 py-3 text-base'
    };
    
    const baseClasses = 'border rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
    const stateClasses = error 
      ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
      : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500';
    const widthClasses = fullWidth ? 'w-full' : '';
    
    const classes = `${baseClasses} ${stateClasses} ${sizeClasses[size]} ${widthClasses} ${className}`;
    
    return (
      <div className={fullWidth ? 'w-full' : ''}>
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-2">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              {leftIcon}
            </div>
          )}
          
          <input
            ref={ref}
            id={inputId}
            className={`${classes} ${leftIcon ? 'pl-10' : ''} ${rightIcon ? 'pr-10' : ''}`}
            {...props}
          />
          
          {rightIcon && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              {rightIcon}
            </div>
          )}
        </div>
        
        {error && (
          <div className="flex items-center mt-2 text-sm text-red-600">
            <AlertCircle className="w-4 h-4 mr-1" />
            {error}
          </div>
        )}
        
        {helperText && !error && (
          <p className="mt-2 text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input; 