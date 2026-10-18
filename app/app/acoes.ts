"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { carregarParticipante } from "@/lib/app/participante";
import { trocarVideoDeHoje } from "@/lib/app/licao-hoje";
import { criarClienteServidor } from "@/lib/supabase/servidor";

/** "Escolher outro vídeo": sorteia outro elegível e grava em licao_passos. */
export async function escolherOutroVideo() {
  const participante = await carregarParticipante();
  await trocarVideoDeHoje(participante);
  revalidatePath("/app");
}

const esquemaTempoFora = z.object({
  tipo: z.enum(["assistindo", "ouvindo", "conversando"]),
  minutos: z.coerce.number().int().min(1).max(720),
  dia: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  nota: z.string().trim().max(200).optional(),
});

export type ResultadoTempoFora = { ok: true } | { ok: false; erro: string };

export async function adicionarTempoFora(dados: FormData): Promise<ResultadoTempoFora> {
  const lido = esquemaTempoFora.safeParse({
    tipo: dados.get("tipo"),
    minutos: dados.get("minutos"),
    dia: dados.get("dia"),
    nota: dados.get("nota") || undefined,
  });
  if (!lido.success) return { ok: false, erro: "Confira o tipo, os minutos (1 a 720) e o dia." };

  const participante = await carregarParticipante();
  if (lido.data.dia > participante.hoje)
    return { ok: false, erro: "O dia não pode ser no futuro." };

  const supabase = await criarClienteServidor();
  const { error } = await supabase.from("tempo_fora").insert({
    user_id: participante.id,
    tipo: lido.data.tipo,
    dia: lido.data.dia,
    segundos: lido.data.minutos * 60,
    nota: lido.data.nota ?? null,
  });
  if (error) return { ok: false, erro: "Não foi possível salvar agora. Tente de novo." };

  revalidatePath("/app", "layout");
  return { ok: true };
}
