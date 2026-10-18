import { cx } from "./cx";

// Cores de fundo com texto escuro ou claro escolhido para manter contraste AA.
const estilos = [
  "bg-[#D6F5EC] text-[#065F46]",
  "bg-[#CDEBFB] text-azul-fundo",
  "bg-[#FBEFC2] text-[#713F12]",
  "bg-[#FFE1D3] text-fogo",
  "bg-[#E7DDF8] text-[#4C1D95]",
  "bg-azul-acao text-branco",
  "bg-azul-fundo text-branco",
];

type Props = { nivel: number; rotulo?: string; className?: string };

export function SeloNivel({ nivel, rotulo, className }: Props) {
  const indice = Math.min(Math.max(Math.round(nivel), 1), estilos.length) - 1;
  return (
    <span
      className={cx(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-bold",
        estilos[indice],
        className,
      )}
    >
      {rotulo ?? `Nível ${indice + 1}`}
    </span>
  );
}
