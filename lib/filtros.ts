import { z } from "zod";

// Filtros da biblioteca (/app/assistir), guardados na URL.

export const ordens = ["novos", "antigos", "curtos", "longos"] as const;
export const abas = ["explorar", "historico", "salvos"] as const;
export type Ordem = (typeof ordens)[number];
export type Aba = (typeof abas)[number];

const texto = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => (v ? v : undefined));

const esquema = z.object({
  aba: z.enum(abas).catch("explorar"),
  ordem: z.enum(ordens).catch("novos"),
  nivel: z.coerce.number().int().min(0).max(6).optional().catch(undefined),
  pais: texto(60).catch(undefined),
  apresentador: z.string().uuid().optional().catch(undefined),
  tema: z
    .string()
    .regex(/^[a-z0-9-]{1,40}$/)
    .optional()
    .catch(undefined),
  q: texto(80).catch(undefined),
  ocultarVistos: z
    .enum(["1", "0"])
    .optional()
    .transform((v) => v === "1")
    .catch(false),
});

export type Filtros = z.infer<typeof esquema>;

type Entrada = URLSearchParams | Record<string, string | string[] | undefined>;

function primeiro(entrada: Entrada, chave: string): string | undefined {
  if (entrada instanceof URLSearchParams) return entrada.get(chave) ?? undefined;
  const v = entrada[chave];
  const s = Array.isArray(v) ? v[0] : v;
  return s === "" ? undefined : s;
}

/** Converte os searchParams em filtros válidos. Valores ruins viram o padrão, sem erro. */
export function lerFiltros(entrada: Entrada): Filtros {
  return esquema.parse({
    aba: primeiro(entrada, "aba"),
    ordem: primeiro(entrada, "ordem"),
    nivel: primeiro(entrada, "nivel"),
    pais: primeiro(entrada, "pais"),
    apresentador: primeiro(entrada, "apresentador"),
    tema: primeiro(entrada, "tema"),
    q: primeiro(entrada, "q"),
    ocultarVistos: primeiro(entrada, "ocultarVistos"),
  });
}

/** Filtros de volta para a URL, sem os valores padrão. */
export function filtrosParaParams(f: Partial<Filtros>): URLSearchParams {
  const p = new URLSearchParams();
  if (f.aba && f.aba !== "explorar") p.set("aba", f.aba);
  if (f.ordem && f.ordem !== "novos") p.set("ordem", f.ordem);
  if (f.nivel !== undefined) p.set("nivel", String(f.nivel));
  if (f.pais) p.set("pais", f.pais);
  if (f.apresentador) p.set("apresentador", f.apresentador);
  if (f.tema) p.set("tema", f.tema);
  if (f.q) p.set("q", f.q);
  if (f.ocultarVistos) p.set("ocultarVistos", "1");
  return p;
}

export function hrefAssistir(f: Partial<Filtros>): string {
  const p = filtrosParaParams(f).toString();
  return p ? `/app/assistir?${p}` : "/app/assistir";
}

export const tamanhoPagina = 24;

/** Cursor opaco da rolagem infinita (posição na lista ordenada). */
export function codificarCursor(posicao: number): string {
  return btoa(`p:${posicao}`).replace(/=+$/, "");
}

export function lerCursor(cursor: string | null | undefined): number {
  if (!cursor) return 0;
  try {
    const m = /^p:(\d{1,6})$/.exec(atob(cursor));
    return m ? Number(m[1]) : 0;
  } catch {
    return 0;
  }
}
