import { Icone, cx } from "@/components/ui";
import type { Passos } from "@/lib/app/licao-hoje";

const passos = [
  { chave: "assistiu", rotulo: "Assistir" },
  { chave: "entendeu", rotulo: "Entender" },
  { chave: "participou", rotulo: "Participar" },
] as const;

/** Os 3 passos da lição de hoje, ligados por uma linha; concluído vira check verde. */
export function TrilhaPassos({ estado }: { estado: Passos }) {
  return (
    <ol aria-label="Passos da lição" className="flex w-full max-w-[560px] items-start">
      {passos.map((p, i) => {
        const feito = estado[p.chave];
        return (
          <li key={p.chave} className="flex flex-1 items-start last:flex-none">
            <div className="flex w-20 flex-col items-center gap-1.5 text-center">
              <span
                className={cx(
                  "font-titulo grid size-11 place-items-center rounded-full border-2 text-lg font-bold",
                  feito
                    ? "text-branco border-[#00684F] bg-[#00684F]"
                    : "border-azul-acao bg-branco text-azul-acao",
                )}
              >
                {feito ? <Icone nome="check" tamanho={22} strokeWidth={3} /> : i + 1}
              </span>
              <span className="text-sm font-bold">
                {p.rotulo}
                <span className="sr-only">{feito ? ": concluído" : ": a fazer"}</span>
              </span>
            </div>
            {i < passos.length - 1 && (
              <span
                aria-hidden="true"
                className={cx(
                  "mt-[21px] h-[3px] flex-1 rounded-full",
                  feito ? "bg-[#00684F]" : "bg-borda",
                )}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
