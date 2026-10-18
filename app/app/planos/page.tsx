import type { Metadata } from "next";
import { EmBreve } from "@/components/app/EmBreve";
import { BotaoLink } from "@/components/ui";
import { avisoImposto } from "@/lib/precos";

export const metadata: Metadata = { title: "Planos" };

// A assinatura dentro do app chega com o Stripe (Fase 4). Por enquanto, leva aos planos do site.
export default function Pagina() {
  return (
    <EmBreve titulo="Planos" fase="Fase 4">
      <p className="text-lg">
        Este vídeo faz parte de um plano pago. Veja o que cada plano inclui. {avisoImposto}
      </p>
      <BotaoLink href="/planos">Ver os planos</BotaoLink>
    </EmBreve>
  );
}
