"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import { alternarSalvo, marcarVisto } from "@/app/app/acoes-video";
import { CenaPorNome, TextoOuMarcador } from "@/components/site/Secao";
import {
  BarraProgresso,
  Icone,
  SeloMais18,
  SeloNivel,
  SeloPlano,
  cx,
  type Plano,
} from "@/components/ui";
import type { CartaoBiblioteca as Dados } from "@/lib/app/catalogo";
import { compartilhar, mensagemCompartilhar } from "@/lib/compartilhar";
import { duracaoVideo } from "@/lib/series";
import { avisar } from "./Avisos";
import { hrefDoVideo } from "./hrefs";

/** Cartão da biblioteca: miniatura, duração, nível, progresso, título, apresentador e menu. */
export function CartaoBiblioteca({
  video,
  compacto = false,
}: {
  video: Dados;
  compacto?: boolean;
}) {
  const [salvo, setSalvo] = useState(video.salvo);
  const [visto, setVisto] = useState(video.visto);
  const href = hrefDoVideo(video);

  return (
    <article
      className={cx(
        "rounded-card bg-branco shadow-card relative flex w-full overflow-hidden",
        compacto ? "flex-row" : "flex-col",
      )}
      data-testid="cartao-video"
      data-visto={visto ? "1" : "0"}
      data-bloqueado={video.bloqueado ? "1" : "0"}
    >
      <div className={cx("relative shrink-0", compacto ? "w-36 sm:w-40" : "w-full")}>
        <CenaPorNome
          nome={video.cena}
          className={cx(
            "block w-full",
            compacto ? "h-full min-h-24" : "aspect-video",
            video.bloqueado && "opacity-70",
          )}
        />
        <span className="bg-azul-fundo/90 text-branco absolute right-2 bottom-2 rounded-lg px-2 py-0.5 text-[13px] font-extrabold tabular-nums">
          <span className="sr-only">Duração: </span>
          {duracaoVideo(video.duracao_seg)}
        </span>
        {visto && !video.bloqueado && (
          <span className="absolute top-2 left-2 grid size-8 place-items-center rounded-full bg-[#00684F] text-white">
            <Icone nome="check" tamanho={18} strokeWidth={3} rotulo="Visto" />
          </span>
        )}
        {video.bloqueado && (
          <span className="bg-azul-fundo/85 text-branco absolute top-2 left-2 grid size-9 place-items-center rounded-full">
            <Icone nome="cadeado" tamanho={18} rotulo="Bloqueado no seu plano" />
          </span>
        )}
        {!visto && video.progresso > 0 && (
          <BarraProgresso
            valor={video.progresso}
            rotulo="Quanto você já assistiu"
            cor="verde"
            className="[&>div]:bg-branco/60 absolute inset-x-0 bottom-0 [&>div]:h-1.5 [&>div]:rounded-none"
          />
        )}
      </div>
      <div className={cx("flex min-w-0 flex-1 flex-col gap-2", compacto ? "p-3" : "p-4")}>
        <div className="flex flex-wrap items-center gap-1.5 pr-10">
          <SeloNivel nivel={video.nivel} />
          {(video.bloqueado || video.plano_minimo === "participar") && (
            <SeloPlano plano={video.plano_minimo as Plano} bloqueado={video.bloqueado} />
          )}
          {video.adulto && <SeloMais18 />}
        </div>
        <h3 className={cx("text-azul-fundo leading-snug", compacto ? "pr-8 text-base" : "text-lg")}>
          <Link
            href={href}
            className="after:focus-visible:rounded-card after:focus-visible:outline-azul-acao after:absolute after:inset-0 focus-visible:outline-none after:focus-visible:outline-4"
          >
            <TextoOuMarcador texto={video.titulo} />
            {video.bloqueado && <span className="sr-only"> (ver planos para assistir)</span>}
          </Link>
        </h3>
        {video.apresentador && (
          <span className="text-texto-suave text-sm">
            com <TextoOuMarcador texto={video.apresentador} />
          </span>
        )}
      </div>
      <MenuCartao video={video} salvo={salvo} visto={visto} aoSalvar={setSalvo} aoVer={setVisto} />
    </article>
  );
}

