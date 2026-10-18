import type { Metadata } from "next";
import { EmBreve } from "@/components/app/EmBreve";

export const metadata: Metadata = { title: "Lives" };

export default function Pagina() {
  return <EmBreve titulo="Lives" fase="Fase 5" />;
}
