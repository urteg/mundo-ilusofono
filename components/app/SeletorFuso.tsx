"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Icone, cx } from "@/components/ui";
import { listaDeFusos, rotuloFuso } from "@/lib/conta";

const semAcento = (t: string) => t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

/** Caixa de combinação com busca para escolher o fuso das lives (padrão ARIA combobox). */
export function SeletorFuso({
  valor,
  doNavegador,
  aoMudar,
}: {
  valor: string;
  /** fuso detectado no navegador, oferecido como primeira opção */
  doNavegador: string | null;
  aoMudar: (fuso: string) => void;
}) {
  const id = useId();
  const [aberto, setAberto] = useState(false);
  const [busca, setBusca] = useState("");
  const [ativo, setAtivo] = useState(0);
  const caixa = useRef<HTMLDivElement>(null);
  const lista = useRef<HTMLUListElement>(null);

  const todos = useMemo(() => {
    const agora = new Date();
    return listaDeFusos().map((f) => ({ fuso: f, rotulo: rotuloFuso(f, agora) }));
  }, []);

  const opcoes = useMemo(() => {
    const q = semAcento(busca.trim());
    const filtrados = q
      ? todos.filter((o) => semAcento(`${o.fuso} ${o.rotulo}`).includes(q))
      : todos;
    return filtrados.slice(0, 60);
  }, [busca, todos]);

  useEffect(() => {
    if (!aberto) return;
    const fora = (e: PointerEvent) => {
      if (!caixa.current?.contains(e.target as Node)) setAberto(false);
    };
    document.addEventListener("pointerdown", fora);
    return () => document.removeEventListener("pointerdown", fora);
  }, [aberto]);

  useEffect(() => {
    lista.current
      ?.querySelector<HTMLElement>(`[data-indice="${ativo}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [ativo]);

  const escolher = (fuso: string) => {
    aoMudar(fuso);
    setBusca("");
    setAberto(false);
  };

  return (
    <div ref={caixa} className="relative flex flex-col gap-1.5">
      <label htmlFor={`${id}-busca`} className="font-bold">
        Fuso das lives
      </label>
      <p id={`${id}-atual`} className="text-texto-suave text-sm">
        Agora: <b className="text-texto">{rotuloFuso(valor)}</b>
        {doNavegador === valor && " (o deste aparelho)"}
      </p>
      <div className="relative">
        <Icone
          nome="busca"
          tamanho={18}
          className="text-texto-suave pointer-events-none absolute top-1/2 left-3 -translate-y-1/2"
        />
        <input
          id={`${id}-busca`}
          role="combobox"
          aria-expanded={aberto}
          aria-controls={`${id}-lista`}
          aria-autocomplete="list"
          aria-describedby={`${id}-atual`}
          aria-activedescendant={aberto && opcoes[ativo] ? `${id}-op-${ativo}` : undefined}
          autoComplete="off"
          value={busca}
          placeholder="Buscar cidade (ex.: Lisboa, Sao Paulo)"
          onFocus={() => setAberto(true)}
          onChange={(e) => {
            setBusca(e.target.value);
            setAtivo(0);
            setAberto(true);
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setAberto(true);
              setAtivo((a) => Math.min(opcoes.length - 1, a + 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setAtivo((a) => Math.max(0, a - 1));
            } else if (e.key === "Enter") {
              if (aberto && opcoes[ativo]) {
                e.preventDefault();
                escolher(opcoes[ativo].fuso);
              }
            } else if (e.key === "Escape") {
              setAberto(false);
            }
          }}
          className="border-borda bg-branco focus-visible:border-azul-acao min-h-11 w-full rounded-xl border-2 pr-3 pl-10"
        />
      </div>
      {doNavegador && doNavegador !== valor && (
        <button
          type="button"
          onClick={() => escolher(doNavegador)}
          className="text-azul-acao min-h-11 self-start font-bold underline underline-offset-4"
        >
          Usar o fuso deste aparelho: {rotuloFuso(doNavegador)}
        </button>
      )}
      {aberto && (
        <ul
          ref={lista}
          id={`${id}-lista`}
          role="listbox"
          aria-label="Fusos"
          className="border-borda bg-branco shadow-card absolute top-full z-20 mt-1 max-h-64 w-full overflow-y-auto rounded-xl border p-1"
        >
          {opcoes.length === 0 && <li className="text-texto-suave p-3">Nenhum fuso encontrado.</li>}
          {opcoes.map((o, i) => (
            <li
              key={o.fuso}
              id={`${id}-op-${i}`}
              role="option"
              aria-selected={o.fuso === valor}
              data-indice={i}
              onPointerDown={(e) => e.preventDefault()}
              onClick={() => escolher(o.fuso)}
              onPointerEnter={() => setAtivo(i)}
              className={cx(
                "flex min-h-11 cursor-pointer items-center justify-between gap-2 rounded-lg px-3",
                i === ativo && "bg-areia",
                o.fuso === valor && "font-bold",
              )}
            >
              <span>{o.rotulo}</span>
              <span className="text-texto-suave truncate text-xs">{o.fuso}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
