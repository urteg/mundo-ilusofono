"use client";

import { useEffect } from "react";
import { Botao, BotaoLink } from "@/components/ui";

export default function ErroApp({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <div className="rounded-bolha bg-branco shadow-card flex max-w-xl flex-col items-start gap-4 p-8">
      <span className="font-mao text-coral-texto text-[28px]">opa, deu um problema</span>
      <h1 className="text-azul-fundo text-3xl font-bold">Esta tela não carregou.</h1>
      <p className="text-texto-suave">Não foi culpa sua. Tente de novo em alguns segundos.</p>
      <div className="flex flex-wrap gap-3">
        <Botao onClick={reset}>Tentar de novo</Botao>
        <BotaoLink href="/app" variante="discreto">
          Voltar ao início
        </BotaoLink>
      </div>
    </div>
  );
}
