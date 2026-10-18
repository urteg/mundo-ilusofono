import { cx } from "./cx";

type Props = {
  valor: number;
  maximo?: number;
  rotulo: string;
  mostrarRotulo?: boolean;
  cor?: "azul" | "verde" | "coral";
  className?: string;
};

const cores = { azul: "bg-azul-acao", verde: "bg-verde", coral: "bg-coral" };

export function BarraProgresso({
  valor,
  maximo = 100,
  rotulo,
  mostrarRotulo = false,
  cor = "azul",
  className,
}: Props) {
  const pct = maximo > 0 ? Math.min(100, Math.max(0, (valor / maximo) * 100)) : 0;
  return (
    <div className={cx("w-full", className)}>
      {mostrarRotulo && (
        <div className="text-texto-suave mb-1 flex justify-between text-sm">
          <span>{rotulo}</span>
          <span>{Math.round(pct)}%</span>
        </div>
      )}
      <div
        role="progressbar"
        aria-label={rotulo}
        aria-valuemin={0}
        aria-valuemax={maximo}
        aria-valuenow={valor}
        className="bg-areia h-3 w-full overflow-hidden rounded-full"
      >
        <div
          className={cx("h-full rounded-full transition-[width] duration-500", cores[cor])}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
