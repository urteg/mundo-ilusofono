import type { Metadata } from "next";
import { CenaCampo } from "@/components/site/cenas";
import { FormEntrar } from "@/components/site/FormEntrar";
import { Marca } from "@/components/site/Marca";

export const metadata: Metadata = {
  title: "Entrar",
  robots: { index: false, follow: false },
};

export default function Entrar() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-[1100px] flex-wrap items-center gap-12 px-4 py-10 sm:px-8">
      <div className="flex min-w-0 flex-[1_1_380px] flex-col gap-8">
        <Marca />
        <div className="rounded-bolha bg-branco shadow-card flex flex-col gap-6 p-7 sm:p-10">
          <h1 className="text-azul-fundo text-[clamp(32px,4vw,40px)] font-bold">
            Entre com seu e-mail
          </h1>
          <FormEntrar />
        </div>
      </div>
      <div className="hidden min-w-0 flex-[1_1_380px] flex-col gap-4 md:flex">
        <div className="rounded-card bg-branco shadow-card overflow-hidden">
          <CenaCampo titulo="Cena ilustrada: casa no campo" className="block aspect-video w-full" />
          <div className="flex flex-col gap-1 px-5 py-4">
            <b>A casa da vó</b>
            <span className="text-texto-suave text-sm">vídeo 2 de 8 · 4:10</span>
          </div>
        </div>
        <span className="font-mao text-coral-texto text-[28px]">vamos lá, tá?</span>
      </div>
    </main>
  );
}
