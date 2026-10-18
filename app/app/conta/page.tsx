import type { Metadata } from "next";
import { sair } from "@/app/acoes-sessao";
import { EmBreve } from "@/components/app/EmBreve";
import { Botao } from "@/components/ui";
import { carregarParticipante } from "@/lib/app/participante";

export const metadata: Metadata = { title: "Conta" };

export default async function Conta() {
  const p = await carregarParticipante();
  return (
    <EmBreve titulo="Conta" fase="Fase 3">
      <p>
        Conectado como <b className="break-all">{p.email}</b>.
      </p>
      <form action={sair}>
        <Botao type="submit" variante="secundario">
          Sair
        </Botao>
      </form>
    </EmBreve>
  );
}
