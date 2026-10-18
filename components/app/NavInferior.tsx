"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { sair } from "@/app/acoes-sessao";
import { Icone, cx } from "@/components/ui";
import { abaAtiva, abasCelular, itensMais } from "./navegacao";

const classeItem =
  "flex min-h-14 min-w-11 flex-1 flex-col items-center justify-center gap-0.5 text-[12px] leading-none font-bold";

/** Barra inferior do celular (Início, Assistir, Séries, Lives, Mais). */
export function NavInferior() {
  const caminho = usePathname();
  const [aberta, setAberta] = useState(false);
  const folha = useRef<HTMLDialogElement>(null);
  const maisAtivo = itensMais.some((i) => abaAtiva(caminho, i.href));

  useEffect(() => {
    const el = folha.current;
    if (!el) return;
    if (aberta && !el.open) el.showModal();
    if (!aberta && el.open) el.close();
  }, [aberta]);

  useEffect(() => setAberta(false), [caminho]);

  return (
    <>
      <nav
        aria-label="App"
        className="border-areia bg-branco fixed inset-x-0 bottom-0 z-30 border-t pb-[env(safe-area-inset-bottom)] lg:hidden"
      >
        <ul className="mx-auto flex max-w-[560px] px-2">
          {abasCelular.map((aba) => {
            const ativa = abaAtiva(caminho, aba.href);
            return (
              <li key={aba.href} className="flex flex-1">
                <Link
                  href={aba.href}
                  aria-current={ativa ? "page" : undefined}
                  className={cx(classeItem, ativa ? "text-azul-acao" : "text-texto-suave")}
                >
                  <Icone nome={aba.icone} tamanho={24} />
                  {aba.rotulo}
                </Link>
              </li>
            );
          })}
          <li className="flex flex-1">
            <button
              type="button"
              onClick={() => setAberta(true)}
              aria-haspopup="dialog"
              aria-expanded={aberta}
              className={cx(classeItem, maisAtivo ? "text-azul-acao" : "text-texto-suave")}
            >
              <Icone nome="menu" tamanho={24} />
              Mais
            </button>
          </li>
        </ul>
      </nav>

      <dialog
        ref={folha}
        aria-label="Mais opções"
        onClose={() => setAberta(false)}
        onClick={(e) => {
          if (e.target === folha.current) setAberta(false);
        }}
        className="rounded-t-card bg-branco text-texto backdrop:bg-azul-fundo/50 mx-auto mt-auto mb-0 w-full max-w-[560px] p-0 lg:hidden"
      >
        <div className="flex flex-col gap-1 px-4 pt-3 pb-[calc(1rem+env(safe-area-inset-bottom))]">
          <div className="flex items-center justify-between">
            <span className="font-titulo text-azul-fundo text-xl font-semibold">Mais</span>
            <button
              type="button"
              onClick={() => setAberta(false)}
              className="hover:bg-areia grid size-11 place-items-center rounded-full"
            >
              <Icone nome="fechar" rotulo="Fechar" />
            </button>
          </div>
          <ul className="flex flex-col">
            {itensMais.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="hover:bg-areia flex min-h-12 items-center gap-3 rounded-xl px-3 font-bold"
                >
                  <Icone nome={item.icone} className="text-azul-acao" />
                  {item.rotulo}
                </Link>
              </li>
            ))}
            <li>
              <form action={sair}>
                <button
                  type="submit"
                  className="text-coral-texto hover:bg-areia flex min-h-12 w-full items-center gap-3 rounded-xl px-3 font-bold"
                >
                  <Icone nome="sair" />
                  Sair
                </button>
              </form>
            </li>
          </ul>
        </div>
      </dialog>
    </>
  );
}
