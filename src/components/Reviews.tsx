import React from 'react';
import { Star, Quote } from 'lucide-react';
import Image from 'next/image';

const GOOGLE_REVIEWS_LINK = "https://share.google/ttLtl5VOHYozWWOw1";
const AIRBNB_LINK = "https://www.airbnb.com.br/rooms/1400169773928514039";

export const Reviews: React.FC = () => {
  return (
    <section className="py-20 bg-stone-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-serif font-bold text-center mb-12 text-gray-800">Quem veio, amou</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Review 1 - Artur (Google) */}
          <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow relative">
            <Quote className="absolute top-6 right-6 text-green-100 w-12 h-12" />
            <div className="flex items-center gap-1 mb-4 text-yellow-400">
              <Star fill="currentColor" size={18} />
              <Star fill="currentColor" size={18} />
              <Star fill="currentColor" size={18} />
              <Star fill="currentColor" size={18} />
              <Star fill="currentColor" size={18} />
            </div>
            <p className="text-gray-600 mb-6 italic">&quot;Lugar super tranquilo e aconchegante, o barulho da água bem próximo da casa é um calmante natural. Ótimo para fds de descanso e curtir com a família. Recomendo de olhos fechados.&quot;</p>
            <div className="flex justify-between items-end border-t pt-4">
              <div>
                <p className="font-bold text-gray-800">Artur</p>
                <p className="text-xs text-gray-500">Google Reviews</p>
              </div>
              <svg className="h-6 w-6 opacity-50" viewBox="0 0 24 24" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            </div>
          </div>

          {/* Review 2 - Xenia (Airbnb) */}
          <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow relative">
            <Quote className="absolute top-6 right-6 text-green-100 w-12 h-12" />
            <div className="flex items-center gap-1 mb-4 text-yellow-400">
              <Star fill="currentColor" size={18} />
              <Star fill="currentColor" size={18} />
              <Star fill="currentColor" size={18} />
              <Star fill="currentColor" size={18} />
              <Star fill="currentColor" size={18} />
            </div>
            <p className="text-gray-600 mb-6 italic line-clamp-6">&quot;Só tenho que agradecer ao Bernardo e a família dele. O lugar é mais lindo e aconchegante que nas Fotos. Muito tranquilo, muito limpo e arrumado. A recepção foi maravilhosa, deixaram um mimo com um bilhete carinhoso que amei.&quot;</p>
            <div className="flex justify-between items-end border-t pt-4">
              <div>
                <p className="font-bold text-gray-800">Xenia</p>
                <p className="text-xs text-gray-500">Airbnb</p>
              </div>
              <Image src="https://upload.wikimedia.org/wikipedia/commons/6/69/Airbnb_Logo_B%C3%A9lo.svg" width={80} height={24} className="h-6 opacity-50" alt="Airbnb" />
            </div>
          </div>

          {/* Review 3 - Victor (Google) */}
          <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow relative">
            <Quote className="absolute top-6 right-6 text-green-100 w-12 h-12" />
            <div className="flex items-center gap-1 mb-4 text-yellow-400">
              <Star fill="currentColor" size={18} />
              <Star fill="currentColor" size={18} />
              <Star fill="currentColor" size={18} />
              <Star fill="currentColor" size={18} />
              <Star fill="currentColor" size={18} />
            </div>
            <p className="text-gray-600 mb-6 italic">&quot;Lugar perfeito para se conectar com a natureza e fugir do caos da vida cotidiana. Estrutura completa em meio a paz de uma floresta natural. Perfeito para recarregar as energias!&quot;</p>
            <div className="flex justify-between items-end border-t pt-4">
              <div>
                <p className="font-bold text-gray-800">Victor</p>
                <p className="text-xs text-gray-500">Google Reviews</p>
              </div>
              <svg className="h-6 w-6 opacity-50" viewBox="0 0 24 24" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            </div>
          </div>

          {/* Review 4 - Cláudia (Google) */}
          <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow relative">
            <Quote className="absolute top-6 right-6 text-green-100 w-12 h-12" />
            <div className="flex items-center gap-1 mb-4 text-yellow-400">
              <Star fill="currentColor" size={18} />
              <Star fill="currentColor" size={18} />
              <Star fill="currentColor" size={18} />
              <Star fill="currentColor" size={18} />
              <Star fill="currentColor" size={18} />
            </div>
            <p className="text-gray-600 mb-6 italic line-clamp-6">&quot;Um sonho de lugar! Uma área externa aconchegante, com redes, iluminação e uma lareira de chão para te aquecer nos dias frios. Para os dias quentes, uma bela cachoeira no fundo da horta. Vale a pena conhecer!&quot;</p>
            <div className="flex justify-between items-end border-t pt-4">
              <div>
                <p className="font-bold text-gray-800">Cláudia</p>
                <p className="text-xs text-gray-500">Google Reviews</p>
              </div>
              <svg className="h-6 w-6 opacity-50" viewBox="0 0 24 24" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            </div>
          </div>

          {/* Review 5 - Reinaldo (Airbnb) */}
          <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow relative">
            <Quote className="absolute top-6 right-6 text-green-100 w-12 h-12" />
            <div className="flex items-center gap-1 mb-4 text-yellow-400">
              <Star fill="currentColor" size={18} />
              <Star fill="currentColor" size={18} />
              <Star fill="currentColor" size={18} />
              <Star fill="currentColor" size={18} />
              <Star fill="currentColor" size={18} />
            </div>
            <p className="text-gray-600 mb-6 italic">&quot;Bernardo é um anfitrião que superou nossas expectativas. O local é muito limpo, arrumado. Roupas de cama e banho cheirosas. Contato com a natureza e extrema tranquilidade e privacidade.&quot;</p>
            <div className="flex justify-between items-end border-t pt-4">
              <div>
                <p className="font-bold text-gray-800">Reinaldo</p>
                <p className="text-xs text-gray-500">Airbnb</p>
              </div>
              <Image src="https://upload.wikimedia.org/wikipedia/commons/6/69/Airbnb_Logo_B%C3%A9lo.svg" width={80} height={24} className="h-6 opacity-50" alt="Airbnb" />
            </div>
          </div>

          {/* Card "Veja mais" */}
          <div className="bg-green-50 p-8 rounded-xl border border-green-100 flex flex-col items-center justify-center text-center">
            <h3 className="font-bold text-gray-800 text-xl mb-2">Veja mais avaliações</h3>
            <p className="text-gray-600 mb-6">Confira o que estão falando sobre nós no Google e Airbnb.</p>
            <div className="flex gap-3">
              <a href={GOOGLE_REVIEWS_LINK} target="_blank" rel="noreferrer" className="px-4 py-2 bg-white rounded-full shadow-sm text-sm font-medium text-blue-600 hover:bg-blue-50 transition-colors">Google</a>
              <a href={AIRBNB_LINK} target="_blank" rel="noreferrer" className="px-4 py-2 bg-white rounded-full shadow-sm text-sm font-medium text-red-500 hover:bg-red-50 transition-colors">Airbnb</a>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
