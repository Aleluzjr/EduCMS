import React, { useState } from 'react';
import { Field } from '../../types';
import Button from '../ui/Button';
import { Eye, EyeOff, Code } from 'lucide-react';

interface HtmlFieldProps {
  field: Field;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
}

export default function HtmlField({ field, value, onChange, error, disabled }: HtmlFieldProps) {
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const inputId = `field-${field.id}`;

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  const togglePreviewMode = () => {
    setIsPreviewMode(!isPreviewMode);
  };

  // Função para sanitizar HTML básico (em produção, usar uma biblioteca como DOMPurify)
  const sanitizeHtml = (html: string): string => {
    // Remove scripts e tags perigosas
    const dangerousTags = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;
    const dangerousAttributes = /on\w+\s*=/gi;
    
    let sanitized = html.replace(dangerousTags, '');
    sanitized = sanitized.replace(dangerousAttributes, 'data-removed-');
    
    return sanitized;
  };

  const renderPreview = () => {
    if (!value) {
      return <div className="text-gray-400 italic">Nenhum conteúdo para visualizar</div>;
    }

    const sanitizedHtml = sanitizeHtml(value);
    
    return (
      <div 
        className="prose prose-sm max-w-none border border-gray-200 rounded-lg p-4 bg-white"
        dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
      />
    );
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700">
          {field.label}
          {field.required && <span className="text-red-500 ml-1">*</span>}
        </label>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={togglePreviewMode}
          leftIcon={isPreviewMode ? <Code className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        >
          {isPreviewMode ? 'Editar' : 'Visualizar'}
        </Button>
      </div>
      
      {isPreviewMode ? (
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 min-h-[200px]">
          {renderPreview()}
        </div>
      ) : (
        <>
          <textarea
            id={inputId}
            name={field.name}
            value={value}
            onChange={handleChange}
            rows={field.rows || 8}
            placeholder={field.placeholder || 'Digite o HTML aqui...'}
            required={field.required}
            disabled={disabled}
            maxLength={field.validation?.maxLength}
            minLength={field.validation?.minLength}
            className={`w-full px-3 py-2 border rounded-lg font-mono text-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              error 
                ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
            } ${disabled ? 'bg-gray-50 cursor-not-allowed' : ''}`}
            aria-describedby={error ? `${inputId}-error` : undefined}
          />
          
          <div className="mt-2 text-xs text-gray-500">
            <p>Dica: Use HTML válido. Tags perigosas como &lt;script&gt; serão removidas automaticamente.</p>
            {field.validation?.maxLength && (
              <p className="mt-1">
                {value.length}/{field.validation.maxLength} caracteres
              </p>
            )}
          </div>
        </>
      )}
      
      {error && (
        <div id={`${inputId}-error`} className="flex items-center mt-2 text-sm text-red-600">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}
    </div>
  );
}
