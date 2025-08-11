import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  text?: string;
  fullScreen?: boolean;
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  variant = 'default',
  text,
  fullScreen = false,
  className = ''
}) => {
  // Configurações de tamanho
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };

  // Configurações de cor por variante
  const variantClasses = {
    default: 'border-gray-300 border-t-gray-600',
    primary: 'border-blue-300 border-t-blue-600',
    secondary: 'border-gray-300 border-t-gray-600',
    success: 'border-green-300 border-t-green-600',
    warning: 'border-yellow-300 border-t-yellow-600',
    error: 'border-red-300 border-t-red-600'
  };

  const spinner = (
    <div className={`text-center ${className}`}>
      <div 
        className={`animate-spin rounded-full border-2 border-t-2 ${sizeClasses[size]} ${variantClasses[variant]} mx-auto mb-4`}
        role="status"
        aria-label="Carregando..."
      />
      {text && (
        <p className="text-gray-600 text-sm font-medium">{text}</p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        {spinner}
      </div>
    );
  }

  return spinner;
};

export default LoadingSpinner;
