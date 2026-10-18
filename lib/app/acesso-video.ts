import "server-only";
import { motivoBloqueio, type Motivo } from "@/lib/entitlements";
import { criarClienteAdmin } from "@/lib/supabase/admin";
import type { DadosParticipante } from "./participante";

export type VideoProtegido = {
  id: string;
  provedor: string;
  video_ref: string | null;
  legenda_url: string | null;
  duracao_seg: number;
  plano_minimo: string;
  desafio_dia: number | null;
};

/**
 * Lê o vídeo COM video_ref (só no servidor, via service role) e decide o acesso.
 * Nunca devolva `video` ao cliente quando `motivo` não for null.
 */
export async function verificarAcessoVideo(
  id: string,
  participante: DadosParticipante,
  agora = new Date(),
): Promise<{ video: VideoProtegido | null; motivo: Motivo | null }> {
  const { data } = await criarClienteAdmin()
    .from("videos")
    .select("id, provedor, video_ref, legenda_url, duracao_seg, plano_minimo, desafio_dia")
    .eq("id", id)
    .maybeSingle();
  if (!data) return { video: null, motivo: null };
  return { video: data, motivo: motivoBloqueio(data, participante.ents, agora, participante.fuso) };
}
