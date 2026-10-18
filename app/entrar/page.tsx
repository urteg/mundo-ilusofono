import type { Metadata } from "next";
import { CelularCena } from "@/components/site/CelularCena";
import { FormEntrar } from "@/components/site/FormEntrar";
import { Marca } from "@/components/site/Marca";
import { caminhoSeguro } from "@/lib/redirecionamento";

export const metadata: Metadata = {
  title: "Entrar",
  robots: { index: false, follow: false },
};

const erros: Record<string, string> = {
  link: "Esse link expirou ou já foi usado. Peça um novo abaixo.",
};

type Props = { searchParams: Promise<{ proximo?: string; erro?: string }> };

export default async function Entrar({ searchParams }: Props) {
  const { proximo, erro } = await searchParams;
  return (
    <main className="mx-auto grid min-h-dvh max-w-[1120px] items-center gap-12 px-4 py-10 sm:px-8 lg:grid-cols-2">
      <div className="flex min-w-0 flex-col gap-8">
        <Marca />
        <div className="rounded-bolha bg-branco shadow-card flex flex-col gap-6 p-7 sm:p-10">
          <h1 className="text-azul-fundo text-[clamp(32px,4vw,40px)] font-bold">
            Entre com seu <span className="whitespace-nowrap">e-mail</span>
          </h1>
          <FormEntrar
            proximo={caminhoSeguro(proximo)}
            erroInicial={erro ? erros[erro] : undefined}
          />
        </div>
      </div>
      <div className="flex justify-center overflow-hidden py-8 lg:overflow-visible">
        <CelularCena
          cena="feira"
          tituloCena="Cena ilustrada: barraca de feira com frutas"
          legenda="Moço, quanto tá a manga hoje?"
          tituloVideo="Um dia na feira"
          progresso={30}
          anotacao="vamos lá, tá?"
        />
      </div>
    </main>
  );
}
