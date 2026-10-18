"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef } from "react";
import { deltaMaximoSeg, intervaloBatimentoSeg, intervaloMinimoSeg } from "@/lib/progresso-api";

type Resposta = { segundos: number; concluido: boolean; recemConcluido: boolean };

/**
 * Conta o tempo real em que o vídeo toca com a aba visível e manda para /api/progresso
 * a cada 15 s (e ao pausar ou terminar). Devolve as funções que o player chama.
 */
export function useBatimentos(videoId: string, aoResposta?: (r: Resposta) => void) {
  const router = useRouter();
  const estado = useRef({
    tocando: false,
    posicao: 0,
    acumulado: 0,
    ultimoTique: 0,
    ultimoEnvio: 0,
    enviando: false,
    pendente: null as ReturnType<typeof setTimeout> | null,
  });
  const cb = useRef(aoResposta);
  cb.current = aoResposta;

  const enviar = useCallback(async () => {
    const e = estado.current;
    if (e.enviando) return;
    const delta = Math.min(deltaMaximoSeg, Math.floor(e.acumulado));
    if (delta < 1) return;
    e.enviando = true;
    try {
      const r = await fetch("/api/progresso", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ video_id: videoId, delta, posicao_seg: e.posicao }),
        keepalive: true,
      });
      e.ultimoEnvio = Date.now();
      if (r.ok) {
        e.acumulado -= delta;
        cb.current?.((await r.json()) as Resposta);
        // Atualiza as pílulas de meta e sequência no topo.
        router.refresh();
      } else if (r.status !== 429) {
        // Sem plano ou dados recusados: descarta o que estava acumulado.
        e.acumulado = 0;
      }
    } catch {
      // Sem rede: tenta de novo no próximo ciclo.
    } finally {
      e.enviando = false;
    }
  }, [videoId, router]);

  /** Manda agora se já passou o intervalo mínimo; se não, agenda. */
  const descarregar = useCallback(() => {
    const e = estado.current;
    if (e.acumulado < 1) return;
    const espera = intervaloMinimoSeg * 1000 - (Date.now() - e.ultimoEnvio);
    if (espera <= 0) return void enviar();
    if (e.pendente) clearTimeout(e.pendente);
    e.pendente = setTimeout(() => {
      e.pendente = null;
      void enviar();
    }, espera + 250);
  }, [enviar]);

  // Relógio de parede: só conta enquanto toca e a aba está visível.
  useEffect(() => {
    const id = setInterval(() => {
      const e = estado.current;
      const agora = Date.now();
      if (e.tocando && document.visibilityState === "visible" && e.ultimoTique) {
        e.acumulado += Math.min(2, (agora - e.ultimoTique) / 1000);
      }
      e.ultimoTique = agora;
      if (e.acumulado >= intervaloBatimentoSeg) descarregar();
    }, 1000);
    const aoMudarVisibilidade = () => {
      if (document.visibilityState === "hidden") descarregar();
    };
    document.addEventListener("visibilitychange", aoMudarVisibilidade);
    const e = estado.current;
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", aoMudarVisibilidade);
      // Ao sair da página (ex.: próximo vídeo), o que faltou enviar ainda vai: o envio
      // agendado continua rodando depois da troca de página.
      e.tocando = false;
      descarregar();
    };
  }, [descarregar]);

  const aoProgresso = useCallback(
    ({ posicao, tocando }: { posicao: number; tocando: boolean }) => {
      const e = estado.current;
      e.posicao = posicao;
      if (tocando && !e.tocando) e.ultimoTique = Date.now();
      if (!tocando && e.tocando) {
        e.tocando = false;
        descarregar();
      }
      e.tocando = tocando;
    },
    [descarregar],
  );

  return { aoProgresso, descarregar };
}
