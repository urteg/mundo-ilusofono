import type { Metadata } from "next";
import { EmBreve } from "@/components/app/EmBreve";

export const metadata: Metadata = { title: "Progresso" };

export default function Pagina() {
  return <EmBreve titulo="Progresso" fase="Fase 3" />;
}
