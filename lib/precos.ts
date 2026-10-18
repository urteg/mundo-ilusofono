// Fonte única dos preços. Valores em centavos de euro, SEM imposto (o IVA é somado no pagamento).
export type Intervalo = "mensal" | "anual";
export type PlanoAssinatura = "entender" | "participar";

export const precos = {
  entender: { mensal: 699, anual: 4900 },
  participar: { mensal: 1299, anual: 8900 },
  desafio: 900,
} as const;

export const avisoImposto = "Os preços não incluem imposto. O IVA é somado no pagamento.";

const formatador = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "EUR" });

const formatadorInteiro = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

/**
 * Formata centavos como "€6,99", ou "€49" quando o valor é redondo.
 * O pt-BR põe um espaço depois do símbolo; tiramos.
 */
export function formatarEuro(centavos: number): string {
  const f = centavos % 100 === 0 ? formatadorInteiro : formatador;
  return f.format(centavos / 100).replace(/\s/g, "");
}

export function precoPlano(plano: PlanoAssinatura, intervalo: Intervalo): string {
  return formatarEuro(precos[plano][intervalo]);
}

export function unidade(intervalo: Intervalo): string {
  return intervalo === "anual" ? "por ano" : "por mês";
}

/** Nota sob o preço: no anual, o valor mensal equivalente; no mensal, o preço anual. */
export function notaPlano(plano: PlanoAssinatura, intervalo: Intervalo): string {
  if (intervalo === "anual") {
    return `equivale a ${formatarEuro(Math.round(precos[plano].anual / 12))} por mês`;
  }
  return `ou ${formatarEuro(precos[plano].anual)} por ano`;
}

export function lerIntervalo(valor: string | null | undefined): Intervalo {
  return valor === "mensal" ? "mensal" : "anual";
}
