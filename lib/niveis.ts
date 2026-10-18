// Níveis do app, do 0 ao 6, com os números da Growing Participator Approach (Greg Thomson).
// A fase 1 tem duas partes no próprio programa: 1A (primeiras 30 a 40 h) e 1B (mais 50 a 60 h).
//
// Nível | fase         | começa em | duração
//   0   | 1A           |     0 h   |  40 h
//   1   | 1B           |    40 h   |  60 h
//   2   | 2            |   100 h   | 150 h
//   3   | 3            |   250 h   | 250 h
//   4   | 4            |   500 h   | 500 h
//   5   | 5            |  1000 h   | 500 h
//   6   | 6            |  1500 h   | contínua
//
// Na interface aparecem só como "Nível 0" a "Nível 6" (a sigla do método não aparece).
export const inicioDosNiveis = [0, 40, 100, 250, 500, 1000, 1500] as const;

/** Maior nível possível (6). */
export const nivelMaximo = inicioDosNiveis.length - 1;

/** Nível (0 a 6) para um total de horas. */
export function nivelPorHoras(horas: number): number {
  let nivel = 0;
  for (let i = 0; i < inicioDosNiveis.length; i++) {
    if (horas >= inicioDosNiveis[i]) nivel = i;
  }
  return nivel;
}

/** Lê um nível vindo do banco ("0" a "6") com segurança; valores estranhos viram 0. */
export function lerNivel(valor: string | number | null | undefined): number {
  const n = typeof valor === "number" ? valor : Number.parseInt(valor ?? "", 10);
  if (!Number.isFinite(n)) return 0;
  return Math.min(nivelMaximo, Math.max(0, Math.trunc(n)));
}
