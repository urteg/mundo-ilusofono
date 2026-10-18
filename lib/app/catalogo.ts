import "server-only";
import { cenaDaCapa, type CenaSerie } from "@/lib/cenas";
import { podeAssistir } from "@/lib/entitlements";
import { codificarCursor, tamanhoPagina, type Filtros } from "@/lib/filtros";
import { lerNivel } from "@/lib/niveis";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import type { DadosParticipante } from "./participante";

// [PLACEHOLDER: regra para menores de 18]. Ainda não guardamos a idade; por ora ninguém é
// tratado como menor e os vídeos adultos só ganham o selo +18.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const participanteMenorDeIdade = (_p: DadosParticipante) => false;

export type CartaoBiblioteca = {
  id: string;
  titulo: string;
  duracao_seg: number;
  nivel: number;
  pais: string | null;
  apresentador: string | null;
  serie_id: string | null;
  serie_titulo: string | null;
  cena: CenaSerie;
  plano_minimo: string;
  bloqueado: boolean;
  adulto: boolean;
  progresso: number; // 0 a 100
  visto: boolean;
  salvo: boolean;
};

const colunas =
  "id, serie_id, titulo, ordem, duracao_seg, nivel, pais, apresentador_id, plano_minimo, adulto, desafio_dia, publicado_em, temas";

type LinhaVideo = {
  id: string | null;
  serie_id: string | null;
  titulo: string | null;
  ordem: number | null;
  duracao_seg: number | null;
  nivel: string | null;
  pais: string | null;
  apresentador_id: string | null;
  plano_minimo: string | null;
  adulto: boolean | null;
  desafio_dia: number | null;
  publicado_em: string | null;
  temas: string[] | null;
};

async function contexto() {
  const supabase = await criarClienteServidor();
  const [series, apresentadores, vis] = await Promise.all([
    supabase.from("series").select("id, titulo, capa, ordem"),
    supabase.from("apresentadores").select("id, nome"),
    supabase.from("visualizacoes").select("video_id, posicao_seg, concluido, salvo, atualizado_em"),
  ]);
  return {
    supabase,
    series: new Map((series.data ?? []).map((s) => [s.id, s])),
    apresentadores: new Map((apresentadores.data ?? []).map((a) => [a.id, a.nome])),
    vis: new Map((vis.data ?? []).map((v) => [v.video_id, v])),
    visLista: vis.data ?? [],
  };
}

type Ctx = Awaited<ReturnType<typeof contexto>>;

function montar(v: LinhaVideo, ctx: Ctx, p: DadosParticipante, agora: Date): CartaoBiblioteca {
  const s = v.serie_id ? ctx.series.get(v.serie_id) : undefined;
  const vis = v.id ? ctx.vis.get(v.id) : undefined;
  const duracao = v.duracao_seg ?? 0;
  return {
    id: v.id!,
    titulo: v.titulo ?? "",
    duracao_seg: duracao,
    nivel: lerNivel(v.nivel),
    pais: v.pais,
    apresentador: v.apresentador_id ? (ctx.apresentadores.get(v.apresentador_id) ?? null) : null,
    serie_id: v.serie_id,
    serie_titulo: s?.titulo ?? null,
    cena: cenaDaCapa(s?.capa),
    plano_minimo: v.plano_minimo ?? "entender",
    bloqueado: !podeAssistir(
      { plano_minimo: v.plano_minimo, desafio_dia: v.desafio_dia },
      p.ents,
      agora,
      p.fuso,
    ),
    adulto: Boolean(v.adulto),
    progresso:
      duracao > 0 ? Math.min(100, Math.round(((vis?.posicao_seg ?? 0) / duracao) * 100)) : 0,
    visto: Boolean(vis?.concluido),
    salvo: Boolean(vis?.salvo),
  };
}

function ordenar(lista: LinhaVideo[], ordem: Filtros["ordem"]) {
  const porData = (a: LinhaVideo, b: LinhaVideo) =>
    (a.publicado_em ?? "").localeCompare(b.publicado_em ?? "");
  const porDuracao = (a: LinhaVideo, b: LinhaVideo) => (a.duracao_seg ?? 0) - (b.duracao_seg ?? 0);
  const desempate = (a: LinhaVideo, b: LinhaVideo) => (a.id ?? "").localeCompare(b.id ?? "");
  const cmp = {
    novos: (a: LinhaVideo, b: LinhaVideo) => porData(b, a) || desempate(a, b),
    antigos: (a: LinhaVideo, b: LinhaVideo) => porData(a, b) || desempate(a, b),
    curtos: (a: LinhaVideo, b: LinhaVideo) => porDuracao(a, b) || desempate(a, b),
    longos: (a: LinhaVideo, b: LinhaVideo) => porDuracao(b, a) || desempate(a, b),
  }[ordem];
  return [...lista].sort(cmp);
}

