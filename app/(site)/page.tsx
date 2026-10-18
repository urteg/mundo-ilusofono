import type { Metadata } from "next";
import Link from "next/link";
import { CenaCampo, CenaConversa, CenaMar } from "@/components/site/cenas";
import { ChamadaEmail } from "@/components/site/ChamadaEmail";
import { Apresentador, Envoltorio, FaixaChamada, Mao } from "@/components/site/Secao";
import { QuadroVideoExemplo } from "@/components/site/LegendaAnimada";
import { Acordeao, BotaoLink, Cartao, Icone, Marcador, SeloEtapa } from "@/components/ui";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: { absolute: `${site.nome}: entenda português de verdade` },
  description: site.descricao,
  alternates: { canonical: "/" },
};

// [PLACEHOLDER: número de alunos, só quando for verdadeiro]. Enquanto for null, o contador não aparece.
const numeroAlunos: number | null = null;

function NumeroPasso({ n }: { n: number }) {
  return (
    <span className="bg-azul-acao font-titulo text-branco grid size-10 shrink-0 place-items-center rounded-full text-lg font-bold">
      {n}
    </span>
  );
}

const vocabulario = [
  { palavra: "a feira", sentido: "onde se compra fruta na rua" },
  { palavra: "barato", sentido: "custa pouco" },
  { palavra: "o troco", sentido: "o dinheiro que volta" },
];

const caminhos = [
  { n: 1 as const, sub: "[PLACEHOLDER: subníveis 1 a 3]" },
  { n: 2 as const, sub: "[PLACEHOLDER: subníveis 4 a 6]" },
  { n: 3 as const, sub: "[PLACEHOLDER: subníveis 7 a 9]" },
];

const perguntas = [
  {
    titulo: "Preciso saber alguma coisa de português?",
    conteudo: "Não. Os primeiros vídeos são feitos para quem está começando do zero.",
  },
  { titulo: "Quanto tempo por dia?", conteudo: "Você escolhe a meta: 10, 20, 30 ou 45 minutos." },
  {
    titulo: "E se eu não entender nada?",
    conteudo: "Escolha um vídeo mais fácil. Entender pouco no começo é normal.",
  },
  { titulo: "Posso cancelar quando quiser?", conteudo: "Pode, a qualquer momento, sem multa." },
];

const organizacao = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: site.nome,
  url: site.url,
  logo: `${site.url}/marca/logo.png`,
  slogan: site.lema,
  email: site.email,
};

