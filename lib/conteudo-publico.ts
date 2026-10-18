import { cenaDaCapa, type CenaSerie } from "@/lib/cenas";
import { criarClientePublico } from "@/lib/supabase/servidor";

// Consultas das páginas públicas do site. Usam só as views v_*_publicas (papel anon).
// Se o banco não responder (ex.: build sem Supabase), devolvem lista vazia e a página
// mostra o estado vazio em vez de quebrar.

export type SeriePublica = {
  id: string;
  titulo: string;
  nivel: number;
  episodios: number;
  cena: CenaSerie;
};

export type ApresentadorPublico = { id: string; nome: string; temas: string };

export async function listarSeriesPublicas(): Promise<SeriePublica[]> {
  try {
    const { data, error } = await criarClientePublico()
      .from("v_series_publicas")
      .select("id, titulo, nivel, episodios, capa, ordem")
      .order("ordem", { ascending: true });
    if (error) throw error;
    return (data ?? []).map((s, i) => ({
      id: s.id ?? String(i),
      titulo: s.titulo ?? "",
      nivel: Number.parseInt(s.nivel ?? "1", 10) || 1,
      episodios: s.episodios ?? 0,
      cena: cenaDaCapa(s.capa),
    }));
  } catch (erro) {
    console.warn("Não foi possível ler as séries públicas:", erro);
    return [];
  }
}

export async function listarApresentadores(): Promise<ApresentadorPublico[]> {
  try {
    const { data, error } = await criarClientePublico()
      .from("v_apresentadores_publicos")
      .select("id, nome, temas")
      .order("nome", { ascending: true });
    if (error) throw error;
    return (data ?? [])
      .map((a, i) => ({
        id: a.id ?? String(i),
        nome: a.nome ?? "",
        temas: (a.temas ?? []).join(", "),
      }))
      .sort((a, b) => Number(b.nome === "Márlio") - Number(a.nome === "Márlio"));
  } catch (erro) {
    console.warn("Não foi possível ler os apresentadores:", erro);
    return [];
  }
}
