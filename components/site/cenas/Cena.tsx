import type { ReactNode, SVGProps } from "react";

export type PropsCena = Omit<SVGProps<SVGSVGElement>, "children"> & {
  /** Descrição para leitores de tela. Sem ela, a cena é decorativa. */
  titulo?: string;
};

/** Moldura comum das cenas ilustradas (16:9, escalável). */
export function Cena({ titulo, children, ...resto }: PropsCena & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 320 180"
      preserveAspectRatio="xMidYMid slice"
      role={titulo ? "img" : undefined}
      aria-label={titulo}
      aria-hidden={titulo ? undefined : true}
      focusable="false"
      {...resto}
    >
      {children}
    </svg>
  );
}
