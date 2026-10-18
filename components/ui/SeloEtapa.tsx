import { cx } from "./cx";

// Nomes humanos das etapas, como no design. [PLACEHOLDER: nomes finais dos níveis, a confirmar pelo Márlio]
export const etapas = [
  { nome: "Primeiros passos", classes: "bg-[#D7F3EC] text-[#00684F]" },
  { nome: "Seguindo em frente", classes: "bg-azul-claro text-azul-acao" },
  { nome: "Mais fluência", classes: "bg-[#FFE4D6] text-[#B23A0B]" },
  { nome: "Quase nativo", classes: "bg-[#DDE5EE] text-azul-fundo" },
] as const;

type Props = { etapa: 1 | 2 | 3 | 4; rotulo?: string; barras?: boolean; className?: string };

/** Selo de etapa com barrinhas de sinal (1 a 4). */
export function SeloEtapa({ etapa, rotulo, barras = true, className }: Props) {
  const { nome, classes } = etapas[etapa - 1];
  const linhas = ["M2 12V9", "M5.5 12V6.5", "M9 12V4", "M12.5 12V1.5"];
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs leading-tight font-bold",
        classes,
        className,
      )}
    >
      {barras && (
        <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" focusable="false">
          <path
            d={linhas.join("")}
            stroke="currentColor"
            strokeOpacity=".3"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d={linhas.slice(0, etapa).join("")}
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      )}
      {rotulo ?? nome}
    </span>
  );
}
