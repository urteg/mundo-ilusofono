import { NextResponse } from "next/server";
import { z } from "zod";
import { participanteDaApi } from "@/lib/app/sessao-api";
import { site } from "@/lib/site";
import { obterStripe, type Stripe } from "@/lib/stripe";
import { criarClienteAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const acoes = z.enum(["geral", "trocar", "pagamento", "cancelar"]).catch("geral");

/**
 * Abre o Customer Portal do Stripe (formulário POST da tela de planos e da conta).
 * Com "acao", vai direto para trocar de plano, atualizar o cartão ou cancelar; se o portal
 * não aceitar o atalho, abre a página inicial do portal.
 */
export async function POST(req: Request) {
  const origem = req.headers.get("origin");
  if (origem && new URL(origem).host !== new URL(req.url).host) {
    return NextResponse.json({ motivo: "origem_invalida" }, { status: 403 });
  }
  const participante = await participanteDaApi();
  if (!participante) return NextResponse.redirect(`${site.url}/entrar?proximo=/app/planos`, 303);

  const admin = criarClienteAdmin();
  const { data: perfil } = await admin
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", participante.id)
    .single();
  if (!perfil?.stripe_customer_id) {
    return NextResponse.redirect(`${site.url}/app/planos?portal=sem_assinatura`, 303);
  }

  let acao: z.infer<typeof acoes> = "geral";
  try {
    acao = acoes.parse((await req.formData()).get("acao"));
  } catch {}

  const stripe = obterStripe();
  const cliente = perfil.stripe_customer_id;
  const retorno = `${site.url}/app/planos`;
  try {
    let fluxo: Stripe.BillingPortal.SessionCreateParams.FlowData | undefined;
    if (acao === "pagamento") fluxo = { type: "payment_method_update" };
    if (acao === "trocar" || acao === "cancelar") {
      const { data: ent } = await admin
        .from("entitlements")
        .select("stripe_subscription_id")
        .eq("user_id", participante.id)
        .not("stripe_subscription_id", "is", null)
        .limit(1)
        .maybeSingle();
      if (ent?.stripe_subscription_id) {
        fluxo =
          acao === "trocar"
            ? {
                type: "subscription_update",
                subscription_update: { subscription: ent.stripe_subscription_id },
              }
            : {
                type: "subscription_cancel",
                subscription_cancel: { subscription: ent.stripe_subscription_id },
              };
      }
    }
    let sessao;
    try {
      sessao = await stripe.billingPortal.sessions.create({
        customer: cliente,
        return_url: retorno,
        locale: "pt-BR",
        ...(fluxo ? { flow_data: fluxo } : {}),
      });
    } catch (erro) {
      if (!fluxo) throw erro;
      sessao = await stripe.billingPortal.sessions.create({
        customer: cliente,
        return_url: retorno,
        locale: "pt-BR",
      });
    }
    return NextResponse.redirect(sessao.url, 303);
  } catch (erro) {
    console.error("portal:", erro instanceof Error ? erro.message : "erro desconhecido");
    return NextResponse.redirect(`${site.url}/app/planos?portal=erro`, 303);
  }
}
