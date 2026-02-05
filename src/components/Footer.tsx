import React from 'react';
import { Phone, Instagram, MapPin } from 'lucide-react';
import Image from 'next/image';

const AIRBNB_LINK = "https://www.airbnb.com.br/rooms/1400169773928514039";

export const Footer: React.FC = () => {
  return (
    <footer id="contato" className="shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
      {/* Faixa superior clara */}
      <div style={{ background: "#ffffff" }} className="bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 items-start">
            
            {/* Logo e Descrição */}
            <div className="flex flex-col items-center lg:items-start">
              <a href="#home" className="cursor-pointer">
                <Image 
                  src="/logocangumbim.png" 
                  alt="Sítio Cangumbim" 
                  width={200}
                  height={80}
                  className="w-44 sm:w-52 lg:w-56 h-auto mb-4 hover:opacity-80 transition-opacity"
                  quality={100}
                />
              </a>
              <p className="text-gray-700 text-sm sm:text-base text-center lg:text-left max-w-xs">
                Seu refúgio na natureza em Resende Costa, MG.<br/>
                Simplicidade, conforto e memórias para a vida toda.
              </p>
            </div>
            
            {/* Acesso Rápido */}
            <div className="text-center lg:text-left">
              <div className="text-gray-900 font-bold text-sm sm:text-base lg:text-lg mb-4">
                ACESSO RÁPIDO
              </div>
              <ul className="space-y-2 text-sm sm:text-base">
                <li>
                  <a href="#home" className="text-gray-700 hover:text-green-600 transition-colors">
                    Início
                  </a>
                </li>
                <li>
                  <a href="#sobre" className="text-gray-700 hover:text-green-600 transition-colors">
                    O Sítio
                  </a>
                </li>
                <li>
                  <a href="#galeria" className="text-gray-700 hover:text-green-600 transition-colors">
                    Galeria
                  </a>
                </li>
                <li>
                  <a href="#reservas" className="text-gray-700 hover:text-green-600 transition-colors">
                    Reservas
                  </a>
                </li>
                <li>
                  <a href={AIRBNB_LINK} target="_blank" rel="noreferrer" className="text-gray-700 hover:text-green-600 transition-colors">
                    Airbnb
                  </a>
                </li>
              </ul>
            </div>
            
            {/* Fale Conosco */}
            <div className="text-center lg:text-left">
              <div className="text-gray-900 font-bold text-sm sm:text-base lg:text-lg mb-4">
                FALE CONOSCO
              </div>
              <div className="space-y-3 text-sm sm:text-base text-gray-700">
                <a 
                  href="https://wa.me/5532999943917" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 justify-center lg:justify-start hover:text-green-600 transition-colors cursor-pointer"
                >
                  <Phone size={18} className="text-gray-600" />
                  <span>(32) 99994-3917</span>
                </a>
                <a 
                  href="https://instagram.com/sitiocangumbim" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 justify-center lg:justify-start hover:text-green-600 transition-colors cursor-pointer"
                >
                  <Instagram size={18} className="text-gray-600" />
                  <span>@sitiocangumbim</span>
                </a>
                <a 
                  href="https://www.google.com/maps/place/Povoado+dos+Pinto,+Resende+Costa+-+MG" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 justify-center lg:justify-start hover:text-green-600 transition-colors cursor-pointer"
                >
                  <MapPin size={18} className="text-gray-600" />
                  <span>Povoado dos Pinto - Resende Costa - MG</span>
                </a>
              </div>
              
              {/* Social Icons */}
              <div className="flex gap-4 justify-center lg:justify-start mt-4">
                {/* WhatsApp */}
                <a 
                  href="https://wa.me/5532999943917" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="transition-transform duration-200 hover:scale-110"
                  aria-label="WhatsApp"
                >
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M16 0C7.164 0 0 7.164 0 16c0 2.825.738 5.477 2.031 7.781L.703 30.703l7.227-1.895A15.908 15.908 0 0016 32c8.836 0 16-7.164 16-16S24.836 0 16 0zm0 29.333c-2.512 0-4.875-.688-6.887-1.891l-.492-.297-5.098 1.336 1.363-4.957-.324-.508A13.238 13.238 0 012.667 16C2.667 8.644 8.644 2.667 16 2.667S29.333 8.644 29.333 16 23.356 29.333 16 29.333z" fill="#25D366"/>
                    <path d="M12.004 9.805c-.297-.66-.61-.672-.895-.684-.23-.008-.496-.008-.758-.008-.262 0-.688.098-1.047.492-.36.394-1.371 1.34-1.371 3.266s1.403 3.789 1.598 4.051c.195.262 2.75 4.195 6.656 5.883.93.399 1.656.637 2.223.816.934.297 1.785.254 2.457.153.75-.113 2.309-.945 2.633-1.859.324-.914.324-1.699.227-1.863-.098-.164-.36-.262-.754-.457-.395-.195-2.333-1.153-2.696-1.285-.363-.133-.628-.196-.89.195-.263.39-1.02 1.285-1.25 1.547-.23.262-.46.297-.856.102-.394-.195-1.664-.613-3.168-1.957-1.172-1.047-1.965-2.34-2.195-2.734-.23-.394-.024-.606.172-.801.176-.176.394-.457.59-.684.196-.226.262-.39.394-.652.132-.262.066-.492-.032-.687-.098-.196-.89-2.145-1.219-2.938z" fill="#25D366"/>
                  </svg>
                </a>
                
                {/* Instagram */}
                <a 
                  href="https://instagram.com/sitiocangumbim" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="transition-transform duration-200 hover:scale-110"
                  aria-label="Instagram"
                >
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <linearGradient id="instagram-gradient" x1="0%" y1="100%" x2="100%" y2="0%">
                        <stop offset="0%" style={{stopColor: '#FED576'}} />
                        <stop offset="25%" style={{stopColor: '#F47133'}} />
                        <stop offset="50%" style={{stopColor: '#BC3081'}} />
                        <stop offset="100%" style={{stopColor: '#4C63D2'}} />
                      </linearGradient>
                    </defs>
                    <path d="M16 2.883c4.271 0 4.78.016 6.465.093 1.56.072 2.406.332 2.97.552a4.96 4.96 0 011.838 1.196 4.96 4.96 0 011.196 1.838c.22.564.48 1.41.552 2.97.077 1.685.093 2.194.093 6.465s-.016 4.78-.093 6.465c-.072 1.56-.332 2.406-.552 2.97a4.96 4.96 0 01-1.196 1.838 4.96 4.96 0 01-1.838 1.196c-.564.22-1.41.48-2.97.552-1.685.077-2.194.093-6.465.093s-4.78-.016-6.465-.093c-1.56-.072-2.406-.332-2.97-.552a4.96 4.96 0 01-1.838-1.196 4.96 4.96 0 01-1.196-1.838c-.22-.564-.48-1.41-.552-2.97C2.9 20.777 2.883 20.268 2.883 16s.017-4.78.094-6.465c.072-1.56.332-2.406.552-2.97a4.96 4.96 0 011.196-1.838A4.96 4.96 0 016.563 3.53c.564-.22 1.41-.48 2.97-.552C11.22 2.9 11.729 2.883 16 2.883zM16 0c-4.343 0-4.889.018-6.596.096-1.704.078-2.87.35-3.889.744a7.846 7.846 0 00-2.835 1.846A7.846 7.846 0 00.834 5.52C.44 6.54.168 7.706.09 9.41.012 11.117 0 11.663 0 16.006s.018 4.889.096 6.596c.078 1.704.35 2.87.744 3.889a7.846 7.846 0 001.846 2.835 7.846 7.846 0 002.835 1.846c1.02.394 2.186.666 3.89.744 1.707.078 2.253.096 6.596.096s4.889-.018 6.596-.096c1.704-.078 2.87-.35 3.889-.744a7.846 7.846 0 002.835-1.846 7.846 7.846 0 001.846-2.835c.394-1.02.666-2.186.744-3.89.078-1.707.096-2.253.096-6.596s-.018-4.889-.096-6.596c-.078-1.704-.35-2.87-.744-3.889a7.846 7.846 0 00-1.846-2.835A7.846 7.846 0 0026.486.834C25.466.44 24.3.168 22.596.09 20.889.012 20.343 0 16 0z" fill="url(#instagram-gradient)"/>
                    <path d="M16 7.784a8.216 8.216 0 100 16.432 8.216 8.216 0 000-16.432zm0 13.549a5.333 5.333 0 110-10.666 5.333 5.333 0 010 10.666zM26.461 7.458a1.919 1.919 0 11-3.838 0 1.919 1.919 0 013.838 0z" fill="url(#instagram-gradient)"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Faixa inferior com crédito */}
      <div style={{ background: "#15803d" }} className="text-center py-6">
        <div className="text-white font-bold text-sm sm:text-base mb-4">
          DESENVOLVIDO POR
        </div>
        <div className="flex justify-center mb-2">
          <a 
            href="https://github.com/bernardodetomi" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="transition-opacity duration-200 hover:opacity-80"
          >
            <Image 
              src="/bmd-logo.png" 
              alt="BMD" 
              width={144}
              height={48}
              className="w-24 sm:w-32 lg:w-36 h-auto"
            />
          </a>
        </div>
        <div className="text-white text-xs sm:text-sm">
          © {new Date().getFullYear()} Sítio Cangumbim. All rights reserved
        </div>
      </div>
    </footer>
  );
};
