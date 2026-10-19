"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { classesBotao, cx, type VarianteBotao } from "@/components/ui";
import { irPara } from "@/lib/navegar";
import type { Intervalo, ProdutoCompra } from "@/lib/precos";

type Props = {
  produto: ProdutoCompra;
  intervalo?: Intervalo;
  children: React.ReactNode;
  variante?: VarianteBotao;
  className?: string;
};

type Estado =
  | { tipo: "pronto" }
  | { tipo: "abrindo" }
  | { tipo: "ja_ativo"; mensagem: string }
  | { tipo: "erro" };

/**
 * Abre o pagamento no Stripe (POST /api/stripe/checkout). Sem sessão, vai para o login e
 * volta para esta página. O preço e o acesso são decididos no servidor, nunca aqui.
 */
export function BotaoComprar({ produto, intervalo, children, variante, className }: Props) {
  const [estado, setEstado] = useState<Estado>({ tipo: "pronto" });
  const id = useId();

  async function comprar() {
    setEstado({ tipo: "abrindo" });
    try {
      const r = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(produto === "desafio" ? { produto } : { produto, intervalo }),
      });
      if (r.status === 401) {
        const aqui = `${window.location.pathname}${window.location.search}`;
        irPara(`/entrar?proximo=${encodeURIComponent(aqui)}`);
        return;
      }
      const corpo = (await r.json().catch(() => ({}))) as { url?: string; mensagem?: string };
      if (r.ok && corpo.url) {
        irPara(corpo.url);
        return;
      }
      if (r.status === 409 && corpo.mensagem) {
        setEstado({ tipo: "ja_ativo", mensagem: corpo.mensagem });
        return;
      }
      setEstado({ tipo: "erro" });
    } catch {
      setEstado({ tipo: "erro" });
    }
  }

  return (
    <div className="flex w-full flex-col items-center gap-2">
      <button
        type="button"
        onClick={comprar}
        disabled={estado.tipo === "abrindo"}
        aria-describedby={estado.tipo === "ja_ativo" || estado.tipo === "erro" ? id : undefined}
        className={classesBotao(variante, cx("disabled:opacity-70", className))}
        data-produto={produto}
      >
        {estado.tipo === "abrindo" ? "Abrindo o pagamento..." : children}
      </button>
      {estado.tipo === "ja_ativo" && (
        <p id={id} role="status" className="text-center text-sm font-semibold">
          {estado.mensagem}{" "}
          <Link href="/app/planos" className="underline underline-offset-4">
            Gerenciar assinatura
          </Link>
        </p>
      )}
      {estado.tipo === "erro" && (
        <p id={id} role="alert" className="text-center text-sm font-semibold">
          Não foi possível abrir o pagamento agora. Tente de novo em alguns segundos.
        </p>
      )}
    </div>
  );
}
