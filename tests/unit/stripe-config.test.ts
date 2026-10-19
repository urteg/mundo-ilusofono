// @vitest-environment node
import { describe, expect, it, vi } from "vitest";
import { precoStripe, produtoDoPreco, valorEsperado, variavelPreco } from "@/lib/precos";

vi.mock("server-only", () => ({}));
const { validarChave, variavelObrigatoria } = await import("@/lib/stripe");

describe("configuração do Stripe", () => {
  it("só aceita chave de teste", () => {
    expect(() => validarChave("sk_test_abc")).not.toThrow();
    expect(() => validarChave("rk_test_abc")).not.toThrow();
    expect(() => validarChave("sk_live_abc")).toThrow(/chave de produção/);
    expect(() => validarChave("pk_test_abc")).toThrow(/não parece/);
  });

  it("variável faltando: mensagem clara com o nome, sem valores", () => {
    delete process.env.NAO_EXISTE_X;
    expect(() => variavelObrigatoria("NAO_EXISTE_X")).toThrow(
      "Falta a variável de ambiente NAO_EXISTE_X",
    );
  });

  it("mapeia {produto, intervalo} para STRIPE_PRICE_* e de volta", () => {
    expect(variavelPreco("desafio")).toBe("STRIPE_PRICE_DESAFIO");
    expect(variavelPreco("participar", "anual")).toBe("STRIPE_PRICE_PARTICIPAR_ANUAL");
    process.env.STRIPE_PRICE_ENTENDER_MENSAL = "price_abc";
    expect(precoStripe("entender", "mensal")).toBe("price_abc");
    expect(produtoDoPreco("price_abc")).toEqual({ produto: "entender", intervalo: "mensal" });
    expect(produtoDoPreco("price_outro")).toBeNull();
    delete process.env.STRIPE_PRICE_PARTICIPAR_MENSAL;
    expect(() => precoStripe("participar", "mensal")).toThrow("STRIPE_PRICE_PARTICIPAR_MENSAL");
  });

  it("valores esperados no Stripe batem com a tabela de preços (IVA incluído)", () => {
    expect(valorEsperado("desafio")).toBe(990);
    expect(valorEsperado("entender", "mensal")).toBe(799);
    expect(valorEsperado("entender", "anual")).toBe(5500);
    expect(valorEsperado("participar", "mensal")).toBe(1399);
    expect(valorEsperado("participar", "anual")).toBe(9900);
  });
});
