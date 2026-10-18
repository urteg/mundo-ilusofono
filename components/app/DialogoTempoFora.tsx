"use client";

import { useId, useState, useTransition } from "react";
import { adicionarTempoFora } from "@/app/app/acoes";
import { Botao, Dialogo } from "@/components/ui";

const tipos = [
  { valor: "assistindo", rotulo: "Assistindo (série, filme, vídeo)" },
  { valor: "ouvindo", rotulo: "Ouvindo (podcast, música, rádio)" },
  { valor: "conversando", rotulo: "Conversando com alguém" },
];

type Props = { aberto: boolean; aoFechar: () => void; hoje: string };

/** Registra tempo em português fora do app (conta nas horas, não na meta do dia). */
export function DialogoTempoFora({ aberto, aoFechar, hoje }: Props) {
  const id = useId();
  const [erro, setErro] = useState<string | null>(null);
  const [salvo, setSalvo] = useState(false);
  const [pendente, iniciar] = useTransition();

  function fechar() {
    setErro(null);
    setSalvo(false);
    aoFechar();
  }

  return (
    <Dialogo aberto={aberto} aoFechar={fechar} titulo="Adicionar tempo fora do app">
      {salvo ? (
        <div className="flex flex-col items-start gap-4" role="status">
          <p>Pronto. Esse tempo já entrou nas suas horas.</p>
          <Botao onClick={fechar}>Fechar</Botao>
        </div>
      ) : (
        <form
          className="flex flex-col gap-4"
          action={(dados) =>
            iniciar(async () => {
              const r = await adicionarTempoFora(dados);
              if (r.ok) setSalvo(true);
              else setErro(r.erro);
            })
          }
        >
          <p className="text-texto-suave">
            Conte o tempo que você passou assistindo, ouvindo ou conversando em português fora do
            app.
          </p>
          <fieldset className="flex flex-col gap-2">
            <legend className="mb-1 font-bold">O que você fez</legend>
            {tipos.map((t, i) => (
              <label
                key={t.valor}
                className="border-areia flex min-h-11 items-center gap-3 rounded-xl border-2 px-3"
              >
                <input
                  type="radio"
                  name="tipo"
                  value={t.valor}
                  defaultChecked={i === 0}
                  className="accent-azul-acao size-5"
                />
                {t.rotulo}
              </label>
            ))}
          </fieldset>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5 font-bold" htmlFor={`${id}-min`}>
              Minutos
              <input
                id={`${id}-min`}
                name="minutos"
                type="number"
                inputMode="numeric"
                min={1}
                max={720}
                required
                defaultValue={30}
                className="border-borda min-h-11 rounded-xl border-2 px-3 font-normal"
              />
            </label>
            <label className="flex flex-col gap-1.5 font-bold" htmlFor={`${id}-dia`}>
              Dia
              <input
                id={`${id}-dia`}
                name="dia"
                type="date"
                max={hoje}
                required
                defaultValue={hoje}
                className="border-borda min-h-11 rounded-xl border-2 px-3 font-normal"
              />
            </label>
          </div>
          <label className="flex flex-col gap-1.5 font-bold" htmlFor={`${id}-nota`}>
            Nota (opcional)
            <input
              id={`${id}-nota`}
              name="nota"
              maxLength={200}
              placeholder="Ex.: um episódio de série"
              className="border-borda min-h-11 rounded-xl border-2 px-3 font-normal"
            />
          </label>
          <p role="alert" className="text-coral-texto min-h-6 text-sm font-semibold">
            {erro}
          </p>
          <div className="flex flex-wrap justify-end gap-3">
            <Botao variante="discreto" onClick={fechar}>
              Cancelar
            </Botao>
            <Botao type="submit" disabled={pendente}>
              {pendente ? "Salvando..." : "Salvar"}
            </Botao>
          </div>
        </form>
      )}
    </Dialogo>
  );
}
