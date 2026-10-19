import { describe, expect, it } from "vitest";
import { inicioDosNiveis, nomesDosNiveis, sentidoDosNiveis } from "@/lib/niveis";

describe("nomes dos níveis", () => {
  it("um nome e uma frase para cada nível, sem repetir", () => {
    expect(nomesDosNiveis).toHaveLength(inicioDosNiveis.length);
    expect(sentidoDosNiveis).toHaveLength(inicioDosNiveis.length);
    expect(new Set(nomesDosNiveis).size).toBe(nomesDosNiveis.length);
  });
  it("frase em minúsculas e sem a palavra aprender", () => {
    for (const t of [...nomesDosNiveis, ...sentidoDosNiveis]) {
      expect(t).not.toMatch(/aprend/i);
    }
    expect(nomesDosNiveis.every((n) => n[0] === n[0].toUpperCase())).toBe(true);
    expect(nomesDosNiveis.slice(1).every((n) => !/\s[A-ZÁÉÍÓÚ]/.test(n))).toBe(true);
  });
});
