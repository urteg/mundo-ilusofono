import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CenaPorNome, Envoltorio, FaixaChamada, TextoOuMarcador } from "@/components/site/Secao";
import { Icone } from "@/components/ui";
import { buscarPost, formatarData, nomeCategoria, posts } from "@/lib/blog";
import { site } from "@/lib/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = buscarPost((await params).slug);
  if (!post) return {};
  return {
    title: post.titulo,
    description: post.resumo,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: { type: "article", publishedTime: post.data },
  };
}

export default async function PaginaPost({ params }: Props) {
  const post = buscarPost((await params).slug);
  if (!post) notFound();
  const { Conteudo } = post;

  const artigo = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.titulo,
    description: post.resumo,
    datePublished: post.data,
    inLanguage: "pt-BR",
    author: { "@type": "Person", name: "Márlio" },
    publisher: { "@type": "Organization", name: site.nome, logo: `${site.url}/marca/logo.png` },
    mainEntityOfPage: `${site.url}/blog/${post.slug}`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(artigo) }}
      />
      <article>
        <Envoltorio className="flex max-w-[860px] flex-col gap-6 pt-10 pb-16 sm:pt-14">
          <Link
            href="/blog"
            className="inline-flex min-h-11 items-center gap-2 self-start font-bold"
          >
            <Icone nome="seta-direita" tamanho={20} className="rotate-180" />
            Voltar ao blog
          </Link>
          <header className="flex flex-col gap-4">
            <p className="text-azul-acao text-sm font-extrabold tracking-wide uppercase">
              {nomeCategoria(post.categoria)} ·{" "}
              <time dateTime={post.data}>{formatarData(post.data)}</time>
            </p>
            <h1 className="text-azul-fundo text-[clamp(36px,5vw,56px)] font-bold">
              <TextoOuMarcador texto={post.titulo} />
            </h1>
            <p className="text-texto-suave max-w-[68ch] text-xl">
              <TextoOuMarcador texto={post.resumo} />
            </p>
          </header>
          <CenaPorNome nome={post.cena} className="rounded-card block aspect-[16/8] w-full" />
          <div className="prosa">
            <Conteudo />
          </div>
        </Envoltorio>
      </article>
      <FaixaChamada />
    </>
  );
}
