import "server-only";
import type Stripe from "stripe";
import { produtoDoPreco, type ProdutoCompra } from "./precos";
import { site } from "./site";
import type { criarClienteAdmin } from "./supabase/admin";

// Aplica os eventos do Stripe aos acessos (entitlements). Usa só o conteúdo do evento,
// que chega assinado pelo Stripe: nada vindo do navegador concede acesso.

type Admin = ReturnType<typeof criarClienteAdmin>;

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const segParaIso = (s: number | null | undefined) => (s ? new Date(s * 1000).toISOString() : null);
const idDe = (x: string | { id: string } | null | undefined) =>
  typeof x === "string" ? x : (x?.id ?? null);

/** Grava o event.id. false = já processado antes (idempotência). */
export async function registrarEvento(admin: Admin, evento: Stripe.Event): Promise<boolean> {
  const { error } = await admin.from("stripe_eventos").insert({ id: evento.id, tipo: evento.type });
  if (!error) return true;
  if (error.code === "23505") return false;
  throw new Error(`stripe_eventos: ${error.message}`);
}

/** Desfaz o registro quando o processamento falha, para o Stripe reenviar e tentarmos de novo. */
export async function esquecerEvento(admin: Admin, id: string) {
  await admin.from("stripe_eventos").delete().eq("id", id);
}

// ---------- Usuário ----------

type Pistas = { userId?: string | null; cliente?: string | null; email?: string | null };

/**
 * Acha o participante do evento: pelo user_id que o nosso checkout pôs nos metadados, pelo
 * cliente do Stripe gravado no perfil ou pelo e-mail. Se não existir, cria a conta e manda
 * o link de acesso por e-mail.
 */
export async function resolverUsuario(admin: Admin, pistas: Pistas): Promise<string | null> {
  let id: string | null = null;

  if (pistas.userId && uuid.test(pistas.userId)) {
    const { data } = await admin
      .from("profiles")
      .select("id")
      .eq("id", pistas.userId)
      .maybeSingle();
    id = data?.id ?? null;
  }
  if (!id && pistas.cliente) {
    const { data } = await admin
      .from("profiles")
      .select("id")
      .eq("stripe_customer_id", pistas.cliente)
      .maybeSingle();
    id = data?.id ?? null;
  }
  if (!id && pistas.email) {
    const { data, error } = await admin.rpc("usuario_por_email", { p_email: pistas.email });
    if (error) throw new Error(`usuario_por_email: ${error.message}`);
    id = data ?? null;
    if (!id) id = await criarContaComLink(admin, pistas.email);
  }
  if (id && pistas.cliente) {
    // Liga o cliente do Stripe ao perfil, sem trocar um que já exista.
    await admin
      .from("profiles")
      .update({ stripe_customer_id: pistas.cliente })
      .eq("id", id)
      .is("stripe_customer_id", null);
  }
  return id;
}

async function criarContaComLink(admin: Admin, email: string): Promise<string> {
  const { data, error } = await admin.auth.admin.createUser({ email, email_confirm: true });
  if (error || !data.user) throw new Error(`criar usuário: ${error?.message ?? "sem usuário"}`);
  await enviarLinkDeAcesso(admin, email);
  return data.user.id;
}

/** Link de acesso pelo e-mail do Supabase (o mesmo modelo do login; ver supabase/templates). */
export async function enviarLinkDeAcesso(admin: Admin, email: string) {
  const { error } = await admin.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: false,
      emailRedirectTo: `${site.url}/auth/confirmar?proximo=/app`,
    },
  });
  // A compra já está garantida; se o e-mail falhar, a pessoa ainda entra por /entrar.
  if (error) console.error("webhook: link de acesso não enviado:", error.message);
}

// ---------- Acessos ----------

type Linha = {
  user_id: string;
  produto: ProdutoCompra;
  status: string;
  intervalo?: string | null;
  renova_em?: string | null;
  stripe_subscription_id?: string | null;
  comprado_em?: string | null;
  pagamento_falhou_em?: string | null;
};

/**
 * Grava o acesso, a menos que já exista um evento mais novo aplicado a esta linha
 * (os eventos do Stripe podem chegar fora de ordem).
 */
async function gravarAcesso(admin: Admin, linha: Linha, quando: string) {
  const { data: atual } = await admin
    .from("entitlements")
    .select("stripe_evento_em")
    .eq("user_id", linha.user_id)
    .eq("produto", linha.produto)
    .maybeSingle();
  if (atual?.stripe_evento_em && atual.stripe_evento_em > quando) return;
  const { error } = await admin
    .from("entitlements")
    .upsert({ ...linha, stripe_evento_em: quando }, { onConflict: "user_id,produto" });
  if (error) throw new Error(`entitlements: ${error.message}`);
}

function precoDaAssinatura(sub: Stripe.Subscription) {
  const item = sub.items?.data?.[0];
  return { item, mapa: item?.price?.id ? produtoDoPreco(item.price.id) : null };
}

