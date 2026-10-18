import type { ReactNode } from "react";
import { cx } from "./cx";

/**
 * Conteúdo que ainda depende do Márlio. Escreva o texto completo com o prefixo,
 * por exemplo <Marcador>[PLACEHOLDER: uma frase]</Marcador>, para o grep encontrar.
 */
export function Marcador({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      data-marcador
      className={cx(
        "bg-marcador-fundo text-marcador-texto rounded-md [box-decoration-break:clone] px-1.5 font-bold",
        className,
      )}
    >
      {children}
    </span>
  );
}
