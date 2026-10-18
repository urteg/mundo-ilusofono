import { z } from "zod";

// Regras do batimento de progresso (POST /api/progresso), separadas para teste.

export const intervaloBatimentoSeg = 15;
/** Intervalo mínimo entre dois batimentos do mesmo vídeo (o player manda a cada 15 s). */
export const intervaloMinimoSeg = 10;
export const deltaMaximoSeg = 20;

export const esquemaBatimento = z.object({
  video_id: z.string().uuid(),
  delta: z.number().int().min(0).max(deltaMaximoSeg),
  posicao_seg: z
    .number()
    .int()
    .min(0)
    .max(24 * 3600),
});

export type Batimento = z.infer<typeof esquemaBatimento>;

export type Decisao =
  | { ok: true; delta: number; posicao: number }
  | { ok: false; status: 400 | 403 | 404 | 429; motivo: string };

type Contexto = {
  existe: boolean;
  podeAssistir: boolean;
  duracaoSeg: number;
  /** quando o último batimento deste vídeo foi gravado (ms) */
  ultimoEm: number | null;
  agora: number;
};

export function decidirBatimento(b: Batimento, ctx: Contexto): Decisao {
  if (!ctx.existe) return { ok: false, status: 404, motivo: "video_inexistente" };
  if (!ctx.podeAssistir) return { ok: false, status: 403, motivo: "sem_plano" };
  if (b.posicao_seg > ctx.duracaoSeg + 5)
    return { ok: false, status: 400, motivo: "posicao_invalida" };
  if (b.delta > 0 && ctx.ultimoEm !== null) {
    const passou = (ctx.agora - ctx.ultimoEm) / 1000;
    if (passou < intervaloMinimoSeg) return { ok: false, status: 429, motivo: "rapido_demais" };
    // O tempo contado não pode passar do tempo real desde o último batimento.
    if (b.delta > passou + 2) return { ok: false, status: 400, motivo: "delta_impossivel" };
  }
  return { ok: true, delta: b.delta, posicao: Math.min(b.posicao_seg, ctx.duracaoSeg) };
}

/** Limite simples por usuário em memória (por instância): N requisições por minuto. */
export function criarLimitador(maximo: number, janelaMs = 60_000) {
  const registros = new Map<string, number[]>();
  return (chave: string, agora = Date.now()): boolean => {
    const recentes = (registros.get(chave) ?? []).filter((t) => agora - t < janelaMs);
    if (recentes.length >= maximo) {
      registros.set(chave, recentes);
      return false;
    }
    recentes.push(agora);
    registros.set(chave, recentes);
    return true;
  };
}