export default function Inicio() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizacao) }}
      />

      {/* a. Abertura */}
      <section className="overflow-hidden">
        <Envoltorio className="flex flex-wrap items-center gap-12 pt-12 pb-20 sm:pt-20 sm:pb-24">
          <div className="flex min-w-0 flex-[1_1_480px] flex-col gap-6">
            <h1 className="text-azul-fundo text-[clamp(44px,6.4vw,84px)] font-bold tracking-tight">
              Entenda português de verdade. <span className="text-azul">Vivendo.</span>
            </h1>
            <p className="text-texto-suave max-w-[520px] text-[21px]">
              <Marcador>[PLACEHOLDER: uma frase]</Marcador>
            </p>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
              <BotaoLink href="/desafio" className="min-h-14 px-8 text-[19px]">
                Comece o Desafio
              </BotaoLink>
              <Link href="/planos" className="inline-flex min-h-11 items-center font-bold">
                Ver planos
              </Link>
            </div>
            {numeroAlunos !== null && (
              <p className="text-texto-suave text-sm">
                {numeroAlunos.toLocaleString("pt-BR")} pessoas já assistem com a gente.
              </p>
            )}
          </div>

          <div className="flex flex-[1_1_380px] justify-center py-6">
            <div className="relative w-[min(300px,76vw)] -rotate-6">
              <div className="bg-texto rounded-[44px] p-3 shadow-[0_24px_48px_rgba(30,39,46,.22)]">
                <div className="bg-papel flex flex-col overflow-hidden rounded-[34px]">
                  <div className="relative">
                    <CenaMar
                      titulo="Cena ilustrada: barco no mar num dia de sol"
                      className="block aspect-[9/11] w-full"
                    />
                    <p className="bg-azul-fundo/90 text-branco absolute inset-x-3.5 bottom-3.5 rounded-xl px-3 py-2.5 text-center text-[17px] leading-snug font-semibold">
                      Olha, que dia bonito, né?
                    </p>
                  </div>
                  <div className="flex flex-col gap-2.5 p-4">
                    <SeloEtapa etapa={1} className="self-start" />
                    <p className="font-titulo text-azul-fundo text-lg font-semibold">
                      Um passeio de barco
                    </p>
                    <div className="bg-areia h-2 overflow-hidden rounded-full" aria-hidden="true">
                      <i className="bg-verde block h-full w-[45%] rounded-full" />
                    </div>
                  </div>
                </div>
              </div>
              <span
                aria-hidden="true"
                className="rounded-bolha bg-branco font-mao text-coral-texto shadow-card absolute top-14 -right-4 rotate-[8deg] px-4 py-2.5 text-[26px] whitespace-nowrap sm:-right-14"
              >
                deixa passar, elas voltam
              </span>
            </div>
          </div>
        </Envoltorio>
      </section>

      {/* b. Prova rápida */}
      <section className="bg-azul-fundo text-branco py-20 sm:py-[88px]">
        <Envoltorio className="flex flex-wrap items-center gap-12">
          <div className="flex min-w-0 flex-[1_1_340px] flex-col gap-4">
            <h2 className="text-branco text-[clamp(36px,4vw,48px)]">
              Veja agora o que você já entende.
            </h2>
            <p className="text-azul-claro text-lg">
              Aperte o play. Sem dicionário, sem pausa. Repare em quanto faz sentido só pelo que
              você vê.
            </p>
            <p className="text-azul-claro text-sm">
              <Marcador>[PLACEHOLDER: vídeo de exemplo de 30 segundos]</Marcador>
            </p>
          </div>
          <div className="min-w-0 flex-[1.4_1_520px]">
            <QuadroVideoExemplo />
          </div>
        </Envoltorio>
      </section>

      {/* c. Cada vídeo vira uma lição */}
      <section id="como" className="py-20 sm:py-24">
        <Envoltorio className="flex flex-col gap-10">
          <div className="flex max-w-[720px] flex-col gap-3">
            <h2 className="text-azul-fundo text-[clamp(36px,4vw,48px)]">
              Cada vídeo vira uma lição
            </h2>
            <p className="text-texto-suave text-lg">
              Três passos, sempre os mesmos. Você sabe o que fazer hoje sem pensar.
            </p>
          </div>
          <ol className="grid grid-cols-[repeat(auto-fit,minmax(min(260px,100%),1fr))] gap-6">
            <Cartao as="li" className="flex flex-col gap-3.5 p-6">
              <div className="flex items-center gap-3">
                <NumeroPasso n={1} />
                <h3 className="text-azul-fundo text-2xl">Assistir</h3>
              </div>
              <div className="border-areia overflow-hidden rounded-[14px] border">
                <div className="relative">
                  <CenaCampo className="block aspect-video w-full" />
                  <span className="bg-azul-fundo/90 text-branco absolute right-2.5 bottom-2.5 rounded-lg px-2 py-0.5 text-[13px] font-extrabold">
                    4:10
                  </span>
                </div>
                <div className="flex flex-col gap-1.5 p-3">
                  <SeloEtapa etapa={1} className="self-start" />
                  <span className="font-bold">A casa da vó</span>
                  <div className="bg-areia h-1.5 overflow-hidden rounded-full" aria-hidden="true">
                    <i className="bg-verde block h-full w-[60%]" />
                  </div>
                </div>
              </div>
              <p className="text-texto-suave">
                Um vídeo curto no seu nível, com legenda em português.
              </p>
            </Cartao>
            <Cartao as="li" className="flex flex-col gap-3.5 p-6">
              <div className="flex items-center gap-3">
                <NumeroPasso n={2} />
                <h3 className="text-azul-fundo text-2xl">Entender o vocabulário</h3>
              </div>
              <dl className="flex flex-col gap-2">
                {vocabulario.map((v) => (
                  <div
                    key={v.palavra}
                    className="border-areia flex flex-wrap items-center justify-between gap-x-3 rounded-[14px] border-2 px-3.5 py-2.5"
                  >
                    <dt className="font-bold">{v.palavra}</dt>
                    <dd className="text-texto-suave text-sm">{v.sentido}</dd>
                  </div>
                ))}
              </dl>
              <p className="text-texto-suave">As palavras do vídeo, com imagem e exemplo.</p>
            </Cartao>
            <Cartao as="li" className="flex flex-col gap-3.5 p-6">
              <div className="flex items-center gap-3">
                <NumeroPasso n={3} />
                <h3 className="text-azul-fundo text-2xl">Participar</h3>
              </div>
              <CenaConversa className="block aspect-video w-full rounded-[14px]" />
              <p className="text-texto-suave">
                Conversa ao vivo com o Márlio e outras pessoas do clube.
              </p>
            </Cartao>
          </ol>
        </Envoltorio>
      </section>

      {/* d. Quatro passos */}
      <section className="bg-papel-escuro py-20 sm:py-24">
        <Envoltorio className="flex flex-col gap-14">
          <h2 className="text-azul-fundo max-w-[760px] text-[clamp(36px,4vw,48px)]">
            Quatro passos, nenhuma lista de regras
          </h2>
          <ol className="flex flex-col gap-14">
            <li className="flex flex-wrap items-center gap-10">
              <div className="flex min-w-0 flex-[1_1_420px] flex-col gap-2.5">
                <Mao>primeiro</Mao>
                <h3 className="text-azul-fundo text-[32px]">Descubra o seu nível</h3>
                <p className="text-texto-suave text-lg">
                  Assista a três vídeos curtos e diga quanto entendeu. A gente sugere por onde
                  começar.
                </p>
              </div>
              <Cartao className="flex min-w-0 flex-[1_1_420px] flex-wrap gap-3 p-6">
                <SeloEtapa etapa={1} />
                <SeloEtapa etapa={2} />
                <SeloEtapa etapa={3} />
                <SeloEtapa etapa={4} />
              </Cartao>
            </li>
            <li className="flex flex-wrap-reverse items-center gap-10">
              <Cartao className="min-w-0 flex-[1_1_420px] overflow-hidden p-0">
                <CenaMar className="block aspect-video w-full" />
                <div className="flex flex-col gap-2 px-5 py-4">
                  <b>Um passeio de barco</b>
                  <div className="bg-areia h-2 overflow-hidden rounded-full" aria-hidden="true">
                    <i className="bg-verde block h-full w-[70%] rounded-full" />
                  </div>
                </div>
              </Cartao>
              <div className="flex min-w-0 flex-[1_1_420px] flex-col gap-2.5">
                <Mao>depois</Mao>
                <h3 className="text-azul-fundo text-[32px]">Assista ao que te interessa</h3>
                <p className="text-texto-suave text-lg">
                  Comida, viagem, família, música. Você escolhe o tema, o nível já vem certo.
                </p>
              </div>
            </li>
            <li className="flex flex-wrap items-center gap-10">
              <div className="flex min-w-0 flex-[1_1_420px] flex-col gap-2.5">
                <Mao>todo dia</Mao>
                <h3 className="text-azul-fundo text-[32px]">Conte as suas horas</h3>
                <p className="text-texto-suave text-lg">
                  Cada minuto assistido entra na conta. Série, podcast e conversa fora do app
                  também.
                </p>
              </div>
              <Cartao className="flex min-w-0 flex-[1_1_420px] flex-col gap-3 p-6">
                <div className="flex justify-between gap-3">
                  <b>18 h de 50 h</b>
                  <span className="text-texto-suave">exemplo de caminho</span>
                </div>
                <div className="bg-areia h-3 overflow-hidden rounded-full" aria-hidden="true">
                  <i className="bg-verde block h-full w-[36%] rounded-full" />
                </div>
              </Cartao>
            </li>
            <li className="flex flex-wrap-reverse items-center gap-10">
              <Cartao className="rounded-bolha flex min-w-0 flex-[1_1_420px] flex-col gap-2 p-6">
                <Mao>entendi quase tudo!</Mao>
                <p className="text-texto-suave">O dia em que um vídeo nativo deixa de ser ruído.</p>
              </Cartao>
              <div className="flex min-w-0 flex-[1_1_420px] flex-col gap-2.5">
                <Mao>e um dia</Mao>
                <h3 className="text-azul-fundo text-[32px]">Chegue à fluência</h3>
                <p className="text-texto-suave text-lg">
                  A fala vem quando o ouvido está pronto. Sem pressa, sem pressão.
                </p>
              </div>
            </li>
          </ol>
        </Envoltorio>
      </section>

      {/* e. Caminhos */}
      <section className="bg-azul-fundo text-branco py-20 sm:py-24">
        <Envoltorio className="flex flex-col gap-10">
          <h2 className="text-branco text-[clamp(36px,4vw,48px)]">
            Seu caminho até a fluência é claro
          </h2>
          <ol className="grid grid-cols-[repeat(auto-fit,minmax(min(280px,100%),1fr))] gap-6">
            {caminhos.map((c) => (
              <li
                key={c.n}
                className="rounded-card bg-branco text-texto shadow-card flex flex-col gap-3 p-6"
              >
                <SeloEtapa etapa={c.n} rotulo={`Caminho ${c.n}`} className="self-start" />
                <h3 className="text-azul-fundo text-2xl">
                  <Marcador>[PLACEHOLDER: nome do caminho {c.n}]</Marcador>
                </h3>
                <p className="text-texto-suave">
                  <Marcador>{c.sub}</Marcador>
                </p>
                <p className="font-titulo text-azul-fundo text-xl font-semibold">
                  <Marcador>[PLACEHOLDER: horas do caminho {c.n}]</Marcador>
                </p>
              </li>
            ))}
          </ol>
        </Envoltorio>
      </section>

      {/* f. Professores e apresentadores */}
      <section className="py-20 sm:py-24">
        <Envoltorio className="flex flex-col gap-8">
          <h2 className="text-azul-fundo text-[clamp(32px,3.6vw,44px)]">
            Professores e apresentadores
          </h2>
          <ul className="grid grid-cols-[repeat(auto-fit,minmax(min(230px,100%),1fr))] gap-6">
            <Apresentador nome="Márlio" temas="Cotidiano, cultura, conversa" />
            {[1, 2, 3].map((n) => (
              <Apresentador
                key={n}
                nome="[PLACEHOLDER: apresentador convidado]"
                temas="[PLACEHOLDER: temas]"
              />
            ))}
          </ul>
        </Envoltorio>
      </section>

      {/* g. Clube */}
      <section className="pb-20 sm:pb-24">
        <Envoltorio>
          <Cartao className="rounded-bolha flex flex-wrap items-center gap-10 p-8 sm:p-12">
            <div className="flex min-w-0 flex-[1_1_300px] flex-col items-start gap-3">
              <h2 className="text-azul-fundo text-[40px]">O clube</h2>
              <p className="text-texto-suave text-lg">Tudo o que você recebe ao entrar.</p>
              <BotaoLink href="/planos" className="mt-2">
                Ver planos
              </BotaoLink>
            </div>
            <ul className="grid min-w-0 flex-[2_1_480px] grid-cols-[repeat(auto-fit,minmax(min(180px,100%),1fr))] gap-6">
              <ItemClube
                icone="play"
                titulo="Biblioteca de vídeos"
                texto="Por nível, tema e país"
              />
              <ItemClube icone="ao-vivo" titulo="Lives com o Márlio" texto="Ao vivo e gravadas" />
              <ItemClube icone="usuario" titulo="Conversa em grupo" texto="Gente de todo canto" />
            </ul>
          </Cartao>
        </Envoltorio>
      </section>

      {/* h. Depoimentos */}
      <section className="bg-papel-escuro py-20 sm:py-24">
        <Envoltorio className="flex flex-col gap-8">
          <h2 className="text-azul-fundo text-[clamp(32px,3.6vw,44px)]">
            Quem já está vivendo o português
          </h2>
          <ul className="grid grid-cols-[repeat(auto-fit,minmax(min(280px,100%),1fr))] gap-6">
            {[1, 2, 3].map((n) => (
              <li key={n}>
                <figure className="rounded-bolha bg-branco shadow-card flex h-full flex-col gap-4 p-7">
                  <blockquote className="text-lg">
                    <Marcador>[PLACEHOLDER: depoimento real {n}]</Marcador>
                  </blockquote>
                  <figcaption className="text-texto-suave mt-auto">
                    <Marcador>[PLACEHOLDER: nome]</Marcador>,{" "}
                    <Marcador>[PLACEHOLDER: país]</Marcador>
                  </figcaption>
                </figure>
              </li>
            ))}
          </ul>
        </Envoltorio>
      </section>

      {/* i. Márlio */}
      <section className="py-20 sm:py-24">
        <Envoltorio className="flex flex-wrap items-center gap-12">
          <div className="rounded-bolha bg-areia grid aspect-[4/5] w-full max-w-[360px] flex-[0_1_360px] place-items-center p-6 text-center">
            <Marcador>[PLACEHOLDER: foto do Márlio]</Marcador>
          </div>
          <div className="flex min-w-0 flex-[1_1_420px] flex-col gap-4">
            <Mao className="text-[30px]">oi, eu sou o Márlio</Mao>
            <h2 className="text-azul-fundo text-[clamp(32px,3.6vw,44px)]">
              Quem está por trás do Mundo Ilusófono
            </h2>
            <p className="text-texto-suave text-lg">
              <Marcador>[PLACEHOLDER: biografia, A CONFIRMAR COM O MÁRLIO]</Marcador>
            </p>
          </div>
        </Envoltorio>
      </section>

      {/* j. Perguntas rápidas */}
      <section className="pb-20 sm:pb-24">
        <Envoltorio className="flex max-w-[880px] flex-col gap-6">
          <h2 className="text-azul-fundo text-[clamp(32px,3.6vw,44px)]">Perguntas rápidas</h2>
          <Acordeao nome="faq-inicio" itens={perguntas} />
          <Link href="/recursos" className="inline-flex min-h-11 items-center self-start font-bold">
            Ver todas as perguntas
          </Link>
        </Envoltorio>
      </section>

      {/* j. Chamada final */}
      <FaixaChamada texto="Ainda não quer começar? Deixe seu e-mail e receba um vídeo por semana.">
        <ChamadaEmail />
      </FaixaChamada>
    </>
  );
}

function ItemClube({
  icone,
  titulo,
  texto,
}: {
  icone: "play" | "ao-vivo" | "usuario";
  titulo: string;
  texto: string;
}) {
  return (
    <li className="flex flex-col gap-2">
      <span className="bg-azul-claro text-azul-acao grid size-12 place-items-center rounded-2xl">
        <Icone nome={icone} />
      </span>
      <b className="font-titulo text-azul-fundo text-xl font-semibold">{titulo}</b>
      <span className="text-texto-suave">{texto}</span>
    </li>
  );
}
