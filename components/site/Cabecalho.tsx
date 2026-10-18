"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { BotaoLink, Icone, cx } from "@/components/ui";
import { navegacao } from "@/lib/site";
import { Marca } from "./Marca";

const focaveis =
  'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** Mantém o Tab dentro do painel aberto (o <dialog> nativo deixa sair para o navegador). */
function prenderFoco(e: KeyboardEvent<HTMLDialogElement>) {
  if (e.key !== "Tab") return;
  const itens = Array.from(e.currentTarget.querySelectorAll<HTMLElement>(focaveis));
  if (itens.length === 0) return;
  const primeiro = itens[0];
  const ultimo = itens[itens.length - 1];
  if (e.shiftKey && document.activeElement === primeiro) {
    e.preventDefault();
    ultimo.focus();
  } else if (!e.shiftKey && document.activeElement === ultimo) {
    e.preventDefault();
    primeiro.focus();
  }
}

export function Cabecalho() {
  const caminho = usePathname();
  const [rolou, setRolou] = useState(false);
  const [menuAberto, setMenuAberto] = useState(false);
  const painel = useRef<HTMLDialogElement>(null);
  const botaoMenu = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const aoRolar = () => setRolou(window.scrollY > 4);
    aoRolar();
    window.addEventListener("scroll", aoRolar, { passive: true });
    return () => window.removeEventListener("scroll", aoRolar);
  }, []);

  useEffect(() => {
    const el = painel.current;
    if (!el) return;
    if (menuAberto && !el.open) el.showModal();
    if (!menuAberto && el.open) {
      el.close();
      botaoMenu.current?.focus();
    }
  }, [menuAberto]);

  // Fecha o painel ao navegar.
  useEffect(() => setMenuAberto(false), [caminho]);

  const ativo = (href: string) => caminho === href || caminho.startsWith(`${href}/`);

  return (
    <header
      className={cx(
        "bg-papel/95 sticky top-0 z-40 border-b backdrop-blur transition-shadow",
        rolou ? "shadow-card border-transparent" : "border-areia",
      )}
    >
      <div className="mx-auto flex max-w-[1260px] items-center gap-4 px-4 py-3 sm:px-8">
        <Marca />

        <nav aria-label="Principal" className="ml-4 hidden lg:block">
          <ul className="flex gap-1">
            {navegacao.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={ativo(item.href) ? "page" : undefined}
                  className={cx(
                    "hover:text-azul-acao inline-flex min-h-11 items-center rounded-full px-3.5 font-bold",
                    ativo(item.href) ? "text-azul-acao" : "text-texto",
                  )}
                >
                  {item.rotulo}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Link
            href="/entrar"
            className="text-texto hover:text-azul-acao hidden min-h-11 items-center rounded-full px-3.5 font-bold sm:inline-flex"
          >
            Entrar
          </Link>
          <span className="hidden sm:block">
            <BotaoLink href="/desafio">Comece o Desafio</BotaoLink>
          </span>
          <button
            ref={botaoMenu}
            type="button"
            onClick={() => setMenuAberto(true)}
            aria-haspopup="dialog"
            aria-expanded={menuAberto}
            className="text-azul-fundo hover:bg-areia grid size-11 place-items-center rounded-full lg:hidden"
          >
            <Icone nome="menu" rotulo="Abrir menu" />
          </button>
        </div>
      </div>

      <dialog
        ref={painel}
        aria-label="Menu"
        onClose={() => setMenuAberto(false)}
        onKeyDown={prenderFoco}
        onClick={(e) => {
          if (e.target === painel.current) setMenuAberto(false);
        }}
        className="bg-papel text-texto shadow-card m-0 ml-auto h-dvh max-h-dvh w-[min(22rem,100%)] max-w-none p-0 backdrop:bg-[#0a3d62]/60 lg:hidden"
      >
        <div className="flex h-full flex-col gap-6 p-5">
          <div className="flex items-center justify-between">
            <Marca />
            <button
              type="button"
              onClick={() => setMenuAberto(false)}
              className="text-azul-fundo hover:bg-areia grid size-11 place-items-center rounded-full"
            >
              <Icone nome="fechar" rotulo="Fechar menu" />
            </button>
          </div>
          <nav aria-label="Principal no celular">
            <ul className="flex flex-col gap-1">
              {navegacao.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={ativo(item.href) ? "page" : undefined}
                    className={cx(
                      "font-titulo hover:bg-areia flex min-h-12 items-center rounded-2xl px-4 text-xl font-semibold",
                      ativo(item.href) ? "text-azul-acao" : "text-azul-fundo",
                    )}
                  >
                    {item.rotulo}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="mt-auto flex flex-col gap-3">
            <BotaoLink href="/desafio" className="w-full">
              Comece o Desafio
            </BotaoLink>
            <BotaoLink href="/entrar" variante="secundario" className="w-full">
              Entrar
            </BotaoLink>
          </div>
        </div>
      </dialog>
    </header>
  );
}
