"use client";

import { useState } from "react";
import { Botao, Dialogo, classesBotao } from "@/components/ui";

/** Baixar os próprios dados e excluir a conta (com confirmação em duas etapas). */
export function BlocoDados({ email }: { email: string }) {
  const [etapa, setEtapa] = useState<0 | 1 | 2>(0);
  const [digitado, setDigitado] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [excluindo, setExcluindo] = useState(false);
  const confere = digitado.trim().toLowerCase() === email.toLowerCase();

  const fechar = () => {
    setEtapa(0);
    setDigitado("");
    setErro(null);
  };

  async function excluir() {
    setExcluindo(true);
    setErro(null);
    try {
      const r = await fetch("/api/conta/excluir", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmacao: digitado.trim() }),
      });
      if (!r.ok) throw new Error();
      window.location.assign("/conta-excluida");
    } catch {
      setErro("Não foi possível excluir agora. Tente de novo ou fale com a gente.");
      setExcluindo(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-texto-suave">
        Você pode baixar uma cópia dos seus dados (perfil, vídeos assistidos e tempo fora do app) ou
        excluir sua conta.
      </p>
      <div className="flex flex-wrap gap-3">
        <a href="/api/conta/dados" download className={classesBotao("secundario")}>
          Baixar meus dados
        </a>
        <Botao variante="discreto" className="text-coral-texto" onClick={() => setEtapa(1)}>
          Excluir minha conta
        </Botao>
      </div>

      <Dialogo
        aberto={etapa === 1}
        aoFechar={() => etapa === 1 && fechar()}
        titulo="Excluir sua conta?"
        rodape={
          <>
            <Botao variante="secundario" onClick={fechar}>
              Cancelar
            </Botao>
            <Botao onClick={() => setEtapa(2)}>Continuar</Botao>
          </>
        }
      >
        <div className="flex flex-col gap-3">
          <p>
            Isso apaga para sempre o seu perfil, o histórico de vídeos, as horas, o tempo fora do
            app e as preferências. Não dá para desfazer.
          </p>
          <p className="text-texto-suave">
            Se você tem um plano pago, cancele a assinatura antes, para não ser cobrado de novo. Se
            quiser, baixe seus dados primeiro.
          </p>
        </div>
      </Dialogo>

      <Dialogo
        aberto={etapa === 2}
        aoFechar={() => etapa === 2 && fechar()}
        titulo="Confirme a exclusão"
        rodape={
          <>
            <Botao variante="secundario" onClick={fechar}>
              Cancelar
            </Botao>
            <Botao
              disabled={!confere || excluindo}
              onClick={excluir}
              className="bg-coral-texto border-coral-texto hover:bg-fogo"
            >
              {excluindo ? "Excluindo..." : "Excluir para sempre"}
            </Botao>
          </>
        }
      >
        <label className="flex flex-col gap-2">
          <span>
            Para confirmar, escreva o seu e-mail: <b className="break-all">{email}</b>
          </span>
          <input
            value={digitado}
            onChange={(e) => setDigitado(e.target.value)}
            autoComplete="off"
            inputMode="email"
            className="border-borda bg-branco min-h-11 rounded-xl border-2 px-3"
          />
        </label>
        {erro && (
          <p role="alert" className="text-coral-texto mt-3 font-semibold">
            {erro}
          </p>
        )}
      </Dialogo>
    </div>
  );
}
