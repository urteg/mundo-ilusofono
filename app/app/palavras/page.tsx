import type { Metadata } from "next";
import { EmBreve } from "@/components/app/EmBreve";

export const metadata: Metadata = { title: "Palavras" };

export default function Pagina() {
  return <EmBreve titulo="Palavras" fase="Fase 6" />;
}
