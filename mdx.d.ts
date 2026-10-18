// Tipos dos arquivos .mdx do blog: corpo como componente e metadados em `meta`.
declare module "*.mdx" {
  import type { ComponentType } from "react";
  import type { MetaPost } from "@/lib/blog";
  export const meta: MetaPost;
  const Conteudo: ComponentType<Record<string, unknown>>;
  export default Conteudo;
}
