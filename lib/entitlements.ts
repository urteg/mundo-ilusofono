import { diaNoFuso, fusoPadrao } from "./datas";

// Regras de acesso (seção 6). Usar SEMPRE no servidor; o cliente nunca decide o plano.

export type Produto = "desafio" | "entender" | "participar";
export type PlanoMinimo = "gratis" | "entender" | "participar";

export type Entitlement = {
  produto: Produto | string;
  status: string;
  renova_em: string | null;
  comprado_em: string | null;
};

export type VideoAcesso = { plano_minimo: PlanoMinimo | string | null; desafio_dia: number | null };

const umDia = 24 * 60 * 60 * 1000;
export const diasTolerancia = 3;

/** O direito está valendo agora? */
export function estaAtivo(e: Entitlement, agora: Date): boolean {
  const fim = e.renova_em ? new Date(e.renova_em).getTime() : null;
  switch (e.status) {
    case "active":
    case "trialing":
      return true;
    case "past_due":
      // Pagamento atrasado: mantém o acesso por 3 dias depois do vencimento.
      return fim === null || agora.getTime() <= fim + diasTolerancia * umDia;
    case "canceled":
      // Cancelado: vale até o fim do período já pago.
      return fim !== null && agora.getTime() < fim;
    default:
      return false;
  }
}

export function produtosAtivos(ents: Entitlement[], agora: Date): Set<string> {
  return new Set(ents.filter((e) => estaAtivo(e, agora)).map((e) => e.produto));
}

/**
 * Dia do Desafio liberado hoje (1 a 7). O dia 1 é o dia da compra; cada meia-noite no fuso
 * do participante libera o seguinte. 0 se não comprou ou se o acesso não está valendo.
 */
export function diaDoDesafio(ents: Entitlement[], agora: Date, fuso: string = fusoPadrao): number {
  const d = ents.find((e) => e.produto === "desafio" && estaAtivo(e, agora));
  if (!d?.comprado_em) return 0;
  const inicio = Date.parse(`${diaNoFuso(new Date(d.comprado_em), fuso)}T00:00:00Z`);
  const hoje = Date.parse(`${diaNoFuso(agora, fuso)}T00:00:00Z`);
  const passados = Math.round((hoje - inicio) / umDia);
  return Math.min(7, Math.max(1, passados + 1));
}

export function podeAssistir(
  video: VideoAcesso,
  ents: Entitlement[],
  agora: Date,
  fuso: string = fusoPadrao,
): boolean {
  if (video.plano_minimo === "gratis") return true;
  const ativos = produtosAtivos(ents, agora);
  if (video.plano_minimo === "entender" && (ativos.has("entender") || ativos.has("participar"))) {
    return true;
  }
  if (video.plano_minimo === "participar" && ativos.has("participar")) return true;
  // O Desafio libera só os vídeos do desafio, um por dia a partir da compra.
  const dia = diaDoDesafio(ents, agora, fuso);
  return video.desafio_dia !== null && dia > 0 && video.desafio_dia <= dia;
}

export type Motivo = "sem_plano" | "plano_participar" | "desafio_dia_futuro" | "fora_do_desafio";

/** Por que o vídeo está bloqueado (para a mensagem e o 403). null = pode assistir. */
export function motivoBloqueio(
  video: VideoAcesso,
  ents: Entitlement[],
  agora: Date,
  fuso: string = fusoPadrao,
): Motivo | null {
  if (podeAssistir(video, ents, agora, fuso)) return null;
  const ativos = produtosAtivos(ents, agora);
  if (video.plano_minimo === "participar" && ativos.has("entender")) return "plano_participar";
  if (ativos.has("desafio")) {
    return video.desafio_dia !== null ? "desafio_dia_futuro" : "fora_do_desafio";
  }
  return "sem_plano";
}
