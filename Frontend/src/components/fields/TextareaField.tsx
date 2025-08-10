import React from 'react';
import { Field } from '../../types';

interface TextareaFieldProps {
  field: Field;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
}

export default function TextareaField({ field, value, onChange, error, disabled }: TextareaFieldProps) {
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  const rows = field.rows || 4;
  const inputId = `field-${field.id}`;

  return (
    <div className="w-full">
      <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-2">
        {field.label}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <textarea
        id={inputId}
        name={field.name}
        value={value}
        onChange={handleChange}
        rows={rows}
        placeholder={field.placeholder}
        required={field.required}
        disabled={disabled}
        maxLength={field.validation?.maxLength}
        minLength={field.validation?.minLength}
        className={`w-full px-3 py-2 border rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
          error 
            ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
            : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
        } ${disabled ? 'bg-gray-50 cursor-not-allowed' : ''}`}
        aria-describedby={error ? `${inputId}-error` : undefined}
      />
      
      {error && (
        <div id={`${inputId}-error`} className="flex items-center mt-2 text-sm text-red-600">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}
      
      {field.validation?.maxLength && (
        <p className="mt-1 text-xs text-gray-500">
          {value.length}/{field.validation.maxLength} caracteres
        </p>
      )}
    </div>
  );
}
