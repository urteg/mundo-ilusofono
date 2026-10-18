"use client";

import { useState, useTransition } from "react";
import { alternarSerieSalva } from "@/app/app/acoes-video";
import { Botao, Icone } from "@/components/ui";
import { avisar } from "./Avisos";

export function BotaoSalvarSerie({ serieId, salva: inicial }: { serieId: string; salva: boolean }) {
  const [salva, setSalva] = useState(inicial);
  const [, iniciar] = useTransition();
  return (
    <Botao
      variante="secundario"
      className="gap-2"
      aria-pressed={salva}
      onClick={() => {
        const nova = !salva;
        setSalva(nova);
        iniciar(async () => {
          const r = await alternarSerieSalva(serieId, nova);
          if (!r.ok) setSalva(!nova);
          avisar(
            r.ok
              ? nova
                ? "Série salva na sua lista."
                : "Série removida da lista."
              : "Não foi possível salvar agora.",
          );
        });
      }}
    >
      <Icone nome="salvar" tamanho={18} />
      {salva ? "Série salva" : "Salvar série"}
    </Botao>
  );
}
