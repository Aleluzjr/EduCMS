import React from 'react';
import { Upload, X } from 'lucide-react';

interface MediaFieldProps {
  label: string;
  required?: boolean;
  value: any;
  uploading: boolean;
  onUpload: (file: File) => void;
  onRemove: () => void;
}

export default function MediaField({ label, required, value, uploading, onUpload, onRemove }: MediaFieldProps) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {value?.url ? (
        <div className="border border-gray-300 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Arquivo enviado</span>
            <button onClick={onRemove} className="text-red-600 hover:text-red-700 p-1">
              <X className="w-4 h-4" />
            </button>
          </div>
          {value.mimetype?.startsWith('image/') ? (
            <img src={value.url} alt="Preview" className="max-w-full h-32 object-cover rounded" />
          ) : (
            <div className="bg-gray-100 p-4 rounded text-center">
              <div className="text-sm text-gray-600">{value.originalName}</div>
              <div className="text-xs text-gray-500">{(value.size / 1024 / 1024).toFixed(2)} MB</div>
            </div>
          )}
        </div>
      ) : (
        <div>
          <input
            type="file"
            accept={"image/*, video/*, audio/*"}
            onChange={e => {
              const file = e.target.files?.[0];
              if (file) onUpload(file);
            }}
            className="hidden"
            id="media-upload"
            disabled={uploading}
          />
          <label htmlFor="media-upload" className="border-2 border-dashed border-gray-300 rounded-lg p-6 cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors flex flex-col items-center justify-center">
            <Upload className="w-8 h-8 text-gray-400 mb-2" />
            <span className="text-sm text-gray-600">{uploading ? 'Enviando...' : 'Clique para enviar arquivo'}</span>
            <span className="text-xs text-gray-500 mt-1">Imagens, vídeos ou áudios (max 10MB)</span>
          </label>
        </div>
      )}
    </div>
  );
}
