// Níveis do app: as fases da abordagem de participação crescente (Greg Thomson), com a fase 1
// dividida em 1A e 1B como no próprio programa, combinadas com os 7 níveis do Dreaming.
//
// Nível | começa em | fase           | Dreaming
//   1   |     0 h   | 1A             | nível 1 (0 h)
//   2   |    50 h   | 1B             | nível 2 (50 h)
//   3   |   100 h   | 2              | (150 h)
//   4   |   250 h   | 3              | (300 h)
//   5   |   500 h   | 4              | (600 h)
//   6   |  1000 h   | 5              | nível 6 (1000 h)
//   7   |  1500 h   | 6 (contínua)   | nível 7 (1500 h)
//
// [PLACEHOLDER: conferir com as horas por nível do Sprout, que não são públicas]
// Na interface aparecem só como "Nível 1" a "Nível 7" (sem siglas de método).
export const inicioDosNiveis = [0, 50, 100, 250, 500, 1000, 1500] as const;

export const nivelMaximo = inicioDosNiveis.length;

/** Nível (1 a 7) para um total de horas. */
export function nivelPorHoras(horas: number): number {
  let nivel = 1;
  for (let i = 0; i < inicioDosNiveis.length; i++) {
    if (horas >= inicioDosNiveis[i]) nivel = i + 1;
  }
  return nivel;
}
