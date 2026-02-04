'use client';

import React from 'react';
import { MessageCircle } from 'lucide-react';

const CONTACT_NUMBER = "5532999943917";

export const FloatingWhatsApp: React.FC = () => (
  <a 
    href={`https://wa.me/${CONTACT_NUMBER}`}
    target="_blank"
    rel="noreferrer"
    className="fixed bottom-6 right-6 z-40 bg-green-500 text-white p-4 rounded-full shadow-lg hover:bg-green-600 transition-all hover:scale-110 flex items-center gap-2 group"
    aria-label="Falar no WhatsApp"
  >
    <MessageCircle size={24} />
    <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 whitespace-nowrap font-medium pr-0 group-hover:pr-2">
      Falar agora
    </span>
  </a>
);
