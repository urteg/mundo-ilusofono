import type { Metadata } from "next";
import { Suspense } from "react";
import { CartoesPlanos } from "@/components/site/CartoesPlanos";
import { Envoltorio, Mao } from "@/components/site/Secao";
import { Acordeao, BotaoLink, Icone } from "@/components/ui";
import { avisoImposto, formatarEuro, precos } from "@/lib/precos";

export const metadata: Metadata = {
  title: "Planos",
  description: `Entender ou Participar, por mês ou por ano. ${avisoImposto}`,
  alternates: { canonical: "/planos" },
};

type Celula = true | false | string;
const colunas = ["Grátis", "Entender", "Participar"] as const;
const linhas: [string, Celula, Celula, Celula][] = [
  ["Vídeos do nível inicial", true, true, true],
  ["Biblioteca completa", false, true, true],
  ["Séries", false, true, true],
  ["Progresso", true, true, true],
  ["Vocabulário do vídeo", "Só nos vídeos grátis", true, true],
  ["Gravações das lives", false, true, true],
  ["Lives ao vivo", false, false, true],
  ["Conversa em grupo", false, false, true],
];

function ValorCelula({ valor }: { valor: Celula }) {
  if (typeof valor === "string") return <span className="text-sm">{valor}</span>;
  return valor ? (
    <Icone nome="check" rotulo="Sim" className="mx-auto text-[#00684F]" />
  ) : (
    <Icone nome="fechar" rotulo="Não" tamanho={20} className="text-texto-suave mx-auto" />
  );
}

const perguntas = [
  {
    titulo: "Posso cancelar a qualquer momento?",
    conteudo: "Pode. Você continua com acesso até o fim do período já pago.",
  },
  {
    titulo: "O preço já inclui o imposto?",
    conteudo: "Sim. O IVA já está incluído no valor que você vê. Não há nada a somar no pagamento.",
  },
  {
    titulo: "Posso trocar de plano depois?",
    conteudo: "Pode, pela sua conta, quando quiser. A diferença é ajustada na próxima cobrança.",
  },
  {
    titulo: "Em que fuso são as lives?",
    conteudo:
      "O app mostra o horário de Madri e o do seu fuso. Os horários alternam a cada semana.",
  },
];

export default function Planos() {
  return (
    <>
      <section>
        <Envoltorio className="flex flex-col items-center gap-4 pt-16 pb-10 text-center sm:pt-20">
          <h1 className="text-azul-fundo max-w-[860px] text-[clamp(40px,5.4vw,64px)] font-bold">
            Escolha como você quer viver o português
          </h1>
          <p className="text-texto-suave text-xl">Cancele quando quiser. {avisoImposto}</p>
        </Envoltorio>
      </section>

      <section className="pb-12">
        <Envoltorio>
          {/* Sem JavaScript da URL ainda (página estática), mostra o anual. */}
          <Suspense fallback={<div className="h-[640px]" aria-hidden="true" />}>
            <CartoesPlanos />
          </Suspense>
          <p className="text-texto-suave mt-6 text-center">{avisoImposto}</p>
        </Envoltorio>
      </section>

      <section className="pb-20">
        <Envoltorio>
          <div className="rounded-bolha bg-papel-escuro mx-auto flex max-w-[920px] flex-wrap items-center justify-between gap-6 px-7 py-6">
            <div className="flex flex-col gap-1">
              <Mao className="text-[26px]">quer experimentar antes?</Mao>
              <h2 className="text-azul-fundo text-[28px]">Desafio 7 Dias</h2>
              <p className="text-texto-suave">
                {formatarEuro(precos.desafio)}, pagamento único, IVA incluído. Sem assinatura.
              </p>
            </div>
            <BotaoLink href="/desafio">Conhecer o Desafio</BotaoLink>
          </div>
        </Envoltorio>
      </section>

      <section className="pb-20">
        <Envoltorio className="flex max-w-[920px] flex-col gap-6">
          <h2 className="text-azul-fundo text-[clamp(32px,3.6vw,44px)]">Compare os planos</h2>
          <div
            className="rounded-card bg-branco shadow-card overflow-x-auto"
            role="region"
            aria-labelledby="legenda-comparacao"
            tabIndex={0}
          >
            <table className="w-full min-w-[560px] border-collapse">
              <caption id="legenda-comparacao" className="sr-only">
                O que cada plano inclui
              </caption>
              <thead>
                <tr>
                  <th
                    scope="col"
                    className="bg-branco font-titulo text-azul-fundo sticky left-0 z-10 px-4 py-4 text-left text-lg font-semibold"
                  >
                    O que você recebe
                  </th>
                  {colunas.map((c) => (
                    <th
                      key={c}
                      scope="col"
                      className="font-titulo text-azul-fundo px-4 py-4 text-center text-lg font-semibold"
                    >
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {linhas.map(([nome, ...valores]) => (
                  <tr key={nome} className="border-areia border-t">
                    <th
                      scope="row"
                      className="bg-branco sticky left-0 z-10 max-w-[45vw] px-4 py-3.5 text-left font-semibold"
                    >
                      {nome}
                    </th>
                    {valores.map((v, i) => (
                      <td key={colunas[i]} className="px-4 py-3.5 text-center">
                        <ValorCelula valor={v} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-texto-suave text-sm sm:hidden">
            Arraste a tabela para o lado para ver todos os planos.
          </p>
        </Envoltorio>
      </section>

      <section className="pb-24">
        <Envoltorio className="flex max-w-[880px] flex-col gap-6">
          <h2 className="text-azul-fundo text-[clamp(32px,3.6vw,44px)]">Dúvidas sobre pagamento</h2>
          <Acordeao nome="faq-pagamento" itens={perguntas} />
        </Envoltorio>
      </section>
    </>
  );
}
