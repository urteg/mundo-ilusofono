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
  it("formata no padrão €7,99 e €55, sem espaço depois do símbolo", () => {
    expect(formatarEuro(799)).toBe("€7,99");
    expect(formatarEuro(5500)).toBe("€55");
    expect(formatarEuro(precos.desafio)).toBe("€9,90");
  });

  it("tem os quatro preços das assinaturas", () => {
    expect(precoPlano("entender", "mensal")).toBe("€7,99");
    expect(precoPlano("entender", "anual")).toBe("€55");
    expect(precoPlano("participar", "mensal")).toBe("€13,99");
    expect(precoPlano("participar", "anual")).toBe("€99");
  });

  it("mostra o equivalente mensal no anual", () => {
    expect(notaPlano("entender", "anual")).toBe("equivale a €4,58 por mês");
    expect(notaPlano("participar", "anual")).toBe("equivale a €8,25 por mês");
  });

  it("mostra o preço anual como alternativa no mensal", () => {
    expect(notaPlano("entender", "mensal")).toBe("ou €55 por ano");
    expect(notaPlano("participar", "mensal")).toBe("ou €99 por ano");
  });

  it("unidade, intervalo padrão e aviso de imposto", () => {
    expect(unidade("mensal")).toBe("por mês");
    expect(unidade("anual")).toBe("por ano");
    expect(lerIntervalo("mensal")).toBe("mensal");
    expect(lerIntervalo(null)).toBe("anual");
    expect(lerIntervalo("qualquer")).toBe("anual");
    expect(avisoImposto).toMatch(/já incluem o IVA/);
  });
});
