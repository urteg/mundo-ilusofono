// [PLACEHOLDER: horas por nível, a definir pelo Márlio]
// Tabela provisória: horas acumuladas em que cada nível começa (7 degraus).
export const inicioDosNiveis = [0, 50, 150, 300, 600, 1000, 1500] as const;

export const nivelMaximo = inicioDosNiveis.length;

/** Nível (1 a 7) para um total de horas. */
export function nivelPorHoras(horas: number): number {
  let nivel = 1;
  for (let i = 0; i < inicioDosNiveis.length; i++) {
    if (horas >= inicioDosNiveis[i]) nivel = i + 1;
  }
  return nivel;
}
