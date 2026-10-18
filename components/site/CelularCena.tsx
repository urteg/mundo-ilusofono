import { SeloEtapa } from "@/components/ui";
import type { CenaSerie } from "@/lib/cenas";
import { CenaPorNome } from "./Secao";

type Props = {
  cena: CenaSerie;
  tituloCena: string;
  legenda: string;
  tituloVideo: string;
  progresso: number;
  anotacao: string;
};

/** Celular inclinado com uma cena, a legenda do vídeo e uma anotação à mão. */
export function CelularCena({
  cena,
  tituloCena,
  legenda,
  tituloVideo,
  progresso,
  anotacao,
}: Props) {
  return (
    <div className="relative w-[min(300px,76vw)] -rotate-6">
      <div className="bg-texto rounded-[44px] p-3 shadow-[0_24px_48px_rgba(30,39,46,.22)]">
        <div className="bg-papel flex flex-col overflow-hidden rounded-[34px]">
          <div className="relative">
            <CenaPorNome nome={cena} titulo={tituloCena} className="block aspect-[9/11] w-full" />
            <p className="bg-azul-fundo/90 text-branco absolute inset-x-3.5 bottom-3.5 rounded-xl px-3 py-2.5 text-center text-[17px] leading-snug font-semibold">
              {legenda}
            </p>
          </div>
          <div className="flex flex-col gap-2.5 p-4">
            <SeloEtapa etapa={1} className="self-start" />
            <p className="font-titulo text-azul-fundo text-lg font-semibold">{tituloVideo}</p>
            <div className="bg-areia h-2 overflow-hidden rounded-full" aria-hidden="true">
              <i
                className="bg-verde block h-full rounded-full"
                style={{ width: `${progresso}%` }}
              />
            </div>
          </div>
        </div>
      </div>
      <span
        aria-hidden="true"
        className="rounded-bolha bg-branco font-mao text-coral-texto shadow-card absolute top-14 -right-4 rotate-[8deg] px-4 py-2.5 text-[26px] whitespace-nowrap sm:-right-14"
      >
        {anotacao}
      </span>
    </div>
  );
}
