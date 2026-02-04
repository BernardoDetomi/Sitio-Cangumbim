'use client';

import React from 'react';
import { MessageCircle } from 'lucide-react';
import { Button } from './Button';
import Image from 'next/image';

const CONTACT_NUMBER = "5532999943917";

export const Hero: React.FC = () => {
  return (
    <section id="home" className="relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden">
      {/* Imagem de Fundo com Overlay */}
      <div className="absolute inset-0 z-0">
        <Image 
          src="/images/casaexterior.jpg" 
          alt="Vista panorâmica do Sítio Cangumbim" 
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/40 md:bg-black/30"></div>
        {/* Gradiente para suavizar a base */}
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-stone-50 to-transparent"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 text-center text-white space-y-6 animate-fade-in-up">
        <span className="inline-block py-1 px-3 rounded-full bg-white/20 backdrop-blur-sm text-sm font-medium tracking-wider mb-2 border border-white/30">
          POVOADO DOS PINTO - RESENDE COSTA
        </span>
        <h1 className="text-4xl md:text-6xl font-serif font-bold leading-tight drop-shadow-lg">
          Viva dias de descanso e <br /> contato com a natureza
        </h1>
        <p className="text-lg md:text-xl max-w-2xl mx-auto opacity-90 font-light drop-shadow-md">
          Seu refúgio completo com cachoeira no quintal, casa ampla e todo o conforto que sua família merece.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
          <Button variant="primary" onClick={() => document.getElementById('reservas')?.scrollIntoView({ behavior: 'smooth' })}>
            Verificar Disponibilidade
          </Button>
          <Button variant="outline" icon={MessageCircle} onClick={() => window.open(`https://wa.me/${CONTACT_NUMBER}`, '_blank')}>
            Falar no WhatsApp
          </Button>
        </div>
      </div>
    </section>
  );
};
