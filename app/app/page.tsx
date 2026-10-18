import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { sair } from "@/app/acoes-sessao";
import { Marca } from "@/components/site/Marca";
import { Botao } from "@/components/ui";
import { criarClienteServidor } from "@/lib/supabase/servidor";

export const metadata: Metadata = { title: "Início do app", robots: { index: false } };

// Tela provisória: o app de verdade (Lição de hoje) chega na Fase 3.
export default async function InicioApp() {
  const supabase = await criarClienteServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/entrar?proximo=/app");

  return (
    <main className="mx-auto flex min-h-dvh max-w-[720px] flex-col justify-center gap-8 px-4 py-10">
      <Marca />
      <div className="rounded-bolha bg-branco shadow-card flex flex-col items-start gap-4 p-8">
        <h1 className="text-azul-fundo text-[clamp(30px,4vw,40px)] font-bold">Você entrou</h1>
        <p className="text-texto-suave">
          Conectado como <b className="text-texto break-all">{user.email}</b>.
        </p>
        <p className="text-texto-suave">As telas do app chegam na próxima etapa.</p>
        <form action={sair}>
          <Botao type="submit" variante="secundario">
            Sair
          </Botao>
        </form>
      </div>
    </main>
  );
}
