import type { Metadata } from "next";
import { Suspense } from "react";
import { BotaoPortal } from "@/components/app/BotaoPortal";
import { CartoesPlanos } from "@/components/site/CartoesPlanos";
import { TabelaPlanos } from "@/components/site/TabelaPlanos";
import { diaDoDesafio, estaAtivo, pagamentoAtrasado } from "@/lib/entitlements";
import { carregarParticipante } from "@/lib/app/participante";
import { avisoImposto } from "@/lib/precos";

export const metadata: Metadata = { title: "Planos" };

const nomes: Record<string, string> = { entender: "Entender", participar: "Participar" };
const formatoData = new Intl.DateTimeFormat("pt-BR", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

const mensagensPortal: Record<string, string> = {
  erro: "Não foi possível abrir a área de pagamento agora. Tente de novo em alguns segundos.",
  sem_assinatura:
    "Seu acesso não está ligado a uma assinatura com cartão, então não há o que gerenciar por aqui. Fale com a gente se precisar.",
};

export default async function Pagina({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const p = await carregarParticipante();
  const agora = new Date();
  const portal = (await searchParams).portal;
  const avisoPortal = typeof portal === "string" ? mensagensPortal[portal] : undefined;

  // Assinatura atual (o Participar vale mais que o Entender se houver as duas).
  const assinatura = p.ents
    .filter((e) => (e.produto === "participar" || e.produto === "entender") && estaAtivo(e, agora))
    .sort((a, b) => (a.produto === "participar" ? -1 : b.produto === "participar" ? 1 : 0))[0];
  const diaDesafio = diaDoDesafio(p.ents, agora, p.fuso);
  const atrasado = pagamentoAtrasado(p.ents, agora);
  const data = (iso: string | null) => (iso ? formatoData.format(new Date(iso)) : null);

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-azul-fundo text-[clamp(32px,4vw,44px)] font-bold">Planos</h1>

      {avisoPortal && (
        <p role="status" className="rounded-card bg-papel-escuro p-4 font-semibold">
          {avisoPortal}
        </p>
      )}

      {assinatura ? (
        <section
          aria-labelledby="sua-assinatura"
          className="rounded-card bg-branco shadow-card flex flex-col gap-4 p-6 sm:p-8"
        >
          <h2 id="sua-assinatura" className="text-azul-fundo text-[28px]">
            Obrigado por ser assinante
          </h2>
          <p className="text-lg" data-testid="plano-atual">
            Seu plano: <b>{nomes[assinatura.produto]}</b>
            {assinatura.intervalo && <>, {assinatura.intervalo === "anual" ? "anual" : "mensal"}</>}
            .
          </p>
          {assinatura.status === "canceled" ? (
            <p>
              A assinatura foi cancelada e não renova. Você continua com acesso até{" "}
              <b>{data(assinatura.renova_em)}</b>.
            </p>
          ) : (
            assinatura.renova_em && (
              <p>
                Próxima cobrança: <b>{data(assinatura.renova_em)}</b>.
              </p>
            )
          )}
          {atrasado && (
            <p role="status" className="text-coral-texto font-semibold">
              Não conseguimos cobrar. Atualize a forma de pagamento.
            </p>
          )}
          <div className="flex flex-wrap gap-3">
            {assinatura.status === "canceled" ? (
              <BotaoPortal acao="geral" variante="primario">
                Reativar a assinatura
              </BotaoPortal>
            ) : (
              <>
                <BotaoPortal acao="trocar" variante="primario">
                  Trocar de plano
                </BotaoPortal>
                <BotaoPortal acao="pagamento">Atualizar forma de pagamento</BotaoPortal>
                <BotaoPortal acao="cancelar" variante="discreto">
                  Cancelar
                </BotaoPortal>
              </>
            )}
          </div>
          <p className="text-texto-suave text-sm">
            Trocar, atualizar o cartão, ver recibos e cancelar abrem a área segura de pagamento do
            Stripe. Ao cancelar, o acesso continua até o fim do período já pago.
          </p>
        </section>
      ) : (
        <section
          aria-labelledby="convite"
          className="rounded-card bg-branco shadow-card flex flex-col gap-3 p-6 sm:p-8"
        >
          <h2 id="convite" className="text-azul-fundo text-[28px]">
            {diaDesafio > 0
              ? `Você está no Desafio 7 Dias: dia ${diaDesafio} de 7`
              : "Veja tudo o que já está esperando por você"}
          </h2>
          <p className="text-lg">
            {diaDesafio > 0
              ? "Quando quiser continuar depois do desafio, escolha um plano: a biblioteca completa abre na hora."
              : "Com um plano, todos os vídeos e séries abrem, e o seu progresso continua de onde está."}
          </p>
        </section>
      )}

      <section aria-label="Planos" className="flex flex-col gap-4">
        <Suspense fallback={<div className="h-[640px]" aria-hidden="true" />}>
          <CartoesPlanos />
        </Suspense>
        <p className="text-texto-suave text-center">{avisoImposto}</p>
      </section>

      <section
        aria-labelledby="compare"
        className="mx-auto flex w-full max-w-[920px] flex-col gap-6"
      >
        <h2 id="compare" className="text-azul-fundo text-[clamp(28px,3.2vw,40px)]">
          Compare os planos
        </h2>
        <TabelaPlanos />
      </section>
    </div>
  );
}
