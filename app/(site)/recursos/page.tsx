import type { Metadata } from "next";
import Link from "next/link";
import { Abertura, Envoltorio, Mao, TextoOuMarcador } from "@/components/site/Secao";
import { Acordeao, Botao, Cartao, Icone, Marcador } from "@/components/ui";
import { posts, nomeCategoria } from "@/lib/blog";
import { faq } from "@/lib/faq";

export const metadata: Metadata = {
  title: "Recursos e perguntas frequentes",
  description:
    "Como funciona em um minuto, o roteiro de níveis e as respostas para as dúvidas mais comuns.",
  alternates: { canonical: "/recursos" },
};

// [PLACEHOLDER: PDF do roteiro de níveis]. Quando existir, coloque em public/ e informe o caminho aqui.
const arquivoRoteiro: string | null = null;

const tutorial = [
  { titulo: "Escolha um vídeo", texto: "A lição de hoje já sugere um." },
  { titulo: "Assista sem pausar", texto: "Deixe passar o que não entender." },
  { titulo: "Veja as palavras", texto: "Salve as que quiser rever." },
  { titulo: "Participe", texto: "Converse nas lives quando quiser." },
];

const paginaFaq = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faq.flatMap((c) =>
    c.perguntas.map((p) => ({
      "@type": "Question",
      name: p.pergunta,
      acceptedAnswer: { "@type": "Answer", text: p.resposta },
    })),
  ),
};

export default function Recursos() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(paginaFaq) }}
      />
      <Abertura mao="para começar bem" titulo="Recursos e perguntas">
        <p>Tudo o que você precisa para começar bem.</p>
      </Abertura>

      <section className="pb-14">
        <Envoltorio>
          <Cartao className="rounded-bolha flex flex-col gap-6 p-7 sm:p-10">
            <h2 className="text-azul-fundo text-[clamp(28px,3vw,34px)]">
              Como funciona, em um minuto
            </h2>
            <ol className="grid grid-cols-[repeat(auto-fit,minmax(min(220px,100%),1fr))] gap-6">
              {tutorial.map((t, i) => (
                <li key={t.titulo} className="flex items-start gap-3">
                  <span className="bg-azul-acao font-titulo text-branco grid size-10 shrink-0 place-items-center rounded-full text-lg font-bold">
                    {i + 1}
                  </span>
                  <div>
                    <b className="block">{t.titulo}</b>
                    <span className="text-texto-suave">{t.texto}</span>
                  </div>
                </li>
              ))}
            </ol>
          </Cartao>
        </Envoltorio>
      </section>

      <section className="pb-20">
        <Envoltorio>
          <div className="rounded-bolha bg-azul-claro flex flex-wrap items-center justify-between gap-6 px-7 py-6">
            <div className="flex min-w-0 flex-[1_1_320px] flex-col gap-1">
              <h2 className="text-azul-fundo text-[26px]">Roteiro de níveis para baixar</h2>
              <p className="text-texto-suave">
                Um PDF com os caminhos, os níveis e as horas de cada um.
              </p>
              {!arquivoRoteiro && (
                <p className="text-sm">
                  <Marcador>[PLACEHOLDER: PDF do roteiro]</Marcador>
                </p>
              )}
            </div>
            {arquivoRoteiro ? (
              <a
                href={arquivoRoteiro}
                download
                className="bg-azul-acao font-titulo text-branco hover:bg-azul-fundo inline-flex min-h-11 items-center gap-2 rounded-full px-6 text-[17px] font-semibold"
              >
                <Icone nome="seta-baixo" tamanho={20} />
                Baixar o roteiro
              </a>
            ) : (
              <div className="flex flex-col items-start gap-1">
                <Botao disabled aria-describedby="roteiro-em-breve">
                  <Icone nome="seta-baixo" tamanho={20} />
                  Baixar o roteiro
                </Botao>
                <span id="roteiro-em-breve" className="text-azul-fundo text-sm font-semibold">
                  Em breve
                </span>
              </div>
            )}
          </div>
        </Envoltorio>
      </section>

      <section className="pb-20" aria-labelledby="titulo-faq">
        <Envoltorio>
          <div className="flex max-w-[880px] flex-col gap-8">
            <h2 id="titulo-faq" className="text-azul-fundo text-[clamp(32px,3.6vw,44px)]">
              Perguntas frequentes
            </h2>
            <nav aria-label="Categorias de perguntas">
              <ul className="flex flex-wrap gap-2.5">
                {faq.map((c) => (
                  <li key={c.id}>
                    <a
                      href={`#${c.id}`}
                      className="border-borda bg-branco text-texto hover:border-azul-acao inline-flex min-h-11 items-center rounded-full border-2 px-4 text-[15px] font-semibold"
                    >
                      {c.nome}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
            {faq.map((c) => (
              <section key={c.id} id={c.id} className="flex scroll-mt-24 flex-col gap-3">
                <h3 className="text-azul-fundo text-2xl">{c.nome}</h3>
                <Acordeao
                  nome={`faq-${c.id}`}
                  itens={c.perguntas.map((p) => ({ titulo: p.pergunta, conteudo: p.resposta }))}
                />
              </section>
            ))}
          </div>
        </Envoltorio>
      </section>

      <section className="bg-papel-escuro py-20">
        <Envoltorio className="flex flex-col gap-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="text-azul-fundo text-[clamp(32px,3.6vw,44px)]">Para ler no blog</h2>
            <Link href="/blog" className="inline-flex min-h-11 items-center font-bold">
              Ver todos os textos
            </Link>
          </div>
          <ul className="grid grid-cols-[repeat(auto-fit,minmax(min(260px,100%),1fr))] gap-6">
            {posts.slice(0, 3).map((p) => (
              <Cartao
                as="li"
                key={p.slug}
                className="rounded-bolha relative flex flex-col gap-2 p-6"
              >
                <Mao className="text-[22px]">{nomeCategoria(p.categoria).toLowerCase()}</Mao>
                <Link
                  href={`/blog/${p.slug}`}
                  className="text-texto hover:text-azul-acao font-bold after:absolute after:inset-0"
                >
                  <TextoOuMarcador texto={p.titulo} />
                </Link>
              </Cartao>
            ))}
          </ul>
        </Envoltorio>
      </section>
    </>
  );
}
