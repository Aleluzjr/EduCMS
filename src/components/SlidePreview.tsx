import React, { useState } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';

interface Document {
  id: number;
  documentId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  slides: any[];
}

interface SlideTemplate {
  id: string;
  name: string;
  icon: string;
  fields: any[];
}

interface SlidePreviewProps {
  document: Document;
  templates: SlideTemplate[];
  onBack: () => void;
}

export default function SlidePreview({ document, templates, onBack }: SlidePreviewProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const API_BASE = 'http://localhost:3001/api';

  const nextSlide = () => {
    setCurrentSlide(prev => Math.min(prev + 1, document.slides.length - 1));
  };

  const prevSlide = () => {
    setCurrentSlide(prev => Math.max(prev - 1, 0));
  };

  const renderSlideContent = (slide: any) => {
    const template = templates.find(t => t.id === slide.__component);
    
    switch (slide.__component) {
      case 'slides.capa':
        return (
          <div className="relative h-full flex flex-col justify-center items-center text-center p-12"
               style={slide.image?.url ? { 
                 backgroundImage: `url(${slide.image.url})`,
                 backgroundSize: 'cover',
                 backgroundPosition: 'center'
               } : {}}>
            {slide.image?.url && <div className="absolute inset-0 bg-black bg-opacity-40"></div>}
            <div className="relative z-10 text-white">
              <h1 className="text-5xl font-bold mb-6">{slide.title}</h1>
              {slide.description && <p className="text-xl mb-8 max-w-2xl">{slide.description}</p>}
              {slide.author && <p className="text-lg opacity-90">Por: {slide.author}</p>}
            </div>
          </div>
        );

      case 'slides.objetivos':
        return (
          <div className="p-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-8 text-center">
              {slide.title || 'Objetivos'}
            </h2>
            <div className="max-w-3xl mx-auto">
              <ul className="space-y-4">
                {slide.objectivesList?.map((objective: any, index: number) => (
                  <li key={objective.id || index} className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                      {index + 1}
                    </div>
                    <p className="text-lg text-gray-700 pt-1">{objective.title}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        );

      case 'slides.texto-com-imagem':
        return (
          <div className="p-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-8 text-center">{slide.title}</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
              <div className="space-y-4">
                <div 
                  className="text-lg text-gray-700 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: slide.content || '' }}
                />
              </div>
              {slide.image?.url && (
                <div className="flex items-center justify-center">
                  <img 
                    src={slide.image.url} 
                    alt={slide.title}
                    className="max-w-full h-auto rounded-lg shadow-lg"
                  />
                </div>
              )}
            </div>
          </div>
        );

      case 'slides.questao':
        return (
          <div className="p-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-8 text-center">{slide.title}</h2>
            <div className="max-w-4xl mx-auto">
              <div className="bg-blue-50 p-6 rounded-lg mb-8">
                <p className="text-xl text-gray-800 font-medium">{slide.description}</p>
              </div>
              
              <div className="space-y-3 mb-8">
                {slide.Alternativas?.map((alt: any, index: number) => {
                  const letter = String.fromCharCode(65 + index); // A, B, C, D...
                  const isCorrect = letter === slide.answer;
                  
                  return (
                    <div 
                      key={alt.id || index}
                      className={`p-4 rounded-lg border-2 ${
                        isCorrect 
                          ? 'border-green-500 bg-green-50' 
                          : 'border-gray-200 bg-white'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                          isCorrect ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'
                        }`}>
                          {letter}
                        </div>
                        <p className="text-lg">{alt.title}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {slide.justification && (
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Justificativa:</h4>
                  <div 
                    className="text-gray-700"
                    dangerouslySetInnerHTML={{ __html: slide.justification }}
                  />
                </div>
              )}
            </div>
          </div>
        );

      case 'slides.texto-livre':
        return (
          <div className="p-12">
            {slide.title && (
              <h2 className="text-4xl font-bold text-gray-900 mb-8 text-center">{slide.title}</h2>
            )}
            <div className="max-w-4xl mx-auto">
              <div 
                className="text-lg text-gray-700 leading-relaxed prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{ __html: slide.content || '' }}
              />
            </div>
          </div>
        );

      case 'slides.podcast':
        return (
          <div className="p-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-8 text-center">{slide.title}</h2>
            <div className="max-w-3xl mx-auto text-center">
              {slide.description && (
                <p className="text-xl text-gray-600 mb-8">{slide.description}</p>
              )}
              
              {slide.audio?.url && (
                <div className="bg-gray-100 p-8 rounded-lg">
                  <audio controls className="w-full">
                    <source src={slide.audio.url} type="audio/mpeg" />
                    Seu navegador não suporta o elemento de áudio.
                  </audio>
                  {slide.duration && (
                    <p className="text-sm text-gray-500 mt-4">Duração: {slide.duration}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        );

      default:
        return (
          <div className="p-12 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Componente Desconhecido</h2>
            <p className="text-gray-600">{slide.__component}</p>
            <pre className="mt-4 text-left bg-gray-100 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(slide, null, 2)}
            </pre>
          </div>
        );
    }
  };

  if (document.slides.length === 0) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Nenhum slide para visualizar</h2>
          <button
            onClick={onBack}
            className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg transition-colors"
          >
            Voltar ao Editor
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white relative">
      {/* Header Controls */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-white bg-opacity-90 backdrop-blur-sm border-b">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Voltar ao Editor</span>
          </button>

          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              {currentSlide + 1} de {document.slides.length}
            </span>
            
            <a
              href={`${API_BASE}/documents/${document.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Ver API</span>
            </a>
          </div>
        </div>
      </div>

      {/* Slide Content */}
      <div className="pt-16 h-screen overflow-y-auto">
        {renderSlideContent(document.slides[currentSlide])}
      </div>

      {/* Navigation Controls */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-4">
        <button
          onClick={prevSlide}
          disabled={currentSlide === 0}
          className="bg-white shadow-lg border p-3 rounded-full hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        
        <button
          onClick={nextSlide}
          disabled={currentSlide === document.slides.length - 1}
          className="bg-white shadow-lg border p-3 rounded-full hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Slide Progress Indicator */}
      <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {document.slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-2 h-2 rounded-full transition-colors ${
              index === currentSlide ? 'bg-blue-600' : 'bg-gray-300'
            }`}
          />
        ))}
      </div>
    </div>
  );
}