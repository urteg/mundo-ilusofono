import type { ButtonHTMLAttributes } from "react";
import { cx } from "./cx";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & { ativo?: boolean };

/** Botão alternável usado em filtros. */
export function Chip({ ativo = false, className, type = "button", ...resto }: Props) {
  return (
    <button
      type={type}
      aria-pressed={ativo}
      className={cx(
        "inline-flex min-h-11 items-center gap-1.5 rounded-full border-2 px-4 text-sm font-semibold transition-colors",
        ativo
          ? "border-azul-acao bg-azul-acao text-branco"
          : "border-borda bg-branco text-texto hover:border-azul-acao",
        className,
      )}
      {...resto}
    />
  );
}