export type PaginaVideos = { itens: CartaoBiblioteca[]; proximo: string | null; total: number };

/** Uma página da biblioteca (24 itens), com os filtros aplicados no servidor. */
export async function buscarVideos(
  p: DadosParticipante,
  f: Filtros,
  posicao: number,
): Promise<PaginaVideos> {
  const agora = new Date();
  const ctx = await contexto();
  const vistos = ctx.visLista.filter((v) => v.concluido).map((v) => v.video_id);

  let consulta = ctx.supabase.from("v_videos_publicos").select(colunas, { count: "exact" });
  if (f.nivel !== undefined) consulta = consulta.eq("nivel", String(f.nivel));
  if (f.pais) consulta = consulta.eq("pais", f.pais);
  if (f.apresentador) consulta = consulta.eq("apresentador_id", f.apresentador);
  if (f.tema) consulta = consulta.contains("temas", [f.tema]);
  if (f.q) consulta = consulta.ilike("titulo", `%${f.q.replace(/[%_\\]/g, (c) => `\\${c}`)}%`);
  if (participanteMenorDeIdade(p)) consulta = consulta.eq("adulto", false);

  if (f.aba === "historico") {
    const ids = [...ctx.visLista]
      .filter((v) => (v.posicao_seg ?? 0) > 0 || v.concluido)
      .sort((a, b) => b.atualizado_em.localeCompare(a.atualizado_em))
      .map((v) => v.video_id);
    if (ids.length === 0) return { itens: [], proximo: null, total: 0 };
    consulta = consulta.in("id", ids);
  }
  if (f.aba === "salvos") {
    const ids = ctx.visLista.filter((v) => v.salvo).map((v) => v.video_id);
    if (ids.length === 0) return { itens: [], proximo: null, total: 0 };
    consulta = consulta.in("id", ids);
  }
  if (f.ocultarVistos && vistos.length > 0)
    consulta = consulta.not("id", "in", `(${vistos.join(",")})`);

  const { data, error } = await consulta;
  if (error) throw error;

  let lista = data ?? [];
  if (f.aba === "historico") {
    const ordemHist = new Map(
      [...ctx.visLista]
        .sort((a, b) => b.atualizado_em.localeCompare(a.atualizado_em))
        .map((v, i) => [v.video_id, i]),
    );
    lista = [...lista].sort((a, b) => (ordemHist.get(a.id!) ?? 0) - (ordemHist.get(b.id!) ?? 0));
  } else {
    lista = ordenar(lista, f.ordem);
  }

  const pagina = lista.slice(posicao, posicao + tamanhoPagina);
  const fim = posicao + pagina.length;
  return {
    itens: pagina.map((v) => montar(v, ctx, p, agora)),
    proximo: fim < lista.length ? codificarCursor(fim) : null,
    total: lista.length,
  };
}

export type OpcoesFiltros = {
  niveis: number[];
  paises: string[];
  apresentadores: { id: string; nome: string }[];
  temas: { slug: string; nome: string }[];
};

export async function opcoesFiltros(): Promise<OpcoesFiltros> {
  const supabase = await criarClienteServidor();
  const [videos, apresentadores, temas] = await Promise.all([
    supabase.from("v_videos_publicos").select("nivel, pais"),
    supabase.from("apresentadores").select("id, nome").order("nome"),
    supabase.from("temas").select("slug, nome").order("nome"),
  ]);
  const v = videos.data ?? [];
  return {
    niveis: [...new Set(v.map((x) => lerNivel(x.nivel)))].sort((a, b) => a - b),
    paises: [...new Set(v.map((x) => x.pais).filter((x): x is string => Boolean(x)))].sort(),
    apresentadores: apresentadores.data ?? [],
    temas: (temas.data ?? []).filter((t): t is { slug: string; nome: string } =>
      Boolean(t.slug && t.nome),
    ),
  };
}

export type SerieCartao = {
  id: string;
  titulo: string;
  descricao: string | null;
  nivel: number;
  cena: CenaSerie;
  apresentador: string | null;
  episodios: CartaoBiblioteca[];
  /** primeiro episódio não visto (ou o primeiro) */
  proximoEpisodio: string | null;
  vistos: number;
  salva: boolean;
};

