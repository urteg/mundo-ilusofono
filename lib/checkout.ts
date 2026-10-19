import { z } from "zod";
import { produtosAtivos, type Entitlement } from "./entitlements";

// Regras do checkout separadas da rota, para testar sem Stripe.

export const esquemaCheckout = z.discriminatedUnion("produto", [
  z.object({ produto: z.literal("desafio") }).strict(),
  z
    .object({
      produto: z.enum(["entender", "participar"]),
      intervalo: z.enum(["mensal", "anual"]),
    })
    .strict(),
]);

export type PedidoCheckout = z.infer<typeof esquemaCheckout>;

/**
 * Pode comprar? Quem já tem uma assinatura troca de plano pelo portal (não abre uma segunda).
 * Retorna a mensagem para o participante, ou null se pode seguir.
 */
export function bloqueioDeCompra(pedido: PedidoCheckout, ents: Entitlement[], agora: Date) {
  const ativos = produtosAtivos(ents, agora);
  const assinatura = ativos.has("participar")
    ? "Participar"
    : ativos.has("entender")
      ? "Entender"
      : null;
  if (pedido.produto === "desafio") {
    if (assinatura) return `Seu plano ${assinatura} já inclui todos os vídeos do Desafio.`;
    if (ativos.has("desafio")) return "Você já tem o Desafio 7 Dias.";
    return null;
  }
  if (assinatura) {
    return `Você já assina o ${assinatura}. Para trocar de plano ou de período, use "Gerenciar assinatura".`;
  }
  return null;
}
