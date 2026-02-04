import React from 'react';
import { Users, Utensils, Gamepad2, Flame, Trees, Church, Wifi, Car, CheckCircle } from 'lucide-react';

export const Amenities: React.FC = () => {
  const items = [
    { icon: Users, title: "Capacidade", desc: "Acomoda até 8 pessoas confortavelmente" },
    { icon: Utensils, title: "Cozinha Completa", desc: "Fogão a lenha, gás, airfryer e utensílios" },
    { icon: Gamepad2, title: "Lazer", desc: "Mesa de sinuca e TV na sala" },
    { icon: Flame, title: "Área Externa", desc: "Churrasqueira e lareira de chão (fogueira)" },
    { icon: Trees, title: "Natureza", desc: "Cachoeira no quintal e pomar" },
    { icon: Church, title: "Capela", desc: "Uma linda capela em frente à casa" },
    { icon: Wifi, title: "Conexão", desc: "Wi-Fi disponível" },
    { icon: Car, title: "Garagem", desc: "Coberta para 2 carros e motos" },
    { icon: CheckCircle, title: "Segurança", desc: "Propriedade monitorada por câmeras" },
  ];

  return (
    <section id="comodidades" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-serif font-bold text-gray-800 text-center mb-16">O que o Sítio oferece</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-12">
          {items.map((item, idx) => (
            <div key={idx} className="flex flex-col items-center text-center p-6 rounded-2xl bg-stone-50 hover:bg-green-50 transition-colors duration-300 group">
              <div className="bg-white p-4 rounded-full shadow-sm mb-4 group-hover:scale-110 transition-transform">
                <item.icon className="w-8 h-8 text-green-700" />
              </div>
              <h3 className="font-bold text-gray-800 mb-2">{item.title}</h3>
              <p className="text-sm text-gray-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
