import React from 'react';
import { ShoppingBag, Utensils, Coffee, Sprout, MessageCircle } from 'lucide-react';

const CONTACT_NUMBER = '5532999943917';

export const LocalTips: React.FC = () => {
  return (
    <section id="dicas" className="py-20 bg-orange-50/50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-serif font-bold text-gray-800 text-center mb-12">Dicas do povoado</h2>
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
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

          <div className="bg-white p-6 rounded-xl shadow-sm border border-orange-100 flex flex-col h-full">
            <div className="flex items-center gap-3 mb-4"><div className="p-2 bg-orange-100 text-orange-600 rounded-lg"><Sprout size={24} /></div><h3 className="font-bold text-lg text-gray-800">Meliponário</h3></div>
            <p className="text-gray-600 text-sm flex-grow">Uma aula viva de biologia: conheça a estrutura das colmeias racionais e participe de uma degustação orientada de méis raros, com nuances florais e ácidas únicas.</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-orange-100 flex flex-col h-full">
            <div className="flex items-center gap-3 mb-4"><div className="p-2 bg-orange-100 text-orange-600 rounded-lg"><Utensils size={24} /></div><h3 className="font-bold text-lg text-gray-800">Casal Gastrô</h3></div>
            <p className="text-gray-600 text-sm flex-grow">Produção artesanal e vivência rural com queijo Minas Artesanal, derivados de leite, charcutaria, pães, molhos e geleias. Uma imersão saborosa na cultura gastronômica mineira, reconhecida em publicações e eventos oficiais do estado.</p>
          </div>

          <div className="bg-green-900 p-6 rounded-xl shadow-sm text-white flex flex-col h-full">
            <div className="flex items-center gap-3 mb-4"><div className="p-2 bg-white/15 text-green-100 rounded-lg"><MessageCircle size={24} /></div><h3 className="font-bold text-lg">Tem um negócio local?</h3></div>
            <p className="text-green-100 text-sm flex-grow">Gostaria de indicar seu estabelecimento para quem visita o povoado? Entre em contato conosco pelo WhatsApp e conte um pouco sobre sua experiência.</p>
            <a className="inline-flex items-center justify-center gap-2 mt-6 rounded-lg bg-white px-4 py-3 text-sm font-semibold text-green-900 hover:bg-green-50" href={`https://wa.me/${CONTACT_NUMBER}?text=${encodeURIComponent('Olá! Tenho um estabelecimento local e gostaria de saber como aparecer nas Dicas do Povoado do Sítio Cangumbim.')}`} target="_blank" rel="noreferrer">Falar pelo WhatsApp <MessageCircle size={17} /></a>
          </div>
        </div>
      </div>
    </section>
  );
};
