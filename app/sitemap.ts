export const dynamic = "force-static";
import type { MetadataRoute } from "next";
import { posts } from "@/lib/blog";
import { site } from "@/lib/site";

// Acrescente aqui cada página pública do site à medida que ela for criada.
const paginas = [
  "/",
  "/metodo",
  "/series",
  "/planos",
  "/desafio",
  "/recursos",
  "/blog",
  ...posts.map((p) => `/blog/${p.slug}`),
];

export default function sitemap(): MetadataRoute.Sitemap {
  return paginas.map((caminho) => ({
    url: `${site.url}${caminho}`,
    changeFrequency: "weekly",
    priority: caminho === "/" ? 1 : 0.7,
  }));
}
