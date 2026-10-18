"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, useTransition, type ReactNode } from "react";
import {
  alternarCurtida,
  alternarSalvo,
  salvarEntendimento,
  salvarPreferencias,
} from "@/app/app/acoes-video";
import { TextoOuMarcador } from "@/components/site/Secao";
import { Botao, BotaoLink, Icone, Interruptor, cx } from "@/components/ui";
import type { CartaoBiblioteca as Dados } from "@/lib/app/catalogo";
import { compartilhar, mensagemCompartilhar } from "@/lib/compartilhar";
import { avisar } from "./Avisos";
import { CartaoBiblioteca } from "./CartaoBiblioteca";
import { useBatimentos } from "./useBatimentos";
import { VideoPlayer, type Provedor } from "./VideoPlayer";

type Entendimento = "quase_tudo" | "principal" | "pouco";

type Props = {
  video: Dados;
  posicaoNaSerie: { atual: number; total: number } | null;
  estado: {
    posicaoSeg: number;
    curtido: boolean;
    salvo: boolean;
    entendimento: Entendimento | null;
  };
  preferencias: { legendas: boolean; reproducaoAutomatica: boolean; pularVistos: boolean };
  parecidos: Dados[];
  selos: ReactNode;
  descricao: string | null;
  mao: ReactNode;
};

const opcoesEntendimento: { valor: Entendimento; rotulo: string }[] = [
  { valor: "quase_tudo", rotulo: "Entendi quase tudo" },
  { valor: "principal", rotulo: "Entendi o principal" },
  { valor: "pouco", rotulo: "Entendi pouco" },
];

const chaveLocal = "mundo-ilusofono:reproducao";

