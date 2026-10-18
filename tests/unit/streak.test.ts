import { describe, expect, it } from "vitest";
import { diaNoFuso, somarDias } from "@/lib/datas";
import { calcularSequencia, metaCumprida, minutosDoDia, type Atividade } from "@/lib/streak";

const meta = 20; // minutos
const cheio = 20 * 60;
const dias = (fim: string, n: number, segundos = cheio): Atividade[] =>
  Array.from({ length: n }, (_, i) => ({ dia: somarDias(fim, -i), segundos }));

describe("lib/streak", () => {
  it("meta cumprida só com o tempo inteiro", () => {
    expect(metaCumprida(1200, 20)).toBe(true);
    expect(metaCumprida(1199, 20)).toBe(false);
  });

  it("sem atividade, sequência zero", () => {
    expect(calcularSequencia([], meta, "2026-10-18")).toEqual({
      dias: 0,
      cumpridaHoje: false,
      trofeu: false,
    });
  });

  it("hoje cumprido conta hoje e os dias anteriores", () => {
    const s = calcularSequencia(dias("2026-10-18", 3), meta, "2026-10-18");
    expect(s).toEqual({ dias: 3, cumpridaHoje: true, trofeu: false });
  });

  it("só até ontem: a sequência continua viva enquanto o dia não acaba", () => {
    const s = calcularSequencia(dias("2026-10-17", 4), meta, "2026-10-18");
    expect(s.dias).toBe(4);
    expect(s.cumpridaHoje).toBe(false);
  });

  it("anteontem sem ontem: sequência quebrada volta a zero", () => {
    expect(calcularSequencia(dias("2026-10-16", 5), meta, "2026-10-18").dias).toBe(0);
  });

  it("um dia abaixo da meta no meio quebra a contagem", () => {
    const atv = [
      ...dias("2026-10-18", 2),
      { dia: "2026-10-16", segundos: 300 },
      ...dias("2026-10-15", 5),
    ];
    expect(calcularSequencia(atv, meta, "2026-10-18").dias).toBe(2);
  });

  it("troféu aos 30 dias", () => {
    expect(calcularSequencia(dias("2026-10-18", 30), meta, "2026-10-18").trofeu).toBe(true);
    expect(calcularSequencia(dias("2026-10-18", 29), meta, "2026-10-18").trofeu).toBe(false);
  });

  it("virada do mês e do ano", () => {
    expect(calcularSequencia(dias("2026-01-02", 4), meta, "2026-01-02").dias).toBe(4);
    expect(somarDias("2026-03-01", -1)).toBe("2026-02-28");
  });

  it("mudança de fuso: o mesmo instante é dias diferentes", () => {
    const instante = new Date("2026-10-18T23:30:00Z");
    expect(diaNoFuso(instante, "Europe/Madrid")).toBe("2026-10-19");
    expect(diaNoFuso(instante, "America/Sao_Paulo")).toBe("2026-10-18");
    expect(diaNoFuso(instante, "Asia/Tokyo")).toBe("2026-10-19");
  });

  it("virada de dia no fuso do participante decide se hoje já foi cumprido", () => {
    const atv = dias("2026-10-18", 3);
    // 23:30 UTC = 01:30 do dia 19 em Madri: hoje (19) ainda não cumprido, sequência viva.
    const hojeMadri = diaNoFuso(new Date("2026-10-18T23:30:00Z"), "Europe/Madrid");
    expect(calcularSequencia(atv, meta, hojeMadri)).toEqual({
      dias: 3,
      cumpridaHoje: false,
      trofeu: false,
    });
    // Em São Paulo ainda é dia 18: hoje cumprido.
    const hojeSP = diaNoFuso(new Date("2026-10-18T23:30:00Z"), "America/Sao_Paulo");
    expect(calcularSequencia(atv, meta, hojeSP).cumpridaHoje).toBe(true);
  });

  it("fuso inválido cai em Madri sem quebrar", () => {
    expect(diaNoFuso(new Date("2026-10-18T23:30:00Z"), "Lugar/Inexistente")).toBe("2026-10-19");
  });

  it("minutos do dia somam as linhas do dia", () => {
    expect(
      minutosDoDia(
        [
          { dia: "2026-10-18", segundos: 610 },
          { dia: "2026-10-17", segundos: 999 },
        ],
        "2026-10-18",
      ),
    ).toBe(10);
  });
});
