import React, { useState, useEffect, Suspense } from 'react';
import { X } from 'lucide-react';
import Button from '../ui/Button';

interface IconSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onIconSelect: (icon: string) => void;
  currentIcon: string;
}

// Lista de ícones disponíveis
const availableIcons = [
  'FileText', 'Type', 'Image', 'Video', 'Mic', 'Target', 'HelpCircle', 
  'AlignLeft', 'List', 'Grid', 'Book', 'Users', 'Settings', 'Star'
];

// Componente de ícone lazy com fallback
const LazyIcon = React.lazy(({ iconName }: { iconName: string }) => 
  import(`lucide-react/dist/esm/icons/${iconName}.js`)
    .then(module => ({ default: module.default }))
    .catch(() => ({ default: () => <div className="w-8 h-8 bg-gray-300 rounded" /> }))
);

// Componente de fallback para carregamento de ícones
const IconFallback = () => (
  <div className="w-8 h-8 bg-gray-200 rounded animate-pulse" />
);

export default function IconSelector({ isOpen, onClose, onIconSelect, currentIcon }: IconSelectorProps) {
  const [loadedIcons, setLoadedIcons] = useState<Record<string, boolean>>({});

  // Carregar ícones sob demanda
  useEffect(() => {
    if (isOpen) {
      const newLoadedIcons = { ...loadedIcons };
      availableIcons.forEach(iconName => {
        if (!newLoadedIcons[iconName]) {
          newLoadedIcons[iconName] = true;
        }
      });
      setLoadedIcons(newLoadedIcons);
    }
  }, [isOpen, loadedIcons]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Escolher Ícone</h3>
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="p-1 hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>
        
        <div className="p-4">
          <div className="grid grid-cols-4 gap-3">
            {availableIcons.map((iconName) => (
              <button
                key={iconName}
                onClick={() => {
                  onIconSelect(iconName);
                  onClose();
                }}
                className={`p-4 border rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 text-center ${
                  currentIcon === iconName ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' : 'border-gray-200'
                }`}
              >
                <Suspense fallback={<IconFallback />}>
                  <LazyIcon iconName={iconName} />
                </Suspense>
                <div className="text-xs text-gray-600 mt-2 font-medium">{iconName}</div>
              </button>
            ))}
          </div>
        </div>
        
        <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          <Button
            onClick={onClose}
            variant="outline"
            size="md"
            className="w-full"
          >
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  );
} 