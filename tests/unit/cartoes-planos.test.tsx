import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

let busca = "";
vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(busca),
}));

const ir = vi.fn();
vi.mock("@/lib/navegar", () => ({ irPara: (url: string) => ir(url) }));

import { CartoesPlanos } from "@/components/site/CartoesPlanos";

describe("alternador de planos", () => {
  beforeEach(() => {
    busca = "";
    window.history.replaceState(null, "", "/planos");
  });

  it("começa no anual quando a URL não diz nada", () => {
    render(<CartoesPlanos />);
    expect(screen.getByRole("button", { name: /Anual/ })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByTestId("preco-entender")).toHaveTextContent("€55");
    expect(screen.getByTestId("nota-participar")).toHaveTextContent("equivale a €8,25 por mês");
    expect(screen.getAllByText("por ano, IVA incluído")).toHaveLength(2);
  });

  it("respeita ?intervalo=mensal", () => {
    busca = "intervalo=mensal";
    render(<CartoesPlanos />);
    expect(screen.getByTestId("preco-participar")).toHaveTextContent("€13,99");
  });

  it("muda preço, unidade e nota e atualiza a URL", async () => {
    render(<CartoesPlanos />);
    await userEvent.click(screen.getByRole("button", { name: "Mensal" }));
    expect(screen.getByRole("button", { name: "Mensal" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByTestId("preco-entender")).toHaveTextContent("€7,99");
    expect(screen.getByTestId("preco-participar")).toHaveTextContent("€13,99");
    expect(screen.getAllByText("por mês, IVA incluído")).toHaveLength(2);
    expect(screen.getByTestId("nota-entender")).toHaveTextContent("ou €55 por ano");
    expect(window.location.search).toBe("?intervalo=mensal");

    await userEvent.click(screen.getByRole("button", { name: /Anual/ }));
    expect(screen.getByTestId("nota-entender")).toHaveTextContent("equivale a €4,58 por mês");
    expect(window.location.search).toBe("?intervalo=anual");
  });

  it("assinar chama o checkout com o plano e o intervalo escolhidos", async () => {
    const pedidos: unknown[] = [];
    ir.mockClear();
    vi.stubGlobal(
      "fetch",
      vi.fn(async (_url: string, init: RequestInit) => {
        pedidos.push(JSON.parse(String(init.body)));
        return new Response(JSON.stringify({ url: "https://checkout.stripe.com/c/x" }));
      }),
    );
    render(<CartoesPlanos />);
    await userEvent.click(screen.getByRole("button", { name: "Mensal" }));
    await userEvent.click(screen.getByRole("button", { name: "Assinar o Participar" }));
    expect(pedidos).toEqual([{ produto: "participar", intervalo: "mensal" }]);
    expect(ir).toHaveBeenCalledWith("https://checkout.stripe.com/c/x");
    vi.unstubAllGlobals();
  });

  it("sem sessão: vai para o login e volta para a página", async () => {
    ir.mockClear();
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("{}", { status: 401 })),
    );
    window.history.replaceState(null, "", "/planos?intervalo=anual");
    render(<CartoesPlanos />);
    await userEvent.click(screen.getByRole("button", { name: "Assinar o Entender" }));
    expect(ir).toHaveBeenCalledWith("/entrar?proximo=%2Fplanos%3Fintervalo%3Danual");
    vi.unstubAllGlobals();
  });
});
