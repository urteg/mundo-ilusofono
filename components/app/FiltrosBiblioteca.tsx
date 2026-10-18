"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState, useTransition, type ReactNode } from "react";
import { Botao, Chip, Icone, Interruptor, cx } from "@/components/ui";
import type { OpcoesFiltros } from "@/lib/app/catalogo";
import { hrefAssistir, type Filtros, type Ordem } from "@/lib/filtros";

const rotulosOrdem: Record<Ordem, string> = {
  novos: "Mais novos",
  antigos: "Mais antigos",
  curtos: "Mais curtos",
  longos: "Mais longos",
};

type Props = { filtros: Filtros; opcoes: OpcoesFiltros };

/** Filtros da biblioteca. Tudo vai para a URL; a página consulta no servidor. */
export function FiltrosBiblioteca({ filtros, opcoes }: Props) {
  const router = useRouter();
  const [pendente, iniciar] = useTransition();
  const [painel, setPainel] = useState(false);
  const [busca, setBusca] = useState(filtros.q ?? "");

  useEffect(() => setBusca(filtros.q ?? ""), [filtros.q]);

  const ir = (mudanca: Partial<Filtros>) => {
    iniciar(() => router.replace(hrefAssistir({ ...filtros, ...mudanca }), { scroll: false }));
  };

  // Busca com uma pequena espera enquanto digita.
  useEffect(() => {
    if ((filtros.q ?? "") === busca.trim()) return;
    const id = setTimeout(() => ir({ q: busca.trim() || undefined }), 350);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [busca]);

  const nomeApresentador = (id?: string) => opcoes.apresentadores.find((a) => a.id === id)?.nome;
  const nomeTema = (slug?: string) => opcoes.temas.find((t) => t.slug === slug)?.nome;
  const ativos = [
    filtros.nivel !== undefined && { chave: "nivel", rotulo: `Nível ${filtros.nivel}` },
    filtros.pais && { chave: "pais", rotulo: filtros.pais },
    filtros.apresentador && {
      chave: "apresentador",
      rotulo: nomeApresentador(filtros.apresentador) ?? "Apresentador",
    },
    filtros.tema && { chave: "tema", rotulo: nomeTema(filtros.tema) ?? filtros.tema },
  ].filter(Boolean) as { chave: keyof Filtros; rotulo: string }[];

  const seletores = (
    <>
      <Seletor
        rotulo="Ordenar"
        valor={filtros.ordem}
        aoMudar={(v) => ir({ ordem: v as Ordem })}
        opcoes={Object.entries(rotulosOrdem).map(([v, r]) => ({ valor: v, rotulo: r }))}
      />
      <Seletor
        rotulo="Nível"
        valor={filtros.nivel === undefined ? "" : String(filtros.nivel)}
        aoMudar={(v) => ir({ nivel: v === "" ? undefined : Number(v) })}
        opcoes={[
          { valor: "", rotulo: "Todos" },
          ...opcoes.niveis.map((n) => ({ valor: String(n), rotulo: `Nível ${n}` })),
        ]}
      />
      <Seletor
        rotulo="País"
        valor={filtros.pais ?? ""}
        aoMudar={(v) => ir({ pais: v || undefined })}
        opcoes={[
          { valor: "", rotulo: "Todos" },
          ...opcoes.paises.map((p) => ({ valor: p, rotulo: p })),
        ]}
      />
      <Seletor
        rotulo="Apresentador"
        valor={filtros.apresentador ?? ""}
        aoMudar={(v) => ir({ apresentador: v || undefined })}
        opcoes={[
          { valor: "", rotulo: "Todos" },
          ...opcoes.apresentadores.map((a) => ({ valor: a.id, rotulo: a.nome })),
        ]}
      />
      <Seletor
        rotulo="Tema"
        valor={filtros.tema ?? ""}
        aoMudar={(v) => ir({ tema: v || undefined })}
        opcoes={[
          { valor: "", rotulo: "Todos" },
          ...opcoes.temas.map((t) => ({ valor: t.slug, rotulo: t.nome })),
        ]}
      />
    </>
  );

  return (
    <div className="flex flex-col gap-3" aria-busy={pendente} data-pendente={pendente ? "1" : "0"}>
      <div className="flex flex-wrap items-center gap-3">
        <label className="relative min-w-0 flex-1 basis-64">
          <span className="sr-only">Buscar vídeos pelo título</span>
          <Icone
            nome="busca"
            tamanho={20}
            className="text-texto-suave pointer-events-none absolute top-1/2 left-4 -translate-y-1/2"
          />
          <input
            type="search"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar pelo título"
            maxLength={80}
            className="border-borda bg-branco focus-visible:border-azul-acao min-h-12 w-full rounded-full border-2 pr-4 pl-11"
          />
        </label>
        <Interruptor
          ligado={filtros.ocultarVistos}
          aoMudar={(v) => ir({ ocultarVistos: v })}
          rotulo="Ocultar vistos"
        />
      </div>

      {/* Desktop e tablet: todos os seletores à vista. */}
      <div className="hidden flex-wrap items-end gap-3 md:flex">{seletores}</div>

      {/* Celular: faixa de chips e o painel "Filtros". */}
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 md:hidden">
        <Chip onClick={() => setPainel(true)} className="shrink-0" aria-haspopup="dialog">
          <Icone nome="filtro" tamanho={18} />
          Filtros{ativos.length > 0 && ` (${ativos.length})`}
        </Chip>
        <Chip className="shrink-0" onClick={() => setPainel(true)}>
          {rotulosOrdem[filtros.ordem]}
        </Chip>
        {ativos.map((a) => (
          <Chip
            key={a.chave}
            ativo
            className="shrink-0"
            onClick={() => ir({ [a.chave]: undefined })}
            aria-label={`Remover filtro: ${a.rotulo}`}
          >
            {a.rotulo}
            <Icone nome="fechar" tamanho={16} />
          </Chip>
        ))}
      </div>

      {ativos.length > 0 && (
        <div className="hidden flex-wrap items-center gap-2 md:flex">
          {ativos.map((a) => (
            <Chip
              key={a.chave}
              ativo
              onClick={() => ir({ [a.chave]: undefined })}
              aria-label={`Remover filtro: ${a.rotulo}`}
            >
              {a.rotulo}
              <Icone nome="fechar" tamanho={16} />
            </Chip>
          ))}
          <button
            type="button"
            onClick={() => iniciar(() => router.replace(hrefAssistir({ aba: filtros.aba })))}
            className="text-azul-acao min-h-11 px-2 font-bold underline underline-offset-4"
          >
            Limpar filtros
          </button>
        </div>
      )}

      <PainelInferior aberto={painel} aoFechar={() => setPainel(false)} titulo="Filtros">
        <div className="flex flex-col gap-4">{seletores}</div>
        <div className="mt-6 flex gap-3">
          <Botao
            variante="secundario"
            className="flex-1"
            onClick={() => {
              setPainel(false);
              iniciar(() => router.replace(hrefAssistir({ aba: filtros.aba })));
            }}
          >
            Limpar
          </Botao>
          <Botao className="flex-1" onClick={() => setPainel(false)}>
            Ver vídeos
          </Botao>
        </div>
      </PainelInferior>
    </div>
  );
}

function Seletor({
  rotulo,
  valor,
  aoMudar,
  opcoes,
}: {
  rotulo: string;
  valor: string;
  aoMudar: (v: string) => void;
  opcoes: { valor: string; rotulo: string }[];
}) {
  const id = useId();
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <label htmlFor={id} className="text-texto-suave text-sm font-bold">
        {rotulo}
      </label>
      <select
        id={id}
        value={valor}
        onChange={(e) => aoMudar(e.target.value)}
        className="border-borda bg-branco focus-visible:border-azul-acao min-h-11 max-w-full rounded-xl border-2 px-3 font-semibold md:max-w-56"
      >
        {opcoes.map((o) => (
          <option key={o.valor} value={o.valor}>
            {o.rotulo}
          </option>
        ))}
      </select>
    </div>
  );
}

