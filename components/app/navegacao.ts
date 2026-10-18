import type { NomeIcone } from "@/components/ui";

export type ItemNav = { href: string; rotulo: string; icone: NomeIcone };

export const abasWeb: ItemNav[] = [
  { href: "/app", rotulo: "Início", icone: "inicio" },
  { href: "/app/assistir", rotulo: "Assistir", icone: "assistir" },
  { href: "/app/series", rotulo: "Séries", icone: "series" },
  { href: "/app/lives", rotulo: "Lives", icone: "ao-vivo" },
  { href: "/app/progresso", rotulo: "Progresso", icone: "progresso" },
  { href: "/app/conta", rotulo: "Conta", icone: "usuario" },
];

export const abasCelular: ItemNav[] = abasWeb.slice(0, 4);

export const itensMais: ItemNav[] = [
  { href: "/app/progresso", rotulo: "Progresso", icone: "progresso" },
  { href: "/app/palavras", rotulo: "Palavras", icone: "livro" },
  { href: "/app/conta", rotulo: "Conta", icone: "usuario" },
  { href: "/recursos", rotulo: "Ajuda", icone: "ajuda" },
];

/** A aba Início só fica ativa em /app; as outras também nas subpáginas. */
export function abaAtiva(caminho: string, href: string): boolean {
  if (href === "/app") return caminho === "/app";
  return caminho === href || caminho.startsWith(`${href}/`);
}
