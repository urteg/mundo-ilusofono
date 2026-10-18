"use server";

import { buscarVideos } from "@/lib/app/catalogo";
import { carregarParticipante } from "@/lib/app/participante";
import { lerCursor, lerFiltros } from "@/lib/filtros";

/** Próxima página da rolagem infinita. Os filtros chegam como texto e são validados de novo. */
export async function carregarMaisVideos(consulta: string, cursor: string) {
  const filtros = lerFiltros(new URLSearchParams(String(consulta).slice(0, 500)));
  const participante = await carregarParticipante();
  return buscarVideos(participante, filtros, lerCursor(String(cursor)));
}
