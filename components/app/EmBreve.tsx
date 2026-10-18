import type { ReactNode } from "react";
import { BotaoLink } from "@/components/ui";

/** Tela provisória das abas que ainda serão construídas. */
export function EmBreve({
  titulo,
  fase,
  children,
}: {
  titulo: string;
  fase: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex max-w-2xl flex-col items-start gap-4">
      <h1 className="text-azul-fundo text-[clamp(32px,4vw,44px)] font-bold">{titulo}</h1>
      <p className="text-texto-suave text-lg">Esta tela chega em breve ({fase}).</p>
      {children}
      <BotaoLink href="/app" variante="secundario">
        Voltar à lição de hoje
      </BotaoLink>
    </div>
  );
}
