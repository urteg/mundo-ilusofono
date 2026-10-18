import "server-only";
import { redirect } from "next/navigation";
import { cache } from "react";
import { diaNoFuso, fusoValido, somarDias } from "@/lib/datas";
import type { Entitlement } from "@/lib/entitlements";
import { horasTotais, resumoProgresso, type ResumoProgresso } from "@/lib/progress";
import { calcularSequencia, minutosDoDia, type Sequencia } from "@/lib/streak";
import { criarClienteServidor } from "@/lib/supabase/servidor";

export type DadosParticipante = {
  id: string;
  email: string;
  fuso: string;
  hoje: string;
  metaMin: number;
  minutosHoje: number;
  sequencia: Sequencia;
  progresso: ResumoProgresso;
  ents: Entitlement[];
};

/** Dados básicos do participante logado (uma vez por requisição: layout e página compartilham). */
export const carregarParticipante = cache(async (): Promise<DadosParticipante> => {
  const supabase = await criarClienteServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/entrar?proximo=/app");

  const { data: perfil } = await supabase
    .from("profiles")
    .select("fuso, meta_diaria_min")
    .eq("id", user.id)
    .maybeSingle();

  const fuso = fusoValido(perfil?.fuso);
  const hoje = diaNoFuso(new Date(), fuso);
  const metaMin = perfil?.meta_diaria_min ?? 20;

  // Um ano de atividade basta para a sequência (o troféu é aos 30 dias).
  const [atividades, visualizacoes, tempoFora, ents] = await Promise.all([
    supabase.from("atividade_diaria").select("dia, segundos").gte("dia", somarDias(hoje, -400)),
    supabase.from("visualizacoes").select("segundos"),
    supabase.from("tempo_fora").select("segundos"),
    supabase.from("entitlements").select("produto, status, renova_em, comprado_em"),
  ]);

  const atv = atividades.data ?? [];
  return {
    id: user.id,
    email: user.email ?? "",
    fuso,
    hoje,
    metaMin,
    minutosHoje: minutosDoDia(atv, hoje),
    sequencia: calcularSequencia(atv, metaMin, hoje),
    progresso: resumoProgresso(horasTotais(visualizacoes.data ?? [], tempoFora.data ?? [])),
    ents: ents.data ?? [],
  };
});
