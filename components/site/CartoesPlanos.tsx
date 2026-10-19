"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Alternador, Icone, cx } from "@/components/ui";
import { BotaoComprar } from "./BotaoComprar";
import {
  lerIntervalo,
  notaPlano,
  precoPlano,
  unidade,
  type Intervalo,
  type PlanoAssinatura,
} from "@/lib/precos";

const planos: {
  id: PlanoAssinatura;
  nome: string;
  resumo: string;
  inclui: string[];
  destaque?: string;
}[] = [
  {
    id: "entender",
    nome: "Entender",
    resumo: "Para assistir no seu ritmo.",
    inclui: [
      "Biblioteca completa de vídeos",
      "Séries",
      "Progresso por horas",
      "Gravações das lives",
    ],
  },
  {
    id: "participar",
    nome: "Participar",
    resumo: "Para assistir e conversar ao vivo.",
    destaque: "O mais completo",
    inclui: ["Tudo do Entender", "Lives ao vivo com o Márlio", "Conversa em grupo com o Márlio"],
  },
];

/** Alternador mensal/anual + cartões dos planos. O intervalo fica na URL (?intervalo=anual). */
export function CartoesPlanos() {
  const naUrl = useSearchParams().get("intervalo");
  const [intervalo, setIntervalo] = useState<Intervalo>(() => lerIntervalo(naUrl));

  // Acompanha voltar/avançar do navegador.
  useEffect(() => setIntervalo(lerIntervalo(naUrl)), [naUrl]);

  function mudar(novo: Intervalo) {
    setIntervalo(novo);
    const url = new URL(window.location.href);
    url.searchParams.set("intervalo", novo);
    window.history.replaceState(null, "", url);
  }

  return (
    <div className="flex flex-col items-center gap-10">
      <Alternador
        rotulo="Período de cobrança"
        valor={intervalo}
        aoMudar={mudar}
        opcoes={[
          { valor: "mensal", rotulo: "Mensal" },
          {
            valor: "anual",
            rotulo: (
              <>
                Anual
                <span className="rounded-full bg-[#D7F3EC] px-2.5 py-0.5 font-sans text-xs font-bold text-[#00684F]">
                  Economize
                </span>
              </>
            ),
          },
        ]}
      />

      <ul className="grid w-full max-w-[920px] grid-cols-[repeat(auto-fit,minmax(min(320px,100%),1fr))] gap-7">
        {planos.map((p) => (
          <li
            key={p.id}
            className={cx(
              "rounded-card bg-branco shadow-card flex flex-col gap-4 p-8",
              p.destaque && "ring-azul-acao ring-[3px]",
            )}
          >
            {p.destaque && (
              <span className="bg-azul-acao text-branco self-start rounded-full px-3 py-1 text-xs font-bold">
                {p.destaque}
              </span>
            )}
            <h2 className="text-azul-fundo text-[32px]">{p.nome}</h2>
            <p className="text-texto-suave">{p.resumo}</p>
            <p className="flex flex-wrap items-baseline gap-x-2" aria-live="polite">
              <span
                className="font-titulo text-azul-fundo text-5xl font-bold tabular-nums"
                data-testid={`preco-${p.id}`}
              >
                {precoPlano(p.id, intervalo)}
              </span>
              <span className="text-texto-suave">{unidade(intervalo)}, IVA incluído</span>
            </p>
            <p className="-mt-2 text-sm font-semibold text-[#00684F]" data-testid={`nota-${p.id}`}>
              {notaPlano(p.id, intervalo)}
            </p>
            <BotaoComprar
              produto={p.id}
              intervalo={intervalo}
              variante={p.destaque ? "primario" : "secundario"}
              className="w-full"
            >
              Assinar o {p.nome}
            </BotaoComprar>
            <ul className="border-areia flex flex-col gap-2.5 border-t pt-4">
              {p.inclui.map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <Icone nome="check" tamanho={20} className="mt-0.5 shrink-0 text-[#00684F]" />
                  {item}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
}
