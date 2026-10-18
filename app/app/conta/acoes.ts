"use server";

import { revalidatePath } from "next/cache";
import { carregarParticipante } from "@/lib/app/participante";
import { esquemaNome, esquemaPreferencias, fusoExiste } from "@/lib/conta";
import { criarClienteServidor } from "@/lib/supabase/servidor";

export type ResultadoConta = { ok: true } | { ok: false; erro: string };

const campos = [
  "meta_diaria_min",
  "legendas",
  "tema",
  "previa_video",
  "email_novidades",
  "email_videos",
  "email_semanal",
  "fuso",
  "fuso_escolhido",
] as const;

export async function salvarPreferenciasConta(dados: FormData): Promise<ResultadoConta> {
  const lido = esquemaPreferencias.safeParse(
    Object.fromEntries(campos.map((c) => [c, dados.get(c) ?? undefined])),
  );
  if (!lido.success)
    return { ok: false, erro: lido.error.issues[0]?.message ?? "Confira as preferências." };
  const p = await carregarParticipante();
  const supabase = await criarClienteServidor();
  const { error } = await supabase.from("profiles").update(lido.data).eq("id", p.id);
  if (error) return { ok: false, erro: "Não foi possível salvar agora. Tente de novo." };
  revalidatePath("/app", "layout");
  return { ok: true };
}

export async function salvarNome(dados: FormData): Promise<ResultadoConta> {
  const lido = esquemaNome.safeParse({ nome: dados.get("nome") ?? "" });
  if (!lido.success) return { ok: false, erro: lido.error.issues[0]?.message ?? "Confira o nome." };
  const p = await carregarParticipante();
  const supabase = await criarClienteServidor();
  const { error } = await supabase.from("profiles").update(lido.data).eq("id", p.id);
  if (error) return { ok: false, erro: "Não foi possível salvar agora. Tente de novo." };
  revalidatePath("/app", "layout");
  return { ok: true };
}

/** Usa o fuso do navegador enquanto o participante não escolheu um na conta. */
export async function usarFusoDoNavegador(fuso: string): Promise<{ mudou: boolean }> {
  if (typeof fuso !== "string" || fuso.length > 64 || !fusoExiste(fuso)) return { mudou: false };
  const p = await carregarParticipante();
  if (p.fusoEscolhido || p.fuso === fuso) return { mudou: false };
  const supabase = await criarClienteServidor();
  const { error } = await supabase
    .from("profiles")
    .update({ fuso })
    .eq("id", p.id)
    .eq("fuso_escolhido", false);
  if (error) return { mudou: false };
  revalidatePath("/app", "layout");
  return { mudou: true };
}