export function PaginaVideo({
  video,
  posicaoNaSerie,
  estado,
  preferencias,
  parecidos,
  selos,
  descricao,
  mao,
}: Props) {
  const router = useRouter();
  const [, iniciar] = useTransition();
  const [curtido, setCurtido] = useState(estado.curtido);
  const [salvo, setSalvo] = useState(estado.salvo);
  const [entendimento, setEntendimento] = useState(estado.entendimento);
  const [concluido, setConcluido] = useState(video.visto);
  const [autoplay, setAutoplay] = useState(preferencias.reproducaoAutomatica);
  const [pularVistos, setPularVistos] = useState(preferencias.pularVistos);
  const [contagem, setContagem] = useState<number | null>(null);
  const [rodada, setRodada] = useState(0);
  const [inicio, setInicio] = useState(
    video.visto || estado.posicaoSeg >= video.duracao_seg - 2 ? 0 : estado.posicaoSeg,
  );

  // Preferências guardadas no aparelho valem primeiro (respondem antes do servidor).
  useEffect(() => {
    try {
      const salvo = JSON.parse(localStorage.getItem(chaveLocal) ?? "null");
      if (salvo && typeof salvo === "object") {
        if (typeof salvo.autoplay === "boolean") setAutoplay(salvo.autoplay);
        if (typeof salvo.pularVistos === "boolean") setPularVistos(salvo.pularVistos);
      }
    } catch {}
  }, []);

  const mudarPreferencia = (mudanca: { autoplay?: boolean; pularVistos?: boolean }) => {
    const nova = { autoplay, pularVistos, ...mudanca };
    setAutoplay(nova.autoplay);
    setPularVistos(nova.pularVistos);
    try {
      localStorage.setItem(chaveLocal, JSON.stringify(nova));
    } catch {}
    void salvarPreferencias({
      reproducao_automatica: nova.autoplay,
      pular_vistos: nova.pularVistos,
    });
  };

  const lista = parecidos.filter((v) => !pularVistos || !v.visto);
  const proximo = lista.find((v) => !v.bloqueado) ?? null;

  const { aoProgresso } = useBatimentos(
    video.id,
    useCallback((r: { concluido: boolean }) => r.concluido && setConcluido(true), []),
  );

  const aoTerminar = useCallback(() => {
    setConcluido(true);
    if (autoplay && proximo) setContagem(5);
  }, [autoplay, proximo]);

  useEffect(() => {
    if (contagem === null) return;
    if (contagem <= 0) {
      router.push(`/app/video/${proximo?.id}`);
      return;
    }
    const id = setTimeout(() => setContagem((c) => (c === null ? null : c - 1)), 1000);
    return () => clearTimeout(id);
  }, [contagem, proximo, router]);

  const verDeNovo = () => {
    setContagem(null);
    setInicio(0);
    setRodada((r) => r + 1);
    document.getElementById("area-player")?.scrollIntoView({ block: "start" });
  };

  const salvarNaLista = () => {
    const novo = !salvo;
    setSalvo(novo);
    iniciar(async () => {
      const r = await alternarSalvo(video.id, novo);
      if (!r.ok) setSalvo(!novo);
      avisar(
        r.ok
          ? novo
            ? "Salvo na sua lista."
            : "Removido da sua lista."
          : "Não foi possível salvar agora.",
      );
    });
  };

  const botaoAcao =
    "inline-flex min-h-11 items-center gap-2 rounded-full border-2 px-4 font-bold transition-colors";

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-[minmax(0,1fr)_380px]">
      <div className="flex min-w-0 flex-col gap-6">
        <div id="area-player" className="relative scroll-mt-24">
          <AreaPlayer
            key={rodada}
            videoId={video.id}
            titulo={video.titulo}
            posicaoInicial={inicio}
            legendaLigada={preferencias.legendas}
            aoProgresso={aoProgresso}
            aoTerminar={aoTerminar}
          />
          {contagem !== null && proximo && (
            <div
              role="status"
              className="bg-azul-fundo/90 text-branco rounded-card absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center"
            >
              <p className="text-lg">Próximo vídeo em {contagem} s</p>
              <p className="font-titulo text-xl font-bold">
                <TextoOuMarcador texto={proximo.titulo} />
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <BotaoLink href={`/app/video/${proximo.id}`} variante="dourado">
                  Assistir agora
                </BotaoLink>
                <Botao
                  variante="secundario"
                  onClick={() => setContagem(null)}
                  className="bg-branco"
                >
                  Cancelar
                </Botao>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <h1 className="text-azul-fundo text-[clamp(26px,3.4vw,38px)] font-bold">
            <TextoOuMarcador texto={video.titulo} />
          </h1>
          {video.serie_titulo && video.serie_id && (
            <p className="text-texto-suave font-semibold">
              <Link
                href={`/app/series/${video.serie_id}`}
                className="text-azul-acao underline underline-offset-4"
              >
                <TextoOuMarcador texto={video.serie_titulo} />
              </Link>
              {posicaoNaSerie && (
                <>
                  {" · "}vídeo {posicaoNaSerie.atual} de {posicaoNaSerie.total}
                </>
              )}
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            aria-pressed={curtido}
            onClick={() => {
              const novo = !curtido;
              setCurtido(novo);
              iniciar(async () => {
                const r = await alternarCurtida(video.id, novo);
                if (!r.ok) setCurtido(!novo);
              });
            }}
            className={cx(
              botaoAcao,
              curtido
                ? "border-coral-texto bg-coral-texto text-branco"
                : "border-borda bg-branco text-azul-fundo hover:border-azul-acao",
            )}
          >
            <Icone nome="coracao" tamanho={20} fill={curtido ? "currentColor" : "none"} />
            {curtido ? "Curtido" : "Curtir"}
          </button>
          <button
            type="button"
            onClick={async () => {
              const m =
                mensagemCompartilhar[await compartilhar(video.titulo, `/app/video/${video.id}`)];
              if (m) avisar(m);
            }}
            className={cx(
              botaoAcao,
              "border-borda bg-branco text-azul-fundo hover:border-azul-acao",
            )}
          >
            <Icone nome="compartilhar" tamanho={20} />
            Compartilhar
          </button>
          <button
            type="button"
            aria-pressed={salvo}
            onClick={salvarNaLista}
            className={cx(
              botaoAcao,
              salvo
                ? "border-azul-acao bg-azul-acao text-branco"
                : "border-borda bg-branco text-azul-fundo hover:border-azul-acao",
            )}
          >
            <Icone nome="salvar" tamanho={20} fill={salvo ? "currentColor" : "none"} />
            {salvo ? "Salvo" : "Salvar"}
          </button>
        </div>

        {selos}

        {descricao && (
          <p className="text-lg">
            <TextoOuMarcador texto={descricao} />
          </p>
        )}

        <section
          aria-labelledby="quanto-entendeu"
          className="rounded-card bg-branco shadow-card flex flex-col gap-4 p-5 sm:p-6"
        >
          <h2 id="quanto-entendeu" className="text-azul-fundo text-2xl">
            Quanto você entendeu?
          </h2>
          <div role="radiogroup" aria-labelledby="quanto-entendeu" className="flex flex-wrap gap-2">
            {opcoesEntendimento.map((o) => {
              const marcado = entendimento === o.valor;
              return (
                <button
                  key={o.valor}
                  type="button"
                  role="radio"
                  aria-checked={marcado}
                  onClick={() => {
                    const anterior = entendimento;
                    setEntendimento(o.valor);
                    iniciar(async () => {
                      const r = await salvarEntendimento(video.id, o.valor);
                      if (!r.ok) {
                        setEntendimento(anterior);
                        avisar("Não foi possível salvar agora.");
                      }
                    });
                  }}
                  className={cx(
                    botaoAcao,
                    marcado
                      ? "border-azul-acao bg-azul-acao text-branco"
                      : "border-borda bg-branco text-azul-fundo hover:border-azul-acao",
                  )}
                >
                  {marcado && <Icone nome="check" tamanho={18} strokeWidth={3} />}
                  {o.rotulo}
                </button>
              );
            })}
          </div>
          <p className="text-texto-suave text-sm">
            Qualquer resposta está certa. Ela só ajuda a escolher os próximos vídeos.
          </p>
          <div className="border-borda flex flex-wrap gap-3 border-t pt-4">
            <Botao variante="secundario" onClick={verDeNovo} className="gap-2">
              <Icone nome="de-novo" tamanho={18} />
              Ver de novo
            </Botao>
            <Botao
              variante="secundario"
              onClick={salvarNaLista}
              className="gap-2"
              aria-pressed={salvo}
            >
              <Icone nome="salvar" tamanho={18} />
              {salvo ? "Salvo na lista" : "Salvar na lista"}
            </Botao>
          </div>
        </section>

        <section aria-labelledby="passos-video" className="flex flex-col gap-3">
          <h2 id="passos-video" className="sr-only">
            Passos deste vídeo
          </h2>
          <ol className="grid gap-3 sm:grid-cols-3">
            <Passo numero={1} rotulo="Assistir" feito={concluido} />
            <Passo numero={2} rotulo="Entender o vocabulário" bloqueado />
            <Passo numero={3} rotulo="Participar" bloqueado />
          </ol>
        </section>

        <p className="-rotate-1">{mao}</p>
      </div>

      <aside aria-labelledby="mais-videos" className="flex min-w-0 flex-col gap-4">
        <h2 id="mais-videos" className="text-azul-fundo text-2xl">
          Mais vídeos como este
        </h2>
        <div className="flex flex-wrap gap-x-6">
          <Interruptor
            ligado={autoplay}
            aoMudar={(v) => mudarPreferencia({ autoplay: v })}
            rotulo="Reprodução automática"
          />
          <Interruptor
            ligado={pularVistos}
            aoMudar={(v) => mudarPreferencia({ pularVistos: v })}
            rotulo="Pular vistos"
          />
        </div>
        {lista.length === 0 ? (
          <p className="text-texto-suave">
            Você já viu todos os parecidos. Que tal explorar outro tema?
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {lista.map((v) => (
              <li key={v.id}>
                <CartaoBiblioteca video={v} compacto />
              </li>
            ))}
          </ul>
        )}
      </aside>
    </div>
  );
}

function Passo({
  numero,
  rotulo,
  feito = false,
  bloqueado = false,
}: {
  numero: number;
  rotulo: string;
  feito?: boolean;
  bloqueado?: boolean;
}) {
  return (
    <li
      className={cx(
        "rounded-card flex items-center gap-3 border-2 p-4",
        bloqueado ? "border-borda bg-areia/50 text-texto-suave" : "border-azul-acao bg-branco",
      )}
    >
      <span
        className={cx(
          "font-titulo grid size-11 shrink-0 place-items-center rounded-full border-2 text-lg font-bold",
          feito
            ? "text-branco border-[#00684F] bg-[#00684F]"
            : bloqueado
              ? "border-borda bg-branco"
              : "border-azul-acao text-azul-acao bg-branco",
        )}
      >
        {feito ? (
          <Icone nome="check" tamanho={22} strokeWidth={3} />
        ) : bloqueado ? (
          <Icone nome="cadeado" tamanho={20} />
        ) : (
          numero
        )}
      </span>
      <span className="font-bold">
        {numero}. {rotulo}
        <span className="sr-only">
          {feito ? ": concluído" : bloqueado ? ": em breve" : ": a fazer"}
        </span>
        {bloqueado && <span className="block text-sm font-semibold">em breve</span>}
      </span>
    </li>
  );
}

type Fonte = { provedor: Provedor; referencia: string; legendas: string | null };

/** Busca a fonte do vídeo na API (só quem pode assistir recebe) e monta o player. */
function AreaPlayer({
  videoId,
  titulo,
  posicaoInicial,
  legendaLigada,
  aoProgresso,
  aoTerminar,
}: {
  videoId: string;
  titulo: string;
  posicaoInicial: number;
  legendaLigada: boolean;
  aoProgresso: (e: { posicao: number; tocando: boolean }) => void;
  aoTerminar: () => void;
}) {
  const [fonte, setFonte] = useState<Fonte | null>(null);
  const [erro, setErro] = useState<"bloqueado" | "falha" | null>(null);
  const [tentativa, setTentativa] = useState(0);

  useEffect(() => {
    let cancelado = false;
    setErro(null);
    fetch(`/api/video/${videoId}/fonte`, { cache: "no-store" })
      .then(async (r) => {
        if (cancelado) return;
        if (r.status === 403) return setErro("bloqueado");
        if (!r.ok) return setErro("falha");
        setFonte((await r.json()) as Fonte);
      })
      .catch(() => !cancelado && setErro("falha"));
    return () => {
      cancelado = true;
    };
  }, [videoId, tentativa]);

  if (erro === "bloqueado") {
    return (
      <div className="bg-azul-fundo text-branco flex aspect-video flex-col items-center justify-center gap-4 rounded-[20px] p-6 text-center">
        <Icone nome="cadeado" tamanho={40} />
        <p className="font-titulo text-xl font-bold">Este vídeo não está no seu plano.</p>
        <BotaoLink href="/app/planos" variante="dourado">
          Ver planos
        </BotaoLink>
      </div>
    );
  }
  if (erro === "falha") {
    return (
      <div className="bg-azul-fundo text-branco flex aspect-video flex-col items-center justify-center gap-4 rounded-[20px] p-6 text-center">
        <p className="font-titulo text-xl font-bold">Não foi possível carregar o vídeo.</p>
        <Botao variante="dourado" onClick={() => setTentativa((t) => t + 1)}>
          Tentar de novo
        </Botao>
      </div>
    );
  }
  if (!fonte) {
    return (
      <div
        className="bg-azul-fundo/80 aspect-video w-full rounded-[20px] motion-safe:animate-pulse"
        aria-label="Carregando o vídeo"
        role="img"
      />
    );
  }
  return (
    <VideoPlayer
      provedor={fonte.provedor}
      referencia={fonte.referencia}
      legendas={fonte.legendas}
      posicaoInicial={posicaoInicial}
      legendaLigada={legendaLigada}
      titulo={titulo}
      aoProgresso={aoProgresso}
      aoTerminar={aoTerminar}
      aoMudarLegenda={(ligada) => void salvarPreferencias({ legendas: ligada })}
    />
  );
}
