import type { Metadata } from "next";
import Link from "next/link";
import { Cabecalho } from "@/components/site/Cabecalho";
import { TelaErro } from "@/components/site/Erro";
import { Rodape } from "@/components/site/Rodape";
import { BotaoLink } from "@/components/ui";

export const metadata: Metadata = {
  title: "Página não encontrada",
  robots: { index: false },
};

export default function NaoEncontrada() {
  return (
    <>
      <Cabecalho />
      <main id="conteudo">
        <TelaErro
          mao="ih, se perdeu?"
          titulo="Essa página não existe."
          texto="O endereço pode ter mudado ou ter sido digitado errado. Acontece."
          acoes={
            <>
              <BotaoLink href="/">Voltar ao início</BotaoLink>
              <Link href="/recursos" className="inline-flex min-h-11 items-center font-bold">
                Ver perguntas frequentes
              </Link>
            </>
          }
        />
      </main>
      <Rodape />
    </>
  );
}
