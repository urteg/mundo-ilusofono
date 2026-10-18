import { describe, expect, it } from "vitest";
import { inicioDosNiveis, nivelPorHoras } from "@/lib/niveis";
import { horasTotais, resumoProgresso } from "@/lib/progress";

describe("lib/progress", () => {
  it("soma vídeos e tempo fora do app", () => {
    expect(horasTotais([{ segundos: 1800 }, { segundos: 1800 }], [{ segundos: 3600 }])).toBe(2);
  });

  it("ignora nulos e negativos", () => {
    expect(horasTotais([{ segundos: null }, { segundos: -50 }], [])).toBe(0);
  });

  it("nível pela tabela provisória", () => {
    expect(inicioDosNiveis).toEqual([0, 50, 150, 300, 600, 1000, 1500]);
    expect(nivelPorHoras(0)).toBe(1);
    expect(nivelPorHoras(49.9)).toBe(1);
    expect(nivelPorHoras(50)).toBe(2);
    expect(nivelPorHoras(1499)).toBe(6);
    expect(nivelPorHoras(5000)).toBe(7);
  });

  it("horas para o próximo nível e fração dentro do nível", () => {
    expect(resumoProgresso(18)).toEqual({
      horas: 18,
      nivel: 1,
      horasParaProximo: 32,
      fracaoNoNivel: 0.36,
    });
    const r = resumoProgresso(100);
    expect(r.nivel).toBe(2);
    expect(r.horasParaProximo).toBe(50);
    expect(r.fracaoNoNivel).toBe(0.5);
  });

  it("no último nível não há próximo", () => {
    expect(resumoProgresso(2000)).toMatchObject({
      nivel: 7,
      horasParaProximo: null,
      fracaoNoNivel: 1,
    });
  });
});
