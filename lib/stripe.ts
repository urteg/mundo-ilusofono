import "server-only";
import Stripe from "stripe";

// Cliente do Stripe, só no servidor. A chave vem de STRIPE_SECRET_KEY (nunca do código).
// Versão da API fixa: uma mudança de versão é uma decisão, não um efeito de atualizar o pacote.
export const versaoApiStripe = "2026-09-30.endive" as const;

let cliente: Stripe | null = null;

/** Lê uma variável obrigatória e falha com uma mensagem clara (sem mostrar valores). */
export function variavelObrigatoria(nome: string): string {
  const valor = process.env[nome]?.trim();
  if (!valor) {
    throw new Error(`Falta a variável de ambiente ${nome}. Veja o .env.example e o README.`);
  }
  return valor;
}

/**
 * Só aceitamos chaves de TESTE enquanto o registro fiscal não estiver pronto.
 * Para liberar o modo real no futuro, será uma decisão explícita (STRIPE_MODO_REAL=1).
 */
export function validarChave(chave: string): void {
  const real = /^(sk|rk)_live_/.test(chave);
  if (real && process.env.STRIPE_MODO_REAL !== "1") {
    throw new Error(
      "STRIPE_SECRET_KEY é uma chave de produção. Use uma chave de teste (sk_test_).",
    );
  }
  if (!/^(sk|rk)_(test|live)_/.test(chave)) {
    throw new Error("STRIPE_SECRET_KEY não parece uma chave secreta do Stripe.");
  }
}

export function obterStripe(): Stripe {
  if (cliente) return cliente;
  const chave = variavelObrigatoria("STRIPE_SECRET_KEY");
  validarChave(chave);
  cliente = new Stripe(chave, {
    apiVersion: versaoApiStripe,
    appInfo: { name: "Mundo Ilusófono" },
    maxNetworkRetries: 2,
  });
  return cliente;
}

/** Só para testes: troca o cliente (ex.: por um simulado). */
export function definirStripeParaTestes(s: Stripe | null) {
  cliente = s;
}

export type { Stripe };
