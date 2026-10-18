"use client";

import { useId } from "react";
import { cx } from "./cx";

type Props = {
  ligado: boolean;
  aoMudar: (ligado: boolean) => void;
  rotulo: string;
  className?: string;
  disabled?: boolean;
};

/** Interruptor liga/desliga (role="switch") com o rótulo clicável ao lado. */
export function Interruptor({ ligado, aoMudar, rotulo, className, disabled }: Props) {
  const id = useId();
  return (
    <span className={cx("inline-flex min-h-11 items-center gap-3", className)}>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={ligado}
        disabled={disabled}
        onClick={() => aoMudar(!ligado)}
        className={cx(
          "relative inline-flex h-7 w-12 shrink-0 items-center rounded-full border-2 transition-colors motion-reduce:transition-none",
          ligado ? "border-azul-acao bg-azul-acao" : "border-borda bg-areia",
          "before:absolute before:inset-[-8px] before:content-['']",
        )}
      >
        <span
          aria-hidden="true"
          className={cx(
            "bg-branco size-5 rounded-full shadow transition-transform motion-reduce:transition-none",
            ligado ? "translate-x-[22px]" : "translate-x-[2px]",
          )}
        />
      </button>
      <label htmlFor={id} className="cursor-pointer font-semibold">
        {rotulo}
      </label>
    </span>
  );
}
