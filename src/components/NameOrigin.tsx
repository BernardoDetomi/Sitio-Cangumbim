import React from 'react';
import Image from 'next/image';

export const NameOrigin: React.FC = () => {
  return (
    <section id="nome" className="py-20 bg-stone-50">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row-reverse items-center gap-12">
          <div className="w-full md:w-1/2">
            <div className="relative rounded-2xl overflow-hidden shadow-xl group">
              <Image
                src="/images/nomesitiocangumbim.jpeg"
                alt="Cachoeira do Cangumbim"
                width={1600}
                height={500}
                className="w-full h-[500px] object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute -bottom-6 -left-6 w-48 h-48 bg-green-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>
            </div>
          </div>
          <div className="w-full md:w-1/2 space-y-6">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-800">
              🌿 Sítio Cangumbim: Onde a História e a Natureza se Encontram 🌿
            </h2>
            <p className="text-gray-600 leading-relaxed text-lg">
              O nome "Cangumbim" ecoa histórias de resistência, memória e conexão com a terra. 🌍💧
            </p>
            <p className="text-gray-600 leading-relaxed">
              A cachoeira que abraça nosso sítio carrega o nome de um homem que, como tantos outros, foi marcado pela dor da escravidão, mas também pela força de sua presença. Cangumbim foi um escravizado que viveu nessas redondezas, e sua história ressoa até hoje, lembrando-nos da luta e da herança de nossos antepassados. 🙏
            </p>
            <p className="text-gray-600 leading-relaxed">
              Hoje, o Sítio Cangumbim é mais que um espaço de descanso, é um lugar onde a memória se encontra com a serenidade. Aqui, você poderá se reconectar com a natureza em um ambiente acolhedor, com uma cozinha ampla e fogão a lenha para aquecer os corações, mesa de sinuca para momentos de diversão e a tranquilidade da cachoeira, que, como um suspiro do passado, nos acompanha em cada canto. 🌿🍃
            </p>
            <p className="text-gray-600 leading-relaxed">
              Este é um refúgio onde a história de Cangumbim ainda vive, entrelaçada com a beleza e a paz da natureza. Venha se perder no tempo e se encontrar em nós. ✨
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
