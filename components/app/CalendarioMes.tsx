"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import { Icone, cx } from "@/components/ui";
import { diasDaSemana, diasDaSemanaCurtos, type MesCalendario } from "@/lib/calendario";

/**
 * Calendário do mês com os minutos de cada dia. Grade navegável pelo teclado:
 * setas movem entre os dias, Home/End vão ao início/fim da semana e
 * Page Up/Page Down trocam de mês.
 *
 * A troca de mês usa links comuns (página nova), não a navegação do Next: na mesma rota,
 * só mudando ?mes=, ela às vezes não concluía (Next 15.5) e a tela ficava parada.
 */
export function CalendarioMes({ cal, metaMin }: { cal: MesCalendario; metaMin: number }) {
  const dias = cal.semanas.flat().filter((c) => c !== null);
  const inicial = dias.find((d) => d.hoje)?.numero ?? 1;
  const [foco, setFoco] = useState(inicial);
  const grade = useRef<HTMLTableElement>(null);
  const linkAnterior = useRef<HTMLAnchorElement>(null);
  const linkProximo = useRef<HTMLAnchorElement>(null);

  const focar = (n: number) => {
    const alvo = Math.min(dias.length, Math.max(1, n));
    setFoco(alvo);
    grade.current?.querySelector<HTMLElement>(`[data-numero="${alvo}"]`)?.focus();
  };

  const teclas = (e: KeyboardEvent<HTMLTableElement>) => {
    const mapa: Record<string, () => void> = {
      ArrowRight: () => focar(foco + 1),
      ArrowLeft: () => focar(foco - 1),
      ArrowDown: () => focar(foco + 7),
      ArrowUp: () => focar(foco - 7),
      Home: () => focar(foco - posicaoNaSemana(cal, foco)),
      End: () => focar(foco + (6 - posicaoNaSemana(cal, foco))),
      // Mesmo caminho dos botões de mês.
      PageUp: () => linkAnterior.current?.click(),
      PageDown: () => linkProximo.current?.click(),
    };
    const acao = mapa[e.key];
    if (!acao) return;
    e.preventDefault();
    acao();
  };

  const navegacao =
    "text-azul-acao hover:bg-areia grid size-11 place-items-center rounded-full aria-disabled:pointer-events-none aria-disabled:opacity-40";

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <h2 id="titulo-calendario" className="text-azul-fundo text-2xl first-letter:uppercase">
          {cal.titulo}
        </h2>
        <div className="flex items-center gap-1">
          <a
            ref={linkAnterior}
            href={`/app/progresso?mes=${cal.anterior}#calendario`}
            className={navegacao}
            aria-label="Mês anterior"
          >
            <Icone nome="seta-esquerda" tamanho={20} />
          </a>
          {cal.proximo ? (
            <a
              ref={linkProximo}
              href={`/app/progresso?mes=${cal.proximo}#calendario`}
              className={navegacao}
              aria-label="Próximo mês"
            >
              <Icone nome="seta-direita" tamanho={20} />
            </a>
          ) : (
            <span className={navegacao} aria-disabled="true" aria-label="Próximo mês" role="link">
              <Icone nome="seta-direita" tamanho={20} />
            </span>
          )}
        </div>
      </div>
      <p className="text-texto-suave -mt-2 text-sm">Minutos por dia, no app e fora dele.</p>

      <table
        ref={grade}
        role="grid"
        aria-labelledby="titulo-calendario"
        onKeyDown={teclas}
        className="w-full table-fixed border-separate border-spacing-1"
        data-testid="calendario"
      >
        <thead>
          <tr>
            {diasDaSemanaCurtos.map((d, i) => (
              <th
                key={d}
                scope="col"
                abbr={diasDaSemana[i]}
                className="text-texto-suave pb-1 text-xs font-bold"
              >
                {d}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {cal.semanas.map((semana, i) => (
            <tr key={i}>
              {semana.map((c, j) =>
                c ? (
                  <td
                    key={c.dia}
                    role="gridcell"
                    tabIndex={c.numero === foco ? 0 : -1}
                    data-numero={c.numero}
                    data-dia={c.dia}
                    data-minutos={c.minutos}
                    aria-label={c.rotulo}
                    aria-current={c.hoje ? "date" : undefined}
                    onFocus={() => setFoco(c.numero)}
                    className={cx(
                      "h-12 rounded-xl text-center align-middle outline-offset-1 sm:h-14",
                      c.cumprida
                        ? "bg-verde text-[#0b2a22]"
                        : c.minutos > 0
                          ? "bg-[#D6F5EC] text-[#065F46]"
                          : c.futuro
                            ? "text-texto-suave"
                            : "bg-papel-escuro text-texto",
                      c.hoje && "ring-azul-acao ring-2 ring-offset-1",
                    )}
                  >
                    <span aria-hidden="true" className="flex flex-col leading-tight">
                      <span className="text-sm font-bold">{c.numero}</span>
                      {c.minutos > 0 && (
                        <span className="text-[11px] font-semibold tabular-nums">{c.minutos}</span>
                      )}
                    </span>
                  </td>
                ) : (
                  <td key={`v-${i}-${j}`} aria-hidden="true" />
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>

      <ul className="text-texto-suave flex flex-wrap gap-x-5 gap-y-1 text-sm">
        <li className="flex items-center gap-2">
          <span aria-hidden="true" className="size-3.5 rounded bg-[#D6F5EC]" />
          menos que a meta
        </li>
        <li className="flex items-center gap-2">
          <span aria-hidden="true" className="bg-verde size-3.5 rounded" />
          meta cumprida ({metaMin} min)
        </li>
      </ul>
    </div>
  );
}

/** Posição (0 = segunda) do dia `n` na semana. */
function posicaoNaSemana(cal: MesCalendario, n: number) {
  for (const semana of cal.semanas) {
    const i = semana.findIndex((c) => c?.numero === n);
    if (i >= 0) return i;
  }
  return 0;
}