/** Painel que sobe da base da tela (celular), sobre o <dialog> nativo. */
export function PainelInferior({
  aberto,
  aoFechar,
  titulo,
  children,
}: {
  aberto: boolean;
  aoFechar: () => void;
  titulo: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const idTitulo = useId();
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (aberto && !el.open) el.showModal();
    if (!aberto && el.open) el.close();
  }, [aberto]);
  return (
    <dialog
      ref={ref}
      aria-labelledby={idTitulo}
      onClose={aoFechar}
      onClick={(e) => e.target === ref.current && aoFechar()}
      className={cx(
        "bg-branco text-texto mx-0 mt-auto mb-0 max-h-[85dvh] w-full max-w-none rounded-t-[24px] p-0 backdrop:bg-[#0a3d62]/60",
      )}
    >
      <div className="flex items-center justify-between gap-4 p-5 pb-2">
        <h2 id={idTitulo} className="text-azul-fundo text-2xl">
          {titulo}
        </h2>
        <button
          type="button"
          onClick={aoFechar}
          aria-label="Fechar"
          className="text-texto-suave hover:bg-areia grid size-11 place-items-center rounded-full"
        >
          <Icone nome="fechar" />
        </button>
      </div>
      <div className="p-5 pt-2 pb-[calc(1.25rem+env(safe-area-inset-bottom))]">{children}</div>
    </dialog>
  );
}
