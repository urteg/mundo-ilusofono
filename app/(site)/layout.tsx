import type { ReactNode } from "react";
import { Cabecalho } from "@/components/site/Cabecalho";
import { Rodape } from "@/components/site/Rodape";

export default function LayoutSite({ children }: { children: ReactNode }) {
  return (
    <>
      <a
        href="#conteudo"
        className="bg-azul-acao text-branco sr-only z-50 rounded-full px-5 py-3 font-bold focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Pular para o conteúdo
      </a>
      <Cabecalho />
      <main id="conteudo" tabIndex={-1} className="outline-none">
        {children}
      </main>
      <Rodape />
    </>
  );
}
