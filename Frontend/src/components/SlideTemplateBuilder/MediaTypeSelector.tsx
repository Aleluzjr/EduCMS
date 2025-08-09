import React, { useState } from 'react';
import { Image, Video, Mic, FileText } from 'lucide-react';

// Tipos de mídia disponíveis
const mediaTypes = {
  images: {
    label: 'Imagens',
    extensions: ['JPEG', 'PNG', 'GIF', 'SVG', 'TIFF', 'ICO', 'DJVU'],
    icon: Image
  },
  videos: {
    label: 'Vídeos',
    extensions: ['MPEG', 'MP4', 'Quicktime', 'WMV', 'AVI', 'FLV'],
    icon: Video
  },
  audios: {
    label: 'Áudios',
    extensions: ['MP3', 'WAV', 'OGG'],
    icon: Mic
  },
  files: {
    label: 'Arquivos',
    extensions: ['PDF', 'DOC', 'DOCX', 'XLS', 'XLSX', 'PPT', 'PPTX'],
    icon: FileText
  }
};

interface MediaTypeSelectorProps {
  value: string[];
  onChange: (value: string[]) => void;
  label?: string;
}

export default function MediaTypeSelector({ value, onChange, label }: MediaTypeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggleType = (type: string) => {
    if (value.includes(type)) {
      onChange(value.filter(t => t !== type));
    } else {
      onChange([...value, type]);
    }
  };

  const handleSelectAll = () => {
    if (value.length === Object.keys(mediaTypes).length) {
      onChange([]);
    } else {
      onChange(Object.keys(mediaTypes));
    }
  };

  const getDisplayText = () => {
    if (value.length === 0) return 'Nenhum tipo selecionado';
    if (value.length === Object.keys(mediaTypes).length) return 'Todos os tipos';
    
    const selectedLabels = value.map(type => mediaTypes[type as keyof typeof mediaTypes]?.label).filter(Boolean);
    return selectedLabels.join(', ');
  };

  const isAllSelected = value.length === Object.keys(mediaTypes).length;
  const isPartiallySelected = value.length > 0 && value.length < Object.keys(mediaTypes).length;

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label || 'Tipos de mídia permitidos'}
      </label>
      
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <span className="text-gray-900">{getDisplayText()}</span>
        <svg className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
          <div className="p-3 border-b border-gray-200">
            <label className="flex items-center space-x-2 cursor-pointer">
              <div className={`w-4 h-4 border-2 rounded flex items-center justify-center ${
                isAllSelected ? 'bg-blue-600 border-blue-600' : 
                isPartiallySelected ? 'bg-blue-600 border-blue-600' : 'border-gray-300'
              }`}>
                {isAllSelected ? (
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : isPartiallySelected ? (
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3 10h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                ) : null}
              </div>
              <span className="text-sm font-medium text-gray-900">Todos os tipos</span>
            </label>
            <input
              type="checkbox"
              checked={isAllSelected}
              onChange={handleSelectAll}
              className="sr-only"
            />
          </div>
          
          <div className="p-3 space-y-2">
            {Object.entries(mediaTypes).map(([type, config]) => {
              const IconComponent = config.icon;
              return (
                <label key={type} className="flex items-center space-x-3 cursor-pointer">
                  <div className={`w-4 h-4 border-2 rounded flex items-center justify-center ${
                    value.includes(type) ? 'bg-blue-600 border-blue-600' : 'border-gray-300'
                  }`}>
                    {value.includes(type) && (
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <IconComponent className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-900">{config.label}</span>
                  </div>
                  <span className="text-xs text-gray-500">({config.extensions.join(', ')})</span>
                  <input
                    type="checkbox"
                    checked={value.includes(type)}
                    onChange={() => handleToggleType(type)}
                    className="sr-only"
                  />
                </label>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
} 