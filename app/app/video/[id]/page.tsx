import type { Metadata } from "next";
import { EmBreve } from "@/components/app/EmBreve";

export const metadata: Metadata = { title: "Vídeo" };

export default function Pagina() {
  return <EmBreve titulo="Vídeo" fase="Fase 3" />;
}
