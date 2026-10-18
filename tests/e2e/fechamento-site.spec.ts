import { expect, test } from "@playwright/test";

test("/desafio: botão de compra e linha do formato", async ({ page }) => {
  await page.goto("/desafio");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Entenda seus primeiros vídeos em português.",
  );
  await expect(page.getByText("Um vídeo por dia, durante sete dias.")).toBeVisible();
  const comprar = page.getByRole("link", { name: "Começar por €9 + IVA" }).first();
  await expect(comprar).toHaveAttribute("href", "/entrar?proximo=/app");
  await expect(page.getByText(/^Dia \d$/)).toHaveCount(7);
});

test("/recursos: roteiro desabilitado e FAQ pelo teclado", async ({ page }) => {
  await page.goto("/recursos");
  await expect(page.getByRole("button", { name: "Baixar o roteiro" })).toBeDisabled();
  await expect(page.getByText("Em breve", { exact: true })).toBeVisible();
  for (const c of [
    "Básico",
    "Como assistir",
    "Quando não entendo",
    "Falar",
    "Planos e pagamento",
  ]) {
    await expect(page.getByRole("heading", { level: 3, name: c })).toBeVisible();
  }
  const pergunta = page.locator("summary", { hasText: "Devo traduzir as palavras?" });
  await pergunta.focus();
  await expect(pergunta).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByText(/Deixe passar: elas voltam/)).toBeVisible();
  await page.keyboard.press("Enter");
  await expect(page.getByText(/Deixe passar: elas voltam/)).toBeHidden();
  const ld = JSON.parse(
    (await page.locator('script[type="application/ld+json"]').textContent()) ?? "{}",
  );
  expect(ld["@type"]).toBe("FAQPage");
  expect(ld.mainEntity.length).toBeGreaterThanOrEqual(15);
});

test("/blog: destaque, filtro por categoria e post com Article", async ({ page }) => {
  await page.goto("/blog");
  await expect(page.getByText("Em destaque", { exact: true })).toBeVisible();
  await page.getByRole("link", { name: "Cultura", exact: true }).click();
  await expect(page).toHaveURL(/categoria=cultura/);
  const lista = page.getByRole("heading", { level: 2, name: /título do post de cultura/ });
  await expect(lista.first()).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: /quando não entendo/ })).toHaveCount(0);
  await page.goto("/blog/quando-nao-entendo");
  const larguraMax = await page.locator(".prosa").evaluate((el) => getComputedStyle(el).maxWidth);
  expect(larguraMax).toMatch(/px$/);
  const ld = JSON.parse(
    (await page.locator('script[type="application/ld+json"]').textContent()) ?? "{}",
  );
  expect(ld["@type"]).toBe("Article");
});

for (const produto of ["desafio", "entender", "participar"]) {
  test(`/obrigado/${produto}: confirma, não é indexada e leva ao app`, async ({ page }) => {
    await page.goto(`/obrigado/${produto}`);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
    await expect(page.getByText(/Olhe o seu e-mail/)).toBeVisible();
    await expect(page.getByRole("link", { name: "Entrar no app" })).toHaveAttribute(
      "href",
      "/entrar",
    );
    if (produto === "desafio") await expect(page.getByText("Como começar o dia 1")).toBeVisible();
  });
}

test("produto desconhecido e endereço inexistente dão 404 amigável", async ({ page }) => {
  for (const url of ["/obrigado/outro", "/nao-existe"]) {
    const resposta = await page.goto(url);
    expect(resposta?.status()).toBe(404);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Essa página não existe.");
    await expect(page.getByText("O português se vive, não só se estuda.").first()).toBeVisible();
  }
});

test("/entrar valida o e-mail e não é indexada", async ({ page }) => {
  await page.goto("/entrar?proximo=/app");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  await page.getByLabel("Seu e-mail").fill("x");
  await page.getByRole("button", { name: "Enviar link de acesso" }).click();
  await expect(page.getByText(/não parece certo/)).toBeVisible();
});

test("sem rolagem horizontal nas páginas novas", async ({ page }) => {
  for (const url of [
    "/desafio",
    "/recursos",
    "/blog",
    "/blog/para-comecar",
    "/obrigado/participar",
    "/entrar",
    "/nao-existe",
  ]) {
    await page.goto(url);
    const transborda = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(transborda, url).toBe(false);
  }
});
