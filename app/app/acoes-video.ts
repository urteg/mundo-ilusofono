"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { carregarParticipante } from "@/lib/app/participante";
import { criarClienteServidor } from "@/lib/supabase/servidor";

const id = z.string().uuid();
const marca = z.boolean();

type Campos = {
  salvo?: boolean;
  curtido?: boolean;
  entendimento?: string | null;
  concluido?: boolean;
};

/** Grava as marcas do participante num vídeo (nunca o tempo assistido). */
async function marcarVideo(videoId: unknown, campos: Campos) {
  const v = id.safeParse(videoId);
  if (!v.success) return { ok: false as const };
  const participante = await carregarParticipante();
  const supabase = await criarClienteServidor();
  // update e, se ainda não houver linha, insert (o upsert mexeria em user_id e video_id,
  // colunas que o participante não pode alterar).
  const atualizado = await supabase
    .from("visualizacoes")
    .update(campos)
    .eq("user_id", participante.id)
    .eq("video_id", v.data)
    .select("video_id");
  let error = atualizado.error;
  if (!error && (atualizado.data ?? []).length === 0) {
    ({ error } = await supabase
      .from("visualizacoes")
      .insert({ user_id: participante.id, video_id: v.data, ...campos }));
    // Outra requisição criou a linha no meio do caminho: agora o update basta.
    if (error?.code === "23505") {
      ({ error } = await supabase
        .from("visualizacoes")
        .update(campos)
        .eq("user_id", participante.id)
        .eq("video_id", v.data));
    }
  }
  if (error) return { ok: false as const };
  revalidatePath("/app", "layout");
  return { ok: true as const };
}

export async function alternarSalvo(videoId: string, salvo: boolean) {
  return marcarVideo(videoId, { salvo: marca.parse(salvo) });
}

export async function alternarCurtida(videoId: string, curtido: boolean) {
  return marcarVideo(videoId, { curtido: marca.parse(curtido) });
}

export async function marcarVisto(videoId: string, visto: boolean) {
  return marcarVideo(videoId, { concluido: marca.parse(visto) });
}

const entendimentos = z.enum(["quase_tudo", "principal", "pouco"]).nullable();

export async function salvarEntendimento(videoId: string, valor: string | null) {
  const e = entendimentos.safeParse(valor);
  if (!e.success) return { ok: false as const };
  return marcarVideo(videoId, { entendimento: e.data });
}

export async function alternarSerieSalva(serieId: string, salva: boolean) {
  const s = id.safeParse(serieId);
  if (!s.success) return { ok: false as const };
  const participante = await carregarParticipante();
  const supabase = await criarClienteServidor();
  const { error } = marca.parse(salva)
    ? await supabase
        .from("series_salvas")
        .upsert({ user_id: participante.id, serie_id: s.data }, { onConflict: "user_id,serie_id" })
    : await supabase.from("series_salvas").delete().eq("serie_id", s.data);
  if (error) return { ok: false as const };
  revalidatePath("/app", "layout");
  return { ok: true as const };
}

const esquemaPreferencias = z
  .object({
    legendas: z.boolean(),
    reproducao_automatica: z.boolean(),
    pular_vistos: z.boolean(),
  })
  .partial()
  .strict();

export async function salvarPreferencias(prefs: z.input<typeof esquemaPreferencias>) {
  const p = esquemaPreferencias.safeParse(prefs);
  if (!p.success || Object.keys(p.data).length === 0) return { ok: false as const };
  const participante = await carregarParticipante();
  const supabase = await criarClienteServidor();
  const { error } = await supabase.from("profiles").update(p.data).eq("id", participante.id);
  return { ok: !error };
}
