import { inicioDosNiveis, nivelMaximo, nivelPorHoras } from "./niveis";

// Horas = (soma de visualizacoes.segundos + soma de tempo_fora.segundos) / 3600.

type ComSegundos = { segundos: number | null };

export function somarSegundos(linhas: ComSegundos[]): number {
  return linhas.reduce((total, l) => total + Math.max(0, l.segundos ?? 0), 0);
}

export function horasTotais(visualizacoes: ComSegundos[], tempoFora: ComSegundos[]): number {
  return (somarSegundos(visualizacoes) + somarSegundos(tempoFora)) / 3600;
}

export type ResumoProgresso = {
  horas: number;
  nivel: number;
  /** Horas que faltam para o próximo nível (null no último nível). */
  horasParaProximo: number | null;
  /** Fração (0 a 1) percorrida dentro do nível atual. */
  fracaoNoNivel: number;
};

export function resumoProgresso(horas: number): ResumoProgresso {
  const h = Math.max(0, horas);
  const nivel = nivelPorHoras(h);
  if (nivel >= nivelMaximo) {
    return { horas: h, nivel, horasParaProximo: null, fracaoNoNivel: 1 };
  }
  const inicio = inicioDosNiveis[nivel - 1];
  const proximo = inicioDosNiveis[nivel];
  return {
    horas: h,
    nivel,
    horasParaProximo: proximo - h,
    fracaoNoNivel: (h - inicio) / (proximo - inicio),
  };
}
