import React from 'react'
import Image from 'next/image'

export default function Page() {
  return (
    <main className="max-w-4xl mx-auto p-6">
      <div className="flex items-center gap-4 mb-6">
        <Image src="/logocangumbim.png" alt="Sítio Cangumbim" width={160} height={64} className="rounded-md shadow-sm" />
        <div>
          <h1 className="text-3xl font-serif">Política de Privacidade</h1>
          <p className="text-sm text-gray-600">Proteção e uso responsável dos seus dados</p>
        </div>
      </div>

      <section className="bg-white border rounded-xl p-6 shadow-sm">
        <p className="mb-4">No Sítio Cangumbim tratamos os dados pessoais informados pelos hóspedes apenas para finalidades relacionadas à hospedagem: emitir orçamentos, formalizar contratos, comunicar sobre reservas e, quando exigido por norma ou órgão regulatório, cadastrar hóspedes em plataformas oficiais (por exemplo, Cadastur/FNRH), conforme obrigação aplicável.</p>

        <h2 className="text-lg font-semibold mt-4 mb-2">Quais dados coletamos</h2>
        <ul className="list-disc pl-6 mb-4">
          <li>Nome, CPF e data de nascimento</li>
          <li>Telefone e e-mail</li>
          <li>Dados de acompanhantes (quando fornecidos)</li>
        </ul>

        <h2 className="text-lg font-semibold mt-4 mb-2">Para que usamos os dados</h2>
        <p className="mb-4">Os dados são usados para processar solicitações e confirmar reservas, preparar o contrato de hospedagem, realizar cadastros em sistemas oficiais quando obrigatórios e para comunicação relacionada à reserva.</p>

        <h2 className="text-lg font-semibold mt-4 mb-2">Base legal</h2>
        <p className="mb-4">O tratamento apoia-se no seu consentimento (aceito ao enviar a solicitação) e em obrigações legais/regulatórias quando aplicável.</p>

        <h2 className="text-lg font-semibold mt-4 mb-2">Compartilhamento e segurança</h2>
        <p className="mb-4">Compartilhamos dados apenas com provedores necessários ao serviço (pagamento, mensageria) e com organizações/órgãos quando exigido por lei. Adotamos medidas técnicas e administrativas razoáveis para proteger as informações.</p>

        <h2 className="text-lg font-semibold mt-4 mb-2">Direitos dos titulares</h2>
        <p className="mb-4">Você pode solicitar acesso, correção, eliminação, portabilidade ou a revogação do consentimento. Para exercer seus direitos, contate o responsável pelo sítio através do contato disponível no rodapé do site.</p>

        <p className="text-sm text-gray-600 mt-6">Este texto é informativo e deve ser revisado pelo responsável legal do estabelecimento para refletir procedimentos internos e obrigações específicas.</p>
      </section>
    </main>
  )
}
