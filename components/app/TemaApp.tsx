"use client";

import { useRouter } from "next/navigation";
import { useEffect, useLayoutEffect } from "react";
import { usarFusoDoNavegador } from "@/app/app/conta/acoes";

export type TemaApp = "sistema" | "claro" | "escuro";

/** Aplica o tema no <html> (os tokens escuros ficam em app/tokens.css). */
export function aplicarTema(tema: TemaApp) {
  document.documentElement.dataset.tema = tema;
}

/**
 * Tema do app e fuso do navegador. O tema vale só dentro do app: ao voltar para o site,
 * o atributo sai e o site fica claro.
 */
export function TemaApp({
  tema,
  fuso,
  fusoEscolhido,
}: {
  tema: TemaApp;
  fuso: string;
  fusoEscolhido: boolean;
}) {
  const router = useRouter();

  useLayoutEffect(() => {
    aplicarTema(tema);
    return () => {
      delete document.documentElement.dataset.tema;
    };
  }, [tema]);

  // Enquanto o participante não escolhe um fuso na conta, o app usa o do navegador.
  useEffect(() => {
    if (fusoEscolhido) return;
    let doNavegador: string | undefined;
    try {
      doNavegador = Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch {}
    if (!doNavegador || doNavegador === fuso) return;
    void usarFusoDoNavegador(doNavegador).then((r) => r.mudou && router.refresh());
  }, [fuso, fusoEscolhido, router]);

  return null;
}
