import { describe, expect, it } from "vitest";
import {
  avisoImposto,
  formatarEuro,
  lerIntervalo,
  notaPlano,
  precoPlano,
  precos,
  unidade,
} from "@/lib/precos";

describe("lib/precos", () => {
  it("formata no padrão €6,99 e €49, sem espaço depois do símbolo", () => {
    expect(formatarEuro(699)).toBe("€6,99");
    expect(formatarEuro(4900)).toBe("€49");
    expect(formatarEuro(precos.desafio)).toBe("€9");
  });

  it("tem os quatro preços das assinaturas", () => {
    expect(precoPlano("entender", "mensal")).toBe("€6,99");
    expect(precoPlano("entender", "anual")).toBe("€49");
    expect(precoPlano("participar", "mensal")).toBe("€12,99");
    expect(precoPlano("participar", "anual")).toBe("€89");
  });

  it("mostra o equivalente mensal no anual", () => {
    expect(notaPlano("entender", "anual")).toBe("equivale a €4,08 por mês");
    expect(notaPlano("participar", "anual")).toBe("equivale a €7,42 por mês");
  });

  it("mostra o preço anual como alternativa no mensal", () => {
    expect(notaPlano("entender", "mensal")).toBe("ou €49 por ano");
    expect(notaPlano("participar", "mensal")).toBe("ou €89 por ano");
  });

  it("unidade, intervalo padrão e aviso de imposto", () => {
    expect(unidade("mensal")).toBe("por mês");
    expect(unidade("anual")).toBe("por ano");
    expect(lerIntervalo("mensal")).toBe("mensal");
    expect(lerIntervalo(null)).toBe("anual");
    expect(lerIntervalo("qualquer")).toBe("anual");
    expect(avisoImposto).toMatch(/não incluem imposto/);
  });
});
