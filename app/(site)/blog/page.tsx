import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ListaBlog } from "@/components/site/ListaBlog";
import { Abertura, CenaPorNome, Envoltorio, TextoOuMarcador } from "@/components/site/Secao";
import { formatarData, nomeCategoria, posts } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Blog",
  description: "Textos curtos sobre como entender português de verdade, cultura e conversa.",
  alternates: { canonical: "/blog" },
};

export default function Blog() {
  const destaque = posts.find((p) => p.destaque) ?? posts[0];
  // O componente da lista é cliente; passamos só os metadados (sem o conteúdo MDX).
  const lista = posts.map((p) => ({
    slug: p.slug,
    titulo: p.titulo,
    resumo: p.resumo,
    data: p.data,
    categoria: p.categoria,
    cena: p.cena,
  }));

  return (
    <>
      <Abertura mao="para ler com calma" titulo="Blog" />

      {destaque && (
        <section className="pb-14">
          <Envoltorio>
            <article className="rounded-card bg-branco shadow-card relative flex flex-wrap overflow-hidden">
              <CenaPorNome
                nome={destaque.cena}
                className="block aspect-[16/10] min-w-0 flex-[1_1_420px]"
              />
              <div className="flex min-w-0 flex-[1_1_380px] flex-col justify-center gap-3.5 p-8 sm:p-10">
                <span className="self-start rounded-full bg-[#FFE4D6] px-3 py-1 text-[13px] font-bold text-[#B23A0B]">
                  Em destaque
                </span>
                <p className="text-azul-acao text-xs font-extrabold tracking-wide uppercase">
                  {nomeCategoria(destaque.categoria)} ·{" "}
                  <time dateTime={destaque.data}>{formatarData(destaque.data)}</time>
                </p>
                <h2 className="text-azul-fundo text-[clamp(28px,3vw,36px)]">
                  <Link href={`/blog/${destaque.slug}`} className="after:absolute after:inset-0">
                    <TextoOuMarcador texto={destaque.titulo} />
                  </Link>
                </h2>
                <p className="text-texto-suave text-lg">
                  <TextoOuMarcador texto={destaque.resumo} />
                </p>
              </div>
            </article>
          </Envoltorio>
        </section>
      )}

      <section className="pb-24">
        <Envoltorio>
          <h2 className="sr-only">Todos os textos</h2>
          <Suspense fallback={null}>
            <ListaBlog posts={lista} />
          </Suspense>
        </Envoltorio>
      </section>
    </>
  );
}
