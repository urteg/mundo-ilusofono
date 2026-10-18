import { expect, test } from "@playwright/test";

const proibidas = /input compreens|i\+1|\bGPA\b|H\.I\.C\.C|nutridor|aprender/i;

const paginas = [
  { caminho: "/metodo", h1: "Como funciona", menu: "Como funciona" },
  { caminho: "/series", h1: "Séries para assistir em sequência", menu: "Séries" },
  { caminho: "/planos", h1: "Escolha como você quer viver o português", menu: "Planos" },
];

for (const p of paginas) {
  test(`${p.caminho}: carrega, sem rolagem horizontal e sem palavras proibidas`, async ({
    page,
    isMobile,
  }) => {
    await page.goto(p.caminho);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(p.h1);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      new RegExp(`${p.caminho}$`),
    );
    const transborda = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(transborda).toBe(false);
    expect(await page.locator("body").innerText()).not.toMatch(proibidas);
    if (!isMobile) {
      await expect(
        page.getByRole("navigation", { name: "Principal" }).getByRole("link", { name: p.menu }),
      ).toHaveAttribute("aria-current", "page");
    }
  });
}

test("/planos: todo preço vem com + IVA", async ({ page }) => {
  await page.goto("/planos");
  const texto = await page.locator("main").innerText();
  const precos = texto.match(/€\d+(,\d{2})?[^\n]*/g) ?? [];
  expect(precos.length).toBeGreaterThan(0);
  // O preço grande e a unidade ficam em linhas separadas; checamos os cartões à parte.
  await expect(page.getByText("por ano + IVA")).toHaveCount(2);
  await expect(page.getByText(/€9 \+ IVA, pagamento único/)).toBeVisible();
  await expect(
    page.getByText("Os preços não incluem imposto. O IVA é somado no pagamento.").first(),
  ).toBeVisible();
});

test("/planos: alternador muda os preços e a URL", async ({ page }) => {
  await page.goto("/planos");
  await expect(page.getByTestId("preco-entender")).toHaveText("€49");
  await page.getByRole("button", { name: "Mensal" }).click();
  await expect(page.getByTestId("preco-entender")).toHaveText("€6,99");
  await expect(page.getByTestId("nota-participar")).toHaveText("ou €89 por ano");
  await expect(page).toHaveURL(/\?intervalo=mensal$/);
  await page.reload();
  await expect(page.getByTestId("preco-participar")).toHaveText("€12,99");
});

test("/planos?intervalo=mensal abre direto no mensal", async ({ page }) => {
  await page.goto("/planos?intervalo=mensal");
  await expect(page.getByRole("button", { name: "Mensal" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(page.getByTestId("preco-entender")).toHaveText("€6,99");
});

test("/planos: tabela acessível e rolável no celular", async ({ page, isMobile }) => {
  await page.goto("/planos");
  const tabela = page.getByRole("table", { name: "O que cada plano inclui" });
  await expect(tabela.getByRole("columnheader")).toHaveCount(4);
  await expect(tabela.getByRole("rowheader")).toHaveCount(8);
  await expect(tabela.getByRole("img", { name: "Sim" }).first()).toBeAttached();
  const regiao = page.getByRole("region", { name: "O que cada plano inclui" });
  const rola = await regiao.evaluate((el) => el.scrollWidth > el.clientWidth);
  expect(rola).toBe(isMobile);
});

test("/planos: botão Assinar leva ao login com o destino", async ({ page }) => {
  await page.goto("/planos");
  await expect(page.getByRole("link", { name: "Assinar o Participar" })).toHaveAttribute(
    "href",
    "/entrar?proximo=/app/planos",
  );
});

test("/series: séries do banco com nível e episódios", async ({ page }) => {
  await page.goto("/series");
  const cartoes = page
    .getByRole("list")
    .filter({ hasText: "episódios" })
    .first()
    .getByRole("listitem");
  await expect(cartoes).toHaveCount(3);
  for (const titulo of ["A cidade", "A cozinha", "A família"]) {
    await expect(page.getByRole("heading", { level: 3, name: titulo })).toBeVisible();
  }
  await expect(page.getByText(/^4 episódios$/)).toHaveCount(3);
  await expect(page.getByText(/^Nível \d$/)).toHaveCount(3);
});
