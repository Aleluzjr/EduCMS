import React from 'react';
import { AlertTriangle } from 'lucide-react';
import Button from '../ui/Button';

interface RestoreDraftDialogProps {
  isOpen: boolean;
  onRestore: () => void;
  onIgnore: () => void;
}

export default function RestoreDraftDialog({ isOpen, onRestore, onIgnore }: RestoreDraftDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Rascunho encontrado</h3>
              <p className="text-sm text-gray-600">Deseja restaurar seu trabalho anterior?</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <Button
              onClick={onRestore}
              variant="primary"
              size="md"
              className="w-full"
            >
              Sim, restaurar rascunho
            </Button>
            <Button
              onClick={onIgnore}
              variant="secondary"
              size="md"
              className="w-full"
            >
              Não, começar do zero
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 