import { expect, test } from "@playwright/test";
import { adminTeste, entrar } from "./apoio";

// Planos e acesso (Fase 4) sem a rede do Stripe: usuários do seed, cadeados, /app/planos,
// aviso de pagamento atrasado e o caminho dos botões de compra.

const VIDEO_ENTENDER = "d0000000-0000-4000-8000-000000000003";
const VIDEO_PARTICIPAR = "d0000000-0000-4000-8000-000000000012";

async function novoParticipante(prefixo: string, projeto: string) {
  const email = `${prefixo}-${projeto}-${Date.now()}@exemplo.com`;
  const { data, error } = await adminTeste().auth.admin.createUser({ email, email_confirm: true });
  if (error) throw error;
  return { email, id: data.user.id };
}

test("seed: gratuito vê convite e cadeado; o servidor nega a fonte", async ({ page, request }) => {
  await entrar(page, request, "gratis@exemplo.com");
  await page.goto("/app/planos");
  await expect(
    page.getByRole("heading", { name: "Veja tudo o que já está esperando por você" }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Assinar o Entender" })).toBeVisible();
  await expect(page.getByRole("table")).toBeVisible();
  expect((await page.request.get(`/api/video/${VIDEO_ENTENDER}/fonte`)).status()).toBe(403);
  await page.goto(`/app/video/${VIDEO_ENTENDER}`);
  await expect(page.getByRole("link", { name: "Ver planos" })).toHaveAttribute(
    "href",
    "/app/planos",
  );
});

test("seed: Participar é assinante e abre o vídeo do Participar", async ({ page, request }) => {
  await entrar(page, request, "participar@exemplo.com");
  await page.goto("/app/planos");
  await expect(page.getByRole("heading", { name: "Obrigado por ser assinante" })).toBeVisible();
  await expect(page.getByTestId("plano-atual")).toHaveText("Seu plano: Participar, anual.");
  await expect(page.getByText(/Próxima cobrança:/)).toBeVisible();
  for (const nome of ["Trocar de plano", "Atualizar forma de pagamento", "Cancelar"]) {
    await expect(page.getByRole("button", { name: nome, exact: true })).toBeVisible();
  }
  const fonte = await page.request.get(`/api/video/${VIDEO_PARTICIPAR}/fonte`);
  expect(fonte.status()).toBe(200);

  // Já assinante: o checkout recusa e manda usar o portal.
  const r = await page.request.post("/api/stripe/checkout", {
    data: { produto: "entender", intervalo: "mensal" },
  });
  expect(r.status()).toBe(409);
  await page.getByRole("button", { name: "Assinar o Entender" }).click();
  await expect(page.getByText(/Você já assina o Participar/)).toBeVisible();

  // Acesso concedido sem Stripe (seed): o portal explica que não há o que gerenciar.
  await page.getByRole("button", { name: "Atualizar forma de pagamento" }).first().click();
  await expect(page).toHaveURL(/\/app\/planos\?portal=sem_assinatura/);
  await expect(page.getByText(/não está ligado a uma assinatura com cartão/)).toBeVisible();
});

test("pagamento atrasado: aviso discreto e acesso mantido nos 3 dias", async ({
  page,
  request,
}, info) => {
  const { email, id } = await novoParticipante("atrasado", info.project.name);
  const admin = adminTeste();
  await admin.from("entitlements").insert({
    user_id: id,
    produto: "entender",
    status: "past_due",
    intervalo: "mensal",
    renova_em: new Date(Date.now() + 25 * 86400e3).toISOString(),
    pagamento_falhou_em: new Date(Date.now() - 86400e3).toISOString(),
  });
  await entrar(page, request, email);
  await expect(page.getByTestId("aviso-pagamento")).toContainText(
    "Não conseguimos cobrar. Atualize a forma de pagamento.",
  );
  expect((await page.request.get(`/api/video/${VIDEO_ENTENDER}/fonte`)).status()).toBe(200);

  // Passados os 3 dias, o acesso pago fecha e o aviso sai.
  await admin
    .from("entitlements")
    .update({ pagamento_falhou_em: new Date(Date.now() - 4 * 86400e3).toISOString() })
    .eq("user_id", id);
  await page.reload();
  await expect(page.getByTestId("aviso-pagamento")).toHaveCount(0);
  expect((await page.request.get(`/api/video/${VIDEO_ENTENDER}/fonte`)).status()).toBe(403);
  await admin.auth.admin.deleteUser(id);
});

test("site: Assinar sem sessão leva ao login e volta para a página", async ({ page }) => {
  await page.goto("/planos?intervalo=mensal");
  await page.getByRole("button", { name: "Assinar o Participar" }).click();
  await expect(page).toHaveURL(/\/entrar\?proximo=%2Fplanos%3Fintervalo%3Dmensal$/);
  await page.goto("/desafio");
  await page
    .getByRole("button", { name: /Começar por/ })
    .first()
    .click();
  await expect(page).toHaveURL(/\/entrar\?proximo=%2Fdesafio$/);
});

test("rotas do Stripe: sem sessão e sem assinatura", async ({ request }) => {
  expect(
    (await request.post("/api/stripe/checkout", { data: { produto: "desafio" } })).status(),
  ).toBe(401);
  const portal = await request.post("/api/stripe/portal", { maxRedirects: 0 });
  expect(portal.status()).toBe(303);
  expect(portal.headers()["location"]).toContain("/entrar?proximo=/app/planos");
  const webhook = await request.post("/api/stripe/webhook", { data: "{}" });
  expect(webhook.status()).toBe(400);
});
