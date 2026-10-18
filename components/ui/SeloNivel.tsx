import { cx } from "./cx";

// Cores de fundo com texto escuro ou claro escolhido para manter contraste AA.
const estilos = [
  "bg-[#D6F5EC] text-[#065F46]",
  "bg-[#CDEBFB] text-[#0a3d62]",
  "bg-[#FBEFC2] text-[#713F12]",
  "bg-[#FFE1D3] text-[#9a3412]",
  "bg-[#E7DDF8] text-[#4C1D95]",
  "bg-azul-acao text-branco",
  "bg-azul-fundo text-branco",
];

type Props = { nivel: number; rotulo?: string; className?: string };

/** Selo "Nível 0" a "Nível 6". */

export function SeloNivel({ nivel, rotulo, className }: Props) {
  const indice = Math.min(Math.max(Math.round(nivel), 0), estilos.length - 1);
  return (
    <span
      className={cx(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-bold",
        estilos[indice],
        className,
      )}
    >
      {rotulo ?? `Nível ${indice}`}
    </span>
  );
}
