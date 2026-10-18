import { somarDias } from "./datas";

// Meta cumprida no dia: atividade_diaria.segundos >= meta_diaria_min * 60 (dia no fuso do participante).
// Sequência: dias seguidos com a meta cumprida, terminando hoje ou ontem. Se quebrar, volta a zero.

export type Atividade = { dia: string; segundos: number };

export const diasParaTrofeu = 30;

export function metaCumprida(segundos: number, metaMin: number): boolean {
  return segundos >= Math.max(1, metaMin) * 60;
}

export type Sequencia = {
  dias: number;
  cumpridaHoje: boolean;
  trofeu: boolean;
};

/** `hoje` é a data AAAA-MM-DD no fuso do participante (use diaNoFuso). */
export function calcularSequencia(
  atividades: Atividade[],
  metaMin: number,
  hoje: string,
): Sequencia {
  const cumpridos = new Set(
    atividades.filter((a) => metaCumprida(a.segundos, metaMin)).map((a) => a.dia),
  );
  const cumpridaHoje = cumpridos.has(hoje);
  // Hoje ainda pode ser cumprido: a sequência não quebra até o dia acabar.
  let dia = cumpridaHoje ? hoje : somarDias(hoje, -1);
  let dias = 0;
  while (cumpridos.has(dia)) {
    dias++;
    dia = somarDias(dia, -1);
  }
  return { dias, cumpridaHoje, trofeu: dias >= diasParaTrofeu };
}

/** Minutos assistidos no dia (para a pílula da meta). */
export function minutosDoDia(atividades: Atividade[], dia: string): number {
  const segundos = atividades.filter((a) => a.dia === dia).reduce((t, a) => t + a.segundos, 0);
  return Math.floor(segundos / 60);
}
