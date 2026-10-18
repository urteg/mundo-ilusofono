import type { Metadata } from "next";
import { CenaCampo, CenaConversa, CenaFeira, CenaMar } from "@/components/site/cenas";
import { Abertura, Envoltorio, FaixaChamada, Mao } from "@/components/site/Secao";
import { Cartao, Icone, Marcador, SeloEtapa, type NomeIcone } from "@/components/ui";

export const metadata: Metadata = {
  title: "Como funciona",
  description:
    "Você assiste a vídeos que entende quase por inteiro e o resto vem pelo contexto. Veja os quatro passos e a escada de níveis.",
  alternates: { canonical: "/metodo" },
};

const beneficios: { icone: NomeIcone; titulo: string; texto: string; cor: string }[] = [
  {
    icone: "coracao",
    titulo: "Sem pressão",
    texto: "Ninguém te corrige no meio da frase. Você fala quando tiver vontade.",
    cor: "text-azul-acao",
  },
  {
    icone: "relogio",
    titulo: "No seu ritmo",
    texto: "Dez minutos num dia, uma hora no outro. Tudo conta.",
    cor: "text-[#00684F]",
  },
  {
    icone: "legenda",
    titulo: "Português de verdade",
    texto: 'O português falado na rua, com "né", "tá" e "olha". Não o do livro.',
    cor: "text-[#B23A0B]",
  },
];

const passos = [
  {
    Cena: CenaCampo,
    titulo: "Descobrir o nível",
    texto: "Três vídeos curtos dizem por onde começar.",
  },
  { Cena: CenaMar, titulo: "Assistir", texto: "Vídeos do seu nível, sobre o que te interessa." },
  {
    Cena: CenaFeira,
    titulo: "Contar as horas",
    texto: "O app soma cada minuto, dentro e fora dele.",
  },
  {
    Cena: CenaConversa,
    titulo: "Chegar à fluência",
    texto: "A fala aparece quando o ouvido está pronto.",
  },
];

const escada = [
  {
    etapa: 1 as const,
    frase: "Entende cenas do dia a dia com muita imagem",
    horas: "[PLACEHOLDER: horas do nível 1]",
  },
  {
    etapa: 2 as const,
    frase: "Acompanha conversas simples sem pausar",
    horas: "[PLACEHOLDER: horas do nível 2]",
  },
  {
    etapa: 3 as const,
    frase: "Entende histórias, opiniões e piadas",
    horas: "[PLACEHOLDER: horas do nível 3]",
  },
  {
    etapa: 4 as const,
    frase: "Assiste a qualquer coisa feita para quem fala português",
    horas: "[PLACEHOLDER: horas do nível 4]",
  },
];

const recuos = ["sm:ml-0", "sm:ml-[8%]", "sm:ml-[16%]", "sm:ml-[24%]"];

