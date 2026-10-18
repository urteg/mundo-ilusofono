import type { Metadata } from "next";
import { CenaPorNome, Envoltorio, FaixaChamada } from "@/components/site/Secao";
import { BotaoLink, Cartao, Icone, Marcador, type NomeIcone } from "@/components/ui";
import { destinoComprarDesafio } from "@/lib/acesso";
import type { CenaSerie } from "@/lib/dados-publicos";
import { formatarEuro, precos } from "@/lib/precos";

const preco = formatarEuro(precos.desafio);

export const metadata: Metadata = {
  title: "Desafio 7 Dias",
  description: `Entenda seus primeiros vídeos em português. Um vídeo por dia, durante sete dias. ${preco} + IVA, pagamento único.`,
  alternates: { canonical: "/desafio" },
};

const cenas: CenaSerie[] = ["mar", "campo", "feira", "conversa"];
const dias = [1, 2, 3, 4, 5, 6, 7];

const tranquilidade: { icone: NomeIcone; titulo: string; texto: string }[] = [
  {
    icone: "salvar",
    titulo: "Sem lista de regras",
    texto: "Nada de decorar conjugação. Você só assiste.",
  },
  {
    icone: "relogio",
    titulo: "No seu ritmo",
    texto: "Pulou um dia? Tudo bem. O desafio espera por você.",
  },
  {
    icone: "check",
    titulo: "Você entende pelo contexto",
    texto: "A imagem, o gesto e a história explicam a palavra.",
  },
];

export default function Desafio() {
  return (
    <>
      <section className="overflow-hidden">
        <Envoltorio className="flex flex-wrap items-center gap-12 pt-16 pb-20 sm:pt-20">
          <div className="flex min-w-0 flex-[1.2_1_480px] flex-col gap-5">
            <span className="font-mao text-coral-texto text-[30px] leading-none">
              sete dias, um vídeo por dia
            </span>
            <h1 className="text-azul-fundo text-[clamp(44px,5.6vw,72px)] font-bold">
              Entenda seus primeiros vídeos em português.
            </h1>
            <p className="text-texto-suave text-xl">Um vídeo por dia, durante sete dias.</p>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
              <BotaoLink href={destinoComprarDesafio} className="min-h-14 px-8 text-[19px]">
                Começar por {preco} + IVA
              </BotaoLink>
              <span className="text-texto-suave">Pagamento único. Sem assinatura.</span>
            </div>
          </div>
          <Cartao className="rounded-bolha min-w-0 flex-[1_1_360px] overflow-hidden p-0">
            <CenaPorNome
              nome="campo"
              titulo="Cena ilustrada: casa no campo"
              className="block aspect-video w-full"
            />
            <p className="font-mao text-coral-texto px-5 py-4 text-[26px]">
              relaxa, você vai entender
            </p>
          </Cartao>
        </Envoltorio>
      </section>

      <section className="bg-papel-escuro py-20">
        <Envoltorio className="flex flex-col gap-8">
          <h2 className="text-azul-fundo text-[clamp(36px,4vw,44px)]">Os sete dias</h2>
          <ol className="grid grid-cols-[repeat(auto-fill,minmax(min(240px,100%),1fr))] gap-5">
            {dias.map((n) => (
              <Cartao as="li" key={n} className="flex flex-col overflow-hidden p-0">
                <div className="relative">
                  <CenaPorNome
                    nome={cenas[(n - 1) % cenas.length]}
                    className="block aspect-video w-full"
                  />
                  <span className="bg-azul-fundo font-titulo text-branco absolute top-3 left-3 rounded-full px-3.5 py-1 text-[15px] font-semibold">
                    Dia {n}
                  </span>
                </div>
                <div className="flex flex-col gap-2 p-5">
                  <h3 className="text-azul-fundo text-xl">
                    <Marcador>[PLACEHOLDER: título do dia {n}]</Marcador>
                  </h3>
                  <p className="text-texto-suave text-[15px]">
                    <Marcador>[PLACEHOLDER: frase do dia {n}]</Marcador>
                  </p>
                </div>
              </Cartao>
            ))}
          </ol>
        </Envoltorio>
      </section>

      <section className="py-20">
        <Envoltorio>
          <h2 className="sr-only">Como é o desafio</h2>
          <ul className="grid grid-cols-[repeat(auto-fit,minmax(min(280px,100%),1fr))] gap-6">
            {tranquilidade.map((t) => (
              <Cartao as="li" key={t.titulo} className="rounded-bolha flex flex-col gap-2.5 p-7">
                <Icone nome={t.icone} tamanho={32} className="text-azul-acao" />
                <h3 className="text-azul-fundo text-[23px]">{t.titulo}</h3>
                <p className="text-texto-suave">{t.texto}</p>
              </Cartao>
            ))}
          </ul>
        </Envoltorio>
      </section>

      <FaixaChamada rotuloBotao={`Começar por ${preco} + IVA`} href={destinoComprarDesafio} />
    </>
  );
}