async function aplicarAssinatura(
  admin: Admin,
  sub: Stripe.Subscription,
  quando: string,
  apagada: boolean,
) {
  const { item, mapa } = precoDaAssinatura(sub);
  if (!mapa || mapa.produto === "desafio") {
    console.error("webhook: assinatura com preço desconhecido", item?.price?.id ?? "-");
    return;
  }
  const userId = await resolverUsuario(admin, {
    userId: sub.metadata?.user_id,
    cliente: idDe(sub.customer),
  });
  if (!userId) throw new Error("webhook: assinatura sem participante");

  const fimPeriodo =
    (item as { current_period_end?: number } | undefined)?.current_period_end ??
    (sub as unknown as { current_period_end?: number }).current_period_end;
  // Apagada: o acesso termina quando a assinatura terminou.
  const status = apagada ? "canceled" : sub.status;
  const renova = apagada
    ? (segParaIso(sub.ended_at ?? sub.canceled_at) ?? quando)
    : segParaIso(fimPeriodo);

  // Trocou de plano no portal (mesma assinatura, outro preço): remove a linha do plano antigo.
  await admin
    .from("entitlements")
    .delete()
    .eq("user_id", userId)
    .eq("stripe_subscription_id", sub.id)
    .neq("produto", mapa.produto);

  const { data: atual } = await admin
    .from("entitlements")
    .select("pagamento_falhou_em")
    .eq("user_id", userId)
    .eq("produto", mapa.produto)
    .maybeSingle();

  await gravarAcesso(
    admin,
    {
      user_id: userId,
      produto: mapa.produto,
      status,
      intervalo: mapa.intervalo,
      renova_em: renova,
      stripe_subscription_id: sub.id,
      // Atraso: conta os 3 dias a partir da primeira falha; pago de novo, limpa.
      pagamento_falhou_em: status === "past_due" ? (atual?.pagamento_falhou_em ?? quando) : null,
    },
    quando,
  );
}

async function aplicarCheckout(admin: Admin, s: Stripe.Checkout.Session, quando: string) {
  if (s.payment_status !== "paid" && s.payment_status !== "no_payment_required") return;
  const userId = await resolverUsuario(admin, {
    userId: s.metadata?.user_id ?? s.client_reference_id,
    cliente: idDe(s.customer),
    email: s.customer_details?.email ?? s.customer_email,
  });
  if (!userId) throw new Error("webhook: checkout sem participante");

  const produto = s.metadata?.produto as ProdutoCompra | undefined;
  if (s.mode === "payment") {
    if (produto !== "desafio") {
      console.error("webhook: pagamento único que não é o Desafio");
      return;
    }
    await gravarAcesso(
      admin,
      { user_id: userId, produto: "desafio", status: "active", comprado_em: quando },
      quando,
    );
    return;
  }
  // Assinatura: libera já; os eventos customer.subscription.* trazem a data de renovação.
  if (produto !== "entender" && produto !== "participar") {
    console.error("webhook: checkout de assinatura sem produto nos metadados");
    return;
  }
  const intervalo = s.metadata?.intervalo === "anual" ? "anual" : "mensal";
  const { data: atual } = await admin
    .from("entitlements")
    .select("stripe_evento_em")
    .eq("user_id", userId)
    .eq("produto", produto)
    .maybeSingle();
  // Se um evento de assinatura já gravou esta linha, ele manda (tem a data de renovação).
  if (atual?.stripe_evento_em) return;
  await gravarAcesso(
    admin,
    {
      user_id: userId,
      produto,
      status: "active",
      intervalo,
      stripe_subscription_id: idDe(s.subscription),
      comprado_em: quando,
    },
    // Peso mínimo: qualquer evento da assinatura, mesmo um pouco anterior, passa por cima.
    new Date(0).toISOString(),
  );
}

function assinaturaDaFatura(f: Stripe.Invoice): string | null {
  const nova = (f as unknown as { parent?: { subscription_details?: { subscription?: unknown } } })
    .parent?.subscription_details?.subscription;
  const antiga = (f as unknown as { subscription?: unknown }).subscription;
  return idDe((nova ?? antiga ?? null) as string | { id: string } | null);
}

async function aplicarFatura(admin: Admin, f: Stripe.Invoice, quando: string, paga: boolean) {
  const assinatura = assinaturaDaFatura(f);
  if (!assinatura) return; // fatura avulsa (ex.: recibo do Desafio)
  const { data: linhas } = await admin
    .from("entitlements")
    .select("user_id, produto, status, pagamento_falhou_em")
    .eq("stripe_subscription_id", assinatura);
  for (const l of linhas ?? []) {
    if (paga) {
      const { error } = await admin
        .from("entitlements")
        .update({
          pagamento_falhou_em: null,
          status: l.status === "past_due" ? "active" : l.status,
        })
        .eq("user_id", l.user_id)
        .eq("produto", l.produto);
      if (error) throw new Error(`entitlements: ${error.message}`);
    } else {
      const { error } = await admin
        .from("entitlements")
        .update({
          status: "past_due",
          pagamento_falhou_em: l.pagamento_falhou_em ?? quando,
        })
        .eq("user_id", l.user_id)
        .eq("produto", l.produto);
      if (error) throw new Error(`entitlements: ${error.message}`);
    }
  }
}

export const eventosTratados = [
  "checkout.session.completed",
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
  "invoice.payment_failed",
  "invoice.paid",
] as const;

/** Processa um evento já verificado. Lança erro em falha interna (a rota responde 500). */
export async function processarEvento(admin: Admin, evento: Stripe.Event) {
  const quando = new Date(evento.created * 1000).toISOString();
  switch (evento.type) {
    case "checkout.session.completed":
      return aplicarCheckout(admin, evento.data.object, quando);
    case "customer.subscription.created":
    case "customer.subscription.updated":
      return aplicarAssinatura(admin, evento.data.object, quando, false);
    case "customer.subscription.deleted":
      return aplicarAssinatura(admin, evento.data.object, quando, true);
    case "invoice.payment_failed":
      return aplicarFatura(admin, evento.data.object, quando, false);
    case "invoice.paid":
      return aplicarFatura(admin, evento.data.object, quando, true);
    default:
      return; // outros eventos: só registramos
  }
}
