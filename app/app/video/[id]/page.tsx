import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { PaginaVideo } from "@/components/app/PaginaVideo";
import { CenaPorNome, Mao, TextoOuMarcador } from "@/components/site/Secao";
import { BotaoLink, Icone, SeloMais18, SeloNivel, SeloPlano, type Plano } from "@/components/ui";
import { buscarVideo } from "@/lib/app/catalogo";
import { carregarParticipante } from "@/lib/app/participante";
import { hrefAssistir } from "@/lib/filtros";

type Props = { params: Promise<{ id: string }> };

export const metadata: Metadata = { title: "Vídeo" };

const nomesPlano: Record<string, string> = {
  entender: "Entender",
  participar: "Participar",
  gratis: "Grátis",
};

export default async function Pagina({ params }: Props) {
  const id = z
    .string()
    .uuid()
    .safeParse((await params).id);
  if (!id.success) notFound();
  const participante = await carregarParticipante();
  const dados = await buscarVideo(participante, id.data);
  if (!dados) notFound();
  const { video } = dados;

  const selos = (
    <ul aria-label="Sobre este vídeo" className="flex flex-wrap gap-2">
      <li>
        <Link
          href={hrefAssistir({ nivel: video.nivel })}
          className="inline-flex min-h-11 items-center"
        >
          <SeloNivel nivel={video.nivel} />
          <span className="sr-only">: ver mais vídeos deste nível</span>
        </Link>
      </li>
      {video.pais && (
        <li>
          <Link href={hrefAssistir({ pais: video.pais })} className={classeSelo}>
            {video.pais}
          </Link>
        </li>
      )}
      {video.apresentador && dados.apresentadorId && (
        <li>
          <Link href={hrefAssistir({ apresentador: dados.apresentadorId })} className={classeSelo}>
            <TextoOuMarcador texto={video.apresentador} />
          </Link>
        </li>
      )}
      {dados.temas.map((t) => (
        <li key={t.slug}>
          <Link href={hrefAssistir({ tema: t.slug })} className={classeSelo}>
            {t.nome}
          </Link>
        </li>
      ))}
      {video.adulto && (
        <li className="inline-flex min-h-11 items-center">
          <SeloMais18 />
        </li>
      )}
    </ul>
  );

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/app/assistir"
        className="text-azul-acao inline-flex min-h-11 items-center gap-2 self-start font-bold"
      >
        <Icone nome="seta-esquerda" tamanho={20} />
        Voltar para Assistir
      </Link>

      {video.bloqueado ? (
        <div className="flex flex-col gap-6">
          <div className="rounded-card relative overflow-hidden">
            <CenaPorNome nome={video.cena} className="block aspect-video w-full opacity-40" />
            <div className="bg-azul-fundo/70 text-branco absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center">
              <Icone nome="cadeado" tamanho={44} />
              <p className="font-titulo text-[clamp(20px,3vw,30px)] font-bold">
                Este vídeo faz parte do plano {nomesPlano[video.plano_minimo] ?? "Entender"}.
              </p>
              <BotaoLink href="/app/planos" variante="dourado">
                Ver planos
              </BotaoLink>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <SeloPlano plano={video.plano_minimo as Plano} bloqueado className="self-start" />
            <h1 className="text-azul-fundo text-[clamp(26px,3.4vw,38px)] font-bold">
              <TextoOuMarcador texto={video.titulo} />
            </h1>
            {selos}
          </div>
        </div>
      ) : (
        <PaginaVideo
          video={video}
          posicaoNaSerie={dados.posicaoNaSerie}
          estado={dados.estado}
          preferencias={dados.preferencias}
          parecidos={dados.parecidos}
          selos={selos}
          descricao={dados.descricao}
          mao={<Mao>palavras que você não conhece? deixa passar. elas voltam.</Mao>}
        />
      )}
    </div>
  );
}

const classeSelo =
  "border-borda bg-branco hover:border-azul-acao text-azul-fundo inline-flex min-h-11 items-center rounded-full border-2 px-4 text-sm font-bold";
