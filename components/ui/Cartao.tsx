import { createElement, type HTMLAttributes } from "react";
import { cx } from "./cx";

type Props = HTMLAttributes<HTMLElement> & {
  as?: "div" | "article" | "section" | "li";
  tom?: "claro" | "escuro";
};

const tons = {
  claro: "border-borda bg-branco text-texto",
  escuro: "border-azul-fundo bg-azul-fundo text-branco",
};

export function Cartao({ as = "div", tom = "claro", className, ...resto }: Props) {
  return createElement(as, {
    className: cx("rounded-card border p-5 shadow-card", tons[tom], className),
    ...resto,
  });
}
