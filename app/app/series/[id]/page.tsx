import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { BotaoSalvarSerie } from "@/components/app/BotaoSalvarSerie";
import { hrefDoVideo } from "@/components/app/hrefs";
import { CenaPorNome, TextoOuMarcador } from "@/components/site/Secao";
import {
  BarraProgresso,
  BotaoLink,
  Icone,
  SeloMais18,
  SeloNivel,
  SeloPlano,
  type Plano,
} from "@/components/ui";
import { buscarSeries } from "@/lib/app/catalogo";
import { carregarParticipante } from "@/lib/app/participante";
import { duracaoVideo, resumoSerie } from "@/lib/series";

type Props = { params: Promise<{ id: string }> };

export const metadata: Metadata = { title: "Série" };

export default async function Pagina({ params }: Props) {
  const id = z
    .string()
    .uuid()
    .safeParse((await params).id);
  if (!id.success) notFound();
  const participante = await carregarParticipante();
  const [serie] = await buscarSeries(participante, id.data);
  if (!serie) notFound();

  return (
    <div className="flex flex-col gap-8">
      <Link
        href="/app/series"
        className="text-azul-acao inline-flex min-h-11 items-center gap-2 self-start font-bold"
      >
        <Icone nome="seta-esquerda" tamanho={20} />
        Voltar para Séries
      </Link>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:items-start">
        <CenaPorNome nome={serie.cena} className="rounded-card block aspect-video w-full" />
        <div className="flex flex-col gap-4">
          <SeloNivel nivel={serie.nivel} className="self-start" />
          <h1 className="text-azul-fundo text-[clamp(30px,4vw,44px)] font-bold">
            <TextoOuMarcador texto={serie.titulo} />
          </h1>
          {serie.apresentador && (
            <p className="text-texto-suave">
              com <TextoOuMarcador texto={serie.apresentador} />
            </p>
          )}
          <p className="text-texto-suave font-semibold">{resumoSerie(serie.episodios)}</p>
          {serie.descricao && (
            <p className="text-lg">
              <TextoOuMarcador texto={serie.descricao} />
            </p>
          )}
          <BarraProgresso
            valor={serie.vistos}
            maximo={Math.max(1, serie.episodios.length)}
            rotulo={`Progresso na série: ${serie.vistos} de ${serie.episodios.length} episódios`}
            mostrarRotulo
            cor="verde"
          />
          <div className="flex flex-wrap gap-3">
            {serie.proximoEpisodio ? (
              <BotaoLink href={`/app/video/${serie.proximoEpisodio}`} className="gap-2">
                <Icone nome="play" tamanho={18} />
                {serie.vistos > 0 ? "Continuar" : "Reproduzir"}
              </BotaoLink>
            ) : (
              <BotaoLink href="/app/planos" className="gap-2">
                <Icone nome="cadeado" tamanho={18} />
                Ver planos
              </BotaoLink>
            )}
            <BotaoSalvarSerie serieId={serie.id} salva={serie.salva} />
          </div>
        </div>
      </div>

      <section aria-labelledby="episodios" className="flex flex-col gap-4">
        <h2 id="episodios" className="text-azul-fundo text-2xl">
          Episódios
        </h2>
        <ol className="flex flex-col gap-3">
          {serie.episodios.map((ep, i) => (
            <li key={ep.id}>
              <Link
                href={hrefDoVideo(ep)}
                className="rounded-card bg-branco shadow-card hover:ring-azul-acao flex items-center gap-4 overflow-hidden pr-4 hover:ring-2"
                data-testid="episodio"
              >
                <span className="relative w-32 shrink-0 sm:w-44">
                  <CenaPorNome nome={ep.cena} className="block aspect-video w-full" />
                  <span className="bg-azul-fundo/90 text-branco absolute right-1.5 bottom-1.5 rounded-md px-1.5 text-xs font-extrabold tabular-nums">
                    {duracaoVideo(ep.duracao_seg)}
                  </span>
                </span>
                <span className="flex min-w-0 flex-1 flex-col gap-1 py-3">
                  <span className="text-texto-suave text-sm font-bold">Episódio {i + 1}</span>
                  <span className="text-azul-fundo font-titulo text-lg leading-snug font-semibold">
                    <TextoOuMarcador texto={ep.titulo} />
                  </span>
                  <span className="flex flex-wrap gap-1.5">
                    {ep.bloqueado && <SeloPlano plano={ep.plano_minimo as Plano} bloqueado />}
                    {ep.adulto && <SeloMais18 />}
                  </span>
                </span>
                {ep.visto ? (
                  <span className="text-branco grid size-9 shrink-0 place-items-center rounded-full bg-[#00684F]">
                    <Icone nome="check" tamanho={18} strokeWidth={3} rotulo="Visto" />
                  </span>
                ) : ep.bloqueado ? (
                  <Icone nome="cadeado" className="text-texto-suave shrink-0" rotulo="Bloqueado" />
                ) : (
                  <Icone nome="play" className="text-azul-acao shrink-0" />
                )}
              </Link>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
