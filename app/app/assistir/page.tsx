import type { Metadata } from "next";
import Link from "next/link";
import { CartaoSerie } from "@/components/app/CartaoSerie";
import { FiltrosBiblioteca } from "@/components/app/FiltrosBiblioteca";
import { GradeVideos } from "@/components/app/GradeVideos";
import { BotaoLink, cx } from "@/components/ui";
import { buscarSeries, buscarVideos, opcoesFiltros } from "@/lib/app/catalogo";
import { carregarParticipante } from "@/lib/app/participante";
import { filtrosParaParams, hrefAssistir, lerFiltros, type Aba, type Filtros } from "@/lib/filtros";

export const metadata: Metadata = { title: "Assistir" };

const abas: { aba: Aba; rotulo: string }[] = [
  { aba: "explorar", rotulo: "Explorar" },
  { aba: "historico", rotulo: "Histórico" },
  { aba: "salvos", rotulo: "Salvos" },
];

export default async function Pagina({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const filtros = lerFiltros(await searchParams);
  const participante = await carregarParticipante();
  const [pagina, opcoes, seriesSalvas] = await Promise.all([
    buscarVideos(participante, filtros, 0),
    opcoesFiltros(),
    filtros.aba === "salvos"
      ? buscarSeries(participante).then((s) => s.filter((x) => x.salva))
      : Promise.resolve([]),
  ]);
  const consulta = filtrosParaParams(filtros).toString();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-azul-fundo text-[clamp(32px,4vw,44px)] font-bold">
        O que vamos assistir?
      </h1>

      <nav aria-label="Seções da biblioteca" className="border-borda flex gap-1 border-b-2">
        {abas.map(({ aba, rotulo }) => {
          const atual = filtros.aba === aba;
          return (
            <Link
              key={aba}
              href={hrefAssistir({ aba })}
              aria-current={atual ? "page" : undefined}
              className={cx(
                "-mb-0.5 flex min-h-12 items-center border-b-4 px-4 font-bold",
                atual
                  ? "border-azul-acao text-azul-acao"
                  : "text-texto-suave hover:text-azul-fundo border-transparent",
              )}
            >
              {rotulo}
            </Link>
          );
        })}
      </nav>

      <FiltrosBiblioteca filtros={filtros} opcoes={opcoes} />

      {seriesSalvas.length > 0 && (
        <section aria-labelledby="series-salvas" className="flex flex-col gap-4">
          <h2 id="series-salvas" className="text-azul-fundo text-2xl">
            Séries salvas
          </h2>
          <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {seriesSalvas.map((s) => (
              <li key={s.id} className="flex">
                <CartaoSerie serie={s} />
              </li>
            ))}
          </ul>
          <h2 className="text-azul-fundo text-2xl">Vídeos salvos</h2>
        </section>
      )}

      {seriesSalvas.length === 0 && <h2 className="sr-only">Vídeos</h2>}
      <p className="text-texto-suave text-sm" aria-live="polite">
        {pagina.total === 1 ? "1 vídeo" : `${pagina.total} vídeos`}
      </p>

      {pagina.total === 0 ? (
        <Vazio filtros={filtros} temSeriesSalvas={seriesSalvas.length > 0} />
      ) : (
        <GradeVideos
          key={consulta}
          iniciais={pagina.itens}
          proximo={pagina.proximo}
          consulta={consulta}
        />
      )}
    </div>
  );
}

function Vazio({ filtros, temSeriesSalvas }: { filtros: Filtros; temSeriesSalvas: boolean }) {
  const comFiltros =
    filtros.nivel !== undefined ||
    filtros.pais ||
    filtros.apresentador ||
    filtros.tema ||
    filtros.q ||
    filtros.ocultarVistos;
  const textos = comFiltros
    ? {
        titulo: "Nenhum vídeo com esses filtros.",
        texto: filtros.ocultarVistos
          ? 'Talvez você já tenha visto todos. Desligue "Ocultar vistos" ou tire algum filtro.'
          : "Tire algum filtro ou busque outra palavra.",
        acao: { href: hrefAssistir({ aba: filtros.aba }), rotulo: "Limpar filtros" },
      }
    : filtros.aba === "historico"
      ? {
          titulo: "Você ainda não começou nenhum vídeo.",
          texto: "Os vídeos que você assistir aparecem aqui, do mais recente para o mais antigo.",
          acao: { href: "/app/assistir", rotulo: "Explorar vídeos" },
        }
      : filtros.aba === "salvos"
        ? {
            titulo: temSeriesSalvas ? "Nenhum vídeo salvo ainda." : "Sua lista está vazia.",
            texto: "Use o menu de um vídeo ou o botão Salvar para guardar o que quer ver depois.",
            acao: { href: "/app/assistir", rotulo: "Explorar vídeos" },
          }
        : {
            titulo: "Ainda não há vídeos aqui.",
            texto: "Os primeiros vídeos chegam em breve.",
            acao: { href: "/app", rotulo: "Voltar à lição de hoje" },
          };
  return (
    <div className="rounded-card bg-branco shadow-card flex flex-col items-start gap-3 p-8">
      <h2 className="text-azul-fundo text-2xl">{textos.titulo}</h2>
      <p className="text-texto-suave">{textos.texto}</p>
      <BotaoLink href={textos.acao.href} variante="secundario">
        {textos.acao.rotulo}
      </BotaoLink>
    </div>
  );
}
