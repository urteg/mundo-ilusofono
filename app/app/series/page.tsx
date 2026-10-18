import type { Metadata } from "next";
import { CartaoSerie } from "@/components/app/CartaoSerie";
import { buscarSeries } from "@/lib/app/catalogo";
import { carregarParticipante } from "@/lib/app/participante";

export const metadata: Metadata = { title: "Séries" };

export default async function Pagina() {
  const participante = await carregarParticipante();
  const series = await buscarSeries(participante);
  const niveis = [...new Set(series.map((s) => s.nivel))].sort((a, b) => a - b);

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-azul-fundo text-[clamp(32px,4vw,44px)] font-bold">Séries</h1>
        <p className="text-texto-suave text-lg">
          Histórias em episódios, para acompanhar do começo ao fim.
        </p>
      </div>
      {series.length === 0 && (
        <p className="text-texto-suave">As primeiras séries chegam em breve.</p>
      )}
      {niveis.map((nivel) => (
        <section key={nivel} aria-labelledby={`nivel-${nivel}`} className="flex flex-col gap-4">
          <h2 id={`nivel-${nivel}`} className="text-azul-fundo text-2xl">
            Nível {nivel}
          </h2>
          <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {series
              .filter((s) => s.nivel === nivel)
              .map((s) => (
                <li key={s.id} className="flex">
                  <CartaoSerie serie={s} />
                </li>
              ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
