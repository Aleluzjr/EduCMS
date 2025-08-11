import React from 'react';
import LoadingSpinner from './LoadingSpinner';

/**
 * Exemplos de uso do componente LoadingSpinner
 * Este arquivo demonstra todas as variantes disponíveis
 */
const LoadingSpinnerExamples: React.FC = () => {
  return (
    <div className="p-8 space-y-8">
      <h1 className="text-2xl font-bold mb-6">Exemplos de LoadingSpinner</h1>
      
      {/* Tamanhos */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Tamanhos</h2>
        <div className="flex items-center space-x-8">
          <div>
            <h3 className="text-sm font-medium mb-2">Small (sm)</h3>
            <LoadingSpinner size="sm" />
          </div>
          <div>
            <h3 className="text-sm font-medium mb-2">Medium (md)</h3>
            <LoadingSpinner size="md" />
          </div>
          <div>
            <h3 className="text-sm font-medium mb-2">Large (lg)</h3>
            <LoadingSpinner size="lg" />
          </div>
          <div>
            <h3 className="text-sm font-medium mb-2">Extra Large (xl)</h3>
            <LoadingSpinner size="xl" />
          </div>
        </div>
      </section>

      {/* Variantes de cor */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Variantes de Cor</h2>
        <div className="grid grid-cols-3 gap-6">
          <div>
            <h3 className="text-sm font-medium mb-2">Default</h3>
            <LoadingSpinner variant="default" />
          </div>
          <div>
            <h3 className="text-sm font-medium mb-2">Primary</h3>
            <LoadingSpinner variant="primary" />
          </div>
          <div>
            <h3 className="text-sm font-medium mb-2">Secondary</h3>
            <LoadingSpinner variant="secondary" />
          </div>
          <div>
            <h3 className="text-sm font-medium mb-2">Success</h3>
            <LoadingSpinner variant="success" />
          </div>
          <div>
            <h3 className="text-sm font-medium mb-2">Warning</h3>
            <LoadingSpinner variant="warning" />
          </div>
          <div>
            <h3 className="text-sm font-medium mb-2">Error</h3>
            <LoadingSpinner variant="error" />
          </div>
        </div>
      </section>

      {/* Com texto */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Com Texto</h2>
        <div className="flex items-center space-x-8">
          <LoadingSpinner text="Carregando dados..." />
          <LoadingSpinner text="Salvando..." variant="success" />
          <LoadingSpinner text="Processando..." variant="primary" />
        </div>
      </section>

      {/* Full Screen */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Full Screen (comentado para não bloquear a visualização)</h2>
        <div className="bg-gray-100 p-4 rounded">
          <p className="text-sm text-gray-600 mb-2">
            Para usar fullScreen, descomente a linha abaixo:
          </p>
          {/* <LoadingSpinner fullScreen text="Carregando aplicação..." /> */}
          <code className="text-xs bg-gray-200 p-2 rounded block">
            {`<LoadingSpinner fullScreen text="Carregando aplicação..." />`}
          </code>
        </div>
      </section>

      {/* Uso em botões */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Uso em Botões</h2>
        <div className="flex space-x-4">
          <button className="bg-blue-500 text-white px-4 py-2 rounded flex items-center space-x-2">
            <LoadingSpinner size="sm" variant="primary" />
            <span>Salvando...</span>
          </button>
          <button className="bg-green-500 text-white px-4 py-2 rounded flex items-center space-x-2">
            <LoadingSpinner size="sm" variant="success" />
            <span>Processando...</span>
          </button>
        </div>
      </section>

      {/* Uso inline */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Uso Inline</h2>
        <div className="space-y-2">
          <p className="flex items-center">
            <span>Carregando configurações</span>
            <LoadingSpinner size="sm" className="ml-2" />
          </p>
          <p className="flex items-center">
            <span>Verificando permissões</span>
            <LoadingSpinner size="sm" variant="warning" className="ml-2" />
          </p>
        </div>
      </section>
    </div>
  );
};

export default LoadingSpinnerExamples;
