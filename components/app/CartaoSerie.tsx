import Link from "next/link";
import { CenaPorNome, TextoOuMarcador } from "@/components/site/Secao";
import { BotaoLink, Icone, SeloNivel } from "@/components/ui";
import type { SerieCartao } from "@/lib/app/catalogo";
import { resumoSerie } from "@/lib/series";

/** Cartão de série: capa, nível, "N episódios · duração", descrição, Reproduzir e Mais informações. */
export function CartaoSerie({ serie }: { serie: SerieCartao }) {
  const href = `/app/series/${serie.id}`;
  return (
    <article className="rounded-card bg-branco shadow-card flex w-full flex-col overflow-hidden">
      <Link href={href} tabIndex={-1} aria-hidden="true">
        <CenaPorNome nome={serie.cena} className="block aspect-video w-full" />
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <div className="flex flex-wrap items-center gap-2">
          <SeloNivel nivel={serie.nivel} />
          {serie.vistos > 0 && (
            <span className="text-texto-suave text-sm font-semibold">
              {serie.vistos} de {serie.episodios.length} vistos
            </span>
          )}
        </div>
        <h3 className="text-azul-fundo text-xl">
          <Link href={href} className="hover:underline">
            <TextoOuMarcador texto={serie.titulo} />
          </Link>
        </h3>
        <p className="text-texto-suave text-sm font-semibold" data-testid="resumo-serie">
          {resumoSerie(serie.episodios)}
        </p>
        {serie.descricao && (
          <p className="text-texto line-clamp-2">
            <TextoOuMarcador texto={serie.descricao} />
          </p>
        )}
        <div className="mt-auto flex flex-wrap gap-2 pt-3">
          {serie.proximoEpisodio ? (
            <BotaoLink href={`/app/video/${serie.proximoEpisodio}`} className="gap-2">
              <Icone nome="play" tamanho={18} />
              Reproduzir
              <span className="sr-only">: {serie.titulo}</span>
            </BotaoLink>
          ) : (
            <BotaoLink href="/app/planos" className="gap-2">
              <Icone nome="cadeado" tamanho={18} />
              Ver planos
            </BotaoLink>
          )}
          <BotaoLink href={href} variante="secundario">
            Mais informações<span className="sr-only">: {serie.titulo}</span>
          </BotaoLink>
        </div>
      </div>
    </article>
  );
}