function MenuCartao({
  video,
  salvo,
  visto,
  aoSalvar,
  aoVer,
}: {
  video: Dados;
  salvo: boolean;
  visto: boolean;
  aoSalvar: (v: boolean) => void;
  aoVer: (v: boolean) => void;
}) {
  const [aberto, setAberto] = useState(false);
  const [, iniciar] = useTransition();
  const caixa = useRef<HTMLDivElement>(null);
  const botao = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!aberto) return;
    caixa.current?.querySelector<HTMLButtonElement>("[role=menuitem]")?.focus();
    const fora = (e: PointerEvent) => {
      if (!caixa.current?.contains(e.target as Node)) setAberto(false);
    };
    document.addEventListener("pointerdown", fora);
    return () => document.removeEventListener("pointerdown", fora);
  }, [aberto]);

  const fechar = () => {
    setAberto(false);
    botao.current?.focus();
  };

  const teclas = (e: React.KeyboardEvent) => {
    const itens = [
      ...(caixa.current?.querySelectorAll<HTMLButtonElement>("[role=menuitem]") ?? []),
    ];
    const i = itens.indexOf(document.activeElement as HTMLButtonElement);
    if (e.key === "Escape") {
      e.preventDefault();
      fechar();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      itens[(i + 1) % itens.length]?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      itens[(i - 1 + itens.length) % itens.length]?.focus();
    } else if (e.key === "Tab") {
      setAberto(false);
    }
  };

  const item =
    "flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-left font-semibold hover:bg-areia focus-visible:bg-areia";

  return (
    <div ref={caixa} className="absolute top-2 right-2 z-10" onKeyDown={teclas}>
      <button
        ref={botao}
        type="button"
        onClick={() => setAberto((a) => !a)}
        aria-haspopup="menu"
        aria-expanded={aberto}
        aria-label={`Opções: ${video.titulo}`}
        className="bg-branco/90 text-azul-fundo hover:bg-branco grid size-11 place-items-center rounded-full shadow"
      >
        <Icone nome="opcoes" />
      </button>
      {aberto && (
        <div
          role="menu"
          aria-label="Opções do vídeo"
          className="bg-branco border-borda shadow-card absolute right-0 mt-1 w-60 rounded-xl border p-1.5"
        >
          <button
            type="button"
            role="menuitem"
            className={item}
            onClick={() => {
              const novo = !salvo;
              aoSalvar(novo);
              fechar();
              iniciar(async () => {
                const r = await alternarSalvo(video.id, novo);
                if (!r.ok) aoSalvar(!novo);
                avisar(
                  r.ok
                    ? novo
                      ? "Salvo na sua lista."
                      : "Removido da sua lista."
                    : "Não foi possível salvar agora.",
                );
              });
            }}
          >
            <Icone nome="salvar" tamanho={20} />
            {salvo ? "Remover da lista" : "Salvar na lista"}
          </button>
          <button
            type="button"
            role="menuitem"
            className={item}
            onClick={() => {
              const novo = !visto;
              aoVer(novo);
              fechar();
              iniciar(async () => {
                const r = await marcarVisto(video.id, novo);
                if (!r.ok) aoVer(!novo);
                avisar(
                  r.ok
                    ? novo
                      ? "Marcado como visto."
                      : "Desmarcado."
                    : "Não foi possível salvar agora.",
                );
              });
            }}
          >
            <Icone nome="check" tamanho={20} />
            {visto ? "Desmarcar como visto" : "Marcar como visto"}
          </button>
          <button
            type="button"
            role="menuitem"
            className={item}
            onClick={async () => {
              fechar();
              const m =
                mensagemCompartilhar[await compartilhar(video.titulo, `/app/video/${video.id}`)];
              if (m) avisar(m);
            }}
          >
            <Icone nome="compartilhar" tamanho={20} />
            Compartilhar
          </button>
        </div>
      )}
    </div>
  );
}