/** Séries com os episódios (já com progresso e cadeado). */
export async function buscarSeries(p: DadosParticipante, id?: string): Promise<SerieCartao[]> {
  const agora = new Date();
  const ctx = await contexto();
  let qs = ctx.supabase
    .from("series")
    .select("id, titulo, descricao, nivel, capa, ordem, apresentador_id")
    .order("ordem");
  if (id) qs = qs.eq("id", id);
  const [series, videos, salvas] = await Promise.all([
    qs,
    ctx.supabase.from("v_videos_publicos").select(colunas).order("ordem"),
    ctx.supabase.from("series_salvas").select("serie_id"),
  ]);
  const setSalvas = new Set((salvas.data ?? []).map((s) => s.serie_id));
  return (series.data ?? []).map((s) => {
    const eps = (videos.data ?? [])
      .filter((v) => v.serie_id === s.id && !(participanteMenorDeIdade(p) && v.adulto))
      .map((v) => montar(v, ctx, p, agora));
    const proximo =
      eps.find((e) => !e.visto && !e.bloqueado) ?? eps.find((e) => !e.bloqueado) ?? null;
    return {
      id: s.id,
      titulo: s.titulo,
      descricao: s.descricao,
      nivel: lerNivel(s.nivel),
      cena: cenaDaCapa(s.capa),
      apresentador: s.apresentador_id ? (ctx.apresentadores.get(s.apresentador_id) ?? null) : null,
      episodios: eps,
      proximoEpisodio: proximo?.id ?? null,
      vistos: eps.filter((e) => e.visto).length,
      salva: setSalvas.has(s.id),
    };
  });
}

/** Detalhes de um vídeo para a página do player (sem video_ref). */
export async function buscarVideo(p: DadosParticipante, id: string) {
  const agora = new Date();
  const ctx = await contexto();
  const { data: v } = await ctx.supabase
    .from("v_videos_publicos")
    .select(`${colunas}, descricao`)
    .eq("id", id)
    .maybeSingle();
  if (!v?.id) return null;
  const cartao = montar(v, ctx, p, agora);
  const [{ data: irmaos }, { data: vis }, { data: perfil }, { data: temas }] = await Promise.all([
    ctx.supabase
      .from("v_videos_publicos")
      .select(colunas)
      .eq("serie_id", v.serie_id ?? "")
      .order("ordem"),
    ctx.supabase
      .from("visualizacoes")
      .select("posicao_seg, curtido, salvo, entendimento, concluido")
      .eq("video_id", id)
      .maybeSingle(),
    ctx.supabase
      .from("profiles")
      .select("legendas, reproducao_automatica, pular_vistos")
      .maybeSingle(),
    ctx.supabase.from("temas").select("slug, nome"),
  ]);
  const episodios = (irmaos ?? []).map((x) => montar(x, ctx, p, agora));
  const indice = episodios.findIndex((e) => e.id === id);
  const nomesTemas = new Map((temas ?? []).map((t) => [t.slug, t.nome]));

  // "Mais vídeos como este": mesma série primeiro, depois o mesmo nível.
  const { data: mesmoNivel } = await ctx.supabase
    .from("v_videos_publicos")
    .select(colunas)
    .eq("nivel", v.nivel ?? "0")
    .neq("id", id)
    .limit(12);
  const vistosIds = new Set<string>();
  const parecidos: CartaoBiblioteca[] = [];
  for (const x of [
    ...episodios.slice(indice + 1),
    ...episodios.slice(0, Math.max(0, indice)),
    ...(mesmoNivel ?? []).map((m) => montar(m, ctx, p, agora)),
  ]) {
    if (x.id === id || vistosIds.has(x.id)) continue;
    vistosIds.add(x.id);
    parecidos.push(x);
  }

  return {
    video: cartao,
    descricao: v.descricao ?? null,
    temas: (v.temas ?? []).map((slug) => ({ slug, nome: nomesTemas.get(slug) ?? slug })),
    apresentadorId: v.apresentador_id,
    posicaoNaSerie: indice >= 0 ? { atual: indice + 1, total: episodios.length } : null,
    estado: {
      posicaoSeg: vis?.posicao_seg ?? 0,
      curtido: vis?.curtido ?? false,
      salvo: vis?.salvo ?? false,
      entendimento: (vis?.entendimento ?? null) as "quase_tudo" | "principal" | "pouco" | null,
    },
    preferencias: {
      legendas: perfil?.legendas ?? true,
      reproducaoAutomatica: perfil?.reproducao_automatica ?? true,
      pularVistos: perfil?.pular_vistos ?? false,
    },
    parecidos: parecidos.slice(0, 8),
  };
}
