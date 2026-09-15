import React from 'react'
import Image from 'next/image'

export default function Page() {
  return (
    <main className="max-w-4xl mx-auto p-6">
      <div className="flex items-center gap-4 mb-6">
        <Image src="/logocangumbim.png" alt="Sítio Cangumbim" width={160} height={64} className="rounded-md shadow-sm" />
        <div>
          <h1 className="text-3xl font-serif">LGPD — Proteção de Dados</h1>
          <p className="text-sm text-gray-600">Direitos, princípios e como exercê-los</p>
        </div>
      </div>

      <section className="bg-white border rounded-xl p-6 shadow-sm">
        <p className="mb-4">O Sítio Cangumbim adota os princípios da Lei Geral de Proteção de Dados (Lei nº 13.709/2018) no tratamento de dados pessoais de hóspedes e visitantes. Buscamos transparência e minimização de dados.</p>

        <h2 className="text-lg font-semibold mt-4 mb-2">Princípios</h2>
        <ul className="list-disc pl-6 mb-4">
          <li>Finalidade</li>
          <li>Necessidade</li>
          <li>Transparência</li>
          <li>Segurança</li>
        </ul>

        <h2 className="text-lg font-semibold mt-4 mb-2">Direitos dos titulares</h2>
        <p className="mb-4">Titulares podem solicitar: confirmação de tratamento, acesso, correção, eliminação, portabilidade, revogação do consentimento e limitação do uso. Para solicitações, use o contato do estabelecimento disponível no rodapé do site.</p>

        <h2 className="text-lg font-semibold mt-4 mb-2">Responsável</h2>
        <p className="mb-4">O proprietário do Sítio Cangumbim é o responsável pelo tratamento dos dados. Procedimentos operacionais internos e prazo de retenção são responsabilidade do proprietário.</p>

        <p className="text-sm text-gray-600 mt-6">Este texto é informativo. Para conformidade completa, consulte um assessor jurídico especializado em proteção de dados.</p>
      </section>
    </main>
  )
}
