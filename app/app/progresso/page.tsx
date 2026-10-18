import type { Metadata } from "next";
import Link from "next/link";
import { CalendarioMes } from "@/components/app/CalendarioMes";
import { CenaPorNome, TextoOuMarcador } from "@/components/site/Secao";
import { BarraProgresso, Icone, SeloNivel, cx } from "@/components/ui";
import { carregarPainel } from "@/lib/app/painel";
import { carregarParticipante } from "@/lib/app/participante";
import { lerMes, textoHoras, textoSequencia } from "@/lib/calendario";
import { inicioDosNiveis, nivelMaximo, nomesDosNiveis } from "@/lib/niveis";

export const metadata: Metadata = { title: "Progresso" };

const formatoHoras = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 });

function horasInteiras(h: number) {
  return `${formatoHoras.format(Math.floor(h))} h`;
}

export default async function Pagina({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const p = await carregarParticipante();
  const mes = lerMes((await searchParams).mes, p.hoje);
  const painel = await carregarPainel(p, mes);
  const { progresso: prog } = p;
  const proximoInicio = prog.nivel < nivelMaximo ? inicioDosNiveis[prog.nivel + 1] : null;
  const frase = textoSequencia(p.sequencia);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-azul-fundo text-[clamp(32px,4vw,44px)] font-bold">Progresso</h1>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section aria-labelledby="horas" className={cartao}>
          <h2 id="horas" className="text-texto-suave text-base font-bold">
            Horas neste caminho
          </h2>
          <p className="flex items-baseline gap-2" data-testid="horas-totais">
            <span className="font-titulo text-azul-fundo text-[44px] leading-none font-bold">
              {horasInteiras(prog.horas)}
            </span>
            {proximoInicio !== null && (
              <span className="text-texto-suave text-lg">de {proximoInicio} h</span>
            )}
          </p>
          <BarraProgresso
            valor={Math.round(prog.horas * 10) / 10}
            maximo={proximoInicio ?? Math.max(1, prog.horas)}
            rotulo={`${horasInteiras(prog.horas)}${proximoInicio !== null ? ` de ${proximoInicio} h` : ""} neste caminho`}
            cor="verde"
          />
          <p className="text-texto-suave text-sm">
            Total exato: {textoHoras(painel.assistidoSeg + painel.foraSeg)}. Inclui{" "}
            {textoHoras(painel.foraSeg)} fora do app ·{" "}
            <Link href="/app/progresso/fora" className="text-azul-acao font-semibold underline">
              Horas fora do app
            </Link>
          </p>
        </section>

        <section aria-labelledby="nivel" className={cartao}>
          <h2 id="nivel" className="text-texto-suave text-base font-bold">
            Seu nível agora
          </h2>
          <div className="flex flex-wrap items-center gap-3">
            <SeloNivel nivel={prog.nivel} className="text-sm" />
            <span className="font-titulo text-azul-fundo text-2xl font-semibold">
              {nomesDosNiveis[prog.nivel]}
            </span>
          </div>
          <p className="text-lg">
            {prog.horasParaProximo !== null ? (
              <>
                Faltam <b>{textoHoras(Math.ceil(prog.horasParaProximo * 3600))}</b> para o Nível{" "}
                {prog.nivel + 1}.
              </>
            ) : (
              "Você chegou ao último nível. Daqui em diante, é viver a língua."
            )}
          </p>
        </section>
      </div>

      <section
        aria-labelledby="semana"
        className={cx(cartao, "md:flex-row md:items-center md:justify-between")}
      >
        <div className="flex flex-col gap-3">
          <h2 id="semana" className="text-azul-fundo text-2xl">
            Esta semana
          </h2>
          <ol className="flex gap-2" aria-label="Dias desta semana">
            {painel.semana.map((d) => (
              <li
                key={d.dia}
                className="flex flex-col items-center gap-1"
                aria-label={`${d.nome}: ${
                  d.futuro
                    ? "ainda não chegou"
                    : d.cumprida
                      ? "meta cumprida"
                      : d.praticou
                        ? "praticou"
                        : "sem registro"
                }${d.hoje ? " (hoje)" : ""}`}
              >
                <span
                  aria-hidden="true"
                  className={cx(
                    "grid size-9 place-items-center rounded-full border-2",
                    d.cumprida
                      ? "border-verde bg-verde text-[#0b2a22]"
                      : d.praticou
                        ? "border-verde bg-[#D6F5EC]"
                        : "border-borda bg-branco",
                    d.hoje && "ring-azul-acao ring-2 ring-offset-2",
                  )}
                >
                  {d.cumprida && <Icone nome="check" tamanho={16} strokeWidth={3} />}
                </span>
                <span aria-hidden="true" className="text-texto-suave text-xs font-bold">
                  {d.inicial}
                </span>
              </li>
            ))}
          </ol>
        </div>
        <p className="max-w-md text-lg" data-testid="frase-sequencia">
          <b>{frase.destaque}</b> {frase.resto}
        </p>
      </section>

      <ul className="grid grid-cols-2 gap-4 lg:grid-cols-4" aria-label="Estatísticas">
        {[
          [textoHoras(painel.assistidoSeg), "horas assistidas"],
          [
            String(painel.videosVistos),
            painel.videosVistos === 1 ? "vídeo visto" : "vídeos vistos",
          ],
          [
            String(painel.diasPraticados),
            painel.diasPraticados === 1 ? "dia praticado" : "dias praticados",
          ],
          [
            String(painel.semanasSeguidas),
            painel.semanasSeguidas === 1 ? "semana seguida" : "semanas seguidas",
          ],
        ].map(([valor, rotulo]) => (
          <li key={rotulo} className="rounded-card bg-papel-escuro flex flex-col gap-1 p-5">
            <span className="font-titulo text-azul-fundo text-[28px] leading-none font-bold">
              {valor}
            </span>
            <span className="text-texto-suave">{rotulo}</span>
          </li>
        ))}
      </ul>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <section id="calendario" aria-labelledby="titulo-calendario" className={cartao}>
          <CalendarioMes key={painel.calendario.mes} cal={painel.calendario} metaMin={p.metaMin} />
        </section>

        <section aria-labelledby="escada" className={cartao}>
          <h2 id="escada" className="text-azul-fundo text-2xl">
            A escada de níveis
          </h2>
          <ol className="flex flex-col-reverse gap-2">
            {inicioDosNiveis.map((inicio, n) => {
              const fim = n < nivelMaximo ? inicioDosNiveis[n + 1] : null;
              const atual = n === prog.nivel;
              const feito = n < prog.nivel;
              return (
                <li
                  key={n}
                  aria-current={atual ? "step" : undefined}
                  className={cx(
                    "flex flex-wrap items-center justify-between gap-2 rounded-xl px-3 py-2",
                    atual && "border-azul-acao border-2",
                  )}
                >
                  <span className="flex flex-wrap items-center gap-2">
                    <SeloNivel nivel={n} />
                    <span className="text-sm font-semibold">{nomesDosNiveis[n]}</span>
                  </span>
                  <span className="text-texto-suave text-sm">
                    {fim !== null ? `${inicio} a ${fim} h` : `a partir de ${inicio} h`}
                    {" · "}
                    <b
                      className={cx(
                        atual ? "text-azul-acao" : feito ? "text-[#00684F]" : "text-texto-suave",
                      )}
                    >
                      {atual ? "você está aqui" : feito ? "concluído" : "a seguir"}
                    </b>
                  </span>
                </li>
              );
            })}
          </ol>
        </section>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section aria-labelledby="conquistas" className={cartao}>
          <h2 id="conquistas" className="text-azul-fundo text-2xl">
            Conquistas
          </h2>
          <div
            aria-disabled="true"
            className="border-borda text-texto-suave rounded-xl border-2 border-dashed p-6 text-center"
          >
            <p className="font-bold">Em breve</p>
            <p className="text-sm">Medalhas pelos marcos do seu caminho.</p>
          </div>
        </section>

        <section aria-labelledby="rever" className={cartao}>
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 id="rever" className="text-azul-fundo text-2xl">
              Para rever
            </h2>
            <Link
              href="/app/progresso/fora"
              className="text-azul-acao inline-flex min-h-11 items-center gap-1 font-bold"
            >
              Horas fora do app
              <Icone nome="seta-direita" tamanho={18} />
            </Link>
          </div>
          {painel.paraRever.length === 0 ? (
            <p className="text-texto-suave">
              Quando você marcar &quot;Entendi pouco&quot; em um vídeo, ele aparece aqui para ver de
              novo mais tarde.
            </p>
          ) : (
            <ul className="flex flex-col gap-3">
              {painel.paraRever.map((v) => (
                <li key={v.id}>
                  <Link
                    href={`/app/video/${v.id}`}
                    className="hover:bg-areia flex items-center gap-3 rounded-xl p-1"
                  >
                    <CenaPorNome nome={v.cena} className="block h-14 w-24 shrink-0 rounded-lg" />
                    <span className="flex flex-col">
                      <span className="font-bold">
                        <TextoOuMarcador texto={v.titulo} />
                      </span>
                      <span className="text-texto-suave text-sm">
                        você marcou &quot;entendi pouco&quot;
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

const cartao = "rounded-card bg-branco shadow-card flex flex-col gap-4 p-5 sm:p-7";
