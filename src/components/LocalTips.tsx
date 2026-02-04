import React from 'react';
import { ShoppingBag, Utensils, Coffee } from 'lucide-react';

export const LocalTips: React.FC = () => {
  return (
    <section id="dicas" className="py-20 bg-orange-50/50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-serif font-bold text-gray-800 text-center mb-12">Dicas do Povoado</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {/* Dica 1 */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-orange-100 flex flex-col h-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
                <ShoppingBag size={24} />
              </div>
              <h3 className="font-bold text-lg text-gray-800">Bar do Roberto</h3>
            </div>
            <p className="text-gray-600 text-sm flex-grow">
              Excelente opção no povoado. Funciona dia e noite com itens de mercearia (arroz, alho, cebola, etc.), cerveja gelada e petiscos deliciosos à noite.
            </p>
          </div>

          {/* Dica 2 */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-orange-100 flex flex-col h-full">
             <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
                <Utensils size={24} />
              </div>
              <h3 className="font-bold text-lg text-gray-800">Cantina da Tia Josi</h3>
            </div>
            <p className="text-gray-600 text-sm flex-grow">
              Comida caseira feita com carinho. O restaurante funciona mediante agendamento, perfeito para um almoço em família com sabor mineiro.
            </p>
          </div>

          {/* Dica 3 */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-orange-100 flex flex-col h-full">
             <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
                <Coffee size={24} />
              </div>
              <h3 className="font-bold text-lg text-gray-800">Biscoitos da Jô</h3>
            </div>
            <p className="text-gray-600 text-sm flex-grow">
              Experimente os biscoitos artesanais vendidos separadamente ou agende um delicioso café colonial com a Jô, uma biscoiteira de mão cheia.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
