// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Entitlement } from "@/lib/entitlements";

// POST /api/stripe/checkout com o Stripe e o Supabase simulados (sem rede).

Object.assign(process.env, {
  STRIPE_PRICE_DESAFIO: "price_d",
  STRIPE_PRICE_ENTENDER_MENSAL: "price_em",
  STRIPE_PRICE_ENTENDER_ANUAL: "price_ea",
  STRIPE_PRICE_PARTICIPAR_MENSAL: "price_pm",
  STRIPE_PRICE_PARTICIPAR_ANUAL: "price_pa",
});

let participante: { id: string; email: string; ents: Entitlement[] } | null;
let perfil: { stripe_customer_id: string | null; nome: string | null };
const gravados: unknown[] = [];

const stripe = {
  customers: { create: vi.fn(async () => ({ id: "cus_novo" })) },
  checkout: {
    sessions: {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      create: vi.fn(async (_p: Record<string, unknown>) => ({
        url: "https://checkout.stripe.com/c/teste",
      })),
    },
  },
};

vi.mock("server-only", () => ({}));
vi.mock("@/lib/stripe", () => ({ obterStripe: () => stripe }));
vi.mock("@/lib/app/sessao-api", () => ({
  participanteDaApi: async () => participante,
  semCache: { "Cache-Control": "no-store" },
}));
vi.mock("@/lib/supabase/admin", () => ({
  criarClienteAdmin: () => ({
    from: () => ({
      select: () => ({ eq: () => ({ single: async () => ({ data: perfil, error: null }) }) }),
      update: (dados: unknown) => ({
        eq: async () => {
          gravados.push(dados);
          return { error: null };
        },
      }),
    }),
  }),
}));

const { POST } = await import("@/app/api/stripe/checkout/route");

const pedir = (corpo: unknown) =>
  POST(
    new Request("http://localhost/api/stripe/checkout", {
      method: "POST",
      body: typeof corpo === "string" ? corpo : JSON.stringify(corpo),
    }),
  );
const ativo = (produto: string): Entitlement => ({
  produto,
  status: "active",
  renova_em: null,
  comprado_em: null,
});

beforeEach(() => {
  participante = { id: "u-1", email: "ana@exemplo.com", ents: [] };
  perfil = { stripe_customer_id: null, nome: "Ana" };
  gravados.length = 0;
  stripe.customers.create.mockClear();
  stripe.checkout.sessions.create.mockClear();
});

describe("checkout: validações", () => {
  it("sem sessão: 401", async () => {
    participante = null;
    expect((await pedir({ produto: "desafio" })).status).toBe(401);
  });

  it.each([
    ["JSON inválido", "{"],
    ["produto desconhecido", { produto: "vip" }],
    ["assinatura sem intervalo", { produto: "entender" }],
    ["intervalo errado", { produto: "participar", intervalo: "semanal" }],
    ["desafio não tem intervalo", { produto: "desafio", intervalo: "mensal" }],
    [
      "campo a mais (ex.: preço vindo do navegador)",
      { produto: "entender", intervalo: "mensal", preco: "price_x" },
    ],
  ])("%s: 400", async (_n, corpo) => {
    expect((await pedir(corpo)).status).toBe(400);
    expect(stripe.checkout.sessions.create).not.toHaveBeenCalled();
  });

  it("plano já ativo: 409 com mensagem para usar o portal", async () => {
    participante!.ents = [ativo("entender")];
    const r = await pedir({ produto: "participar", intervalo: "anual" });
    expect(r.status).toBe(409);
    expect((await r.json()).mensagem).toMatch(/Gerenciar assinatura/);
    const d = await pedir({ produto: "desafio" });
    expect(d.status).toBe(409);
    expect((await d.json()).mensagem).toBe(
      "Seu plano Entender já inclui todos os vídeos do Desafio.",
    );
    participante!.ents = [ativo("desafio")];
    expect((await pedir({ produto: "desafio" })).status).toBe(409);
    // Ter o Desafio não impede assinar.
    expect((await pedir({ produto: "entender", intervalo: "mensal" })).status).toBe(200);
  });

  it("plano cancelado e vencido não bloqueia uma compra nova", async () => {
    participante!.ents = [
      { ...ativo("entender"), status: "canceled", renova_em: "2020-01-01T00:00:00Z" },
    ];
    expect((await pedir({ produto: "entender", intervalo: "anual" })).status).toBe(200);
  });
});

