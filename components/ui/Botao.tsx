import Link from "next/link";
import type { ButtonHTMLAttributes, ComponentProps, ReactNode } from "react";
import { cx } from "./cx";

export type VarianteBotao = "primario" | "secundario" | "discreto" | "dourado";

const base =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-6 py-2 font-titulo text-[17px] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60";

const variantes: Record<VarianteBotao, string> = {
  primario: "bg-azul-acao text-branco hover:bg-azul-fundo",
  secundario: "border-2 border-azul-acao bg-branco text-azul-acao hover:bg-areia",
  discreto: "text-azul-acao underline-offset-4 hover:underline px-3",
  dourado: "bg-dourado text-azul-fundo hover:bg-[#F0C933]",
};

export function classesBotao(variante: VarianteBotao = "primario", extra?: string) {
  return cx(base, variantes[variante], extra);
}

type BotaoProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variante?: VarianteBotao;
  children: ReactNode;
};

export function Botao({ variante = "primario", className, type = "button", ...resto }: BotaoProps) {
  return <button type={type} className={classesBotao(variante, className)} {...resto} />;
}

type BotaoLinkProps = ComponentProps<typeof Link> & { variante?: VarianteBotao };

export function BotaoLink({ variante = "primario", className, ...resto }: BotaoLinkProps) {
  return <Link className={classesBotao(variante, className)} {...resto} />;
}
