import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { BarraProgresso, Botao, Chip, Icone, Pilula, SeloPlano } from "@/components/ui";

describe("componentes base", () => {
  it("botão dispara clique e tem type=button por padrão", async () => {
    const aoClicar = vi.fn();
    render(<Botao onClick={aoClicar}>Começar</Botao>);
    const botao = screen.getByRole("button", { name: "Começar" });
    expect(botao).toHaveAttribute("type", "button");
    await userEvent.click(botao);
    expect(aoClicar).toHaveBeenCalledOnce();
  });

  it("chip expõe o estado com aria-pressed", () => {
    render(<Chip ativo>Nível 1</Chip>);
    expect(screen.getByRole("button", { name: "Nível 1" })).toHaveAttribute("aria-pressed", "true");
  });

  it("ícone sem rótulo é decorativo; com rótulo é anunciado", () => {
    const { container } = render(<Icone nome="play" />);
    expect(container.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
    render(<Icone nome="cadeado" rotulo="Bloqueado" />);
    expect(screen.getByRole("img", { name: "Bloqueado" })).toBeInTheDocument();
  });

  it("barra de progresso limita o preenchimento a 100%", () => {
    const { container } = render(<BarraProgresso valor={30} maximo={20} rotulo="Meta" />);
    const barra = screen.getByRole("progressbar", { name: "Meta" });
    expect(barra).toHaveAttribute("aria-valuenow", "30");
    expect((container.querySelector("[style]") as HTMLElement).style.width).toBe("100%");
  });

  it("pílulas anunciam meta e sequência em português", () => {
    render(
      <>
        <Pilula tipo="meta" minutos={20} metaMin={20} />
        <Pilula tipo="sequencia" dias={1} />
      </>,
    );
    expect(screen.getByLabelText("Meta de hoje: 20 de 20 minutos, cumprida")).toBeInTheDocument();
    expect(screen.getByLabelText("Sequência: 1 dia")).toBeInTheDocument();
  });

  it("selo de plano bloqueado avisa leitores de tela", () => {
    render(<SeloPlano plano="participar" bloqueado />);
    expect(screen.getByText("(bloqueado no seu plano)")).toBeInTheDocument();
  });
});
