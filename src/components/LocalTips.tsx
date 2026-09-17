import React from 'react';
import { ShoppingBag, Utensils, Coffee, Sprout, MessageCircle, Phone } from 'lucide-react';

const CONTACT_NUMBER = '5532999943917';

const WhatsAppLink: React.FC<{ number: string }> = ({ number }) => (
  <a className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-green-700 hover:text-green-900" href={`https://wa.me/${number.replace(/\D/g, '')}`} target="_blank" rel="noreferrer">
    <Phone size={16} /> {number}
  </a>
);

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
              <h3 className="font-bold text-lg text-gray-800">Cantinho da Tia Josi</h3>
            </div>
            <p className="text-gray-600 text-sm flex-grow">
              Comida caseira feita com carinho. O restaurante funciona mediante agendamento, perfeito para um almoço em família com sabor mineiro.
            </p>
            <WhatsAppLink number="32 99922-0037" />
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
            <WhatsAppLink number="32 99930-8338" />
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-orange-100 flex flex-col h-full">
            <div className="flex items-center gap-3 mb-4"><div className="p-2 bg-orange-100 text-orange-600 rounded-lg"><Sprout size={24} /></div><h3 className="font-bold text-lg text-gray-800">Meliponário Grota do Recreio</h3></div>
            <p className="text-gray-600 text-sm flex-grow">Uma aula viva de biologia: conheça a estrutura das colmeias racionais e participe de uma degustação orientada de méis raros, com nuances florais e ácidas únicas.</p>
            <WhatsAppLink number="32 99817-0301" />
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-orange-100 flex flex-col h-full">
            <div className="flex items-center gap-3 mb-4"><div className="p-2 bg-orange-100 text-orange-600 rounded-lg"><Utensils size={24} /></div><h3 className="font-bold text-lg text-gray-800">Casal Gastrô</h3></div>
            <p className="text-gray-600 text-sm flex-grow">Produção artesanal e vivência rural com queijo Minas Artesanal, derivados de leite, charcutaria, pães, molhos e geleias. Uma imersão saborosa na cultura gastronômica mineira, reconhecida em publicações e eventos oficiais do estado.</p>
            <WhatsAppLink number="31 99967-4467" />
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-orange-100 flex flex-col h-full">
            <div className="flex items-center gap-3 mb-4"><div className="p-2 bg-orange-100 text-orange-600 rounded-lg"><ShoppingBag size={24} /></div><h3 className="font-bold text-lg text-gray-800">Memorial e Ateliê 2 Irmãs</h3></div>
            <p className="text-gray-600 text-sm flex-grow">Conheça as raízes do artesanato de Resende Costa em um espaço rústico e autêntico. Descubra ferramentas históricas centenárias, resgate histórias do nosso povoado e sente-se ao tear para tecer com as próprias mãos um pedacinho dessa tradição. A visita precisa ser agendada e tem o custo de R$ 10,00 por pessoa.</p>
            <WhatsAppLink number="32 99958-3420" />
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
