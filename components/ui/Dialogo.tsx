"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { Icone } from "./Icone";

type Props = {
  aberto: boolean;
  aoFechar: () => void;
  titulo: string;
  children: ReactNode;
  rodape?: ReactNode;
};

/** Diálogo modal baseado no elemento nativo <dialog> (foco preso e Esc já inclusos). */
export function Dialogo({ aberto, aoFechar, titulo, children, rodape }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const idTitulo = useId();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (aberto && !el.open) el.showModal();
    if (!aberto && el.open) el.close();
  }, [aberto]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={idTitulo}
      onClose={aoFechar}
      onClick={(e) => {
        if (e.target === ref.current) aoFechar();
      }}
      className="rounded-card border-borda bg-branco text-texto shadow-card backdrop:bg-azul-fundo/50 m-auto w-[calc(100%-2rem)] max-w-lg border p-0"
    >
      <div className="flex items-start justify-between gap-4 p-5 pb-0">
        <h2 id={idTitulo} className="text-azul-fundo text-2xl">
          {titulo}
        </h2>
        <button
          type="button"
          onClick={aoFechar}
          aria-label="Fechar"
          className="text-texto-suave hover:bg-areia grid size-11 shrink-0 place-items-center rounded-full"
        >
          <Icone nome="fechar" />
        </button>
      </div>
      <div className="p-5">{children}</div>
      {rodape && <div className="flex flex-wrap justify-end gap-3 p-5 pt-0">{rodape}</div>}
    </dialog>
  );
}
