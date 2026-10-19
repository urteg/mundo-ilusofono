import { createClient } from "@supabase/supabase-js";
import { existsSync } from "node:fs";
import Stripe from "stripe";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

// Webhook do Stripe com payloads fixos, assinados aqui com um segredo de teste, contra o
// Supabase local. Nada vai para a rede do Stripe: o webhook usa só o conteúdo do evento.

if (existsSync(".env.local")) process.loadEnvFile(".env.local");
const SEGREDO = "whsec_somente_para_testes";
Object.assign(process.env, {
  STRIPE_SECRET_KEY: "sk_test_somente_para_testes",
  STRIPE_WEBHOOK_SECRET: SEGREDO,
  STRIPE_PRICE_DESAFIO: "price_teste_desafio",
  STRIPE_PRICE_ENTENDER_MENSAL: "price_teste_entender_mensal",
  STRIPE_PRICE_ENTENDER_ANUAL: "price_teste_entender_anual",
  STRIPE_PRICE_PARTICIPAR_MENSAL: "price_teste_participar_mensal",
  STRIPE_PRICE_PARTICIPAR_ANUAL: "price_teste_participar_anual",
});

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false, autoRefreshToken: false } },
);
const assinador = new Stripe("sk_test_somente_para_testes");
const { POST } = await import("@/app/api/stripe/webhook/route");

const sufixo = Date.now();
let seq = 0;
const agoraSeg = Math.floor(Date.now() / 1000);
const criados: string[] = [];

async function enviar(evento: object, segredo = SEGREDO) {
  const corpo = JSON.stringify(evento);
  const assinatura = assinador.webhooks.generateTestHeaderString({
    payload: corpo,
    secret: segredo,
  });
  return POST(
    new Request("http://localhost:3000/api/stripe/webhook", {
      method: "POST",
      headers: { "stripe-signature": assinatura, "content-type": "application/json" },
      body: corpo,
    }),
  );
}

function evento(type: string, objeto: object, created = agoraSeg) {
  return {
    id: `evt_teste_${sufixo}_${++seq}`,
    object: "event",
    api_version: "2026-09-30.endive",
    created,
    livemode: false,
    type,
    data: { object: objeto },
  };
}

function sessao(p: {
  usuario?: string;
  cliente: string;
  email: string;
  produto: string;
  intervalo?: string;
  assinatura?: string;
}) {
  const assinaturaModo = p.produto !== "desafio";
  return {
    id: `cs_test_${sufixo}_${++seq}`,
    object: "checkout.session",
    mode: assinaturaModo ? "subscription" : "payment",
    payment_status: "paid",
    status: "complete",
    customer: p.cliente,
    customer_details: { email: p.email },
    client_reference_id: p.usuario ?? null,
    subscription: assinaturaModo ? (p.assinatura ?? `sub_teste_${sufixo}_${seq}`) : null,
    metadata: p.usuario
      ? { user_id: p.usuario, produto: p.produto, intervalo: p.intervalo ?? "" }
      : { produto: p.produto, intervalo: p.intervalo ?? "" },
  };
}

function assinatura(p: {
  id: string;
  cliente: string;
  preco: string;
  status?: string;
  fim?: number;
  usuario?: string;
  encerradaEm?: number;
}) {
  return {
    id: p.id,
    object: "subscription",
    customer: p.cliente,
    status: p.status ?? "active",
    cancel_at_period_end: false,
    ended_at: p.encerradaEm ?? null,
    canceled_at: p.encerradaEm ?? null,
    metadata: p.usuario ? { user_id: p.usuario } : {},
    items: {
      object: "list",
      data: [
        {
          id: `si_${p.id}`,
          price: { id: p.preco },
          current_period_start: agoraSeg,
          current_period_end: p.fim ?? agoraSeg + 30 * 86400,
        },
      ],
    },
  };
}

function fatura(subId: string) {
  return {
    id: `in_teste_${sufixo}_${++seq}`,
    object: "invoice",
    parent: { type: "subscription_details", subscription_details: { subscription: subId } },
  };
}

async function novoUsuario(nome: string) {
  const { data, error } = await admin.auth.admin.createUser({
    email: `webhook-${nome}-${sufixo}@exemplo.com`,
    email_confirm: true,
  });
  if (error) throw error;
  criados.push(data.user.id);
  return { id: data.user.id, email: data.user.email! };
}

