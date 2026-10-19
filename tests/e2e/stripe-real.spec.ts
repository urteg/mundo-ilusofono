import { expect, test, type Page } from "@playwright/test";
import Stripe from "stripe";
import { formatarEuro, precos } from "@/lib/precos";
import { adminTeste, entrar } from "./apoio";

// Compra de verdade no Stripe em MODO DE TESTE (página hospedada do Stripe + webhook).
// Só roda com: STRIPE_SECRET_KEY de teste, os 5 STRIPE_PRICE_*, rede liberada para o Stripe e
//   stripe listen --forward-to localhost:3000/api/stripe/webhook
// (o STRIPE_WEBHOOK_SECRET do servidor precisa ser o que o stripe listen mostra).
// O cartão é o número PÚBLICO de teste do Stripe; nenhum dado de cartão real entra aqui.
const CARTAO_TESTE = ["4242", "4242", "4242", "4242"].join("");

const chave = process.env.STRIPE_SECRET_KEY ?? "";
const pronto = chave.startsWith("sk_test_") && Boolean(process.env.STRIPE_WEBHOOK_SECRET);
test.skip(!pronto, "Sem chave de teste do Stripe ou sem STRIPE_WEBHOOK_SECRET neste ambiente.");
test.describe.configure({ mode: "serial", timeout: 180_000 });

const stripe = pronto ? new Stripe(chave) : (null as unknown as Stripe);

async function novoParticipante(prefixo: string) {
  const email = `stripe-${prefixo}-${Date.now()}@exemplo.com`;
  const { data, error } = await adminTeste().auth.admin.createUser({ email, email_confirm: true });
  if (error) throw error;
  return { email, id: data.user.id };
}

async function pagarNoStripe(page: Page) {
  await page.waitForURL(/checkout\.stripe\.com/, { timeout: 30_000 });
  await page.locator("#cardNumber").fill(CARTAO_TESTE);
  await page.locator("#cardExpiry").fill("12 / 34");
  await page.locator("#cardCvc").fill("123");
  await page.locator("#billingName").fill("Participante Teste");
  const pais = page.locator("#billingCountry");
  if (await pais.isVisible()) await pais.selectOption("ES");
  for (const [campo, valor] of [
    ["#billingAddressLine1", "Calle Real 1"],
    ["#billingPostalCode", "15003"],
    ["#billingLocality", "A Coruña"],
  ]) {
    const el = page.locator(campo);
    if (await el.isVisible()) await el.fill(valor);
  }
  await page
    .locator('[data-testid="hosted-payment-submit-button"], button[type="submit"]')
    .first()
    .click();
}

async function esperarAcesso(userId: string, produto: string) {
  await expect
    .poll(
      async () =>
        (
          await adminTeste()
            .from("entitlements")
            .select("status")
            .eq("user_id", userId)
            .eq("produto", produto)
            .maybeSingle()
        ).data?.status,
      {
        timeout: 60_000,
        message: `acesso ${produto} pelo webhook (o stripe listen está rodando?)`,
      },
    )
    .toBe("active");
}

for (const caso of [
  { produto: "desafio", pagina: "/desafio", botao: /Começar por/, valor: precos.desafio },
  {
    produto: "entender",
    pagina: "/planos?intervalo=mensal",
    botao: "Assinar o Entender",
    valor: precos.entender.mensal,
  },
  {
    produto: "participar",
    pagina: "/planos?intervalo=anual",
    botao: "Assinar o Participar",
    valor: precos.participar.anual,
  },
] as const) {
  test(`compra de teste: ${caso.produto}`, async ({ page, request }) => {
    const { email, id } = await novoParticipante(caso.produto);
    await entrar(page, request, email);
    await page.goto(caso.pagina);
    await page.getByRole("button", { name: caso.botao }).first().click();
    await page.waitForURL(/checkout\.stripe\.com/);
    // O valor na página do Stripe é o de lib/precos.ts, com o IVA incluído (não somado).
    await expect(page.getByText(formatarEuro(caso.valor).replace("€", "")).first()).toBeVisible();
    await pagarNoStripe(page);
    await page.waitForURL(new RegExp(`/obrigado/${caso.produto}$`), { timeout: 60_000 });
    await esperarAcesso(id, caso.produto);
  });
}

test("portal abre e cancelar mantém o acesso até o fim do período", async ({ page, request }) => {
  const { email, id } = await novoParticipante("portal");
  await entrar(page, request, email);
  await page.goto("/planos?intervalo=mensal");
  await page.getByRole("button", { name: "Assinar o Entender" }).click();
  await pagarNoStripe(page);
  await page.waitForURL(/\/obrigado\/entender$/, { timeout: 60_000 });
  await esperarAcesso(id, "entender");

  await page.goto("/app/planos");
  await page.getByRole("button", { name: "Cancelar", exact: true }).click();
  await page.waitForURL(/billing\.stripe\.com/, { timeout: 30_000 });
  await page
    .getByRole("button", { name: /cancel/i })
    .first()
    .click();
  // Cancelado no fim do período: continua ativo até lá.
  const { data } = await adminTeste()
    .from("entitlements")
    .select("stripe_subscription_id")
    .eq("user_id", id)
    .single();
  await expect
    .poll(
      async () =>
        (await stripe.subscriptions.retrieve(data!.stripe_subscription_id!)).cancel_at_period_end,
    )
    .toBe(true);
  await esperarAcesso(id, "entender");

  // Fim do período (simulado encerrando a assinatura agora): o acesso cai.
  await stripe.subscriptions.cancel(data!.stripe_subscription_id!);
  await expect
    .poll(
      async () =>
        (await adminTeste().from("entitlements").select("status").eq("user_id", id).single()).data
          ?.status,
      {
        timeout: 60_000,
      },
    )
    .toBe("canceled");
  expect(
    (await page.request.get("/api/video/d0000000-0000-4000-8000-000000000003/fonte")).status(),
  ).toBe(403);
});
