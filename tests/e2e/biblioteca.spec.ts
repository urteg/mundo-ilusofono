import { expect, test, type Page } from "@playwright/test";
import { adminTeste, entrar } from "./apoio";

// Biblioteca, séries e player (Fase 3B). Cada teste usa um participante novo.

const VIDEO_1 = "d0000000-0000-4000-8000-000000000001"; // grátis, arquivo local de 40 s
const VIDEO_3 = "d0000000-0000-4000-8000-000000000003"; // plano Entender
const SERIE_1 = "c0000000-0000-4000-8000-000000000001";

function diaMadri() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Madrid" }).format(new Date());
}

async function novoParticipante(prefixo: string, projeto: string) {
  const email = `${prefixo}-${projeto}-${Date.now()}@exemplo.com`;
  const { data, error } = await adminTeste().auth.admin.createUser({ email, email_confirm: true });
  if (error) throw error;
  return { email, id: data.user.id };
}

async function semRolagemHorizontal(page: Page) {
  const sobra = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(sobra).toBeLessThanOrEqual(0);
}

test("assistir 20 s do vídeo de exemplo e ver o tempo, a meta e a sequência mudarem", async ({
  page,
  request,
  isMobile,
}, info) => {
  test.skip(isMobile, "um projeto basta para o fluxo de tempo");
  test.setTimeout(120_000);
  const { email, id } = await novoParticipante("tempo", info.project.name);
  const admin = adminTeste();
  // Meta de 1 minuto e 50 s já feitos hoje: 20 s de vídeo fecham a meta.
  await admin.from("profiles").update({ meta_diaria_min: 1 }).eq("id", id);
  await admin.from("atividade_diaria").insert({ user_id: id, dia: diaMadri(), segundos: 50 });

  await entrar(page, request, email);
  await expect(page.getByLabel("Meta de hoje: 0 de 1 minutos")).toBeVisible();
  await expect(page.getByLabel("Sequência: 0 dias")).toBeVisible();

  await page.goto(`/app/video/${VIDEO_1}`);
  const player = page.getByTestId("player");
  const tocar = player.getByRole("button", { name: "Reproduzir" }).last();
  await expect(tocar).toBeEnabled();
  // A fonte vem da API; o endereço do vídeo não está no HTML da página.
  expect(await (await request.get(`/app/video/${VIDEO_1}`)).text()).not.toContain("exemplo.webm");

  await tocar.click();
  await expect(player).toHaveAttribute("data-tocando", "1");
  // Legenda em português ligada por padrão.
  await expect(player.getByRole("button", { name: "Legenda" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(player.getByTestId("legenda")).toBeVisible({ timeout: 10_000 });

  await page.waitForTimeout(20_500);
  await player.getByRole("button", { name: "Pausar" }).click();
  await expect(player).toHaveAttribute("data-tocando", "0");

  // O batimento dos 15 s e o envio do resto depois da pausa atualizam as pílulas.
  await expect(page.getByLabel("Meta de hoje: 1 de 1 minutos, cumprida")).toBeVisible({
    timeout: 20_000,
  });
  await expect(page.getByLabel("Sequência: 1 dia")).toBeVisible();
  await expect
    .poll(
      async () =>
        (await admin.from("visualizacoes").select("segundos").eq("user_id", id).single()).data
          ?.segundos,
      { timeout: 15_000 },
    )
    .toBeGreaterThanOrEqual(19);
  const { data: atv } = await admin
    .from("atividade_diaria")
    .select("segundos")
    .eq("user_id", id)
    .single();
  expect(atv!.segundos).toBeGreaterThanOrEqual(69);
  expect(atv!.segundos).toBeLessThanOrEqual(75);

  // Quanto você entendeu? fica gravado em visualizacoes.entendimento.
  await page.getByRole("radio", { name: "Entendi o principal" }).click();
  await expect(page.getByRole("radio", { name: "Entendi o principal" })).toHaveAttribute(
    "aria-checked",
    "true",
  );
  await expect
    .poll(
      async () =>
        (await admin.from("visualizacoes").select("entendimento").eq("user_id", id).single()).data
          ?.entendimento,
    )
    .toBe("principal");
  await admin.auth.admin.deleteUser(id);
});

test("atalhos de teclado do player", async ({ page, request }, info) => {
  const { email, id } = await novoParticipante("teclas", info.project.name);
  await entrar(page, request, email);
  await page.goto(`/app/video/${VIDEO_1}`);
  const player = page.getByTestId("player");
  await expect(player.getByRole("button", { name: "Reproduzir" }).last()).toBeEnabled();
  await player.focus();

  await page.keyboard.press(" ");
  await expect(player).toHaveAttribute("data-tocando", "1");
  await page.keyboard.press(" ");
  await expect(player).toHaveAttribute("data-tocando", "0");

  const posicao = player.getByRole("slider", { name: "Posição no vídeo" });
  const antes = Number(await posicao.inputValue());
  await page.keyboard.press("ArrowRight");
  await expect.poll(async () => Number(await posicao.inputValue())).toBe(antes + 5);
  await page.keyboard.press("ArrowLeft");
  await expect.poll(async () => Number(await posicao.inputValue())).toBe(antes);

  const legenda = player.getByRole("button", { name: "Legenda" });
  await page.keyboard.press("c");
  await expect(legenda).toHaveAttribute("aria-pressed", "false");
  await page.keyboard.press("c");
  await expect(legenda).toHaveAttribute("aria-pressed", "true");

  await page.keyboard.press("f");
  await expect(player.getByRole("button", { name: "Sair da tela cheia" })).toBeVisible();
  await page.keyboard.press("f");
  await expect(player.getByRole("button", { name: "Tela cheia" })).toBeVisible();

  await player.getByRole("button", { name: "Velocidade: 1x" }).click();
  await expect(player.getByRole("button", { name: "Velocidade: 1,25x" })).toBeVisible();
  await adminTeste().auth.admin.deleteUser(id);
});

test("sem plano: cadeado leva a /app/planos e a fonte responde 403", async ({
  page,
  request,
}, info) => {
  const { email, id } = await novoParticipante("semplano", info.project.name);
  await entrar(page, request, email);

  // Sem sessão: 401.
  const anonimo = await request.get(`/api/video/${VIDEO_3}/fonte`, {
    headers: { Cookie: "" },
  });
  expect([401, 403]).toContain(anonimo.status());

  const r = await page.request.get(`/api/video/${VIDEO_3}/fonte`);
  expect(r.status()).toBe(403);
  expect(await r.json()).toEqual({ motivo: "sem_plano" });
  expect(r.headers()["cache-control"]).toContain("no-store");
  const gratis = await page.request.get(`/api/video/${VIDEO_1}/fonte`);
  expect(gratis.status()).toBe(200);
  expect((await gratis.json()).provedor).toBe("file");

  // A página do vídeo bloqueado não traz a referência do vídeo.
  await page.goto(`/app/video/${VIDEO_3}`);
  await expect(page.getByText("Este vídeo faz parte do plano Entender.")).toBeVisible();
  expect(await page.content()).not.toContain("exemplo-ref-3");

  // Progresso de vídeo bloqueado é recusado.
  const p = await page.request.post("/api/progresso", {
    data: { video_id: VIDEO_3, delta: 5, posicao_seg: 5 },
  });
  expect(p.status()).toBe(403);

  await page.goto("/app/assistir");
  const bloqueado = page.locator('[data-testid="cartao-video"][data-bloqueado="1"]').first();
  await expect(bloqueado.getByRole("img", { name: "Bloqueado no seu plano" })).toBeVisible();
  await bloqueado.getByRole("link").first().click();
  await expect(page).toHaveURL(/\/app\/planos$/);
  await expect(page.getByRole("heading", { level: 1, name: "Planos" })).toBeVisible();
  await adminTeste().auth.admin.deleteUser(id);
});

test("filtros na URL e Ocultar vistos", async ({ page, request }, info) => {
  const { email, id } = await novoParticipante("filtros", info.project.name);
  await adminTeste()
    .from("visualizacoes")
    .insert({ user_id: id, video_id: VIDEO_1, segundos: 40, posicao_seg: 40, concluido: true });
  await entrar(page, request, email);

  await page.goto("/app/assistir");
  await expect(
    page.getByRole("heading", { level: 1, name: "O que vamos assistir?" }),
  ).toBeVisible();
  const cartoes = page.getByTestId("cartao-video");
  await expect(cartoes).toHaveCount(12);
  await expect(page.locator('[data-testid="cartao-video"][data-visto="1"]')).toHaveCount(1);
  await semRolagemHorizontal(page);

  await page.getByRole("switch", { name: "Ocultar vistos" }).click();
  await expect(page).toHaveURL(/ocultarVistos=1/);
  await expect(cartoes).toHaveCount(11);
  await expect(page.locator('[data-testid="cartao-video"][data-visto="1"]')).toHaveCount(0);
  await page.reload();
  await expect(page.getByRole("switch", { name: "Ocultar vistos" })).toHaveAttribute(
    "aria-checked",
    "true",
  );
  await expect(cartoes).toHaveCount(11);

  // Filtro de nível pela URL; valor inválido é ignorado.
  await page.goto("/app/assistir?nivel=1");
  await expect(cartoes).toHaveCount(4);
  await page.goto("/app/assistir?nivel=99&ordem=qualquer");
  await expect(cartoes).toHaveCount(12);

  // Ordem "mais curtos": o vídeo de exemplo (40 s) vem primeiro.
  await page.goto("/app/assistir?ordem=curtos");
  await expect(cartoes.first()).toContainText("título do vídeo 1]");

  // Busca pelo título.
  await page.getByRole("searchbox", { name: "Buscar vídeos pelo título" }).fill("vídeo 12");
  await expect(page).toHaveURL(/q=v%C3%ADdeo\+12|q=v%C3%ADdeo%2012/);
  await expect(cartoes).toHaveCount(1);
  await expect(cartoes.first().getByText("+18")).toBeVisible();

  // Histórico: só o vídeo já começado.
  await page.goto("/app/assistir?aba=historico");
  await expect(cartoes).toHaveCount(1);
  await adminTeste().auth.admin.deleteUser(id);
});

test("séries: duração somada, episódios e salvar", async ({ page, request }, info) => {
  const { email, id } = await novoParticipante("series", info.project.name);
  await entrar(page, request, email);
  await page.goto("/app/series");
  await expect(page.getByRole("heading", { level: 1, name: "Séries" })).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: "Nível 0" })).toBeVisible();
  await expect(page.getByTestId("resumo-serie").first()).toHaveText("4 episódios · 14 min");
  await semRolagemHorizontal(page);

  await page.goto(`/app/series/${SERIE_1}`);
  await expect(page.getByTestId("episodio")).toHaveCount(4);
  await page.getByRole("button", { name: "Salvar série" }).click();
  await expect(page.getByRole("button", { name: "Série salva" })).toBeVisible();
  await expect
    .poll(
      async () =>
        (await adminTeste().from("series_salvas").select("serie_id").eq("user_id", id)).data,
    )
    .toEqual([{ serie_id: SERIE_1 }]);
  await semRolagemHorizontal(page);

  await page.goto("/app/assistir?aba=salvos");
  await expect(page.getByRole("heading", { name: "Séries salvas" })).toBeVisible();

  await page.goto(`/app/video/${VIDEO_1}`);
  await expect(page.getByText(/vídeo 1 de 4/)).toBeVisible();
  await expect(
    page.getByText("palavras que você não conhece? deixa passar. elas voltam."),
  ).toBeVisible();
  await semRolagemHorizontal(page);
  await adminTeste().auth.admin.deleteUser(id);
});
