import { NextResponse } from "next/server";
import { obterStripe, variavelObrigatoria } from "@/lib/stripe";
import { esquecerEvento, processarEvento, registrarEvento } from "@/lib/stripe-webhook";
import { criarClienteAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

// Webhook do Stripe. Corpo bruto + assinatura (STRIPE_WEBHOOK_SECRET); idempotente por event.id.
// Erro interno => 500, para o Stripe reenviar o evento mais tarde.
export async function POST(req: Request) {
  const assinatura = req.headers.get("stripe-signature");
  const corpo = await req.text();
  if (!assinatura) return NextResponse.json({ motivo: "sem_assinatura" }, { status: 400 });

  let evento;
  try {
    evento = obterStripe().webhooks.constructEvent(
      corpo,
      assinatura,
      variavelObrigatoria("STRIPE_WEBHOOK_SECRET"),
    );
  } catch (erro) {
    const configuracao = erro instanceof Error && erro.message.startsWith("Falta a variável");
    if (configuracao) {
      console.error("webhook:", erro.message);
      return NextResponse.json({ motivo: "configuracao" }, { status: 500 });
    }
    return NextResponse.json({ motivo: "assinatura_invalida" }, { status: 400 });
  }

  const admin = criarClienteAdmin();
  try {
    const novo = await registrarEvento(admin, evento);
    if (!novo) return NextResponse.json({ recebido: true, repetido: true });
    try {
      await processarEvento(admin, evento);
    } catch (erro) {
      await esquecerEvento(admin, evento.id);
      throw erro;
    }
    return NextResponse.json({ recebido: true });
  } catch (erro) {
    console.error(
      "webhook:",
      evento.type,
      evento.id,
      erro instanceof Error ? erro.message : "erro desconhecido",
    );
    return NextResponse.json({ motivo: "erro_interno" }, { status: 500 });
  }
}
