import type { ReactNode } from "react";
import { cx } from "./cx";

export type OpcaoAlternador<T extends string> = { valor: T; rotulo: ReactNode };

type Props<T extends string> = {
  rotulo: string;
  opcoes: OpcaoAlternador<T>[];
  valor: T;
  aoMudar: (valor: T) => void;
  className?: string;
};

/** Botões segmentados (um ativo por vez), com aria-pressed. */
export function Alternador<T extends string>({
  rotulo,
  opcoes,
  valor,
  aoMudar,
  className,
}: Props<T>) {
  return (
    <div
      role="group"
      aria-label={rotulo}
      className={cx("bg-areia inline-flex gap-1 rounded-full p-1.5", className)}
    >
      {opcoes.map((o) => {
        const ativo = o.valor === valor;
        return (
          <button
            key={o.valor}
            type="button"
            aria-pressed={ativo}
            onClick={() => aoMudar(o.valor)}
            className={cx(
              "font-titulo inline-flex min-h-11 items-center gap-2 rounded-full px-5 text-base font-semibold transition-colors",
              ativo ? "bg-azul-fundo text-branco" : "text-texto hover:bg-papel",
            )}
          >
            {o.rotulo}
          </button>
        );
      })}
    </div>
  );
}
