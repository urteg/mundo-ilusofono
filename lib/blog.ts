import type { ComponentType } from "react";
import * as postComecar from "@/content/blog/para-comecar.mdx";
import * as postNaoEntendo from "@/content/blog/quando-nao-entendo.mdx";
import * as postCultura from "@/content/blog/cultura-no-dia-a-dia.mdx";

export const categoriasBlog = [
  { slug: "para-comecar", nome: "Para começar" },
  { slug: "como-assistir", nome: "Como assistir" },
  { slug: "cultura", nome: "Cultura" },
  { slug: "falar", nome: "Falar" },
] as const;

export type CategoriaBlog = (typeof categoriasBlog)[number]["slug"];

export type MetaPost = {
  titulo: string;
  resumo: string;
  /** AAAA-MM-DD */
  data: string;
  categoria: CategoriaBlog;
  destaque?: boolean;
  cena: "mar" | "campo" | "feira" | "conversa";
};

export type Post = MetaPost & { slug: string; Conteudo: ComponentType };

// Para publicar um post: crie o .mdx em content/blog/ e acrescente-o aqui.
const modulos = {
  "para-comecar": postComecar,
  "quando-nao-entendo": postNaoEntendo,
  "cultura-no-dia-a-dia": postCultura,
};

export const posts: Post[] = Object.entries(modulos)
  .map(([slug, m]) => ({ ...m.meta, slug, Conteudo: m.default }))
  .sort((a, b) => b.data.localeCompare(a.data));

export function buscarPost(slug: string): Post | undefined {
  return posts.find((p) => p.slug === slug);
}

export function nomeCategoria(slug: CategoriaBlog): string {
  return categoriasBlog.find((c) => c.slug === slug)?.nome ?? slug;
}

const formatoData = new Intl.DateTimeFormat("pt-BR", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

export function formatarData(data: string): string {
  return formatoData.format(new Date(`${data}T00:00:00Z`));
}
