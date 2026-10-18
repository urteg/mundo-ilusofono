"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { carregarParticipante } from "@/lib/app/participante";
import { trocarVideoDeHoje } from "@/lib/app/licao-hoje";

/** "Escolher outro vídeo": sorteia outro elegível e grava em licao_passos. */
export async function escolherOutroVideo() {
  const participante = await carregarParticipante();
  await trocarVideoDeHoje(participante);
  // Redireciona para forçar uma leitura nova da lição (funciona com ou sem JavaScript).
  revalidatePath("/app", "layout");
  redirect("/app");
}
