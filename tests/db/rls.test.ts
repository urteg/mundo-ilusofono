import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { existsSync } from "node:fs";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { Database } from "@/lib/supabase/tipos";

// Prova a RLS com dois alunos de verdade no banco local.
if (existsSync(".env.local")) process.loadEnvFile(".env.local");
const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const servico = process.env.SUPABASE_SERVICE_ROLE_KEY!;

type Cliente = SupabaseClient<Database>;
const opcoes = { auth: { persistSession: false, autoRefreshToken: false } };
const admin: Cliente = createClient<Database>(url, servico, opcoes);

const sufixo = Date.now();
const senha = "senha-so-para-teste-123";
const VIDEO = "d0000000-0000-4000-8000-000000000001";
const PALAVRA = "e0000000-0000-4000-8000-000000000001";

let idA = "";
let idB = "";
let alunoA: Cliente;
let alunoB: Cliente;
const visitante: Cliente = createClient<Database>(url, anon, opcoes);

async function criarAluno(email: string): Promise<[string, Cliente]> {
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password: senha,
    email_confirm: true,
  });
  if (error) throw error;
  const cliente = createClient<Database>(url, anon, opcoes);
  const login = await cliente.auth.signInWithPassword({ email, password: senha });
  if (login.error) throw login.error;
  return [data.user.id, cliente];
}

beforeAll(async () => {
  [idA, alunoA] = await criarAluno(`rls-a-${sufixo}@exemplo.com`);
  [idB, alunoB] = await criarAluno(`rls-b-${sufixo}@exemplo.com`);

  // Dados do aluno A, gravados por ele mesmo.
  expect(
    (await alunoA.from("visualizacoes").insert({ user_id: idA, video_id: VIDEO, segundos: 40 }))
      .error,
  ).toBeNull();
  expect(
    (
      await alunoA
        .from("tempo_fora")
        .insert({ user_id: idA, tipo: "ouvindo", dia: "2026-10-18", segundos: 600 })
    ).error,
  ).toBeNull();
  expect(
    (await alunoA.from("palavras_aluno").insert({ user_id: idA, palavra_id: PALAVRA })).error,
  ).toBeNull();
});

afterAll(async () => {
  for (const id of [idA, idB]) if (id) await admin.auth.admin.deleteUser(id);
});

describe("RLS: cada aluno só vê e altera o que é dele", () => {
  it("o gatilho criou o perfil com os valores padrão", async () => {
    const { data } = await alunoA.from("profiles").select("fuso, meta_diaria_min, nome").single();
    expect(data).toEqual({ fuso: "Europe/Madrid", meta_diaria_min: 20, nome: null });
  });

  it("A lê os próprios dados", async () => {
    expect((await alunoA.from("visualizacoes").select("segundos")).data).toEqual([
      { segundos: 40 },
    ]);
    expect((await alunoA.from("tempo_fora").select("segundos")).data).toEqual([{ segundos: 600 }]);
    expect((await alunoA.from("palavras_aluno").select("palavra_id")).data).toHaveLength(1);
  });

  for (const tabela of ["visualizacoes", "tempo_fora", "palavras_aluno"] as const) {
    it(`B não lê nem altera ${tabela} de A`, async () => {
      const leitura = await alunoB.from(tabela).select("*").eq("user_id", idA);
      expect(leitura.error).toBeNull();
      expect(leitura.data).toEqual([]);

      const alteracao = await alunoB
        .from(tabela)
        .update({ user_id: idB })
        .eq("user_id", idA)
        .select();
      expect(alteracao.data ?? []).toEqual([]);

      const apagar = await alunoB.from(tabela).delete().eq("user_id", idA).select();
      expect(apagar.data ?? []).toEqual([]);

      // Os dados de A continuam lá.
      expect((await alunoA.from(tabela).select("user_id")).data).toHaveLength(1);
    });
  }

  it("B não grava linhas em nome de A", async () => {
    const r = await alunoB
      .from("visualizacoes")
      .insert({ user_id: idA, video_id: VIDEO, segundos: 999 });
    expect(r.error?.code).toBe("42501");
    const t = await alunoB
      .from("tempo_fora")
      .insert({ user_id: idA, tipo: "assistindo", dia: "2026-10-18", segundos: 60 });
    expect(t.error?.code).toBe("42501");
  });

  it("B não lê nem altera o perfil de A", async () => {
    expect((await alunoB.from("profiles").select("*").eq("id", idA)).data).toEqual([]);
    const r = await alunoB.from("profiles").update({ nome: "invasor" }).eq("id", idA).select();
    expect(r.data ?? []).toEqual([]);
    const { data } = await admin.from("profiles").select("nome").eq("id", idA).single();
    expect(data?.nome).not.toBe("invasor");
  });

  it("o aluno altera as próprias preferências", async () => {
    const r = await alunoA
      .from("profiles")
      .update({ nome: "Ana", meta_diaria_min: 30 })
      .eq("id", idA)
      .select("nome, meta_diaria_min");
    expect(r.data).toEqual([{ nome: "Ana", meta_diaria_min: 30 }]);
  });

  it("o aluno não troca o próprio stripe_customer_id", async () => {
    const r = await alunoA
      .from("profiles")
      .update({ stripe_customer_id: "cus_falso" })
      .eq("id", idA);
    expect(r.error).not.toBeNull();
  });
});

