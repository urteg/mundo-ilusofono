"use client";

import { useEffect } from "react";
import { TelaErro } from "@/components/site/Erro";
import { Botao, BotaoLink } from "@/components/ui";

export default function Erro({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <TelaErro
      mao="opa, deu um problema"
      titulo="Algo não funcionou."
      texto="Não foi culpa sua. Tente de novo em alguns segundos."
      acoes={
        <>
          <Botao onClick={reset}>Tentar de novo</Botao>
          <BotaoLink href="/" variante="discreto">
            Voltar ao início
          </BotaoLink>
        </>
      }
    />
  );
}
