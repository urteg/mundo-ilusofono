import { describe, expect, it } from "vitest";
import {
  diaDaSemana,
  diasPraticados,
  lerMes,
  montarMes,
  segundosPorDia,
  semanaAtual,
  semanasSeguidas,
  somarMeses,
  textoHoras,
  textoMinutos,
  textoSequencia,
} from "@/lib/calendario";
import { diaNoFuso } from "@/lib/datas";

const porDia = segundosPorDia(
  [
    { dia: "2026-10-12", segundos: 25 * 60 },
    { dia: "2026-10-13", segundos: 5 * 60 },
    { dia: "2026-09-30", segundos: 20 * 60 },
  ],
  // tempo fora do app soma no mesmo dia
  [
    { dia: "2026-10-13", segundos: 30 * 60 },
    { dia: "2026-11-01", segundos: 10 * 60 },
  ],
);

describe("soma por dia", () => {
  it("junta tempo no app e fora do app", () => {
    expect(porDia.get("2026-10-13")).toBe(35 * 60);
    expect(porDia.get("2026-10-12")).toBe(25 * 60);
    expect(diasPraticados(porDia)).toBe(4);
  });
  it("ignora valores negativos", () => {
    expect(segundosPorDia([{ dia: "2026-01-01", segundos: -50 }]).get("2026-01-01")).toBe(0);
  });
});

describe("mês do calendário", () => {
  const out = montarMes("2026-10", porDia, "2026-10-18", 20);
  const dias = out.semanas.flat().filter((c) => c !== null);

  it("tem os 31 dias de outubro, começando na quinta-feira", () => {
    expect(dias).toHaveLength(31);
    expect(out.semanas[0].slice(0, 3)).toEqual([null, null, null]);
    expect(out.semanas[0][3]?.numero).toBe(1);
    expect(out.semanas.every((s) => s.length === 7)).toBe(true);
    expect(out.titulo).toBe("outubro de 2026");
  });

  it("rótulo acessível com minutos e meta", () => {
    const d12 = dias.find((d) => d.numero === 12)!;
    expect(d12.rotulo).toBe("12 de outubro, 25 minutos");
    expect(d12.cumprida).toBe(true);
    const d13 = dias.find((d) => d.numero === 13)!;
    expect(d13.minutos).toBe(35);
    expect(dias.find((d) => d.numero === 1)!.rotulo).toBe("1 de outubro, 0 minutos");
  });

  it("marca hoje e os dias futuros", () => {
    expect(dias.find((d) => d.hoje)?.numero).toBe(18);
    expect(dias.find((d) => d.numero === 18)!.rotulo).toBe("18 de outubro, 0 minutos (hoje)");
    expect(dias.find((d) => d.numero === 19)!.futuro).toBe(true);
    expect(dias.find((d) => d.numero === 19)!.rotulo).toBe("19 de outubro, ainda não chegou");
  });

  it("navegação: anterior sempre, próximo só até o mês atual", () => {
    expect(out.anterior).toBe("2026-09");
    expect(out.proximo).toBeNull();
    expect(montarMes("2026-09", porDia, "2026-10-18", 20).proximo).toBe("2026-10");
  });

  it("não mistura dias de meses vizinhos", () => {
    expect(out.totalSegundos).toBe(60 * 60);
    expect(montarMes("2026-09", porDia, "2026-10-18", 20).totalSegundos).toBe(20 * 60);
  });

  it("fevereiro bissexto e virada de ano", () => {
    const fev = montarMes("2028-02", new Map(), "2028-03-01", 20);
    expect(fev.semanas.flat().filter(Boolean)).toHaveLength(29);
    expect(somarMeses("2026-12", 1)).toBe("2027-01");
    expect(somarMeses("2026-01", -1)).toBe("2025-12");
  });
});