async function acessos(userId: string) {
  const { data } = await admin
    .from("entitlements")
    .select(
      "produto, status, intervalo, renova_em, stripe_subscription_id, pagamento_falhou_em, comprado_em",
    )
    .eq("user_id", userId)
    .order("produto");
  return data ?? [];
}

let a: { id: string; email: string };
let b: { id: string; email: string };

beforeAll(async () => {
  a = await novoUsuario("a");
  b = await novoUsuario("b");
});

afterAll(async () => {
  for (const id of criados) await admin.auth.admin.deleteUser(id);
});

describe("webhook do Stripe", () => {
  it("assinatura inválida ou ausente: 400 e nada muda", async () => {
    const e = evento(
      "checkout.session.completed",
      sessao({ usuario: a.id, cliente: "cus_x", email: a.email, produto: "desafio" }),
    );
    expect((await enviar(e, "whsec_errado")).status).toBe(400);
    const semAssinatura = await POST(
      new Request("http://localhost/api/stripe/webhook", { method: "POST", body: "{}" }),
    );
    expect(semAssinatura.status).toBe(400);
    expect(await acessos(a.id)).toEqual([]);
    const { data } = await admin.from("stripe_eventos").select("id").eq("id", e.id);
    expect(data).toEqual([]);
  });

  it("checkout do Desafio concede o desafio (pagamento único)", async () => {
    const cliente = `cus_teste_a_${sufixo}`;
    const r = await enviar(
      evento(
        "checkout.session.completed",
        sessao({ usuario: a.id, cliente, email: a.email, produto: "desafio" }),
      ),
    );
    expect(r.status).toBe(200);
    const [d] = await acessos(a.id);
    expect(d).toMatchObject({ produto: "desafio", status: "active", stripe_subscription_id: null });
    expect(d.comprado_em).toBeTruthy();
    // O cliente do Stripe ficou ligado ao perfil.
    const { data: perfil } = await admin
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", a.id)
      .single();
    expect(perfil?.stripe_customer_id).toBe(cliente);
  });

  it("checkout do Entender libera e a assinatura traz a renovação", async () => {
    const cliente = `cus_teste_b_${sufixo}`;
    const sub = `sub_teste_b_${sufixo}`;
    await admin.from("profiles").update({ stripe_customer_id: cliente }).eq("id", b.id);
    expect(
      (
        await enviar(
          evento(
            "checkout.session.completed",
            sessao({
              usuario: b.id,
              cliente,
              email: b.email,
              produto: "entender",
              intervalo: "anual",
              assinatura: sub,
            }),
          ),
        )
      ).status,
    ).toBe(200);
    expect(await acessos(b.id)).toMatchObject([
      { produto: "entender", status: "active", intervalo: "anual", stripe_subscription_id: sub },
    ]);

    const fim = agoraSeg + 365 * 86400;
    expect(
      (
        await enviar(
          evento(
            "customer.subscription.created",
            assinatura({ id: sub, cliente, preco: "price_teste_entender_anual", fim }),
          ),
        )
      ).status,
    ).toBe(200);
    const [e] = await acessos(b.id);
    expect(new Date(e.renova_em!).getTime()).toBe(fim * 1000);
  });

  it("pagamento falho: past_due com a data da falha; pago de novo: volta a active", async () => {
    const sub = `sub_teste_b_${sufixo}`;
    expect((await enviar(evento("invoice.payment_failed", fatura(sub)))).status).toBe(200);
    let [e] = await acessos(b.id);
    expect(e.status).toBe("past_due");
    expect(e.pagamento_falhou_em).toBeTruthy();
    const primeiraFalha = e.pagamento_falhou_em;

    // Segunda falha não empurra a data (os 3 dias contam da primeira).
    await enviar(evento("invoice.payment_failed", fatura(sub), agoraSeg + 3600));
    [e] = await acessos(b.id);
    expect(e.pagamento_falhou_em).toBe(primeiraFalha);

    await enviar(evento("invoice.paid", fatura(sub), agoraSeg + 7200));
    [e] = await acessos(b.id);
    expect(e).toMatchObject({ status: "active", pagamento_falhou_em: null });
  });

  it("troca de plano no portal: a linha do Entender sai e entra o Participar", async () => {
    const sub = `sub_teste_b_${sufixo}`;
    await enviar(
      evento(
        "customer.subscription.updated",
        assinatura({
          id: sub,
          cliente: `cus_teste_b_${sufixo}`,
          preco: "price_teste_participar_mensal",
        }),
        agoraSeg + 8000,
      ),
    );
    expect(await acessos(b.id)).toMatchObject([
      { produto: "participar", status: "active", intervalo: "mensal", stripe_subscription_id: sub },
    ]);
  });

  it("evento antigo que chega atrasado não desfaz um mais novo", async () => {
    const sub = `sub_teste_b_${sufixo}`;
    await enviar(
      evento(
        "customer.subscription.updated",
        assinatura({
          id: sub,
          cliente: `cus_teste_b_${sufixo}`,
          preco: "price_teste_participar_mensal",
          status: "past_due",
        }),
        agoraSeg + 100, // mais antigo que o evento de troca de plano
      ),
    );
    const [e] = await acessos(b.id);
    expect(e.status).toBe("active");
  });

  it("assinatura cancelada: canceled, com fim na data do encerramento", async () => {
    const sub = `sub_teste_b_${sufixo}`;
    const fim = agoraSeg + 9000;
    expect(
      (
        await enviar(
          evento(
            "customer.subscription.deleted",
            assinatura({
              id: sub,
              cliente: `cus_teste_b_${sufixo}`,
              preco: "price_teste_participar_mensal",
              status: "canceled",
              encerradaEm: fim,
            }),
            agoraSeg + 9000,
          ),
        )
      ).status,
    ).toBe(200);
    const [e] = await acessos(b.id);
    expect(e.status).toBe("canceled");
    expect(new Date(e.renova_em!).getTime()).toBe(fim * 1000);
  });

  it("evento repetido é idempotente (200 sem refazer)", async () => {
    const c = await novoUsuario("repetido");
    const e = evento(
      "checkout.session.completed",
      sessao({ usuario: c.id, cliente: `cus_rep_${sufixo}`, email: c.email, produto: "desafio" }),
    );
    expect((await enviar(e)).status).toBe(200);
    // Alguém retira o acesso à mão; o mesmo evento chegando de novo não o devolve.
    await admin.from("entitlements").delete().eq("user_id", c.id);
    const segunda = await enviar(e);
    expect(segunda.status).toBe(200);
    expect(await segunda.json()).toEqual({ recebido: true, repetido: true });
    expect(await acessos(c.id)).toEqual([]);
  });

  it("compra de quem não tem conta: cria o usuário, concede e manda o link", async () => {
    const email = `webhook-novo-${sufixo}@exemplo.com`;
    const cliente = `cus_novo_${sufixo}`;
    expect(
      (
        await enviar(
          evento(
            "checkout.session.completed",
            sessao({ cliente, email, produto: "participar", intervalo: "mensal" }),
          ),
        )
      ).status,
    ).toBe(200);
    const { data: id } = await admin.rpc("usuario_por_email", { p_email: email });
    expect(id).toBeTruthy();
    criados.push(id as string);
    expect(await acessos(id as string)).toMatchObject([
      { produto: "participar", status: "active" },
    ]);
    const { data: perfil } = await admin
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", id as string)
      .single();
    expect(perfil?.stripe_customer_id).toBe(cliente);
    // O e-mail com o link chegou (Mailpit, no Supabase local).
    let achou = false;
    for (let i = 0; i < 20 && !achou; i++) {
      const r = await fetch(
        `http://127.0.0.1:54324/api/v1/search?query=${encodeURIComponent(`to:${email}`)}`,
      );
      achou = ((await r.json()).messages ?? []).length > 0;
      if (!achou) await new Promise((ok) => setTimeout(ok, 250));
    }
    expect(achou).toBe(true);
  });

  it("erro interno: 500 e o evento não fica registrado (o Stripe reenvia)", async () => {
    const e = evento(
      "customer.subscription.updated",
      assinatura({
        id: `sub_orfa_${sufixo}`,
        cliente: `cus_desconhecido_${sufixo}`,
        preco: "price_teste_entender_mensal",
      }),
    );
    expect((await enviar(e)).status).toBe(500);
    const { data } = await admin.from("stripe_eventos").select("id").eq("id", e.id);
    expect(data).toEqual([]);
  });

  it("preço desconhecido não concede nada", async () => {
    const c = await novoUsuario("preco");
    await enviar(
      evento(
        "customer.subscription.created",
        assinatura({
          id: `sub_preco_${sufixo}`,
          cliente: "cus_qualquer",
          preco: "price_de_outro_produto",
          usuario: c.id,
        }),
      ),
    );
    expect(await acessos(c.id)).toEqual([]);
  });
});
