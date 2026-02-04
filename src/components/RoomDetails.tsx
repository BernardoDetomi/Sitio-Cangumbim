import React from 'react';
import { BedDouble, Users } from 'lucide-react';

export const RoomDetails: React.FC = () => {
  return (
    <section id="acomodacoes" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
           <span className="text-green-700 font-bold tracking-widest uppercase text-sm">Conforto e Privacidade</span>
           <h2 className="text-3xl font-serif font-bold text-gray-800 mt-2">Distribuição dos Quartos</h2>
           <p className="text-gray-600 mt-4">Acomoda até 8 pessoas com conforto em 3 quartos espaçosos.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Suíte 1 */}
          <div className="bg-stone-50 p-8 rounded-2xl border border-stone-100 hover:shadow-lg transition-all">
            <div className="bg-white w-12 h-12 rounded-full flex items-center justify-center shadow-sm mb-6 text-green-700">
              <BedDouble size={24} />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Suíte 1</h3>
            <p className="text-gray-600 text-sm mb-4">Privacidade e conforto para o casal.</p>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-2">• 1 Cama de Casal</li>
              <li className="flex items-center gap-2">• Banheiro privativo</li>
            </ul>
          </div>

          {/* Suíte 2 */}
          <div className="bg-stone-50 p-8 rounded-2xl border border-stone-100 hover:shadow-lg transition-all">
             <div className="bg-white w-12 h-12 rounded-full flex items-center justify-center shadow-sm mb-6 text-green-700">
              <div className="flex">
                <BedDouble size={20} />
                <Users size={16} className="-ml-1 mt-1" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Suíte 2</h3>
            <p className="text-gray-600 text-sm mb-4">Ideal para casal com filho.</p>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-2">• 1 Cama de Casal</li>
              <li className="flex items-center gap-2">• 1 Cama de Solteiro</li>
              <li className="flex items-center gap-2">• Banheiro privativo</li>
            </ul>
          </div>

          {/* Quarto 3 */}
          <div className="bg-stone-50 p-8 rounded-2xl border border-stone-100 hover:shadow-lg transition-all">
             <div className="bg-white w-12 h-12 rounded-full flex items-center justify-center shadow-sm mb-6 text-green-700">
               <div className="flex -space-x-1">
                 <Users size={20} />
                 <Users size={20} />
               </div>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Quarto 3</h3>
            <p className="text-gray-600 text-sm mb-4">Espaço para amigos ou crianças.</p>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-2">• 3 Camas de Solteiro</li>
              <li className="flex items-center gap-2">• Acesso ao banheiro social</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};
