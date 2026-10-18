"use client";

import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from "react";
import { Icone, cx } from "@/components/ui";
import { duracaoVideo } from "@/lib/series";
import { deixaEm, lerVtt, type Deixa } from "@/lib/vtt";

export type Provedor = "youtube" | "file";

type Props = {
  provedor: Provedor;
  /** id do YouTube ou endereço do arquivo (.mp4, .webm, .m3u8) */
  referencia: string;
  /** endereço da legenda em português (WebVTT) */
  legendas?: string | null;
  posicaoInicial?: number;
  /** legenda ligada ao abrir (vem de profiles.legendas) */
  legendaLigada?: boolean;
  titulo: string;
  /** chamado a cada segundo tocando e ao pausar */
  aoProgresso?: (estado: { posicao: number; tocando: boolean }) => void;
  aoTerminar?: () => void;
  aoMudarLegenda?: (ligada: boolean) => void;
};

/** Operações comuns aos dois provedores. */
type Motor = {
  tocar: () => void;
  pausar: () => void;
  irPara: (s: number) => void;
  tempo: () => number;
  duracao: () => number;
  velocidade: (v: number) => void;
  legendaNativa: (ligada: boolean) => void;
  destruir: () => void;
};

const velocidades = [0.75, 1, 1.25] as const;
const rotuloVelocidade = (v: number) => `${String(v).replace(".", ",")}x`;
const salto = 5;

// ---------- YouTube (IFrame API, domínio sem cookies) ----------

type YTPlayer = {
  playVideo(): void;
  pauseVideo(): void;
  seekTo(s: number, permitir: boolean): void;
  getCurrentTime(): number;
  getDuration(): number;
  setPlaybackRate(v: number): void;
  loadModule(m: string): void;
  unloadModule(m: string): void;
  destroy(): void;
};
type YTGlobal = {
  Player: new (
    el: HTMLElement,
    opcoes: {
      host: string;
      videoId: string;
      playerVars: Record<string, string | number>;
      events: {
        onReady: () => void;
        onStateChange: (e: { data: number }) => void;
      };
    },
  ) => YTPlayer;
};

let promessaYT: Promise<YTGlobal> | null = null;
function carregarYT(): Promise<YTGlobal> {
  const w = window as unknown as { YT?: YTGlobal; onYouTubeIframeAPIReady?: () => void };
  if (w.YT?.Player) return Promise.resolve(w.YT);
  promessaYT ??= new Promise((resolve) => {
    w.onYouTubeIframeAPIReady = () => resolve(w.YT!);
    const s = document.createElement("script");
    s.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(s);
  });
  return promessaYT;
}

