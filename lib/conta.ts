import { z } from "zod";
import { estaAtivo, type Entitlement } from "./entitlements";

// Regras da tela Conta: plano atual, preferências e fusos.

export const metasDiarias = [10, 20, 30, 45] as const;
export const temas = ["sistema", "claro", "escuro"] as const;
export type TemaConta = (typeof temas)[number];

const nomesProdutos: Record<string, string> = {
  participar: "Participar",
  entender: "Entender",
  desafio: "Desafio 7 Dias",
};

const formatoData = new Intl.DateTimeFormat("pt-BR", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

/** "Entender · renova em 12 de março de 2027", ou "Grátis" sem plano ativo. */
export function descreverPlano(
  ents: Entitlement[],
  agora: Date,
): { nome: string; detalhe: string | null } {
  const ordem = ["participar", "entender", "desafio"];
  const ativo = ents
    .filter((e) => estaAtivo(e, agora))
    .sort((a, b) => ordem.indexOf(a.produto) - ordem.indexOf(b.produto))[0];
  if (!ativo) return { nome: "Grátis", detalhe: "Você assiste aos vídeos grátis." };
  const nome = nomesProdutos[ativo.produto] ?? ativo.produto;
  const data = ativo.renova_em ? formatoData.format(new Date(ativo.renova_em)) : null;
  if (ativo.produto === "desafio") return { nome, detalhe: "Um vídeo novo liberado por dia." };
  if (ativo.status === "canceled") return { nome, detalhe: data ? `Termina em ${data}.` : null };
  if (ativo.status === "past_due")
    return { nome, detalhe: "Há um pagamento pendente. Confira seu cartão." };
  return { nome, detalhe: data ? `Renova em ${data}.` : null };
}

/** Lista de fusos que o navegador/servidor conhece. */
export function listaDeFusos(): string[] {
  try {
    return Intl.supportedValuesOf("timeZone");
  } catch {
    return ["Europe/Madrid", "Europe/Lisbon", "America/Sao_Paulo", "UTC"];
  }
}

export function fusoExiste(fuso: string): boolean {
  if (fuso === "UTC") return true;
  return listaDeFusos().includes(fuso);
}

/** "UTC+2", "UTC−3", "UTC+5:30" para um fuso agora. */
export function deslocamento(fuso: string, agora = new Date()): string {
  const partes = new Intl.DateTimeFormat("en-US", {
    timeZone: fuso,
    timeZoneName: "shortOffset",
  }).formatToParts(agora);
  const nome = partes.find((p) => p.type === "timeZoneName")?.value ?? "GMT";
  const m = /GMT([+-])?(\d+)?(?::(\d+))?/.exec(nome);
  if (!m || !m[1]) return "UTC";
  return `UTC${m[1] === "-" ? "−" : "+"}${Number(m[2])}${m[3] ? `:${m[3]}` : ""}`;
}

/** "Sao Paulo (UTC−3)": cidade do identificador + deslocamento atual. */
export function rotuloFuso(fuso: string, agora = new Date()): string {
  const cidade = fuso.split("/").pop()!.replace(/_/g, " ");
  return `${cidade} (${deslocamento(fuso, agora)})`;
}

const booleano = z.enum(["1", "0"]).transform((v) => v === "1");

export const esquemaPreferencias = z.object({
  meta_diaria_min: z.coerce
    .number()
    .int()
    .refine(
      (n) => (metasDiarias as readonly number[]).includes(n),
      "Escolha 10, 20, 30 ou 45 minutos.",
    ),
  legendas: booleano,
  tema: z.enum(temas),
  previa_video: booleano,
  email_novidades: booleano,
  email_videos: booleano,
  email_semanal: booleano,
  fuso: z.string().max(64).refine(fusoExiste, "Escolha um fuso da lista."),
  fuso_escolhido: booleano,
});

export const esquemaNome = z.object({
  nome: z
    .string()
    .trim()
    .max(80, "O nome pode ter até 80 caracteres.")
    .transform((v) => v || null),
});
