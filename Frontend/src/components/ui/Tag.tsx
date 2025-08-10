import React from 'react';

export interface TagProps {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  removable?: boolean;
  onRemove?: () => void;
}

const Tag: React.FC<TagProps> = ({
  variant = 'default',
  size = 'md',
  children,
  className = '',
  onClick,
  removable = false,
  onRemove
}) => {
  const baseClasses = 'inline-flex items-center font-medium rounded-full transition-colors duration-200';
  
  const variantClasses = {
    default: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
    success: 'bg-green-100 text-green-800 hover:bg-green-200',
    warning: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
    danger: 'bg-red-100 text-red-800 hover:bg-red-200',
    info: 'bg-blue-100 text-blue-800 hover:bg-blue-200'
  };
  
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-sm'
  };
  
  const interactiveClasses = onClick ? 'cursor-pointer' : '';
  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${interactiveClasses} ${className}`;
  
  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      e.stopPropagation();
      onClick();
    }
  };
  
  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onRemove) {
      onRemove();
    }
  };
  
  return (
    <span className={classes} onClick={handleClick}>
      {children}
      {removable && onRemove && (
        <button
          onClick={handleRemove}
          className="ml-1.5 -mr-1 h-4 w-4 rounded-full inline-flex items-center justify-center text-current hover:bg-current hover:bg-opacity-20 transition-colors"
          aria-label="Remover tag"
        >
          <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      )}
    </span>
  );
};

export default Tag; 