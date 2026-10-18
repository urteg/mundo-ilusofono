import type { Metadata } from "next";
import Link from "next/link";
import { escolherOutroVideo } from "@/app/app/acoes";
import { CartaoVideo } from "@/components/app/CartaoVideo";
import { ContagemRegressiva } from "@/components/app/ContagemRegressiva";
import { TrilhaPassos } from "@/components/app/TrilhaPassos";
import { BotaoLink, Icone } from "@/components/ui";
import { carregarLicaoHoje, carregarProximaLive } from "@/lib/app/licao-hoje";
import { carregarParticipante } from "@/lib/app/participante";

export const metadata: Metadata = { title: "Lição de hoje" };

function quandoNoFuso(inicio: string, fuso: string): string {
  const texto = new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: fuso,
  }).format(new Date(inicio));
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

function BotaoOutroVideo({ className }: { className?: string }) {
  return (
    <form action={escolherOutroVideo}>
      <button type="submit" className={className}>
        Escolher outro vídeo
      </button>
    </form>
  );
}

export default async function LicaoDeHoje() {
  const participante = await carregarParticipante();
  const [licao, live] = await Promise.all([carregarLicaoHoje(participante), carregarProximaLive()]);
  const { video, passos, continuar, temAlternativa } = licao;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex max-w-[760px] items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-azul-fundo text-[clamp(34px,4.4vw,48px)] font-bold">Lição de hoje</h1>
          <p className="text-texto-suave text-lg">Assista, entenda e depois participe.</p>
        </div>
        {video && temAlternativa && (
          <details className="relative">
            <summary
              className="border-borda bg-branco text-texto hover:bg-areia grid size-11 cursor-pointer list-none place-items-center rounded-full border [&::-webkit-details-marker]:hidden"
              aria-label="Mais opções da lição"
            >
              <Icone nome="opcoes" />
            </summary>
            <div className="border-borda bg-branco shadow-card absolute right-0 z-20 mt-2 w-56 rounded-2xl border p-1.5">
              <BotaoOutroVideo className="hover:bg-areia flex min-h-11 w-full items-center rounded-xl px-3 text-left font-semibold" />
            </div>
          </details>
        )}
      </div>

      <TrilhaPassos estado={passos} />

      {video ? (
        <section aria-label="Vídeo recomendado" className="flex max-w-[760px] flex-col gap-4">
          <CartaoVideo video={video} grande href={`/app/video/${video.id}`} />
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <BotaoLink href={`/app/video/${video.id}`} className="min-h-12 px-8">
              <Icone nome="play" tamanho={20} />
              Assistir agora
            </BotaoLink>
            {temAlternativa && (
              <BotaoOutroVideo className="text-azul-acao inline-flex min-h-11 items-center font-bold underline-offset-4 hover:underline" />
            )}
          </div>
        </section>
      ) : (
        <section className="rounded-card bg-branco shadow-card flex max-w-[760px] flex-col items-start gap-3 p-8">
          <h2 className="text-azul-fundo text-2xl">Nenhum vídeo disponível agora</h2>
          <p className="text-texto-suave">Veja os planos para abrir a biblioteca inteira.</p>
          <BotaoLink href="/planos">Ver planos</BotaoLink>
        </section>
      )}

      {continuar && (
        <section aria-labelledby="titulo-continuar" className="flex max-w-[760px] flex-col gap-3">
          <h2 id="titulo-continuar" className="text-azul-fundo text-2xl">
            Continue de onde parou
          </h2>
          <div className="max-w-[420px]">
            <CartaoVideo video={continuar} href={`/app/video/${continuar.id}`} />
          </div>
        </section>
      )}

      {live && (
        <Link
          href="/app/lives"
          className="rounded-card bg-azul-fundo text-branco shadow-card flex max-w-[760px] flex-wrap items-center justify-between gap-4 p-6 hover:bg-[#0c4a75]"
        >
          <div className="flex min-w-0 items-center gap-4">
            <span className="bg-branco/15 grid size-12 shrink-0 place-items-center rounded-full">
              <Icone nome="ao-vivo" />
            </span>
            <div className="min-w-0">
              <b className="font-titulo block text-xl font-semibold">Próxima live com o Márlio</b>
              <span className="text-azul-claro">
                {quandoNoFuso(live.inicio, participante.fuso)} no seu fuso
              </span>
            </div>
          </div>
          <ContagemRegressiva inicio={live.inicio} />
        </Link>
      )}
    </div>
  );
}
