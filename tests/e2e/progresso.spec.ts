import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { adminTeste, entrar } from "./apoio";

// Progresso, horas fora do app e Conta (Fase 3C). Cada teste usa um participante novo.

const meses = [
  "janeiro",
  "fevereiro",
  "março",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
];

function hojeMadri() {
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

test("adicionar 30 minutos Conversando e ver horas, calendário e meta mudarem", async ({
  page,
  request,
}, info) => {
  const { email, id } = await novoParticipante("fora", info.project.name);
  const hoje = hojeMadri();
  const rotuloHoje = `${Number(hoje.slice(8))} de ${meses[Number(hoje.slice(5, 7)) - 1]}`;
  await entrar(page, request, email);

  await page.goto("/app/progresso");
  await expect(page.getByRole("heading", { level: 1, name: "Progresso" })).toBeVisible();
  await expect(page.getByText("Total exato: 0 min. Inclui 0 min fora do app")).toBeVisible();
  const celulaHoje = page.getByRole("gridcell", { name: `${rotuloHoje}, 0 minutos (hoje)` });
  await expect(celulaHoje).toBeVisible();
  await expect(page.getByLabel("Meta de hoje: 0 de 20 minutos")).toBeVisible();
  await expect(page.getByTestId("frase-sequencia")).toContainText(
    "Hoje é um bom dia para começar.",
  );
  await semRolagemHorizontal(page);

  // O "+" da pílula da meta abre o diálogo.
  await page.getByRole("button", { name: "Adicionar tempo fora do app" }).click();
  const dialogo = page.getByRole("dialog", { name: "Adicionar tempo fora do app" });
  await dialogo.getByRole("radio", { name: /Conversando/ }).click();
  await expect(dialogo.getByRole("radio", { name: /Conversando/ })).toHaveAttribute(
    "aria-checked",
    "true",
  );
  await dialogo.getByLabel("Horas").fill("0");
  await dialogo.getByLabel("Minutos").fill("30");
  await dialogo.getByLabel(/Nota/).fill("café com uma amiga");
  await dialogo.getByRole("button", { name: "Salvar" }).click();
  await expect(dialogo).toBeHidden();
  await expect(page.getByRole("status").filter({ hasText: "Salvo." })).toBeVisible();

  // Horas, calendário, meta e sequência atualizados sem recarregar.
  await expect(page.getByText("Total exato: 30 min. Inclui 30 min fora do app")).toBeVisible();
  await expect(
    page.getByRole("gridcell", { name: `${rotuloHoje}, 30 minutos (hoje)` }),
  ).toBeVisible();
  await expect(page.getByLabel("Meta de hoje: 30 de 20 minutos, cumprida")).toBeVisible();
  await expect(page.getByLabel("Sequência: 1 dia")).toBeVisible();
  await expect(page.getByTestId("frase-sequencia")).toContainText(
    "1 dia seguido. Se pular um dia, tudo bem: você continua daqui.",
  );

  const { data } = await adminTeste()
    .from("tempo_fora")
    .select("tipo, dia, segundos, nota")
    .eq("user_id", id);
  expect(data).toEqual([
    { tipo: "conversando", dia: hoje, segundos: 1800, nota: "café com uma amiga" },
  ]);
  await adminTeste().auth.admin.deleteUser(id);
});

test("horas fora do app: validar, editar e excluir com confirmação", async ({
  page,
  request,
  isMobile,
}, info) => {
  const { email, id } = await novoParticipante("lista", info.project.name);
  await entrar(page, request, email);
  await page.goto("/app/progresso/fora");
  await expect(page.getByRole("heading", { level: 1, name: "Horas fora do app" })).toBeVisible();
  await expect(page.getByText("Nenhum registro ainda.")).toBeVisible();

  await page.getByRole("button", { name: "Adicionar tempo", exact: true }).click();
  const dialogo = page.getByRole("dialog", { name: "Adicionar tempo fora do app" });
  // Mais de 12 h é recusado pelo servidor.
  await dialogo.getByLabel("Horas").fill("12");
  await dialogo.getByLabel("Minutos").fill("30");
  await dialogo.getByRole("button", { name: "Salvar" }).click();
  await expect(dialogo.getByRole("alert")).toHaveText("A duração vai de 1 minuto a 12 horas.");
  // Data no futuro também.
  await dialogo.getByLabel("Horas").fill("1");
  await dialogo.getByLabel("Minutos").fill("0");
  await dialogo.getByLabel("Data").evaluate((el: HTMLInputElement) => {
    el.removeAttribute("max");
    el.value = "2099-01-01";
  });
  await dialogo.getByRole("button", { name: "Salvar" }).click();
  await expect(dialogo.getByRole("alert")).toHaveText("A data não pode ser no futuro.");
  await dialogo.getByLabel("Data").fill(hojeMadri());
  await dialogo.getByRole("button", { name: "Salvar" }).click();
  await expect(dialogo).toBeHidden();

  const linhas = page.getByTestId(isMobile ? "registro-celular" : "registro");
  await expect(linhas).toHaveCount(1);
  await expect(linhas.first()).toContainText("Assistindo");
  await expect(linhas.first()).toContainText("1 h");
  await expect(page.getByTestId("total-fora")).toHaveText("Total fora do app: 1 h");
  await semRolagemHorizontal(page);

  // Editar para 2 h 15 min ouvindo.
  await linhas
    .first()
    .getByRole("button", { name: /^Editar/ })
    .click();
  const editar = page.getByRole("dialog", { name: "Editar tempo fora do app" });
  await expect(editar.getByLabel("Horas")).toHaveValue("1");
  await editar.getByRole("radio", { name: /Ouvindo/ }).click();
  await editar.getByLabel("Horas").fill("2");
  await editar.getByLabel("Minutos").fill("15");
  await editar.getByRole("button", { name: "Salvar" }).click();
  await expect(page.getByTestId("total-fora")).toHaveText("Total fora do app: 2 h 15 min");
  await expect(linhas.first()).toContainText("Ouvindo");

  // As horas totais do painel incluem o tempo fora.
  await page.goto("/app/progresso");
  await expect(page.getByTestId("horas-totais")).toContainText("2 h");
  await page.goto("/app/progresso/fora");

  // Excluir pede confirmação; cancelar não apaga.
  await linhas
    .first()
    .getByRole("button", { name: /^Excluir/ })
    .click();
  const confirmar = page.getByRole("dialog", { name: "Excluir este registro?" });
  await confirmar.getByRole("button", { name: "Cancelar" }).click();
  await expect(linhas).toHaveCount(1);
  await linhas
    .first()
    .getByRole("button", { name: /^Excluir/ })
    .click();
  await confirmar.getByRole("button", { name: "Excluir" }).click();
  await expect(page.getByText("Nenhum registro ainda.")).toBeVisible();
  const { data } = await adminTeste().from("tempo_fora").select("id").eq("user_id", id);
  expect(data).toEqual([]);
  await adminTeste().auth.admin.deleteUser(id);
});

test("calendário: teclado e troca de mês", async ({ page, request, isMobile }, info) => {
  test.skip(isMobile, "teclado físico só no desktop");
  const { email, id } = await novoParticipante("calendario", info.project.name);
  await entrar(page, request, email);
  await page.goto("/app/progresso");
  // O teclado só funciona depois que o JavaScript da página carrega.
  await page.waitForLoadState("networkidle");
  const hoje = page.locator('[role="gridcell"][aria-current="date"]');
  await expect(hoje).toHaveAttribute("tabindex", "0");
  await hoje.focus();
  const numero = Number(await hoje.getAttribute("data-numero"));
  await page.keyboard.press(numero > 1 ? "ArrowLeft" : "ArrowRight");
  const alvo = numero > 1 ? numero - 1 : numero + 1;
  await expect(page.locator(`[role="gridcell"][data-numero="${alvo}"]`)).toBeFocused();
  // Mês anterior pelo teclado (Page Up) e pelos botões.
  await page.keyboard.press("PageUp");
  await expect(page).toHaveURL(/mes=\d{4}-\d{2}/);
  await expect(page.getByRole("link", { name: "Próximo mês" })).toBeVisible();
  await page.getByRole("link", { name: "Próximo mês" }).click();
  await expect(page.locator('[role="gridcell"][aria-current="date"]')).toBeVisible();
  // Mês inválido na URL cai no mês atual.
  await page.goto("/app/progresso?mes=2026-99");
  await expect(page.locator('[role="gridcell"][aria-current="date"]')).toBeVisible();
  await adminTeste().auth.admin.deleteUser(id);
});

test("conta: preferências, fuso, modo escuro com contraste AA e dados", async ({
  page,
  request,
}, info) => {
  const { email, id } = await novoParticipante("conta", info.project.name);
  await entrar(page, request, email);
  await page.goto("/app/conta");
  await expect(page.getByRole("heading", { level: 1, name: "Conta" })).toBeVisible();
  await expect(page.getByLabel("E-mail", { exact: true })).toHaveAttribute("readonly", "");
  await semRolagemHorizontal(page);

  await page.getByLabel("Nome").fill("Ana");
  await page.getByRole("button", { name: "Salvar nome" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Salvo." }).first()).toBeVisible();

  await page.getByRole("radio", { name: "30 min" }).click();
  await page.getByRole("radio", { name: "Escuro" }).click();
  await page.getByRole("switch", { name: "Resumo da semana" }).click();
  const busca = page.getByRole("combobox", { name: "Fuso das lives" });
  await busca.fill("lisbon");
  await page.getByRole("option", { name: /Lisbon/ }).click();
  await expect(page.getByText(/Agora: Lisbon/)).toBeVisible();
  await page.getByRole("button", { name: "Salvar preferências" }).click();
  await expect(page.getByText("Salvo.", { exact: true }).last()).toBeVisible();

  await expect(page.locator("html")).toHaveAttribute("data-tema", "escuro");
  await expect(page.getByLabel(/Meta de hoje: 0 de 30 minutos/)).toBeVisible();
  const { data: perfil } = await adminTeste()
    .from("profiles")
    .select("nome, meta_diaria_min, tema, email_semanal, fuso, fuso_escolhido")
    .eq("id", id)
    .single();
  expect(perfil).toEqual({
    nome: "Ana",
    meta_diaria_min: 30,
    tema: "escuro",
    email_semanal: false,
    fuso: "Europe/Lisbon",
    fuso_escolhido: true,
  });

  // Modo escuro: sem problemas de contraste nas telas principais.
  for (const url of [
    "/app/conta",
    "/app/progresso",
    "/app/progresso/fora",
    "/app",
    "/app/assistir",
  ]) {
    await page.goto(url);
    await expect(page.locator("html")).toHaveAttribute("data-tema", "escuro");
    const r = await new AxeBuilder({ page }).withTags(["wcag2aa"]).analyze();
    const contraste = r.violations.filter((v) => v.id === "color-contrast");
    expect(contraste.flatMap((v) => v.nodes.map((n) => `${url}: ${n.target}`))).toEqual([]);
  }

  // O site público continua claro.
  await page.goto("/");
  await expect(page.locator("html")).not.toHaveAttribute("data-tema", /.*/);

  // Baixar meus dados.
  const r = await page.request.get("/api/conta/dados");
  expect(r.status()).toBe(200);
  expect(r.headers()["content-disposition"]).toContain("attachment");
  const dados = await r.json();
  expect(Object.keys(dados)).toEqual(
    expect.arrayContaining(["profile", "visualizacoes", "tempo_fora"]),
  );
  expect(dados.profile.nome).toBe("Ana");
  await adminTeste().auth.admin.deleteUser(id);
});

test("excluir minha conta apaga o usuário e os dados", async ({ page, request }, info) => {
  const { email, id } = await novoParticipante("excluir", info.project.name);
  const admin = adminTeste();
  await admin
    .from("tempo_fora")
    .insert({ user_id: id, tipo: "ouvindo", dia: hojeMadri(), segundos: 600 });
  await admin.from("atividade_diaria").insert({ user_id: id, dia: hojeMadri(), segundos: 120 });
  await admin
    .from("visualizacoes")
    .insert({ user_id: id, video_id: "d0000000-0000-4000-8000-000000000001", segundos: 30 });
  await entrar(page, request, email);
  await page.goto("/app/conta");

  await page.getByRole("button", { name: "Excluir minha conta" }).click();
  const etapa1 = page.getByRole("dialog", { name: "Excluir sua conta?" });
  await etapa1.getByRole("button", { name: "Continuar" }).click();
  const etapa2 = page.getByRole("dialog", { name: "Confirme a exclusão" });
  const botao = etapa2.getByRole("button", { name: "Excluir para sempre" });
  await expect(botao).toBeDisabled();
  await etapa2.getByRole("textbox").fill("outro@exemplo.com");
  await expect(botao).toBeDisabled();
  await etapa2.getByRole("textbox").fill(email);
  await botao.click();
  await expect(page).toHaveURL(/\/conta-excluida$/);
  await expect(
    page.getByRole("heading", { level: 1, name: "Sua conta foi excluída" }),
  ).toBeVisible();

  // Nada do participante ficou no banco.
  expect((await admin.auth.admin.getUserById(id)).data.user).toBeNull();
  for (const tabela of ["profiles", "tempo_fora", "atividade_diaria", "visualizacoes"] as const) {
    const coluna = tabela === "profiles" ? "id" : "user_id";
    const { data } = await admin.from(tabela).select(coluna).eq(coluna, id);
    expect(data, tabela).toEqual([]);
  }
  // A sessão acabou.
  await page.goto("/app");
  await expect(page).toHaveURL(/\/entrar/);
});

test("a rota de exclusão exige sessão e a confirmação certa", async ({ page, request }, info) => {
  const sem = await request.post("/api/conta/excluir", { data: { confirmacao: "x" } });
  expect(sem.status()).toBe(401);
  const { email, id } = await novoParticipante("excluir-api", info.project.name);
  await entrar(page, request, email);
  const errado = await page.request.post("/api/conta/excluir", { data: { confirmacao: "nao" } });
  expect(errado.status()).toBe(400);
  const fora = await page.request.post("/api/conta/excluir", {
    data: { confirmacao: email },
    headers: { Origin: "https://outro-site.example" },
  });
  expect(fora.status()).toBe(403);
  expect((await adminTeste().auth.admin.getUserById(id)).data.user).not.toBeNull();
  await adminTeste().auth.admin.deleteUser(id);
});