export default function Metodo() {
  return (
    <>
      <Abertura mao="sem lista de regras" titulo="Como funciona" centro>
        <p>
          Você assiste a vídeos que entende quase por inteiro. O resto o seu cérebro completa pelo
          contexto. É assim que toda criança chega à primeira língua.
        </p>
      </Abertura>

      <section className="pb-20 sm:pb-24">
        <Envoltorio>
          <Cartao className="rounded-bolha flex flex-wrap items-center gap-10 p-7 sm:p-12">
            <div className="flex min-w-0 flex-[1_1_420px] flex-col gap-3.5">
              <h2 className="text-azul-fundo text-[clamp(32px,3.4vw,40px)]">
                O que é entender de verdade
              </h2>
              <p className="text-texto-suave text-lg">
                Não é traduzir na cabeça. É ouvir &ldquo;tá muito calor hoje, né?&rdquo; e sentir o
                calor junto. Quando a história faz sentido, a palavra nova gruda sozinha.
              </p>
              <p className="text-texto-suave text-lg">
                Por isso cada vídeo mostra muito: gestos, objetos, lugares. Você entende o principal
                e deixa o resto passar.
              </p>
            </div>
            <figure className="flex min-w-0 flex-[1_1_360px] flex-col gap-3">
              <CenaFeira
                titulo="Cena ilustrada: feira com frutas"
                className="block aspect-video w-full rounded-[18px]"
              />
              <figcaption>
                <Mao className="text-[26px]">&ldquo;essa aqui tá docinha, ó&rdquo;</Mao>
              </figcaption>
            </figure>
          </Cartao>
        </Envoltorio>
      </section>

      <section className="bg-papel-escuro py-20 sm:py-24">
        <Envoltorio>
          <h2 className="sr-only">Por que é mais leve</h2>
          <ul className="grid grid-cols-[repeat(auto-fit,minmax(min(280px,100%),1fr))] gap-6">
            {beneficios.map((b) => (
              <Cartao as="li" key={b.titulo} className="flex flex-col gap-3 p-7">
                <Icone nome={b.icone} tamanho={32} className={b.cor} />
                <h3 className="text-azul-fundo text-2xl">{b.titulo}</h3>
                <p className="text-texto-suave">{b.texto}</p>
              </Cartao>
            ))}
          </ul>
        </Envoltorio>
      </section>

      <section className="py-20 sm:py-24">
        <Envoltorio className="flex flex-col gap-10">
          <h2 className="text-azul-fundo text-[clamp(36px,4vw,48px)]">Quatro passos</h2>
          <ol className="grid grid-cols-[repeat(auto-fit,minmax(min(240px,100%),1fr))] gap-6">
            {passos.map(({ Cena, titulo, texto }, i) => (
              <Cartao as="li" key={titulo} className="flex flex-col overflow-hidden p-0">
                <Cena className="block aspect-video w-full" />
                <div className="flex flex-col gap-2 p-5">
                  <Mao className="text-2xl">passo {i + 1}</Mao>
                  <h3 className="text-azul-fundo text-[22px]">{titulo}</h3>
                  <p className="text-texto-suave">{texto}</p>
                </div>
              </Cartao>
            ))}
          </ol>
        </Envoltorio>
      </section>

      <section className="bg-azul-fundo text-branco py-20 sm:py-24">
        <Envoltorio className="flex flex-col gap-9">
          <h2 className="text-branco text-[clamp(36px,4vw,48px)]">A escada de níveis</h2>
          <ol className="flex flex-col gap-3.5">
            {escada.map((d, i) => (
              <li
                key={d.etapa}
                className={`bg-branco text-texto flex max-w-[640px] flex-wrap items-center gap-x-4 gap-y-2 rounded-[18px] px-6 py-4 ${recuos[i]}`}
              >
                <SeloEtapa etapa={d.etapa} />
                <span className="min-w-0 flex-[1_1_220px]">{d.frase}</span>
                <b>
                  <Marcador>{d.horas}</Marcador>
                </b>
              </li>
            ))}
          </ol>
        </Envoltorio>
      </section>

      <section className="py-20 sm:py-24">
        <Envoltorio className="flex flex-col gap-8">
          <h2 className="text-azul-fundo text-[clamp(32px,3.6vw,44px)]">
            Histórias de participantes
          </h2>
          <ul className="grid grid-cols-[repeat(auto-fit,minmax(min(300px,100%),1fr))] gap-6">
            {[1, 2, 3].map((n) => (
              <Cartao as="li" key={n} className="overflow-hidden p-0">
                <div className="bg-areia grid aspect-video place-items-center p-4 text-center">
                  <Marcador>[PLACEHOLDER: depoimento em vídeo {n}]</Marcador>
                </div>
                <p className="px-5 py-4">
                  <Marcador>[PLACEHOLDER: nome]</Marcador>, <Marcador>[PLACEHOLDER: país]</Marcador>
                </p>
              </Cartao>
            ))}
          </ul>
        </Envoltorio>
      </section>

      <FaixaChamada />
    </>
  );
}
