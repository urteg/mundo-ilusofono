"use client";

import { useEffect, useState } from "react";

const evento = "mundo-ilusofono:aviso";

/** Mostra uma mensagem curta no rodapé da tela (ex.: "Link copiado."). */
export function avisar(texto: string) {
  window.dispatchEvent(new CustomEvent(evento, { detail: texto }));
}

/** Região de avisos do app; fica no layout. */
export function Avisos() {
  const [texto, setTexto] = useState<string | null>(null);
  useEffect(() => {
    let id: ReturnType<typeof setTimeout>;
    const aoAvisar = (e: Event) => {
      setTexto((e as CustomEvent<string>).detail);
      clearTimeout(id);
      id = setTimeout(() => setTexto(null), 3500);
    };
    window.addEventListener(evento, aoAvisar);
    return () => {
      window.removeEventListener(evento, aoAvisar);
      clearTimeout(id);
    };
  }, []);
  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-24 z-50 flex justify-center px-4 lg:bottom-8"
    >
      {texto && (
        <p className="bg-azul-fundo text-branco shadow-card rounded-full px-5 py-3 font-semibold">
          {texto}
        </p>
      )}
    </div>
  );
}
