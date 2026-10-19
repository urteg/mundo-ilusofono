import { NextResponse } from "next/server";
import { participanteDaApi, semCache } from "@/lib/app/sessao-api";
import { bloqueioDeCompra, esquemaCheckout } from "@/lib/checkout";
import { precoStripe } from "@/lib/precos";
import { site } from "@/lib/site";
import { obterStripe } from "@/lib/stripe";
import { criarClienteAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const json = (corpo: object, status = 200) =>
  NextResponse.json(corpo, { status, headers: semCache });

/** Cria a sessão de Checkout do Stripe e devolve a URL. Só para quem está logado. */
export async function POST(req: Request) {
  const participante = await participanteDaApi();
  if (!participante) return json({ motivo: "sem_sessao" }, 401);

  let corpo: unknown;
  try {
    corpo = await req.json();
  } catch {
    return json({ motivo: "json_invalido" }, 400);
  }
  const lido = esquemaCheckout.safeParse(corpo);
  if (!lido.success) return json({ motivo: "dados_invalidos" }, 400);
  const pedido = lido.data;

  // Plano já ativo: não abre outra compra (o portal cuida de trocar de plano).
  const bloqueio = bloqueioDeCompra(pedido, participante.ents, new Date());
  if (bloqueio) return json({ motivo: "ja_ativo", mensagem: bloqueio }, 409);

  try {
    const stripe = obterStripe();
    const intervalo = pedido.produto === "desafio" ? undefined : pedido.intervalo;
    const preco = precoStripe(pedido.produto, intervalo);
    const admin = criarClienteAdmin();

    // Cliente do Stripe: reaproveita o do perfil ou cria um (e grava no perfil).
    const { data: perfil } = await admin
      .from("profiles")
      .select("stripe_customer_id, nome")
      .eq("id", participante.id)
      .single();
    let cliente = perfil?.stripe_customer_id ?? null;
    if (!cliente) {
      const novo = await stripe.customers.create(
        {
          email: participante.email,
          name: perfil?.nome ?? undefined,
          metadata: { user_id: participante.id },
          preferred_locales: ["pt-BR"],
        },
        // Dois cliques seguidos não criam dois clientes.
        { idempotencyKey: `cliente-${participante.id}` },
      );
      cliente = novo.id;
      const { error } = await admin
        .from("profiles")
        .update({ stripe_customer_id: cliente })
        .eq("id", participante.id);
      if (error) throw error;
    }

    // Dados que o webhook usa para conceder o acesso: definidos aqui, no servidor.
    const metadata = {
      user_id: participante.id,
      produto: pedido.produto,
      intervalo: intervalo ?? "",
    };
    const assinatura = pedido.produto !== "desafio";
    const sessao = await stripe.checkout.sessions.create({
      mode: assinatura ? "subscription" : "payment",
      customer: cliente,
      client_reference_id: participante.id,
      line_items: [{ price: preco, quantity: 1 }],
      automatic_tax: { enabled: true },
      billing_address_collection: "required",
      tax_id_collection: { enabled: true },
      customer_update: { address: "auto", name: "auto" },
      allow_promotion_codes: false,
      locale: "pt-BR",
      metadata,
      ...(assinatura
        ? { subscription_data: { metadata } }
        : { payment_intent_data: { metadata }, invoice_creation: { enabled: true } }),
      success_url: `${site.url}/obrigado/${pedido.produto}`,
      cancel_url: `${site.url}/planos`,
    });
    if (!sessao.url) throw new Error("Sessão sem URL");
    return json({ url: sessao.url });
  } catch (erro) {
    // Mensagem para o log sem dados sensíveis (nada de chaves).
    console.error("checkout:", erro instanceof Error ? erro.message : "erro desconhecido");
    return json(
      { motivo: "erro_stripe", mensagem: "Não foi possível abrir o pagamento agora." },
      502,
    );
  }
}
