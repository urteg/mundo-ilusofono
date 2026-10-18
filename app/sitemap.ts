export const dynamic = "force-static";
import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

// Acrescente aqui cada página pública do site à medida que ela for criada.
const paginas = ["/"];

export default function sitemap(): MetadataRoute.Sitemap {
  return paginas.map((caminho) => ({
    url: `${site.url}${caminho}`,
    changeFrequency: "weekly",
    priority: caminho === "/" ? 1 : 0.7,
  }));
}