export function VideoPlayer({
  provedor,
  referencia,
  legendas,
  posicaoInicial = 0,
  legendaLigada = true,
  titulo,
  aoProgresso,
  aoTerminar,
  aoMudarLegenda,
}: Props) {
  const caixa = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const ytRef = useRef<HTMLDivElement>(null);
  const motor = useRef<Motor | null>(null);

  const [pronto, setPronto] = useState(false);
  const [tocando, setTocando] = useState(false);
  const [tempo, setTempo] = useState(posicaoInicial);
  const [duracao, setDuracao] = useState(0);
  const [legenda, setLegenda] = useState(legendaLigada);
  const [velocidade, setVelocidade] = useState(1);
  const [telaCheia, setTelaCheia] = useState(false);
  const [deixas, setDeixas] = useState<Deixa[]>([]);
  const [aviso, setAviso] = useState<string | null>(null);

  // Callbacks sempre atuais sem recriar o motor.
  const cb = useRef({ aoProgresso, aoTerminar });
  cb.current = { aoProgresso, aoTerminar };

  const aoTocar = useCallback((sim: boolean) => {
    setTocando(sim);
    cb.current.aoProgresso?.({ posicao: Math.floor(motor.current?.tempo() ?? 0), tocando: sim });
  }, []);

  // Monta o provedor.
  useEffect(() => {
    let cancelado = false;
    setPronto(false);

    if (provedor === "file") {
      const v = videoRef.current!;
      let hls: { destroy(): void } | null = null;
      const iniciar = () => {
        if (posicaoInicial > 0 && posicaoInicial < v.duration - 2) v.currentTime = posicaoInicial;
        setDuracao(v.duration || 0);
        setPronto(true);
      };
      v.addEventListener("loadedmetadata", iniciar, { once: true });
      if (/\.m3u8($|\?)/.test(referencia) && !v.canPlayType("application/vnd.apple.mpegurl")) {
        // hls.js só é baixado quando o vídeo é HLS e o navegador não toca HLS sozinho.
        import("hls.js").then(({ default: Hls }) => {
          if (cancelado) return;
          const h = new Hls();
          h.loadSource(referencia);
          h.attachMedia(v);
          hls = h;
        });
      } else {
        v.src = referencia;
      }
      motor.current = {
        tocar: () => void v.play().catch(() => setAviso("Toque no vídeo para começar.")),
        pausar: () => v.pause(),
        irPara: (s) => (v.currentTime = s),
        tempo: () => v.currentTime,
        duracao: () => v.duration || 0,
        velocidade: (x) => (v.playbackRate = x),
        legendaNativa: () => {},
        destruir: () => {
          hls?.destroy();
          v.removeAttribute("src");
          v.load();
        },
      };
    } else {
      carregarYT().then((YT) => {
        if (cancelado || !ytRef.current) return;
        const alvo = document.createElement("div");
        ytRef.current.replaceChildren(alvo);
        const p = new YT.Player(alvo, {
          host: "https://www.youtube-nocookie.com",
          videoId: referencia,
          playerVars: {
            controls: 0,
            disablekb: 1,
            rel: 0,
            playsinline: 1,
            modestbranding: 1,
            iv_load_policy: 3,
            hl: "pt-BR",
            cc_lang_pref: "pt",
            cc_load_policy: legendas ? 0 : legendaLigada ? 1 : 0,
            start: Math.floor(posicaoInicial),
          },
          events: {
            onReady: () => {
              setDuracao(p.getDuration());
              setPronto(true);
            },
            onStateChange: (e) => {
              // 1 tocando, 2 pausado, 0 terminou
              if (e.data === 1) aoTocar(true);
              if (e.data === 2) aoTocar(false);
              if (e.data === 0) {
                aoTocar(false);
                cb.current.aoTerminar?.();
              }
            },
          },
        });
        motor.current = {
          tocar: () => p.playVideo(),
          pausar: () => p.pauseVideo(),
          irPara: (s) => p.seekTo(s, true),
          tempo: () => p.getCurrentTime?.() ?? 0,
          duracao: () => p.getDuration?.() ?? 0,
          velocidade: (x) => p.setPlaybackRate(x),
          legendaNativa: (ligada) =>
            ligada ? p.loadModule("captions") : p.unloadModule("captions"),
          destruir: () => p.destroy(),
        };
      });
    }
    return () => {
      cancelado = true;
      motor.current?.destruir();
      motor.current = null;
    };
    // posicaoInicial e legendaLigada só valem na montagem.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provedor, referencia, aoTocar]);

  // Legenda em português (arquivo .vtt) desenhada sobre o vídeo.
  useEffect(() => {
    if (!legendas) return setDeixas([]);
    let cancelado = false;
    fetch(legendas)
      .then((r) => (r.ok ? r.text() : ""))
      .then((t) => !cancelado && setDeixas(lerVtt(t)))
      .catch(() => {});
    return () => {
      cancelado = true;
    };
  }, [legendas]);

  // Relógio: atualiza o tempo e avisa o progresso a cada segundo enquanto toca.
  useEffect(() => {
    if (!tocando) return;
    const id = setInterval(() => {
      const t = motor.current?.tempo() ?? 0;
      setTempo(t);
      if (!duracao) setDuracao(motor.current?.duracao() ?? 0);
      cb.current.aoProgresso?.({ posicao: Math.floor(t), tocando: true });
    }, 1000);
    return () => clearInterval(id);
  }, [tocando, duracao]);

  useEffect(() => {
    const aoMudar = () => setTelaCheia(document.fullscreenElement === caixa.current);
    document.addEventListener("fullscreenchange", aoMudar);
    return () => document.removeEventListener("fullscreenchange", aoMudar);
  }, []);

  const alternarTocar = () => {
    if (!motor.current) return;
    setAviso(null);
    if (tocando) motor.current.pausar();
    else motor.current.tocar();
  };
  const irPara = (s: number) => {
    const alvo = Math.max(0, Math.min(duracao || s, s));
    motor.current?.irPara(alvo);
    setTempo(alvo);
  };
  const alternarLegenda = () => {
    const nova = !legenda;
    setLegenda(nova);
    if (!legendas) motor.current?.legendaNativa(nova);
    aoMudarLegenda?.(nova);
  };
  const trocarVelocidade = () => {
    const i = velocidades.indexOf(velocidade as (typeof velocidades)[number]);
    const nova = velocidades[(i + 1) % velocidades.length];
    setVelocidade(nova);
    motor.current?.velocidade(nova);
  };
  const alternarTelaCheia = () => {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void caixa.current?.requestFullscreen?.();
  };

  const teclas = (e: KeyboardEvent<HTMLDivElement>) => {
    const alvo = e.target as HTMLElement;
    const emControle = alvo.tagName === "BUTTON" || alvo.tagName === "INPUT";
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    switch (e.key) {
      case " ":
      case "k":
        if (alvo.tagName === "BUTTON") return; // o próprio botão já reage ao espaço
        e.preventDefault();
        alternarTocar();
        break;
      case "ArrowLeft":
        if (emControle && alvo.tagName === "INPUT") return;
        e.preventDefault();
        irPara((motor.current?.tempo() ?? tempo) - salto);
        break;
      case "ArrowRight":
        if (emControle && alvo.tagName === "INPUT") return;
        e.preventDefault();
        irPara((motor.current?.tempo() ?? tempo) + salto);
        break;
      case "f":
      case "F":
        e.preventDefault();
        alternarTelaCheia();
        break;
      case "c":
      case "C":
        e.preventDefault();
        alternarLegenda();
        break;
    }
  };

  const textoLegenda = legenda && deixas.length > 0 ? deixaEm(deixas, tempo) : null;
  const botao =
    "grid size-11 shrink-0 place-items-center rounded-full text-branco hover:bg-branco/15 focus-visible:outline-branco";

  return (
    <div
      ref={caixa}
      role="region"
      aria-label={`Player: ${titulo}`}
      tabIndex={0}
      onKeyDown={teclas}
      data-testid="player"
      data-tocando={tocando ? "1" : "0"}
      className="tema-claro-fixo group bg-azul-fundo relative aspect-video w-full overflow-hidden rounded-[20px] focus-visible:outline-4 focus-visible:outline-offset-2"
    >
      {provedor === "file" ? (
        <video
          ref={videoRef}
          className="size-full bg-black object-contain"
          playsInline
          preload="metadata"
          onPlay={() => aoTocar(true)}
          onPause={() => aoTocar(false)}
          onEnded={() => cb.current.aoTerminar?.()}
          onTimeUpdate={(e) => setTempo(e.currentTarget.currentTime)}
          onClick={alternarTocar}
          aria-hidden="true"
        />
      ) : (
        <div ref={ytRef} className="pointer-events-none size-full [&_iframe]:size-full" />
      )}

      {!tocando && pronto && (
        <button
          type="button"
          onClick={alternarTocar}
          className="bg-dourado absolute top-1/2 left-1/2 grid size-20 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full text-[#0a3d62] shadow-lg"
          aria-label="Reproduzir"
          tabIndex={-1}
        >
          <Icone nome="play" tamanho={36} />
        </button>
      )}

      {textoLegenda && (
        <p
          className="bg-azul-fundo/85 text-branco absolute inset-x-4 bottom-20 mx-auto w-fit max-w-[90%] rounded-lg px-3 py-1.5 text-center text-[clamp(15px,2vw,22px)] leading-snug font-semibold whitespace-pre-line"
          aria-live="off"
          lang="pt-BR"
          data-testid="legenda"
        >
          {textoLegenda}
        </p>
      )}

      {aviso && (
        <p className="bg-branco text-azul-fundo absolute top-4 left-4 rounded-lg px-3 py-1 text-sm font-bold">
          {aviso}
        </p>
      )}

      <div className="from-azul-fundo/95 absolute inset-x-0 bottom-0 flex items-center gap-1 bg-gradient-to-t to-transparent px-2 pt-8 pb-2 sm:gap-2 sm:px-3">
        <button
          type="button"
          onClick={alternarTocar}
          className={botao}
          disabled={!pronto}
          aria-label={tocando ? "Pausar" : "Reproduzir"}
        >
          <Icone nome={tocando ? "pausa" : "play"} />
        </button>
        <input
          type="range"
          min={0}
          max={Math.max(1, Math.floor(duracao))}
          step={1}
          value={Math.floor(tempo)}
          onChange={(e) => irPara(Number(e.target.value))}
          aria-label="Posição no vídeo"
          aria-valuetext={`${duracaoVideo(Math.floor(tempo))} de ${duracaoVideo(Math.floor(duracao))}`}
          className="accent-dourado h-11 min-w-0 flex-1 cursor-pointer"
          disabled={!pronto}
        />
        <span className="text-branco hidden shrink-0 text-sm font-semibold tabular-nums sm:inline">
          {duracaoVideo(Math.floor(tempo))} / {duracaoVideo(Math.floor(duracao))}
        </span>
        <button
          type="button"
          onClick={alternarLegenda}
          className={cx(botao, legenda && "bg-branco/20")}
          aria-pressed={legenda}
          aria-label="Legenda"
          title="Legenda (C)"
        >
          <Icone nome="legenda" />
        </button>
        <button
          type="button"
          onClick={trocarVelocidade}
          className={cx(botao, "w-auto min-w-11 px-2 text-sm font-extrabold")}
          aria-label={`Velocidade: ${rotuloVelocidade(velocidade)}`}
        >
          {rotuloVelocidade(velocidade)}
        </button>
        <button
          type="button"
          onClick={alternarTelaCheia}
          className={botao}
          aria-label={telaCheia ? "Sair da tela cheia" : "Tela cheia"}
          title="Tela cheia (F)"
        >
          <Icone nome={telaCheia ? "sair-tela-cheia" : "tela-cheia"} />
        </button>
      </div>
    </div>
  );
}
