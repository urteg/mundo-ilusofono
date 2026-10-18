import { describe, expect, it } from "vitest";
import { caminhoSeguro } from "@/lib/redirecionamento";

describe("caminhoSeguro (?proximo=)", () => {
  it.each([
    ["/app", "/app"],
    ["/app/planos", "/app/planos"],
    ["/app/assistir?nivel=2#topo", "/app/assistir?nivel=2#topo"],
    ["%2Fapp%2Fplanos", "/app/planos"],
    ["/app/../planos", "/planos"],
  ])("aceita caminho interno %s", (entrada, esperado) => {
    expect(caminhoSeguro(entrada)).toBe(esperado);
  });

  it.each([
    [null],
    [undefined],
    [""],
    ["app"],
    ["https://golpe.example/app"],
    ["//golpe.example"],
    ["/\\golpe.example"],
    ["%2F%2Fgolpe.example"],
    ["/\tgolpe"],
    ["javascript:alert(1)"],
    ["%E0%A4%A"],
    ["\\\\golpe.example"],
  ])("rejeita %s e usa /app", (entrada) => {
    expect(caminhoSeguro(entrada)).toBe("/app");
  });

  it("aceita um caminho de reserva", () => {
    expect(caminhoSeguro("https://x.example", "/")).toBe("/");
  });
});
