"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Cartao, cx } from "@/components/ui";
import { categoriasBlog, formatarData, nomeCategoria, type MetaPost } from "@/lib/blog";
import { CenaPorNome, TextoOuMarcador } from "./Secao";

type ItemLista = MetaPost & { slug: string };

/** Lista de posts com filtro por categoria na URL (?categoria=cultura). */
export function ListaBlog({ posts }: { posts: ItemLista[] }) {
  const ativa = useSearchParams().get("categoria");
  const visiveis = ativa ? posts.filter((p) => p.categoria === ativa) : posts;
  const filtros = [{ slug: null, nome: "Todos" }, ...categoriasBlog];

  return (
    <div className="flex flex-col gap-8">
      <nav aria-label="Categorias do blog">
        <ul className="flex flex-wrap gap-2.5">
          {filtros.map((c) => {
            const atual = (c.slug ?? null) === (ativa ?? null);
            return (
              <li key={c.nome}>
                <Link
                  href={c.slug ? `/blog?categoria=${c.slug}` : "/blog"}
                  scroll={false}
                  aria-current={atual ? "page" : undefined}
                  className={cx(
                    "inline-flex min-h-11 items-center rounded-full border-2 px-4 text-[15px] font-semibold",
                    atual
                      ? "border-azul-fundo bg-azul-fundo text-branco"
                      : "border-borda bg-branco text-texto hover:border-azul-acao",
                  )}
                >
                  {c.nome}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {visiveis.length === 0 ? (
        <p className="text-texto-suave">Ainda não há textos nesta categoria.</p>
      ) : (
        <ul className="grid grid-cols-[repeat(auto-fill,minmax(min(300px,100%),1fr))] gap-6">
          {visiveis.map((p) => (
            <Cartao as="li" key={p.slug} className="relative flex flex-col overflow-hidden p-0">
              <CenaPorNome nome={p.cena} className="block aspect-video w-full" />
              <div className="flex flex-col gap-2 p-5">
                <p className="text-azul-acao text-xs font-extrabold tracking-wide uppercase">
                  {nomeCategoria(p.categoria)} ·{" "}
                  <time dateTime={p.data}>{formatarData(p.data)}</time>
                </p>
                <h2 className="text-azul-fundo text-xl">
                  <Link href={`/blog/${p.slug}`} className="after:absolute after:inset-0">
                    <TextoOuMarcador texto={p.titulo} />
                  </Link>
                </h2>
                <p className="text-texto-suave text-[15px]">
                  <TextoOuMarcador texto={p.resumo} />
                </p>
              </div>
            </Cartao>
          ))}
        </ul>
      )}
    </div>
  );
}
