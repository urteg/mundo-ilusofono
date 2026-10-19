import "server-only";
import { diaNoFuso, fusoValido } from "@/lib/datas";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import type { DadosParticipante } from "./participante";

/** Versão leve de carregarParticipante para rotas de API: sem redirecionar, sem somar horas. */
export async function participanteDaApi(): Promise<DadosParticipante | null> {
  const supabase = await criarClienteServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const [perfil, ents] = await Promise.all([
    supabase.from("profiles").select("fuso, meta_diaria_min").eq("id", user.id).maybeSingle(),
    supabase
      .from("entitlements")
      .select("produto, status, intervalo, renova_em, comprado_em, pagamento_falhou_em"),
  ]);
  const fuso = fusoValido(perfil.data?.fuso);
  return {
    id: user.id,
    email: user.email ?? "",
    nome: null,
    tema: "sistema",
    fusoEscolhido: true,
    fuso,
    hoje: diaNoFuso(new Date(), fuso),
    metaMin: perfil.data?.meta_diaria_min ?? 20,
    minutosHoje: 0,
    sequencia: { dias: 0, cumpridaHoje: false, trofeu: false },
    progresso: { horas: 0, nivel: 0, horasParaProximo: null, fracaoNoNivel: 0 },
    ents: ents.data ?? [],
  };
}

export const semCache = {
  "Cache-Control": "private, no-store, max-age=0",
  Vary: "Cookie",
};
