import { beforeEach, describe, expect, it, vi } from "vitest";
import { validarTempoFora } from "@/lib/tempo-fora";

const HOJE = "2026-10-18";
const base = { tipo: "conversando", dia: HOJE, horas: "0", minutos: "30", nota: "" };

describe("validarTempoFora: limites", () => {
  it("aceita 30 minutos conversando hoje", () => {
    expect(validarTempoFora(base, HOJE)).toEqual({
      ok: true,
      dados: { tipo: "conversando", dia: HOJE, segundos: 1800, nota: null },
    });
  });

  it("aceita exatamente 12 h e 1 minuto", () => {
    expect(validarTempoFora({ ...base, horas: "12", minutos: "0" }, HOJE).ok).toBe(true);
    expect(validarTempoFora({ ...base, horas: "", minutos: "1" }, HOJE).ok).toBe(true);
  });

  it.each([
    ["zero", { horas: "0", minutos: "0" }],
    ["vazio", { horas: "", minutos: "" }],
    ["mais de 12 h", { horas: "12", minutos: "1" }],
    ["13 h", { horas: "13", minutos: "0" }],
    ["minutos acima de 59", { horas: "0", minutos: "60" }],
    ["negativo", { horas: "-1", minutos: "30" }],
    ["fração", { horas: "0", minutos: "1.5" }],
    ["texto", { horas: "duas", minutos: "0" }],
  ])("recusa duração %s", (_nome, campos) => {
    expect(validarTempoFora({ ...base, ...campos }, HOJE)).toEqual({
      ok: false,
      erro: "A duração vai de 1 minuto a 12 horas.",
    });
  });

  it("impede data no futuro (no fuso do participante)", () => {
    expect(validarTempoFora({ ...base, dia: "2026-10-19" }, HOJE)).toEqual({
      ok: false,
      erro: "A data não pode ser no futuro.",
    });
    expect(validarTempoFora({ ...base, dia: "2026-10-17" }, HOJE).ok).toBe(true);
  });

  it("recusa datas inválidas", () => {
    for (const dia of ["2026-02-30", "18/10/2026", "", "1999-12-31"]) {
      expect(validarTempoFora({ ...base, dia }, HOJE).ok).toBe(false);
    }
  });

  it("recusa tipo desconhecido", () => {
    expect(validarTempoFora({ ...base, tipo: "lendo" }, HOJE)).toEqual({
      ok: false,
      erro: "Escolha o que você fez.",
    });
  });

  it("nota opcional com até 140 caracteres, sem espaços sobrando", () => {
    const r = validarTempoFora({ ...base, nota: "  podcast  " }, HOJE);
    expect(r.ok && r.dados.nota).toBe("podcast");
    expect(validarTempoFora({ ...base, nota: "a".repeat(140) }, HOJE).ok).toBe(true);
    expect(validarTempoFora({ ...base, nota: "a".repeat(141) }, HOJE)).toEqual({
      ok: false,
      erro: "A nota pode ter até 140 caracteres.",
    });
  });
});

// ---------- Server Actions com o Supabase simulado ----------

type Chamada = { metodo: string; args: unknown[] };
const chamadas: Chamada[] = [];
let resposta: { data: unknown; error: unknown } = { data: [{ id: "x" }], error: null };

function consulta() {
  const q: Record<string, unknown> = {};
  for (const metodo of ["from", "insert", "update", "delete", "eq", "select"]) {
    q[metodo] = (...args: unknown[]) => {
      chamadas.push({ metodo, args });
      return q;
    };
  }
  q.then = (ok: (v: unknown) => unknown) => Promise.resolve(resposta).then(ok);
  return q;
}

vi.mock("server-only", () => ({}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/app/participante", () => ({
  carregarParticipante: async () => ({ id: "dono-1", hoje: HOJE }),
}));
// O cliente em si não pode ser "thenable" (o await o resolveria); só a consulta é.
vi.mock("@/lib/supabase/servidor", () => ({
  criarClienteServidor: async () => ({
    from: (t: string) => (consulta().from as (t: string) => unknown)(t),
  }),
}));

const { salvarTempoFora, excluirTempoFora } = await import("@/app/app/progresso/acoes");
const { revalidatePath } = await import("next/cache");

function formulario(campos: Record<string, string>) {
  const f = new FormData();
  for (const [k, v] of Object.entries(campos)) f.set(k, v);
  return f;
}

const ID = "a1b2c3d4-0000-4000-8000-000000000001";

describe("Server Actions do tempo fora", () => {
  beforeEach(() => {
    chamadas.length = 0;
    resposta = { data: [{ id: ID }], error: null };
    vi.mocked(revalidatePath).mockClear();
  });

  it("adicionar grava com o user_id da sessão (não do formulário) e atualiza as telas", async () => {
    const r = await salvarTempoFora(formulario({ ...base, user_id: "outra-pessoa" }));
    expect(r).toEqual({ ok: true });
    const insert = chamadas.find((c) => c.metodo === "insert");
    expect(insert?.args[0]).toEqual({
      tipo: "conversando",
      dia: HOJE,
      segundos: 1800,
      nota: null,
      user_id: "dono-1",
    });
    expect(revalidatePath).toHaveBeenCalledWith("/app", "layout");
  });

  it("não grava nada quando a validação falha", async () => {
    const r = await salvarTempoFora(formulario({ ...base, dia: "2026-10-20" }));
    expect(r).toEqual({ ok: false, erro: "A data não pode ser no futuro." });
    expect(chamadas).toHaveLength(0);
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it("editar filtra pelo id e pelo dono", async () => {
    await salvarTempoFora(formulario({ ...base, id: ID, minutos: "45" }));
    expect(chamadas.find((c) => c.metodo === "update")?.args[0]).toMatchObject({ segundos: 2700 });
    const filtros = chamadas.filter((c) => c.metodo === "eq").map((c) => c.args);
    expect(filtros).toEqual([
      ["id", ID],
      ["user_id", "dono-1"],
    ]);
  });

  it("editar registro de outra pessoa não altera nada", async () => {
    resposta = { data: [], error: null }; // nenhuma linha do dono com esse id
    expect(await salvarTempoFora(formulario({ ...base, id: ID }))).toEqual({
      ok: false,
      erro: "Registro não encontrado.",
    });
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it("id inválido é recusado antes de consultar o banco", async () => {
    expect(await salvarTempoFora(formulario({ ...base, id: "1; drop" }))).toEqual({
      ok: false,
      erro: "Registro não encontrado.",
    });
    expect(chamadas.some((c) => c.metodo === "update")).toBe(false);
    expect(await excluirTempoFora("nada")).toEqual({ ok: false, erro: "Registro não encontrado." });
  });

  it("excluir filtra pelo dono e avisa quando não acha", async () => {
    expect(await excluirTempoFora(ID)).toEqual({ ok: true });
    expect(chamadas.filter((c) => c.metodo === "eq").map((c) => c.args)).toEqual([
      ["id", ID],
      ["user_id", "dono-1"],
    ]);
    resposta = { data: [], error: null };
    expect(await excluirTempoFora(ID)).toEqual({ ok: false, erro: "Registro não encontrado." });
  });
});
