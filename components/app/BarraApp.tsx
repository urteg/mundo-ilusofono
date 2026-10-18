"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Marca } from "@/components/site/Marca";
import { cx } from "@/components/ui";
import { abaAtiva, abasWeb } from "./navegacao";

/** Barra superior do app. No celular mostra só as pílulas (a navegação fica embaixo). */
export function BarraApp({ pilulas }: { pilulas: ReactNode }) {
  const caminho = usePathname();
  return (
    <header className="border-areia bg-papel/95 sticky top-0 z-30 border-b pt-[env(safe-area-inset-top)] backdrop-blur">
      <div className="mx-auto flex max-w-[1260px] items-center gap-4 px-4 py-2 lg:px-8 lg:py-3">
        <Marca className="hidden lg:inline-flex" />
        <nav aria-label="App" className="ml-4 hidden lg:block">
          <ul className="flex gap-1">
            {abasWeb.map((aba) => {
              const ativa = abaAtiva(caminho, aba.href);
              return (
                <li key={aba.href}>
                  <Link
                    href={aba.href}
                    aria-current={ativa ? "page" : undefined}
                    className={cx(
                      "relative inline-flex min-h-11 items-center px-3 font-bold",
                      ativa
                        ? "text-azul-acao after:bg-azul-acao after:absolute after:inset-x-3 after:bottom-1 after:h-[3px] after:rounded-full"
                        : "text-texto hover:text-azul-acao",
                    )}
                  >
                    {aba.rotulo}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="ml-auto lg:ml-auto">{pilulas}</div>
      </div>
    </header>
  );
}
