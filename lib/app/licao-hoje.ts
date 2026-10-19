import "server-only";
import { cenaDaCapa, type CenaSerie } from "@/lib/cenas";
import { recomendarVideo, sortearOutro, videosElegiveis, type VideoLicao } from "@/lib/licao";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import type { DadosParticipante } from "./participante";

export type VideoCartao = VideoLicao & {
  titulo: string;
  duracao_seg: number;
  apresentador: string | null;
  cena: CenaSerie;
  serie_titulo: string | null;
  /** segundos já assistidos (posição) */
  posicao_seg: number;
  concluido: boolean;
};

export type Passos = { assistiu: boolean; entendeu: boolean; participou: boolean };

export type LicaoHoje = {
  video: VideoCartao | null;
  passos: Passos;
  continuar: VideoCartao | null;
  temAlternativa: boolean;
};

/** Catálogo (sem video_ref) já com série, apresentador e o progresso do participante. */
export async function carregarCatalogo() {
  const supabase = await criarClienteServidor();
  const [videos, series, apresentadores, visualizacoes] = await Promise.all([
    supabase
      .from("v_videos_publicos")
      .select(
        "id, serie_id, titulo, ordem, duracao_seg, nivel, apresentador_id, plano_minimo, desafio_dia",
      ),
    supabase.from("series").select("id, ordem, titulo, capa"),
    supabase.from("apresentadores").select("id, nome"),
    supabase.from("visualizacoes").select("video_id, posicao_seg, concluido, atualizado_em"),
  ]);
  const serie = new Map((series.data ?? []).map((s) => [s.id, s]));
  const nomes = new Map((apresentadores.data ?? []).map((a) => [a.id, a.nome]));
  const vis = new Map((visualizacoes.data ?? []).map((v) => [v.video_id, v]));

  const catalogo: VideoCartao[] = (videos.data ?? []).map((v) => {
    const s = v.serie_id ? serie.get(v.serie_id) : undefined;
    const p = v.id ? vis.get(v.id) : undefined;
    return {
      id: v.id!,
      titulo: v.titulo ?? "",
      nivel: v.nivel ?? "1",
      ordem: v.ordem,
      serie_ordem: s?.ordem ?? null,
      serie_titulo: s?.titulo ?? null,
      plano_minimo: v.plano_minimo,
      desafio_dia: v.desafio_dia,
      duracao_seg: v.duracao_seg ?? 0,
      apresentador: v.apresentador_id ? (nomes.get(v.apresentador_id) ?? null) : null,
      cena: cenaDaCapa(s?.capa),
      posicao_seg: p?.posicao_seg ?? 0,
      concluido: p?.concluido ?? false,
    };
  });

  const vistos = new Set(catalogo.filter((v) => v.concluido).map((v) => v.id));
  const emAndamento = (visualizacoes.data ?? [])
    .filter((v) => !v.concluido && (v.posicao_seg ?? 0) > 0)
    .sort((a, b) => b.atualizado_em.localeCompare(a.atualizado_em));
  return { catalogo, vistos, emAndamento, supabase };
}

export async function carregarLicaoHoje(participante: DadosParticipante): Promise<LicaoHoje> {
  const agora = new Date();
  const { catalogo, vistos, emAndamento, supabase } = await carregarCatalogo();
  const elegiveis = videosElegiveis(catalogo, participante.ents, agora, participante.fuso);

  const { data: passosHoje } = await supabase
    .from("licao_passos")
    .select("video_id, assistiu, entendeu, participou")
    .eq("dia", participante.hoje)
    .maybeSingle();

  // Mantém o vídeo escolhido para hoje enquanto ele continuar liberado.
  let video = elegiveis.find((v) => v.id === passosHoje?.video_id) ?? null;
  if (!video) {
    video = recomendarVideo({
      videos: catalogo,
      vistos,
      nivelParticipante: participante.progresso.nivel,
      ents: participante.ents,
      agora,
      fuso: participante.fuso,
    });
    if (video) {
      await supabase
        .from("licao_passos")
        .upsert(
          { user_id: participante.id, dia: participante.hoje, video_id: video.id },
          { onConflict: "user_id,dia" },
        );
    }
  }

  const porId = new Map(catalogo.map((v) => [v.id, v]));
  const continuar =
    emAndamento
      .map((v) => porId.get(v.video_id))
      .find((v) => v && v.id !== video?.id && elegiveis.some((e) => e.id === v.id)) ?? null;

  return {
    video,
    passos: {
      assistiu: passosHoje?.assistiu ?? false,
      entendeu: passosHoje?.entendeu ?? false,
      participou: passosHoje?.participou ?? false,
    },
    continuar,
    temAlternativa: elegiveis.length > 1,
  };
}

/** Sorteia outro vídeo elegível e grava como a lição de hoje. */
export async function trocarVideoDeHoje(participante: DadosParticipante): Promise<string | null> {
  const agora = new Date();
  const { catalogo, vistos, supabase } = await carregarCatalogo();
  const { data: atual } = await supabase
    .from("licao_passos")
    .select("video_id")
    .eq("dia", participante.hoje)
    .maybeSingle();
  const outro = sortearOutro(
    { videos: catalogo, vistos, ents: participante.ents, agora, fuso: participante.fuso },
    atual?.video_id ?? null,
  );
  if (!outro) return null;
  const { error } = await supabase
    .from("licao_passos")
    .upsert(
      { user_id: participante.id, dia: participante.hoje, video_id: outro.id, assistiu: false },
      { onConflict: "user_id,dia" },
    );
  if (error) throw error;
  return outro.id;
}

export type ProximaLive = { id: string; titulo: string; inicio: string; duracao_min: number };

export async function carregarProximaLive(): Promise<ProximaLive | null> {
  const supabase = await criarClienteServidor();
  const { data } = await supabase
    .from("v_lives_publicas")
    .select("id, titulo, inicio, duracao_min")
    .gt("inicio", new Date().toISOString())
    .order("inicio", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (!data?.id || !data.inicio) return null;
  return {
    id: data.id,
    titulo: data.titulo ?? "",
    inicio: data.inicio,
    duracao_min: data.duracao_min ?? 60,
  };
}
