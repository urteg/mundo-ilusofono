import "server-only";
import {
  diasPraticados,
  montarMes,
  segundosPorDia,
  semanaAtual,
  semanasSeguidas,
} from "@/lib/calendario";
import { cenaDaCapa, type CenaSerie } from "@/lib/cenas";
import { somarSegundos } from "@/lib/progress";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import type { DadosParticipante } from "./participante";

export type ItemRever = { id: string; titulo: string; cena: CenaSerie };

/** Tudo o que o painel de progresso mostra, para o mês pedido ("AAAA-MM"). */
export async function carregarPainel(p: DadosParticipante, mes: string) {
  const supabase = await criarClienteServidor();
  const [atividades, fora, vis] = await Promise.all([
    supabase.from("atividade_diaria").select("dia, segundos"),
    supabase.from("tempo_fora").select("dia, segundos"),
    supabase
      .from("visualizacoes")
      .select("video_id, segundos, concluido, entendimento, atualizado_em"),
  ]);
  const atv = atividades.data ?? [];
  const tempoFora = fora.data ?? [];
  const visualizacoes = vis.data ?? [];
  const porDia = segundosPorDia(atv, tempoFora);

  // "Para rever": vídeos marcados "Entendi pouco", os mais recentes primeiro.
  const pouco = visualizacoes
    .filter((v) => v.entendimento === "pouco")
    .sort((a, b) => b.atualizado_em.localeCompare(a.atualizado_em))
    .slice(0, 6);
  let paraRever: ItemRever[] = [];
  if (pouco.length > 0) {
    const [{ data: videos }, { data: series }] = await Promise.all([
      supabase
        .from("v_videos_publicos")
        .select("id, titulo, serie_id")
        .in(
          "id",
          pouco.map((v) => v.video_id),
        ),
      supabase.from("series").select("id, capa"),
    ]);
    const capas = new Map((series ?? []).map((s) => [s.id, s.capa]));
    const porId = new Map((videos ?? []).map((v) => [v.id, v]));
    paraRever = pouco.flatMap((v) => {
      const video = porId.get(v.video_id);
      if (!video?.id) return [];
      return [
        {
          id: video.id,
          titulo: video.titulo ?? "",
          cena: cenaDaCapa(video.serie_id ? capas.get(video.serie_id) : null),
        },
      ];
    });
  }

  return {
    assistidoSeg: somarSegundos(visualizacoes),
    foraSeg: somarSegundos(tempoFora),
    videosVistos: visualizacoes.filter((v) => v.concluido).length,
    diasPraticados: diasPraticados(porDia),
    semanasSeguidas: semanasSeguidas(porDia, p.hoje),
    semana: semanaAtual(porDia, p.hoje, p.metaMin),
    calendario: montarMes(mes, porDia, p.hoje, p.metaMin),
    paraRever,
  };
}

/** Registros de tempo fora do app, do mais recente para o mais antigo. */
export async function carregarTempoFora() {
  const supabase = await criarClienteServidor();
  const { data } = await supabase
    .from("tempo_fora")
    .select("id, tipo, dia, segundos, nota, criado_em")
    .order("dia", { ascending: false })
    .order("criado_em", { ascending: false });
  return data ?? [];
}
