import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

let busca = "";
vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(busca),
}));

import { CartoesPlanos, destinoAssinar } from "@/components/site/CartoesPlanos";

describe("alternador de planos", () => {
  beforeEach(() => {
    busca = "";
    window.history.replaceState(null, "", "/planos");
  });

  it("começa no anual quando a URL não diz nada", () => {
    render(<CartoesPlanos />);
    expect(screen.getByRole("button", { name: /Anual/ })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByTestId("preco-entender")).toHaveTextContent("€49");
    expect(screen.getByTestId("nota-participar")).toHaveTextContent("equivale a €7,42 por mês");
    expect(screen.getAllByText("por ano + IVA")).toHaveLength(2);
  });

  it("respeita ?intervalo=mensal", () => {
    busca = "intervalo=mensal";
    render(<CartoesPlanos />);
    expect(screen.getByTestId("preco-participar")).toHaveTextContent("€12,99");
  });

  it("muda preço, unidade e nota e atualiza a URL", async () => {
    render(<CartoesPlanos />);
    await userEvent.click(screen.getByRole("button", { name: "Mensal" }));
    expect(screen.getByRole("button", { name: "Mensal" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByTestId("preco-entender")).toHaveTextContent("€6,99");
    expect(screen.getByTestId("preco-participar")).toHaveTextContent("€12,99");
    expect(screen.getAllByText("por mês + IVA")).toHaveLength(2);
    expect(screen.getByTestId("nota-entender")).toHaveTextContent("ou €49 por ano");
    expect(window.location.search).toBe("?intervalo=mensal");

    await userEvent.click(screen.getByRole("button", { name: /Anual/ }));
    expect(screen.getByTestId("nota-entender")).toHaveTextContent("equivale a €4,08 por mês");
    expect(window.location.search).toBe("?intervalo=anual");
  });

  it("botões de assinar levam ao login até a Fase 4", () => {
    render(<CartoesPlanos />);
    for (const nome of ["Assinar o Entender", "Assinar o Participar"]) {
      expect(screen.getByRole("link", { name: nome })).toHaveAttribute("href", destinoAssinar);
    }
  });
});
