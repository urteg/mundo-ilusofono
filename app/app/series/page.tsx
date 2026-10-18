import type { Metadata } from "next";
import { EmBreve } from "@/components/app/EmBreve";

export const metadata: Metadata = { title: "Séries" };

export default function Pagina() {
  return <EmBreve titulo="Séries" fase="Fase 3" />;
}
