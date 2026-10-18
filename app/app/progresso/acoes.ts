"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { carregarParticipante } from "@/lib/app/participante";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { camposDoFormulario, validarTempoFora } from "@/lib/tempo-fora";

export type ResultadoTempoFora = { ok: true } | { ok: false; erro: string };

const idRegistro = z.string().uuid();
const erroGenerico = "Não foi possível salvar agora. Tente de novo.";

function atualizarTelas() {
  // Pílulas, Progresso, calendário e a lista de horas fora do app.
  revalidatePath("/app", "layout");
}

/** Adiciona um registro de tempo fora do app ou edita um existente (quando vem "id"). */
export async function salvarTempoFora(dados: FormData): Promise<ResultadoTempoFora> {
  const participante = await carregarParticipante();
  const v = validarTempoFora(camposDoFormulario(dados), participante.hoje);
  if (!v.ok) return v;

  const supabase = await criarClienteServidor();
  const id = dados.get("id");
  if (id) {
    const lido = idRegistro.safeParse(id);
    if (!lido.success) return { ok: false, erro: "Registro não encontrado." };
    // Filtra também pelo dono: além da RLS, nunca altera o registro de outra pessoa.
    const { data, error } = await supabase
      .from("tempo_fora")
      .update(v.dados)
      .eq("id", lido.data)
      .eq("user_id", participante.id)
      .select("id");
    if (error) return { ok: false, erro: erroGenerico };
    if (!data || data.length === 0) return { ok: false, erro: "Registro não encontrado." };
  } else {
    const { error } = await supabase
      .from("tempo_fora")
      .insert({ ...v.dados, user_id: participante.id });
    if (error) return { ok: false, erro: erroGenerico };
  }
  atualizarTelas();
  return { ok: true };
}

export async function excluirTempoFora(id: string): Promise<ResultadoTempoFora> {
  const lido = idRegistro.safeParse(id);
  if (!lido.success) return { ok: false, erro: "Registro não encontrado." };
  const participante = await carregarParticipante();
  const supabase = await criarClienteServidor();
  const { data, error } = await supabase
    .from("tempo_fora")
    .delete()
    .eq("id", lido.data)
    .eq("user_id", participante.id)
    .select("id");
  if (error) return { ok: false, erro: "Não foi possível excluir agora. Tente de novo." };
  if (!data || data.length === 0) return { ok: false, erro: "Registro não encontrado." };
  atualizarTelas();
  return { ok: true };
}
