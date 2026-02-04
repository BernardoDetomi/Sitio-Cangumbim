'use client';

import React, { useState, useEffect } from 'react';
import { X, PlusCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';

export const Gallery: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [visibleCount, setVisibleCount] = useState(9);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const categories = ['Todos', 'Exterior', 'Interior', 'Natureza', 'Capela', 'Cachoeira'];

  useEffect(() => {
    setVisibleCount(9);
  }, [activeCategory]);

  // Suporte para teclas do teclado
  useEffect(() => {
    if (!selectedImage) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        navigatePrevious();
      } else if (e.key === 'ArrowRight') {
        navigateNext();
      } else if (e.key === 'Escape') {
        setSelectedImage(null);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedImage, currentImageIndex]);

  const allImages = [
    // Exterior
    { src: "/images/casaexterior.jpg", category: "Exterior", title: "Fachada Principal" },
    { src: "/images/garagem1.jpg", category: "Exterior", title: "Garagem Coberta" },
    { src: "/images/garagem2.jpg", category: "Exterior", title: "Área Externa" },
    { src: "/images/deck.jpg", category: "Exterior", title: "Deck de Madeira" },
    { src: "/images/deck2.jpg", category: "Exterior", title: "Deck - Vista Lateral" },
    { src: "/images/ducha.jpg", category: "Exterior", title: "Ducha Externa" },
    { src: "/images/ducha2.jpg", category: "Exterior", title: "Ducha - Detalhe" },
    { src: "/images/lareira.jpg", category: "Exterior", title: "Lareira de Chão" },
    { src: "/images/lareira2.jpg", category: "Exterior", title: "Fogueira" },
    { src: "/images/lareira3.jpg", category: "Exterior", title: "Área da Lareira" },
    { src: "/images/lareira4.jpg", category: "Exterior", title: "Lareira Acesa" },
    { src: "/images/lareira5.jpg", category: "Exterior", title: "Fogueira à Noite" },
    { src: "/images/lareira6.jpg", category: "Exterior", title: "Lareira - Vista Completa" },
    
    // Natureza
    { src: "/images/redes.jpg", category: "Natureza", title: "Redes de Descanso" },

    // Interior - Cozinha
    { src: "/images/cozinha1.jpg", category: "Interior", title: "Cozinha Completa" },
    { src: "/images/cozinha2.jpg", category: "Interior", title: "Cozinha Equipada" },
    { src: "/images/cozinha3.jpg", category: "Interior", title: "Área de Preparo" },
    { src: "/images/cozinhafogaoalenha.jpg", category: "Interior", title: "Fogão a Lenha" },
    { src: "/images/cozinhafogaoalenha2.jpg", category: "Interior", title: "Fogão a Lenha - Detalhe" },
    { src: "/images/cozinhafogaoalenha3.jpg", category: "Interior", title: "Cozinha Tradicional" },
    
    // Interior - Sala
    { src: "/images/sala1.jpg", category: "Interior", title: "Sala de Estar" },
    { src: "/images/sala2.jpg", category: "Interior", title: "Área de Convivência" },
    { src: "/images/sala3.jpg", category: "Interior", title: "Sala Aconchegante" },
    { src: "/images/sinuca.jpg", category: "Interior", title: "Mesa de Sinuca" },
    
    // Interior - Quartos
    { src: "/images/quartosuite.jpg", category: "Interior", title: "Suíte Principal" },
    { src: "/images/quartosuite3.jpg", category: "Interior", title: "Suíte Principal - Vista 2" },
    { src: "/images/quartosuite4.jpg", category: "Interior", title: "Suíte Principal - Vista 3" },
    { src: "/images/segundasuite1.jpg", category: "Interior", title: "Segunda Suíte" },
    { src: "/images/segundasuite2.jpg", category: "Interior", title: "Suíte 2 - Vista" },
    { src: "/images/segundasuite3.jpg", category: "Interior", title: "Suíte 2 - Vista Lateral" },
    { src: "/images/segundasuite4.jpg", category: "Interior", title: "Suíte 2 - Detalhe" },
    { src: "/images/quartosolteiro.jpg", category: "Interior", title: "Quarto de Solteiro" },
    { src: "/images/quartosolteiro2.jpg", category: "Interior", title: "Quarto 3" },
    { src: "/images/quartosolteiro3.jpg", category: "Interior", title: "Quarto Solteiro - Vista 2" },
    { src: "/images/quartosolteiro4.jpg", category: "Interior", title: "Quarto Solteiro - Vista 3" },
    { src: "/images/closetsuite.jpg", category: "Interior", title: "Closet da Suíte" },
    
    // Interior - Banheiros
    { src: "/images/banheirosuite.jpg", category: "Interior", title: "Banheiro Suíte" },
    { src: "/images/banheirosuite2.jpg", category: "Interior", title: "Banheiro Suíte - Detalhe" },
    { src: "/images/segundasuitebanheiro.jpg", category: "Interior", title: "Banheiro Suíte 2" },
    { src: "/images/segundasuitebanheiro2.jpg", category: "Interior", title: "Banheiro Suíte 2 - Vista" },
    { src: "/images/banheirosocial1.jpg", category: "Interior", title: "Banheiro Social" },
    { src: "/images/banheirosocial2.jpg", category: "Interior", title: "Banheiro Social - Detalhe" },
    
    // Cachoeira
    { src: "/images/cachoeira1.jpg", category: "Cachoeira", title: "Cachoeira Principal" },
    { src: "/images/cachoeira2.jpg", category: "Cachoeira", title: "Queda D'água" },
    { src: "/images/cachoeira3.jpg", category: "Cachoeira", title: "Piscina Natural" },
    { src: "/images/cachoeira4.jpg", category: "Cachoeira", title: "Cachoeira do Povoado" },
    { src: "/images/cachoeira5.jpg", category: "Cachoeira", title: "Área de Banho" },
    { src: "/images/cachoeira7.jpg", category: "Cachoeira", title: "Cachoeira - Vista Lateral" },
    { src: "/images/cachoeira8.jpg", category: "Cachoeira", title: "Água Cristalina" },
    { src: "/images/cachoeiraparticular.jpg", category: "Cachoeira", title: "Cachoeira Particular" },
    { src: "/images/cachoeiraparticular2.jpg", category: "Cachoeira", title: "Cachoeira Particular - Vista 2" },
    { src: "/images/cachoeiraparticular3.jpg", category: "Cachoeira", title: "Cachoeira Particular - Vista 3" },
    { src: "/images/cachoeiraparticular4.jpg", category: "Cachoeira", title: "Cachoeira Particular - Vista 4" },
    { src: "/images/cachoeiraparticular5.jpg", category: "Cachoeira", title: "Cachoeira Particular - Vista 5" },
    { src: "/images/cachoeiraparticular6.jpg", category: "Cachoeira", title: "Cachoeira Particular - Vista 6" },
    
    // Capela
    { src: "/images/capela_(1).jpg", category: "Capela", title: "Capela - Vista 1" },
    { src: "/images/capela_(9).jpg", category: "Capela", title: "Capela - Vista 2" },
    { src: "/images/capela_(10).jpg", category: "Capela", title: "Capela - Vista 3" },
    { src: "/images/capela_(11).jpg", category: "Capela", title: "Capela - Vista 4" },
    { src: "/images/capela_(12).jpg", category: "Capela", title: "Capela - Interior" },
    { src: "/images/capela_(13).jpg", category: "Capela", title: "Capela - Altar" },
    { src: "/images/capela_(14).jpg", category: "Capela", title: "Capela - Detalhe" },
    { src: "/images/capela_(15).jpg", category: "Capela", title: "Capela - Vista Lateral" },
    { src: "/images/capela_(16).jpg", category: "Capela", title: "Capela - Fachada" },
    { src: "/images/capela_(17).jpg", category: "Capela", title: "Capela - Entrada" },
    { src: "/images/capela_(18).jpg", category: "Capela", title: "Capela - Vista Completa" },
  ];

  const filteredImages = activeCategory === 'Todos' 
    ? allImages 
    : allImages.filter(img => img.category === activeCategory);
    
  const visibleImages = filteredImages.slice(0, visibleCount);

  const openLightbox = (src: string) => {
    const index = filteredImages.findIndex(img => img.src === src);
    setCurrentImageIndex(index);
    setSelectedImage(src);
  };

  const navigateNext = () => {
    const nextIndex = (currentImageIndex + 1) % filteredImages.length;
    setCurrentImageIndex(nextIndex);
    setSelectedImage(filteredImages[nextIndex].src);
  };

  const navigatePrevious = () => {
    const prevIndex = (currentImageIndex - 1 + filteredImages.length) % filteredImages.length;
    setCurrentImageIndex(prevIndex);
    setSelectedImage(filteredImages[prevIndex].src);
  };

  return (
    <section id="galeria" className="py-20 bg-stone-100">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-800 text-center mb-8">Nossos Cantinhos</h2>
        
        {/* Filtros */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                activeCategory === cat 
                  ? 'bg-green-700 text-white shadow-md' 
                  : 'bg-white text-gray-600 hover:bg-green-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        
        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 animate-fade-in">
          {visibleImages.map((img, index) => (
            <div 
              key={index} 
              className="group relative h-64 overflow-hidden rounded-xl cursor-pointer shadow-sm hover:shadow-xl transition-all"
              onClick={() => setSelectedImage(img.src)}
            >
              <Image 
                src={img.src} 
                alt={img.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-all"></div>
              <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-white text-sm font-medium">{img.title}</span>
                <p className="text-green-300 text-xs uppercase tracking-wide">{img.category}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Botão Ver Mais */}
        {visibleCount < filteredImages.length && (
          <div className="flex justify-center mt-12">
            <button
              onClick={() => setVisibleCount(prev => prev + 6)}
              className="flex items-center gap-2 px-8 py-3 bg-white border border-gray-200 text-gray-600 rounded-full font-medium hover:bg-stone-50 hover:border-green-600 hover:text-green-700 transition-all shadow-sm"
            >
              <PlusCircle size={20} />
              Ver mais fotos
            </button>
          </div>
        )}
      </div>

      {/* Modal Lightbox */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" 
          onClick={() => setSelectedImage(null)}
        >
          {/* Botão Fechar */}
          <button 
            className="absolute top-6 right-6 text-white hover:text-gray-300 transition-colors z-10"
            onClick={() => setSelectedImage(null)}
          >
            <X size={40} />
          </button>

          {/* Seta Anterior */}
          <button 
            className="absolute left-4 md:left-8 text-white hover:text-gray-300 transition-colors z-10 bg-black/50 hover:bg-black/70 rounded-full p-2 md:p-3"
            onClick={(e) => {
              e.stopPropagation();
              navigatePrevious();
            }}
          >
            <ChevronLeft size={32} className="md:w-12 md:h-12" />
          </button>

          {/* Imagem */}
          <div className="relative max-w-[90vw] max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <Image 
              src={selectedImage} 
              alt={filteredImages[currentImageIndex]?.title || "Zoom"} 
              width={1600}
              height={900}
              className="max-w-full max-h-[90vh] rounded-lg shadow-2xl animate-fade-in object-contain"
            />
            {/* Contador de imagens */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-sm">
              {currentImageIndex + 1} / {filteredImages.length}
            </div>
          </div>

          {/* Seta Próxima */}
          <button 
            className="absolute right-4 md:right-8 text-white hover:text-gray-300 transition-colors z-10 bg-black/50 hover:bg-black/70 rounded-full p-2 md:p-3"
            onClick={(e) => {
              e.stopPropagation();
              navigateNext();
            }}
          >
            <ChevronRight size={32} className="md:w-12 md:h-12" />
          </button>
        </div>
      )}
    </section>
  );
};
