import React, { useState } from 'react';
import { Image, Video, Mic, FileText, ChevronDown } from 'lucide-react';
import { MediaType } from '../../types';
import Button from '../ui/Button';

// Mapeamento dos tipos de mídia para as chaves do sistema
const mediaTypeMapping: Record<string, MediaType> = {
  images: 'image',
  videos: 'video',
  audios: 'audio',
  files: 'document'
};

// Tipos de mídia disponíveis
const mediaTypes = {
  images: {
    label: 'Imagens',
    extensions: ['JPEG', 'PNG', 'GIF', 'SVG', 'TIFF', 'ICO', 'DJVU'],
    icon: Image,
    type: 'image' as MediaType
  },
  videos: {
    label: 'Vídeos',
    extensions: ['MPEG', 'MP4', 'Quicktime', 'WMV', 'AVI', 'FLV'],
    icon: Video,
    type: 'video' as MediaType
  },
  audios: {
    label: 'Áudios',
    extensions: ['MP3', 'WAV', 'OGG'],
    icon: Mic,
    type: 'audio' as MediaType
  },
  files: {
    label: 'Arquivos',
    extensions: ['PDF', 'DOC', 'DOCX', 'XLS', 'XLSX', 'PPT', 'PPTX'],
    icon: FileText,
    type: 'document' as MediaType
  }
};

interface MediaTypeSelectorProps {
  value: MediaType[];
  onChange: (value: MediaType[]) => void;
  label?: string;
}

export default function MediaTypeSelector({ value, onChange, label }: MediaTypeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggleType = (type: string) => {
    const mediaType = mediaTypeMapping[type];
    if (value.includes(mediaType)) {
      onChange(value.filter(t => t !== mediaType));
    } else {
      onChange([...value, mediaType]);
    }
  };

  const handleSelectAll = () => {
    if (value.length === Object.keys(mediaTypes).length) {
      onChange([]);
    } else {
      onChange(Object.values(mediaTypeMapping));
    }
  };

  const getDisplayText = () => {
    if (value.length === 0) return 'Nenhum tipo selecionado';
    if (value.length === Object.keys(mediaTypes).length) return 'Todos os tipos';
    
    const selectedLabels = value.map(type => {
      const key = Object.keys(mediaTypeMapping).find(k => mediaTypeMapping[k] === type);
      return key ? mediaTypes[key as keyof typeof mediaTypes]?.label : '';
    }).filter(Boolean);
    return selectedLabels.join(', ');
  };

  const isAllSelected = value.length === Object.keys(mediaTypes).length;
  const isPartiallySelected = value.length > 0 && value.length < Object.keys(mediaTypes).length;

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label || 'Tipos de mídia permitidos'}
      </label>
      
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="outline"
        size="md"
        rightIcon={<ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />}
        className="w-full justify-between"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="text-gray-900">{getDisplayText()}</span>
      </Button>

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
              const isSelected = value.includes(config.type);
              return (
                <label key={type} className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors">
                  <div className={`w-4 h-4 border-2 rounded flex items-center justify-center ${
                    isSelected ? 'bg-blue-600 border-blue-600' : 'border-gray-300'
                  }`}>
                    {isSelected && (
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
                    checked={isSelected}
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