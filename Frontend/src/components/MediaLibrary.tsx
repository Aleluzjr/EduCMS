import React, { useState, useRef } from 'react';
import { Upload, File, Image as ImageIcon, Video, Music, Trash2, Copy, ExternalLink } from 'lucide-react';
import { ENDPOINTS, apiRequest } from '../config/api';
import { useToastContext } from '../contexts/ToastContext';

export default function MediaLibrary() {
  const [files, setFiles] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { success, error, warning } = useToastContext();

  const handleFileUpload = async (filesToUpload: FileList) => {
    setUploading(true);
    
    const uploadPromises = Array.from(filesToUpload).map(async (file) => {
      const formData = new FormData();
      formData.append('file', file);

      try {
              const response = await apiRequest(ENDPOINTS.UPLOAD, {
        method: 'POST',
        body: formData
      });

        if (!response.ok) throw new Error('Upload failed');
        return await response.json();
      } catch (err) {
        console.error('Erro no upload:', err);
        error('Erro no upload do arquivo');
        return null;
      }
    });

    const results = await Promise.all(uploadPromises);
    const successfulUploads = results.filter(result => result !== null);
    
    setFiles(prev => [...prev, ...successfulUploads]);
    setUploading(false);
    
    if (successfulUploads.length > 0) {
      success(`${successfulUploads.length} arquivo(s) enviado(s) com sucesso`);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  const getFileIcon = (mimetype: string) => {
    if (mimetype.startsWith('image/')) return ImageIcon;
    if (mimetype.startsWith('video/')) return Video;
    if (mimetype.startsWith('audio/')) return Music;
    return File;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    success('URL copiada para a área de transferência');
  };

  const deleteFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    success('Arquivo removido da biblioteca');
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Biblioteca de Mídia</h2>
          <p className="text-gray-600 mt-2">Gerencie imagens, vídeos e áudios</p>
        </div>
      </div>

      {/* Upload Area */}
      <div className="bg-white rounded-xl shadow-sm border mb-8">
        <div className="p-6">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*, video/*, audio/*"
            onChange={(e) => {
              if (e.target.files) handleFileUpload(e.target.files);
            }}
            className="hidden"
          />
          
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
            }`}
          >
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {uploading ? 'Enviando arquivos...' : 'Enviar arquivos'}
            </h3>
            <p className="text-gray-600 mb-4">
              Arraste e solte arquivos aqui ou clique para selecionar
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              Selecionar Arquivos
            </button>
            <p className="text-sm text-gray-500 mt-3">
              Suportado: imagens, vídeos e áudios (máx. 10MB por arquivo)
            </p>
          </div>
        </div>
      </div>

      {/* Files Grid */}
      {files.length > 0 ? (
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="p-4 border-b">
            <h3 className="text-lg font-semibold text-gray-900">
              Arquivos ({files.length})
            </h3>
          </div>
          
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {files.map((file, index) => {
                const FileIcon = getFileIcon(file.mimetype);
                const isImage = file.mimetype.startsWith('image/');
                
                return (
                  <div key={index} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                    {/* Preview */}
                    <div className="aspect-square bg-gray-100 flex items-center justify-center relative">
                      {isImage ? (
                        <img
                          src={file.url}
                          alt={file.originalName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <FileIcon className="w-12 h-12 text-gray-400" />
                      )}
                      
                      <div className="absolute top-2 right-2 flex space-x-1">
                        <button
                          onClick={() => copyUrl(file.url)}
                          className="bg-white bg-opacity-90 hover:bg-opacity-100 p-1 rounded transition-colors"
                          title="Copiar URL"
                        >
                          <Copy className="w-3 h-3 text-gray-600" />
                        </button>
                        <button
                          onClick={() => window.open(file.url, '_blank')}
                          className="bg-white bg-opacity-90 hover:bg-opacity-100 p-1 rounded transition-colors"
                          title="Abrir em nova aba"
                        >
                          <ExternalLink className="w-3 h-3 text-gray-600" />
                        </button>
                        <button
                          onClick={() => deleteFile(index)}
                          className="bg-white bg-opacity-90 hover:bg-opacity-100 p-1 rounded transition-colors"
                          title="Remover"
                        >
                          <Trash2 className="w-3 h-3 text-red-600" />
                        </button>
                      </div>
                    </div>
                    
                    {/* Info */}
                    <div className="p-3">
                      <div className="text-sm font-medium text-gray-900 truncate mb-1">
                        {file.originalName}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatFileSize(file.size)}
                      </div>
                      <div className="text-xs text-gray-400 mt-1 truncate">
                        {file.mimetype}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="p-12 text-center">
            <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhum arquivo na biblioteca</h3>
            <p className="text-gray-600 mb-6">Comece enviando seus primeiros arquivos de mídia</p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Enviar Primeiro Arquivo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}