describe("RLS: entitlements é só leitura para o aluno", () => {
  it("nenhum aluno cria, altera ou apaga entitlements", async () => {
    for (const aluno of [alunoA, alunoB]) {
      const criar = await aluno
        .from("entitlements")
        .insert({ user_id: idA, produto: "participar", status: "active" });
      expect(criar.error).not.toBeNull();
    }
    await admin
      .from("entitlements")
      .insert({ user_id: idA, produto: "entender", status: "active" });
    const alterar = await alunoA
      .from("entitlements")
      .update({ produto: "participar" })
      .eq("user_id", idA)
      .select();
    expect(alterar.error ?? alterar.data?.length === 0).toBeTruthy();
    const apagar = await alunoA.from("entitlements").delete().eq("user_id", idA).select();
    expect(apagar.error ?? apagar.data?.length === 0).toBeTruthy();
    // A lê o próprio; B não lê o de A.
    expect((await alunoA.from("entitlements").select("produto")).data).toEqual([
      { produto: "entender" },
    ]);
    expect((await alunoB.from("entitlements").select("*").eq("user_id", idA)).data).toEqual([]);
  });
});

describe("video_ref e sala_url nunca saem para o cliente", () => {
  const clientes = () =>
    [
      ["aluno", alunoA],
      ["visitante", visitante],
    ] as const;

  it("as tabelas videos e lives não são acessíveis diretamente", async () => {
    for (const [, c] of clientes()) {
      const v = await c.from("videos").select("video_ref");
      expect(v.error?.code).toBe("42501");
      const l = await c.from("lives").select("sala_url");
      expect(l.error?.code).toBe("42501");
    }
  });

  it("as views públicas não têm as colunas sensíveis", async () => {
    for (const [, c] of clientes()) {
      // Cliente sem tipos: o tipo já impede pedir essas colunas, aqui testamos o banco.
      const solto = c as unknown as SupabaseClient;
      const v = await solto.from("v_videos_publicos").select("video_ref");
      expect(v.error).not.toBeNull();
      const l = await solto.from("v_lives_publicas").select("sala_url");
      expect(l.error).not.toBeNull();
    }
  });

  it("as views públicas devolvem o catálogo", async () => {
    const { data: videos } = await alunoA.from("v_videos_publicos").select("*");
    expect(videos).toHaveLength(12);
    for (const v of videos ?? []) expect(Object.keys(v)).not.toContain("video_ref");
    const { data: lives } = await visitante.from("v_lives_publicas").select("*");
    expect(lives).toHaveLength(3);
    for (const l of lives ?? []) {
      expect(Object.keys(l)).not.toContain("sala_url");
      expect(new Date(l.inicio!).getTime()).toBeGreaterThan(Date.now());
    }
  });

  it("visitante sem login não lê tabelas de conteúdo nem de alunos", async () => {
    for (const tabela of ["series", "palavras", "profiles", "visualizacoes"] as const) {
      const r = await visitante.from(tabela).select("*").limit(1);
      expect(r.error?.code, tabela).toBe("42501");
    }
  });

  it("aluno logado lê o conteúdo e não escreve nele", async () => {
    expect((await alunoA.from("series").select("titulo")).data).toHaveLength(3);
    const r = await alunoA.from("series").insert({ titulo: "x", nivel: "1" });
    expect(r.error).not.toBeNull();
  });
});