describe("checkout: cliente e sessão", () => {
  it("sem cliente: cria no Stripe (uma vez por usuário) e grava no perfil", async () => {
    const r = await pedir({ produto: "entender", intervalo: "anual" });
    expect(r.status).toBe(200);
    expect(await r.json()).toEqual({ url: "https://checkout.stripe.com/c/teste" });
    expect(stripe.customers.create).toHaveBeenCalledWith(
      expect.objectContaining({ email: "ana@exemplo.com", metadata: { user_id: "u-1" } }),
      { idempotencyKey: "cliente-u-1" },
    );
    expect(gravados).toEqual([{ stripe_customer_id: "cus_novo" }]);
  });

  it("com cliente no perfil: reaproveita, sem criar outro", async () => {
    perfil.stripe_customer_id = "cus_existente";
    await pedir({ produto: "participar", intervalo: "mensal" });
    expect(stripe.customers.create).not.toHaveBeenCalled();
    expect(gravados).toEqual([]);
    expect(stripe.checkout.sessions.create).toHaveBeenCalledWith(
      expect.objectContaining({ customer: "cus_existente" }),
    );
  });

  it("assinatura: parâmetros de imposto, endereço, NIF e retorno", async () => {
    await pedir({ produto: "participar", intervalo: "anual" });
    const p = stripe.checkout.sessions.create.mock.calls[0][0];
    expect(p).toMatchObject({
      mode: "subscription",
      line_items: [{ price: "price_pa", quantity: 1 }],
      automatic_tax: { enabled: true },
      billing_address_collection: "required",
      tax_id_collection: { enabled: true },
      customer_update: { address: "auto", name: "auto" },
      allow_promotion_codes: false,
      client_reference_id: "u-1",
      metadata: { user_id: "u-1", produto: "participar", intervalo: "anual" },
      subscription_data: {
        metadata: { user_id: "u-1", produto: "participar", intervalo: "anual" },
      },
    });
    expect(p.success_url).toMatch(/\/obrigado\/participar$/);
    expect(p.cancel_url).toMatch(/\/planos$/);
  });

  it("desafio: pagamento único com recibo", async () => {
    await pedir({ produto: "desafio" });
    const p = stripe.checkout.sessions.create.mock.calls[0][0];
    expect(p).toMatchObject({
      mode: "payment",
      line_items: [{ price: "price_d", quantity: 1 }],
      invoice_creation: { enabled: true },
      payment_intent_data: { metadata: { produto: "desafio" } },
    });
    expect(p).not.toHaveProperty("subscription_data");
    expect(p.success_url).toMatch(/\/obrigado\/desafio$/);
  });

  it("variável de preço faltando: erro claro no log, 502 para o navegador", async () => {
    const antes = process.env.STRIPE_PRICE_PARTICIPAR_ANUAL;
    delete process.env.STRIPE_PRICE_PARTICIPAR_ANUAL;
    const erro = vi.spyOn(console, "error").mockImplementation(() => {});
    const r = await pedir({ produto: "participar", intervalo: "anual" });
    expect(r.status).toBe(502);
    expect(erro.mock.calls[0].join(" ")).toContain("STRIPE_PRICE_PARTICIPAR_ANUAL");
    erro.mockRestore();
    process.env.STRIPE_PRICE_PARTICIPAR_ANUAL = antes;
  });
});
