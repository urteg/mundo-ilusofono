"use client";

import { useEffect, useState } from "react";

function partes(ms: number) {
  const total = Math.max(0, Math.floor(ms / 60000));
  return {
    dias: Math.floor(total / 1440),
    horas: Math.floor((total % 1440) / 60),
    minutos: total % 60,
  };
}

const plural = (n: number, um: string, varios: string) => `${n} ${n === 1 ? um : varios}`;

/** Contagem até o início da live, atualizada a cada 30 segundos. */
export function ContagemRegressiva({ inicio }: { inicio: string }) {
  const alvo = new Date(inicio).getTime();
  const [agora, setAgora] = useState<number | null>(null);

  useEffect(() => {
    setAgora(Date.now());
    const t = setInterval(() => setAgora(Date.now()), 30_000);
    return () => clearInterval(t);
  }, []);

  // Antes de hidratar não sabemos a hora do navegador: mostra só o espaço.
  if (agora === null) return <span className="inline-block h-12 w-40" aria-hidden="true" />;
  const { dias, horas, minutos } = partes(alvo - agora);
  if (alvo - agora <= 0) return <span className="font-bold">Começou</span>;
  const leitura = `Começa em ${plural(dias, "dia", "dias")}, ${plural(horas, "hora", "horas")} e ${plural(minutos, "minuto", "minutos")}`;
  const bloco = (n: number, rotulo: string) => (
    <span className="bg-branco/15 flex min-w-14 flex-col items-center rounded-xl px-2 py-1.5">
      <span className="font-titulo text-2xl font-semibold tabular-nums">
        {String(n).padStart(2, "0")}
      </span>
      <small className="text-xs">{rotulo}</small>
    </span>
  );
  return (
    <span role="timer" aria-label={leitura} className="flex gap-2">
      <span aria-hidden="true" className="flex gap-2">
        {bloco(dias, dias === 1 ? "dia" : "dias")}
        {bloco(horas, "h")}
        {bloco(minutos, "min")}
      </span>
    </span>
  );
}
