"use client";

import { useState } from "react";
import { Icone, Pilula } from "@/components/ui";
import { DialogoTempoFora } from "./DialogoTempoFora";

type Props = { minutosHoje: number; metaMin: number; sequencia: number; hoje: string };

/** Meta do dia (com o "+" do tempo fora do app) e sequência de dias. */
export function Pilulas({ minutosHoje, metaMin, sequencia, hoje }: Props) {
  const [aberto, setAberto] = useState(false);
  return (
    <div className="flex items-center gap-2">
      <div className="border-borda bg-branco flex items-center rounded-full border">
        <Pilula
          tipo="meta"
          minutos={minutosHoje}
          metaMin={metaMin}
          className="border-0 bg-transparent pr-1"
        />
        <button
          type="button"
          onClick={() => setAberto(true)}
          className="text-azul-acao hover:bg-areia mr-0.5 grid size-11 place-items-center rounded-full"
        >
          <Icone nome="mais" tamanho={20} rotulo="Adicionar tempo fora do app" />
        </button>
      </div>
      <Pilula tipo="sequencia" dias={sequencia} />
      <DialogoTempoFora aberto={aberto} aoFechar={() => setAberto(false)} hoje={hoje} />
    </div>
  );
}
