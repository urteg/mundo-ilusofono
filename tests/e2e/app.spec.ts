import { expect, test } from "@playwright/test";
import { adminTeste, entrar } from "./apoio";

const SEED = "f0000000-0000-4000-8000-000000000001";

function diaMadri(deslocamento = 0) {
  const d = new Date(Date.now() + deslocamento * 86_400_000);
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Madrid" }).format(d);
}

test.describe("app com o usuário do seed", () => {
  test.skip(({ isMobile }) => isMobile, "o usuário do seed é usado só no projeto desktop");

  test.beforeAll(async () => {
    const admin = adminTeste();
    await admin.from("licao_passos").delete().eq("user_id", SEED);
    await admin.from("tempo_fora").delete().eq("user_id", SEED);
    await admin.from("atividade_diaria").delete().eq("user_id", SEED);
  });

  test("lição de hoje, outro vídeo, pílulas e tempo fora do app", async ({ page, request }) => {
    await entrar(page, request, "teste@exemplo.com");
    await expect(page.getByRole("heading", { level: 1, name: "Lição de hoje" })).toBeVisible();
    await expect(page.getByText("Assista, entenda e depois participe.")).toBeVisible();
    await expect(
      page.getByRole("list", { name: "Passos da lição" }).getByRole("listitem"),
    ).toHaveCount(3);

    // 0 horas = nível 0; o primeiro vídeo do nível 0 na ordem da série.
    const recomendado = page.getByRole("region", { name: "Vídeo recomendado" });
    await expect(recomendado.getByRole("heading", { level: 2 })).toHaveText(
      "[PLACEHOLDER: título do vídeo 1]",
    );
    await expect(recomendado.getByText("Nível 0")).toBeVisible();
    await expect(recomendado.getByRole("link", { name: "Assistir agora" })).toBeVisible();

    // Escolher outro vídeo troca a recomendação e grava em licao_passos.
    await recomendado.getByRole("button", { name: "Escolher outro vídeo" }).click();
    await expect(recomendado.getByRole("heading", { level: 2 })).not.toHaveText(
      "[PLACEHOLDER: título do vídeo 1]",
    );
    const novo = await recomendado.getByRole("heading", { level: 2 }).textContent();
    const { data: passo } = await adminTeste()
      .from("licao_passos")
      .select("video_id")
      .eq("user_id", SEED)
      .eq("dia", diaMadri())
      .single();
    expect(passo?.video_id).not.toBe("d0000000-0000-4000-8000-000000000001");
    // A escolha vale para o dia todo.
    await page.reload();
    await expect(recomendado.getByRole("heading", { level: 2 })).toHaveText(novo!);

    // Próxima live com contagem regressiva.
    await expect(page.getByRole("timer")).toHaveAttribute(
      "aria-label",
      /^Começa em \d+ dias?, \d+ horas? e \d+ minutos?$/,
    );

    // Pílulas a partir do banco: sem atividade, 0 de 20 e sequência 0.
    await expect(page.getByLabel("Meta de hoje: 0 de 20 minutos")).toBeVisible();
    await expect(page.getByLabel("Sequência: 0 dias")).toBeVisible();
    await adminTeste()
      .from("atividade_diaria")
      .insert([
        { user_id: SEED, dia: diaMadri(), segundos: 25 * 60 },
        { user_id: SEED, dia: diaMadri(-1), segundos: 21 * 60 },
      ]);
    await page.reload();
    await expect(page.getByLabel("Meta de hoje: 25 de 20 minutos, cumprida")).toBeVisible();
    await expect(page.getByLabel("Sequência: 2 dias")).toBeVisible();

    // Tempo fora do app pelo "+" da pílula.
    await page.getByRole("button", { name: "Adicionar tempo fora do app" }).click();
    const dialogo = page.getByRole("dialog", { name: "Adicionar tempo fora do app" });
    await dialogo.getByLabel("Ouvindo (podcast, música, rádio)").check();
    await dialogo.getByLabel("Minutos").fill("45");
    await dialogo.getByRole("button", { name: "Salvar" }).click();
    await expect(dialogo.getByText("Pronto. Esse tempo já entrou nas suas horas.")).toBeVisible();
    const { data: fora } = await adminTeste()
      .from("tempo_fora")
      .select("tipo, segundos")
      .eq("user_id", SEED);
    expect(fora).toEqual([{ tipo: "ouvindo", segundos: 2700 }]);
  });

  test.afterAll(async () => {
    const admin = adminTeste();
    await admin.from("tempo_fora").delete().eq("user_id", SEED);
    await admin.from("atividade_diaria").delete().eq("user_id", SEED);
  });
});

test("navegação pelas abas", async ({ page, request, isMobile }, info) => {
  await entrar(page, request, `abas-${info.project.name}-${Date.now()}@exemplo.com`);
  const sem = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
  expect(sem).toBe(false);

  const nav = page.getByRole("navigation", { name: "App" });
  const destinos = isMobile
    ? [
        ["Assistir", "Assistir"],
        ["Séries", "Séries"],
        ["Lives", "Lives"],
        ["Início", "Lição de hoje"],
      ]
    : [
        ["Assistir", "Assistir"],
        ["Séries", "Séries"],
        ["Lives", "Lives"],
        ["Progresso", "Progresso"],
        ["Conta", "Conta"],
        ["Início", "Lição de hoje"],
      ];
  for (const [aba, titulo] of destinos) {
    await nav.getByRole("link", { name: aba, exact: true }).click();
    await expect(page.getByRole("heading", { level: 1, name: titulo })).toBeVisible();
    await expect(nav.getByRole("link", { name: aba, exact: true })).toHaveAttribute(
      "aria-current",
      "page",
    );
  }

  if (isMobile) {
    for (const [item, titulo] of [
      ["Progresso", "Progresso"],
      ["Palavras", "Palavras"],
      ["Conta", "Conta"],
    ]) {
      await nav.getByRole("button", { name: "Mais" }).click();
      const folha = page.getByRole("dialog", { name: "Mais opções" });
      await folha.getByRole("link", { name: item }).click();
      await expect(page.getByRole("heading", { level: 1, name: titulo })).toBeVisible();
    }
    await nav.getByRole("button", { name: "Mais" }).click();
    await page
      .getByRole("dialog", { name: "Mais opções" })
      .getByRole("button", { name: "Sair" })
      .click();
    await expect(page).toHaveURL(/\/$/);
  }
});
