import type { ReactNode } from "react";
import { site } from "@/lib/site";
import { CenaMar } from "./cenas";
import { Envoltorio, Mao } from "./Secao";

/** Corpo comum das páginas de 404 e de erro. */
export function TelaErro({
  mao,
  titulo,
  texto,
  acoes,
}: {
  mao: string;
  titulo: string;
  texto: string;
  acoes: ReactNode;
}) {
  return (
    <section className="py-16 sm:py-24">
      <Envoltorio className="flex flex-wrap items-center gap-12">
        <div className="flex min-w-0 flex-[1_1_420px] flex-col items-start gap-5">
          <Mao className="text-[30px]">{mao}</Mao>
          <h1 className="text-azul-fundo text-[clamp(40px,5vw,60px)] font-bold">{titulo}</h1>
          <p className="text-texto-suave text-xl">{texto}</p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">{acoes}</div>
          <p className="font-mao text-coral-texto text-[26px]">{site.lema}</p>
        </div>
        <div className="rounded-bolha shadow-card min-w-0 flex-[1_1_320px] overflow-hidden">
          <CenaMar className="block aspect-video w-full" />
        </div>
      </Envoltorio>
    </section>
  );
}
