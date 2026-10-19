// Fonte única dos preços. Valores em centavos de euro, COM o IVA já incluído.
// No Stripe, cada preço é criado com o mesmo valor e tax_behavior = inclusive.
export type Intervalo = "mensal" | "anual";
export type PlanoAssinatura = "entender" | "participar";
export type ProdutoCompra = PlanoAssinatura | "desafio";

export const precos = {
  entender: { mensal: 799, anual: 5500 },
  participar: { mensal: 1399, anual: 9900 },
  desafio: 990,
} as const;

export const avisoImposto = "Os preços já incluem o IVA.";

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

// ---------- Preços no Stripe (só no servidor: as variáveis não são públicas) ----------

/** Nome da variável de ambiente com o price_ do Stripe para cada produto e intervalo. */
export function variavelPreco(produto: ProdutoCompra, intervalo?: Intervalo): string {
  if (produto === "desafio") return "STRIPE_PRICE_DESAFIO";
  return `STRIPE_PRICE_${produto.toUpperCase()}_${(intervalo ?? "mensal").toUpperCase()}`;
}

export const variaveisPrecos = [
  "STRIPE_PRICE_DESAFIO",
  "STRIPE_PRICE_ENTENDER_MENSAL",
  "STRIPE_PRICE_ENTENDER_ANUAL",
  "STRIPE_PRICE_PARTICIPAR_MENSAL",
  "STRIPE_PRICE_PARTICIPAR_ANUAL",
] as const;

/** price_ do Stripe para {produto, intervalo}. Falha com mensagem clara se faltar. */
export function precoStripe(produto: ProdutoCompra, intervalo?: Intervalo): string {
  const nome = variavelPreco(produto, intervalo);
  const valor = process.env[nome]?.trim();
  if (!valor) throw new Error(`Falta a variável de ambiente ${nome} (price_ do Stripe).`);
  return valor;
}

/** O caminho inverso: de um price_ recebido no webhook para {produto, intervalo}. */
export function produtoDoPreco(
  precoId: string,
): { produto: ProdutoCompra; intervalo: Intervalo | null } | null {
  const mapa: [string, ProdutoCompra, Intervalo | null][] = [
    ["STRIPE_PRICE_DESAFIO", "desafio", null],
    ["STRIPE_PRICE_ENTENDER_MENSAL", "entender", "mensal"],
    ["STRIPE_PRICE_ENTENDER_ANUAL", "entender", "anual"],
    ["STRIPE_PRICE_PARTICIPAR_MENSAL", "participar", "mensal"],
    ["STRIPE_PRICE_PARTICIPAR_ANUAL", "participar", "anual"],
  ];
  for (const [nome, produto, intervalo] of mapa) {
    if (process.env[nome]?.trim() === precoId) return { produto, intervalo };
  }
  return null;
}

/** Valor em centavos (com IVA) que o preço do Stripe deve ter, para conferência. */
export function valorEsperado(produto: ProdutoCompra, intervalo?: Intervalo): number {
  return produto === "desafio" ? precos.desafio : precos[produto][intervalo ?? "mensal"];
}
