import type { ComponentType } from "react";
import { Marcador } from "@/components/ui";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ComponentesMdx = Record<string, ComponentType<any>>;

// Os estilos do texto ficam no contêiner .prosa (app/globals.css).
export function useMDXComponents(components: ComponentesMdx): ComponentesMdx {
  return { Marcador, ...components };
}
