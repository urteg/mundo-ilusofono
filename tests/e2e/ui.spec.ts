import { expect, test } from "@playwright/test";

test("página de componentes carrega sem rolagem horizontal", async ({ page }) => {
  await page.goto("/_ui");
  await expect(page.getByRole("heading", { level: 1, name: "Componentes" })).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("lang", "pt-BR");
  const transborda = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
  expect(transborda).toBe(false);
});

test("diálogo abre e fecha com Esc", async ({ page }) => {
  await page.goto("/_ui");
  await page.getByRole("button", { name: "Abrir diálogo" }).click();
  const dialogo = page.getByRole("dialog", { name: "Adicionar tempo fora do app" });
  await expect(dialogo).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialogo).toBeHidden();
});
