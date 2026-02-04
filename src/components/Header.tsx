'use client';

import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import Image from 'next/image';

export const Header: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'O Sítio', href: '#sobre' },
    { name: 'Acomodações', href: '#acomodacoes' },
    { name: 'Fotos', href: '#galeria' },
    { name: 'Dicas Locais', href: '#dicas' },
    { name: 'Reservar', href: '#reservas' },
  ];

  return (
    <header className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm py-2' : 'bg-transparent py-4'}`}>
      <div className="container mx-auto px-4 flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Image 
            src="/logocangumbim.png" 
            alt="Sítio Cangumbim" 
            width={200}
            height={80}
            className="h-12 w-auto object-contain"
            priority
            quality={100}
          />
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex gap-8">
          {navLinks.map((link) => (
            <a 
              key={link.name} 
              href={link.href} 
              className={`text-sm font-medium tracking-wide hover:text-green-600 transition-colors ${scrolled ? 'text-gray-700' : 'text-white drop-shadow-md'}`}
            >
              {link.name}
            </a>
          ))}
        </nav>

        {/* Mobile Menu Button */}
        <button className="md:hidden p-2 text-gray-600" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X /> : <Menu className={scrolled ? 'text-gray-800' : 'text-white'} />}
        </button>

        {/* Mobile Nav */}
        {isOpen && (
          <div className="absolute top-full left-0 w-full bg-white shadow-xl border-t md:hidden flex flex-col p-4 animate-fade-in">
            {navLinks.map((link) => (
              <a 
                key={link.name} 
                href={link.href} 
                className="py-3 text-gray-700 font-medium border-b border-gray-100 last:border-0"
                onClick={() => setIsOpen(false)}
              >
                {link.name}
              </a>
            ))}
          </div>
        )}
      </div>
    </header>
  );
};
