import { Icone } from "./Icone";
import { cx } from "./cx";

type MetaProps = { tipo: "meta"; minutos: number; metaMin: number; className?: string };
type SequenciaProps = { tipo: "sequencia"; dias: number; className?: string };
type Props = MetaProps | SequenciaProps;

/** Pílula da barra superior do app: meta diária ou sequência de dias. */
export function Pilula(props: Props) {
  const classes =
    "inline-flex min-h-11 items-center gap-2 rounded-full border border-borda bg-branco px-3 text-sm font-bold";

  if (props.tipo === "meta") {
    const cumprida = props.minutos >= props.metaMin;
    const pct = Math.min(100, (props.minutos / Math.max(1, props.metaMin)) * 100);
    return (
      <span
        className={cx(classes, props.className)}
        title="Meta de hoje"
        aria-label={`Meta de hoje: ${props.minutos} de ${props.metaMin} minutos${cumprida ? ", cumprida" : ""}`}
      >
        <span
          className="relative grid size-6 place-items-center rounded-full"
          style={{
            background: `conic-gradient(var(--verde) ${pct}%, var(--areia) 0)`,
          }}
        >
          <span className="bg-branco grid size-4 place-items-center rounded-full text-[#065F46]">
            {cumprida && <Icone nome="check" tamanho={12} strokeWidth={3} />}
          </span>
        </span>
        <span aria-hidden="true">
          {props.minutos}/{props.metaMin} min
        </span>
      </span>
    );
  }

  return (
    <span
      className={cx(classes, props.className)}
      title="Sequência de dias"
      aria-label={`Sequência: ${props.dias} ${props.dias === 1 ? "dia" : "dias"}`}
    >
      <Icone
        nome="fogo"
        tamanho={20}
        className={props.dias > 0 ? "text-coral-texto" : "text-texto-suave"}
      />
      <span aria-hidden="true">{props.dias}</span>
    </span>
  );
}
