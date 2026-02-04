import React from 'react';
import { CheckCircle } from 'lucide-react';
import Image from 'next/image';

export const About: React.FC = () => {
  return (
    <section id="sobre" className="py-20 bg-stone-50">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center gap-12">
          <div className="w-full md:w-1/2">
            <div className="relative rounded-2xl overflow-hidden shadow-xl group">
              <Image 
                src="/images/redes.jpg" 
                alt="Área de descanso com redes" 
                width={1600}
                height={500}
                className="w-full h-[500px] object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute -bottom-6 -right-6 w-48 h-48 bg-green-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>
            </div>
          </div>
          <div className="w-full md:w-1/2 space-y-6">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-800">
              Sobre este espaço
            </h2>
            <p className="text-gray-600 leading-relaxed text-lg">
              Viva dias de descanso no <strong>Sítio Cangumbim</strong>, localizado no Povoado dos Pinto, a apenas 13 km de Resende Costa e 30 km de São Tiago. O acesso é feito por uma estrada de terra bem conservada e de fácil tráfego.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Ideal para famílias, casais ou grupos que desejam sossego. Nossa casa ampla oferece <strong>3 quartos (2 suítes)</strong>, cozinha completa com fogão a lenha, e uma área de lazer com sinuca e churrasqueira.
            </p>
            <p className="text-gray-600 leading-relaxed">
              O destaque fica para a natureza: temos uma <strong>cachoeira passando no quintal</strong> e estamos a apenas 200m da cachoeira principal do povoado. Relaxe nas redes em meio à mata, aproveite a capela charmosa em frente à casa e sinta a paz do interior.
            </p>
            
            <div className="grid grid-cols-2 gap-4 pt-4">
               <div className="flex items-center gap-2 text-gray-700">
                 <CheckCircle className="w-5 h-5 text-green-600" /> <span>Wi-Fi</span>
               </div>
               <div className="flex items-center gap-2 text-gray-700">
                 <CheckCircle className="w-5 h-5 text-green-600" /> <span>Cachoeira no quintal</span>
               </div>
               <div className="flex items-center gap-2 text-gray-700">
                 <CheckCircle className="w-5 h-5 text-green-600" /> <span>Câmeras de Segurança</span>
               </div>
               <div className="flex items-center gap-2 text-gray-700">
                 <CheckCircle className="w-5 h-5 text-green-600" /> <span>Pet Friendly</span>
               </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
