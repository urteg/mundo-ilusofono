import type { Metadata } from "next";
import { EmBreve } from "@/components/app/EmBreve";

export const metadata: Metadata = { title: "Assistir" };

export default function Pagina() {
  return <EmBreve titulo="Assistir" fase="Fase 3" />;
}
