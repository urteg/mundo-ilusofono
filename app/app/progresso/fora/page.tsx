import type { Metadata } from "next";
import Link from "next/link";
import type { RegistroTempoFora } from "@/components/app/DialogoTempoFora";
import { ListaTempoFora } from "@/components/app/ListaTempoFora";
import { Mao } from "@/components/site/Secao";
import { Icone } from "@/components/ui";
import { carregarTempoFora } from "@/lib/app/painel";
import { carregarParticipante } from "@/lib/app/participante";

export const metadata: Metadata = { title: "Horas fora do app" };

export default async function Pagina() {
  const [p, registros] = await Promise.all([carregarParticipante(), carregarTempoFora()]);
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <Link
        href="/app/progresso"
        className="text-azul-acao inline-flex min-h-11 items-center gap-2 self-start font-bold"
      >
        <Icone nome="seta-esquerda" tamanho={20} />
        Voltar para Progresso
      </Link>
      <div className="flex flex-col gap-2">
        <h1 className="text-azul-fundo text-[clamp(32px,4vw,44px)] font-bold">Horas fora do app</h1>
        <p className="text-texto-suave text-lg">
          Série, podcast, conversa com amigos: tudo em português conta.
        </p>
      </div>
      <ListaTempoFora registros={registros as RegistroTempoFora[]} hoje={p.hoje} />
      <p className="-rotate-1">
        <Mao>ouviu música e entendeu um pedaço? conta também.</Mao>
      </p>
    </div>
  );
}