describe("mês da URL e fuso", () => {
  it("aceita AAAA-MM válido e recusa o resto", () => {
    expect(lerMes("2026-09", "2026-10-18")).toBe("2026-09");
    expect(lerMes("2026-13", "2026-10-18")).toBe("2026-10");
    expect(lerMes("abc", "2026-10-18")).toBe("2026-10");
    expect(lerMes(undefined, "2026-10-18")).toBe("2026-10");
    expect(lerMes(["2026-08", "2026-07"], "2026-10-18")).toBe("2026-08");
  });
  it("não vai para o futuro", () => {
    expect(lerMes("2027-01", "2026-10-18")).toBe("2026-10");
  });
  it("o mês atual depende do fuso: 31/10 23h30 UTC já é novembro em Madri", () => {
    const instante = new Date("2026-10-31T23:30:00Z");
    expect(lerMes(null, diaNoFuso(instante, "Europe/Madrid"))).toBe("2026-11");
    expect(lerMes(null, diaNoFuso(instante, "America/Sao_Paulo"))).toBe("2026-10");
    // O dia 1/11 em Madri recebe o tempo daquela noite.
    const cal = montarMes("2026-11", porDia, diaNoFuso(instante, "Europe/Madrid"), 20);
    expect(cal.semanas.flat().find((c) => c?.numero === 1)?.hoje).toBe(true);
    expect(cal.semanas.flat().find((c) => c?.numero === 1)?.minutos).toBe(10);
  });
});

describe("semana e sequência", () => {
  it("semana de segunda a domingo", () => {
    expect(diaDaSemana("2026-10-12")).toBe(0); // segunda
    expect(diaDaSemana("2026-10-18")).toBe(6); // domingo
    const s = semanaAtual(porDia, "2026-10-14", 20);
    expect(s.map((d) => d.dia)).toEqual([
      "2026-10-12",
      "2026-10-13",
      "2026-10-14",
      "2026-10-15",
      "2026-10-16",
      "2026-10-17",
      "2026-10-18",
    ]);
    expect(s.map((d) => d.cumprida)).toEqual([true, true, false, false, false, false, false]);
    expect(s[2].hoje).toBe(true);
    expect(s[3].futuro).toBe(true);
    expect(s[0].inicial).toBe("S");
  });

  it("semanas seguidas com prática", () => {
    // semana de 12/10 e semana de 28/09 (30/09) praticadas; semana de 05/10 vazia.
    expect(semanasSeguidas(porDia, "2026-10-14")).toBe(1);
    const continuo = segundosPorDia([
      { dia: "2026-10-01", segundos: 60 },
      { dia: "2026-10-08", segundos: 60 },
    ]);
    // Semana atual ainda sem prática: conta a partir da anterior.
    expect(semanasSeguidas(continuo, "2026-10-14")).toBe(2);
    expect(semanasSeguidas(new Map(), "2026-10-14")).toBe(0);
  });

  it("frase nunca culpa", () => {
    expect(textoSequencia({ dias: 0, cumpridaHoje: false, trofeu: false }).destaque).toBe(
      "Hoje é um bom dia para começar.",
    );
    expect(textoSequencia({ dias: 3, cumpridaHoje: true, trofeu: false })).toEqual({
      destaque: "3 dias seguidos.",
      resto: "Se pular um dia, tudo bem: você continua daqui.",
    });
    expect(textoSequencia({ dias: 1, cumpridaHoje: false, trofeu: false }).destaque).toBe(
      "1 dia seguido.",
    );
    for (const dias of [0, 1, 5]) {
      for (const cumpridaHoje of [true, false]) {
        const t = textoSequencia({ dias, cumpridaHoje, trofeu: false });
        expect(`${t.destaque} ${t.resto}`).not.toMatch(/perdeu|falhou|quebrou|culpa/i);
      }
    }
  });
});

describe("textos de tempo", () => {
  it("minutos e horas", () => {
    expect(textoMinutos(60)).toBe("1 minuto");
    expect(textoMinutos(25 * 60 + 59)).toBe("25 minutos");
    expect(textoMinutos(65 * 60)).toBe("1 h 05 min");
    expect(textoHoras(18 * 3600)).toBe("18 h");
    expect(textoHoras(2.5 * 3600)).toBe("2 h 30 min");
    expect(textoHoras(45 * 60)).toBe("45 min");
    expect(textoHoras(0)).toBe("0 min");
  });
});
