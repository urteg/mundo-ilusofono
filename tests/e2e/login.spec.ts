import { expect, test } from "@playwright/test";

import { linkDoEmail } from "./apoio";

test("/app sem sessão redireciona para /entrar com o destino", async ({ page }) => {
  await page.goto("/app");
  await expect(page).toHaveURL(/\/entrar\?proximo=%2Fapp$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Entre com seu e-mail");
});

test("login por link no e-mail, de ponta a ponta, e sair", async ({ page, request }, info) => {
  const email = `login-${info.project.name}-${Date.now()}@exemplo.com`;
  await page.goto("/app/planos");
  await expect(page).toHaveURL(/proximo=%2Fapp%2Fplanos/);

  await page.getByLabel("Seu e-mail").fill(email);
  await page.getByRole("button", { name: "Enviar link de acesso" }).click();
  await expect(page.getByRole("heading", { name: "Olhe o seu e-mail" })).toBeVisible();
  await expect(page.getByText(email).first()).toBeVisible();

  const link = await linkDoEmail(request, email);
  await page.goto(link);
  // /app/planos ainda não existe (Fase 4): o importante é chegar logado ao destino pedido.
  await expect(page).toHaveURL(/\/app\/planos$/);

  await page.goto("/app");
  await expect(page.getByRole("heading", { level: 1, name: "Lição de hoje" })).toBeVisible();

  // Logado, /entrar manda para /app.
  await page.goto("/entrar");
  await expect(page).toHaveURL(/\/app$/);

  await page.goto("/app/conta");
  await expect(page.getByText(email).first()).toBeVisible();
  await page.getByRole("button", { name: "Sair" }).click();
  await expect(page).toHaveURL(/\/$/);
  await page.goto("/app");
  await expect(page).toHaveURL(/\/entrar/);
});

test("link usado de novo mostra erro claro", async ({ page, request }, info) => {
  const email = `reuso-${info.project.name}-${Date.now()}@exemplo.com`;
  await page.goto("/entrar");
  await page.getByLabel("Seu e-mail").fill(email);
  await page.getByRole("button", { name: "Enviar link de acesso" }).click();
  await expect(page.getByRole("heading", { name: "Olhe o seu e-mail" })).toBeVisible();
  const link = await linkDoEmail(request, email);
  await page.goto(link);
  await expect(page).toHaveURL(/\/app$/);
  await page.context().clearCookies();
  await page.goto(link);
  await expect(page).toHaveURL(/\/entrar\?erro=link/);
  await expect(
    page.getByText("Esse link expirou ou já foi usado.", { exact: false }),
  ).toBeVisible();
});

test("?proximo= para outro site é ignorado", async ({ page }) => {
  await page.goto("/auth/callback?code=x&proximo=https://golpe.example");
  await expect(page).toHaveURL(/localhost:3000\/entrar\?erro=link/);
});

test("usuário 'Usar outro e-mail' volta ao formulário", async ({ page }, info) => {
  await page.goto("/entrar");
  await page.getByLabel("Seu e-mail").fill(`outro-${info.project.name}-${Date.now()}@exemplo.com`);
  await page.getByRole("button", { name: "Enviar link de acesso" }).click();
  await page.getByRole("button", { name: "Usar outro e-mail" }).click();
  await expect(page.getByLabel("Seu e-mail")).toBeFocused();
  await expect(page.getByLabel("Seu e-mail")).toHaveValue("");
});
