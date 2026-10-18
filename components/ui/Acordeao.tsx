import type { ReactNode } from "react";
import { Icone } from "./Icone";

export type ItemAcordeao = { titulo: string; conteudo: ReactNode };

type Props = { itens: ItemAcordeao[]; nome?: string };

/** Acordeão nativo (<details>). Com `nome`, só um item fica aberto por vez. */
export function Acordeao({ itens, nome }: Props) {
  return (
    <div className="divide-borda rounded-card border-borda bg-branco divide-y overflow-hidden border">
      {itens.map((item) => (
        <details key={item.titulo} name={nome} className="group">
          <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 px-5 py-3 font-semibold [&::-webkit-details-marker]:hidden">
            {item.titulo}
            <Icone
              nome="seta-baixo"
              className="text-azul-acao shrink-0 transition-transform group-open:rotate-180"
            />
          </summary>
          <div className="text-texto-suave px-5 pb-5">{item.conteudo}</div>
        </details>
      ))}
    </div>
  );
}
