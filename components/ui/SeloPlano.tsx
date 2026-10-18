import { Icone } from "./Icone";
import { cx } from "./cx";

export type Plano = "gratis" | "desafio" | "entender" | "participar";

const config: Record<Plano, { rotulo: string; classes: string }> = {
  gratis: { rotulo: "Grátis", classes: "bg-[#D6F5EC] text-[#065F46]" },
  desafio: { rotulo: "Desafio", classes: "bg-[#FFE1D3] text-[#9a3412]" },
  entender: { rotulo: "Entender", classes: "bg-[#CDEBFB] text-[#0a3d62]" },
  participar: { rotulo: "Participar", classes: "bg-azul-fundo text-branco" },
};

type Props = { plano: Plano; bloqueado?: boolean; className?: string };

export function SeloPlano({ plano, bloqueado = false, className }: Props) {
  const { rotulo, classes } = config[plano];
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold",
        classes,
        className,
      )}
    >
      {bloqueado && <Icone nome="cadeado" tamanho={14} />}
      {rotulo}
      {bloqueado && <span className="sr-only">(bloqueado no seu plano)</span>}
    </span>
  );
}
