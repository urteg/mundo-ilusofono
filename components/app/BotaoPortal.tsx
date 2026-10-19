import { classesBotao, type VarianteBotao } from "@/components/ui";

/** Abre o portal do Stripe (POST com a ação desejada; a rota redireciona). */
export function BotaoPortal({
  acao,
  children,
  variante = "secundario",
  className,
}: {
  acao: "geral" | "trocar" | "pagamento" | "cancelar";
  children: React.ReactNode;
  variante?: VarianteBotao;
  className?: string;
}) {
  return (
    <form method="post" action="/api/stripe/portal">
      <input type="hidden" name="acao" value={acao} />
      <button type="submit" className={classesBotao(variante, className)}>
        {children}
      </button>
    </form>
  );
}
