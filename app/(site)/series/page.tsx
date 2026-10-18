import type { Metadata } from "next";
import Link from "next/link";
import {
  Abertura,
  Apresentador,
  CenaPorNome,
  Envoltorio,
  FaixaChamada,
  TextoOuMarcador,
} from "@/components/site/Secao";
import { Cartao, SeloNivel } from "@/components/ui";
import { listarApresentadores, listarSeriesPublicas } from "@/lib/conteudo-publico";
import { formatarEuro, precos } from "@/lib/precos";

export const metadata: Metadata = {
  title: "Séries",
  description:
    "Histórias com os mesmos lugares e as mesmas pessoas, em português do Brasil. Quanto mais você assiste, mais entende.",
  alternates: { canonical: "/series" },
};

// Página estática, renovada a cada hora com os dados públicos do banco.
export const revalidate = 3600;

export default async function Series() {
  const [series, apresentadores] = await Promise.all([
    listarSeriesPublicas(),
    listarApresentadores(),
  ]);
  return (
    <>
      <Abertura mao="um episódio puxa o outro" titulo="Séries para assistir em sequência">
        <p>
          Histórias com os mesmos lugares e as mesmas pessoas. Quanto mais você assiste, mais
          entende.
        </p>
      </Abertura>

      <section className="pb-20 sm:pb-24">
        <Envoltorio>
          <h2 className="sr-only">Todas as séries</h2>
          {series.length === 0 && (
            <p className="text-texto-suave text-lg">As séries aparecem aqui em breve.</p>
          )}
          <ul className="grid grid-cols-[repeat(auto-fill,minmax(min(300px,100%),1fr))] gap-7">
            {series.map((s) => (
              <Cartao as="li" key={s.id} className="relative flex flex-col overflow-hidden p-0">
                <CenaPorNome nome={s.cena} className="block aspect-[4/3] w-full" />
                <div className="flex flex-col gap-2.5 px-5 pt-4 pb-5">
                  <SeloNivel nivel={s.nivel} className="self-start" />
                  <h3 className="text-azul-fundo text-[21px]">
                    {/* Toda a área do cartão leva ao app; a entrada pede login. */}
                    <Link href="/entrar" className="after:absolute after:inset-0">
                      <TextoOuMarcador texto={s.titulo} />
                    </Link>
                  </h3>
                  <span className="text-texto-suave text-sm">{s.episodios} episódios</span>
                </div>
              </Cartao>
            ))}
          </ul>
        </Envoltorio>
      </section>

      <section className="bg-papel-escuro py-20 sm:py-24">
        <Envoltorio className="flex flex-col gap-8">
          <h2 className="text-azul-fundo text-[clamp(32px,3.6vw,44px)]">
            Conheça os apresentadores
          </h2>
          <ul className="grid grid-cols-[repeat(auto-fit,minmax(min(230px,100%),1fr))] gap-6">
            {apresentadores.map((a) => (
              <Apresentador key={a.id} nome={a.nome} temas={a.temas} />
            ))}
          </ul>
        </Envoltorio>
      </section>

      <FaixaChamada
        titulo="Comece pelos primeiros vídeos"
        texto={`Sete dias, um vídeo por dia, ${formatarEuro(precos.desafio)}, IVA incluído.`}
      />
    </>
  );
}
