import type { Metadata } from "next";
import Link from "next/link";
import { sair } from "@/app/acoes-sessao";
import { BlocoDados } from "@/components/app/BlocoDados";
import { FormNome } from "@/components/app/FormNome";
import { FormPreferencias, type Preferencias } from "@/components/app/FormPreferencias";
import { BotaoLink, Icone } from "@/components/ui";
import { carregarParticipante } from "@/lib/app/participante";
import { descreverPlano } from "@/lib/conta";
import { site } from "@/lib/site";
import { criarClienteServidor } from "@/lib/supabase/servidor";

export const metadata: Metadata = { title: "Conta" };

const cartao = "rounded-card bg-branco shadow-card flex flex-col gap-4 p-5 sm:p-7";

export default async function Conta() {
  const p = await carregarParticipante();
  const supabase = await criarClienteServidor();
  const { data: perfil } = await supabase
    .from("profiles")
    .select(
      "meta_diaria_min, legendas, tema, previa_video, email_novidades, email_videos, email_semanal",
    )
    .eq("id", p.id)
    .single();
  const plano = descreverPlano(p.ents, new Date());
  const metas = [10, 20, 30, 45];

  const preferencias: Preferencias = {
    meta_diaria_min: metas.includes(perfil?.meta_diaria_min ?? 20)
      ? (perfil?.meta_diaria_min ?? 20)
      : 20,
    legendas: perfil?.legendas ?? true,
    tema: p.tema,
    previa_video: perfil?.previa_video ?? true,
    email_novidades: perfil?.email_novidades ?? true,
    email_videos: perfil?.email_videos ?? true,
    email_semanal: perfil?.email_semanal ?? true,
    fuso: p.fuso,
    fuso_escolhido: p.fusoEscolhido,
  };

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-azul-fundo text-[clamp(32px,4vw,44px)] font-bold">Conta</h1>
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <div className="flex flex-col gap-6">
          <section aria-label="Seus dados" className={cartao}>
            <FormNome nome={p.nome} email={p.email} />
          </section>

          <section aria-labelledby="plano" className={cartao}>
            <h2 id="plano" className="text-azul-fundo text-2xl">
              Plano
            </h2>
            <p>
              <b>{plano.nome}</b>
              {plano.detalhe && <> · {plano.detalhe}</>}
            </p>
            <BotaoLink href="/app/planos" className="self-start">
              Ver planos
            </BotaoLink>
          </section>

          <section aria-labelledby="ajuda" className={cartao}>
            <h2 id="ajuda" className="text-azul-fundo text-2xl">
              Ajuda
            </h2>
            <ul className="divide-areia flex flex-col divide-y">
              <li>
                <Link
                  href="/recursos"
                  className="flex min-h-12 items-center justify-between font-semibold"
                >
                  Perguntas frequentes
                  <Icone nome="seta-direita" tamanho={20} />
                </Link>
              </li>
              <li>
                <a
                  href={`mailto:${site.email}`}
                  className="flex min-h-12 items-center justify-between font-semibold"
                >
                  Fale com a gente
                  <Icone nome="seta-direita" tamanho={20} />
                </a>
              </li>
              <li>
                <form action={sair}>
                  <button
                    type="submit"
                    className="text-coral-texto flex min-h-12 w-full items-center font-bold"
                  >
                    Sair
                  </button>
                </form>
              </li>
            </ul>
          </section>
        </div>

        <div className="flex flex-col gap-6">
          <section aria-labelledby="preferencias" className={cartao}>
            <h2 id="preferencias" className="text-azul-fundo text-2xl">
              Preferências
            </h2>
            <FormPreferencias inicial={preferencias} />
          </section>

          <section aria-labelledby="seus-dados" className={cartao}>
            <h2 id="seus-dados" className="text-azul-fundo text-2xl">
              Seus dados
            </h2>
            <BlocoDados email={p.email} />
          </section>
        </div>
      </div>
    </div>
  );
}
