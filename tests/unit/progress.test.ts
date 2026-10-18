import { describe, expect, it } from "vitest";
import { inicioDosNiveis, lerNivel, nivelPorHoras } from "@/lib/niveis";
import { horasTotais, resumoProgresso } from "@/lib/progress";

describe("lib/progress", () => {
  it("soma vídeos e tempo fora do app", () => {
    expect(horasTotais([{ segundos: 1800 }, { segundos: 1800 }], [{ segundos: 3600 }])).toBe(2);
  });

  it("ignora nulos e negativos", () => {
    expect(horasTotais([{ segundos: null }, { segundos: -50 }], [])).toBe(0);
  });

  it("nível pelas horas das fases (0 a 6)", () => {
    expect(inicioDosNiveis).toEqual([0, 40, 100, 250, 500, 1000, 1500]);
    expect(nivelPorHoras(0)).toBe(0);
    expect(nivelPorHoras(39.9)).toBe(0);
    expect(nivelPorHoras(40)).toBe(1);
    expect(nivelPorHoras(100)).toBe(2);
    expect(nivelPorHoras(250)).toBe(3);
    expect(nivelPorHoras(500)).toBe(4);
    expect(nivelPorHoras(999)).toBe(4);
    expect(nivelPorHoras(1000)).toBe(5);
    expect(nivelPorHoras(1499)).toBe(5);
    expect(nivelPorHoras(1500)).toBe(6);
    expect(nivelPorHoras(5000)).toBe(6);
  });

  it("lê o nível do banco com segurança", () => {
    expect(lerNivel("0")).toBe(0);
    expect(lerNivel("3")).toBe(3);
    expect(lerNivel(9)).toBe(6);
    expect(lerNivel("x")).toBe(0);
    expect(lerNivel(null)).toBe(0);
  });

  it("horas para o próximo nível e fração dentro do nível", () => {
    expect(resumoProgresso(18)).toEqual({
      horas: 18,
      nivel: 0,
      horasParaProximo: 22,
      fracaoNoNivel: 0.45,
    });
    const r = resumoProgresso(175);
    expect(r.nivel).toBe(2);
    expect(r.horasParaProximo).toBe(75);
    expect(r.fracaoNoNivel).toBe(0.5);
  });

  it("no último nível não há próximo", () => {
    expect(resumoProgresso(2000)).toMatchObject({
      nivel: 6,
      horasParaProximo: null,
      fracaoNoNivel: 1,
    });
  });
});
