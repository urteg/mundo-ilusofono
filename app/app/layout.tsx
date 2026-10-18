import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Avisos } from "@/components/app/Avisos";
import { BarraApp } from "@/components/app/BarraApp";
import { NavInferior } from "@/components/app/NavInferior";
import { Pilulas } from "@/components/app/Pilulas";
import { TemaApp } from "@/components/app/TemaApp";
import { carregarParticipante } from "@/lib/app/participante";

export const metadata: Metadata = {
  title: { default: "App", template: "%s | Mundo Ilusófono" },
  robots: { index: false, follow: false },
};

export default async function LayoutApp({ children }: { children: ReactNode }) {
  const p = await carregarParticipante();
  return (
    <div className="bg-papel min-h-dvh">
      {/* Tema já no primeiro carregamento, antes de pintar (o TemaApp cuida das navegações). */}
      <script
        dangerouslySetInnerHTML={{
          __html: `document.documentElement.dataset.tema=${JSON.stringify(p.tema)}`,
        }}
      />
      <TemaApp tema={p.tema} fuso={p.fuso} fusoEscolhido={p.fusoEscolhido} />
      <a
        href="#conteudo"
        className="bg-azul-acao text-branco sr-only z-50 rounded-full px-5 py-3 font-bold focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Pular para o conteúdo
      </a>
      <BarraApp
        pilulas={
          <Pilulas
            minutosHoje={p.minutosHoje}
            metaMin={p.metaMin}
            sequencia={p.sequencia.dias}
            hoje={p.hoje}
          />
        }
      />
      <main
        id="conteudo"
        tabIndex={-1}
        className="mx-auto w-full max-w-[1260px] px-4 pt-6 pb-[calc(6rem+env(safe-area-inset-bottom))] outline-none lg:px-8 lg:pt-10 lg:pb-16"
      >
        {children}
      </main>
      <NavInferior />
      <Avisos />
    </div>
  );
}
