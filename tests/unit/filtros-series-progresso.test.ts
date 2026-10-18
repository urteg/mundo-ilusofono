import { describe, expect, it } from "vitest";
import {
  codificarCursor,
  filtrosParaParams,
  hrefAssistir,
  lerCursor,
  lerFiltros,
} from "@/lib/filtros";
import { criarLimitador, decidirBatimento, esquemaBatimento } from "@/lib/progresso-api";
import { duracaoTotal, duracaoVideo, resumoSerie } from "@/lib/series";

const UUID = "a0000000-0000-4000-8000-000000000001";

describe("filtros da biblioteca", () => {
  it("valores padrão", () => {
    expect(lerFiltros(new URLSearchParams())).toEqual({
      aba: "explorar",
      ordem: "novos",
      ocultarVistos: false,
    });
  });
  it("lê todos os filtros", () => {
    const f = lerFiltros(
      new URLSearchParams(
        `aba=salvos&ordem=curtos&nivel=2&pais=Brasil&apresentador=${UUID}&tema=comida&q=feira&ocultarVistos=1`,
      ),
    );
    expect(f).toEqual({
      aba: "salvos",
      ordem: "curtos",
      nivel: 2,
      pais: "Brasil",
      apresentador: UUID,
      tema: "comida",
      q: "feira",
      ocultarVistos: true,
    });
  });
  it("valores inválidos viram o padrão em vez de quebrar", () => {
    const f = lerFiltros({
      aba: "x",
      ordem: "y",
      nivel: "9",
      apresentador: "nao-uuid",
      tema: "Com Espaço",
      ocultarVistos: "talvez",
    });
    expect(f).toEqual({ aba: "explorar", ordem: "novos", ocultarVistos: false });
  });
  it("aceita objeto do Next (com arrays e vazios)", () => {
    expect(lerFiltros({ nivel: ["0", "3"], q: "" })).toMatchObject({ nivel: 0 });
  });
  it("ida e volta pela URL, sem os padrões", () => {
    const f = lerFiltros(new URLSearchParams("nivel=1&ocultarVistos=1&ordem=novos"));
    expect(filtrosParaParams(f).toString()).toBe("nivel=1&ocultarVistos=1");
    expect(hrefAssistir({ tema: "comida" })).toBe("/app/assistir?tema=comida");
    expect(hrefAssistir({})).toBe("/app/assistir");
  });
  it("cursor opaco", () => {
    expect(lerCursor(codificarCursor(48))).toBe(48);
    expect(lerCursor("lixo!!")).toBe(0);
    expect(lerCursor(null)).toBe(0);
  });
});

describe("duração", () => {
  it("de um vídeo", () => {
    expect(duracaoVideo(250)).toBe("4:10");
    expect(duracaoVideo(3725)).toBe("1:02:05");
  });
  it("total da série", () => {
    expect(duracaoTotal([1800, 1800, 720])).toBe("1 h 12 min");
    expect(duracaoTotal([3600])).toBe("1 h");
    expect(duracaoTotal([200, 220])).toBe("7 min");
    expect(duracaoTotal([20])).toBe("1 min");
    expect(duracaoTotal([])).toBe("0 min");
  });
  it("resumo do cartão", () => {
    expect(resumoSerie([{ duracao_seg: 2400 }, { duracao_seg: 1920 }])).toBe(
      "2 episódios · 1 h 12 min",
    );
    expect(resumoSerie([{ duracao_seg: 60 }])).toBe("1 episódio · 1 min");
  });
});

describe("batimento de progresso", () => {
  const ctx = { existe: true, podeAssistir: true, duracaoSeg: 300, ultimoEm: null, agora: 100_000 };
  const b = { video_id: UUID, delta: 15, posicao_seg: 30 };

  it("esquema rejeita delta fora de 0 a 20 e campos ruins", () => {
    expect(esquemaBatimento.safeParse(b).success).toBe(true);
    expect(esquemaBatimento.safeParse({ ...b, delta: 21 }).success).toBe(false);
    expect(esquemaBatimento.safeParse({ ...b, delta: -1 }).success).toBe(false);
    expect(esquemaBatimento.safeParse({ ...b, delta: 2.5 }).success).toBe(false);
    expect(esquemaBatimento.safeParse({ ...b, video_id: "x" }).success).toBe(false);
  });
  it("aceita o primeiro batimento", () => {
    expect(decidirBatimento(b, ctx)).toEqual({ ok: true, delta: 15, posicao: 30 });
  });
  it("vídeo bloqueado: 403", () => {
    expect(decidirBatimento(b, { ...ctx, podeAssistir: false })).toMatchObject({
      ok: false,
      status: 403,
    });
  });
  it("vídeo inexistente: 404", () => {
    expect(decidirBatimento(b, { ...ctx, existe: false })).toMatchObject({
      ok: false,
      status: 404,
    });
  });
  it("repetição rápida: 429", () => {
    expect(decidirBatimento(b, { ...ctx, ultimoEm: 95_000 })).toMatchObject({
      ok: false,
      status: 429,
    });
  });
  it("delta maior que o tempo real desde o último: 400", () => {
    expect(decidirBatimento({ ...b, delta: 20 }, { ...ctx, ultimoEm: 88_000 })).toMatchObject({
      ok: false,
      status: 400,
    });
  });
  it("posição além do fim: 400", () => {
    expect(decidirBatimento({ ...b, posicao_seg: 400 }, ctx)).toMatchObject({
      ok: false,
      status: 400,
      motivo: "posicao_invalida",
    });
  });
  it("só posição (delta 0) não precisa esperar", () => {
    expect(decidirBatimento({ ...b, delta: 0 }, { ...ctx, ultimoEm: 99_000 })).toMatchObject({
      ok: true,
    });
  });
  it("limitador por usuário", () => {
    const pode = criarLimitador(2, 1000);
    expect(pode("a", 0)).toBe(true);
    expect(pode("a", 10)).toBe(true);
    expect(pode("a", 20)).toBe(false);
    expect(pode("b", 20)).toBe(true);
    expect(pode("a", 1500)).toBe(true);
  });
});
