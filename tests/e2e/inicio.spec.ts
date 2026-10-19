import { expect, test } from "@playwright/test";

const proibidas = /input compreens|i\+1|\bGPA\b|H\.I\.C\.C|nutridor|aprender/i;

test.describe("Início", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("tem título, metadados e nenhuma rolagem horizontal", async ({ page }) => {
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Entenda português de verdade. E fale com naturalidade.",
    );
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      /^https?:\/\/[^/]+\/?$/,
    );
    await expect(page.locator('meta[property="og:image"]')).toHaveCount(1);
    const jsonLd = await page.locator('script[type="application/ld+json"]').textContent();
    expect(JSON.parse(jsonLd ?? "{}")["@type"]).toBe("Organization");
    const transborda = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(transborda).toBe(false);
  });

  test("texto visível sem palavras proibidas e com o lema exato", async ({ page }) => {
    const texto = await page.locator("body").innerText();
    expect(texto).not.toMatch(proibidas);
    expect(texto).toContain("O português se vive, não só se estuda.");
    expect(texto).toContain("Preços com IVA incluído.");
  });

  test("contador de participantes não aparece sem número real", async ({ page }) => {
    await expect(page.getByText(/pessoas já assistem/)).toHaveCount(0);
  });

  test("teclado: pular para o conteúdo e foco visível no primeiro link", async ({ page }) => {
    await page.keyboard.press("Tab");
    const pular = page.getByRole("link", { name: "Pular para o conteúdo" });
    await expect(pular).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page.locator("#conteudo")).toBeFocused();
  });

  test("acordeão abre pelo teclado", async ({ page }) => {
    const pergunta = page.locator("summary", { hasText: "Quanto tempo por dia?" });
    await pergunta.focus();
    await page.keyboard.press("Enter");
    await expect(page.getByText("Você escolhe a meta: 10, 20, 30 ou 45 minutos.")).toBeVisible();
  });

  test("campo de e-mail valida e mostra em breve", async ({ page }) => {
    const campo = page.getByLabel("Seu e-mail");
    await campo.fill("errado");
    await page.getByRole("button", { name: "Quero receber" }).click();
    await expect(page.getByText("Esse e-mail não parece certo.", { exact: false })).toBeVisible();
    await campo.fill("pessoa@exemplo.com");
    await page.getByRole("button", { name: "Quero receber" }).click();
    await expect(page.getByText(/^Em breve\./)).toBeVisible();
  });
});

test("menu do celular abre, prende o foco e fecha com Esc", async ({ page, isMobile }) => {
  test.skip(!isMobile, "só no celular");
  await page.goto("/");
  const abrir = page.getByRole("button", { name: "Abrir menu" });
  await abrir.click();
  const painel = page.getByRole("dialog", { name: "Menu" });
  await expect(painel).toBeVisible();
  for (let i = 0; i < 12; i++) {
    await page.keyboard.press("Tab");
    const dentro = await page.evaluate(() => !!document.activeElement?.closest("dialog"));
    expect(dentro).toBe(true);
  }
  await page.keyboard.press("Escape");
  await expect(painel).toBeHidden();
  await expect(abrir).toBeFocused();
});

test("robots bloqueia /app e /api", async ({ request }) => {
  const r = await (await request.get("/robots.txt")).text();
  expect(r).toContain("Disallow: /app");
  expect(r).toContain("Disallow: /api/");
  expect(await (await request.get("/sitemap.xml")).text()).toContain("<loc>");
});
