"use client";

import { useId, useState, useTransition } from "react";
import { salvarTempoFora } from "@/app/app/progresso/acoes";
import { Botao, Dialogo, Icone, cx } from "@/components/ui";
import {
  exemplosTipos,
  limiteNota,
  nomesTipos,
  tiposTempoFora,
  type TipoTempoFora,
} from "@/lib/tempo-fora";
import { avisar } from "./Avisos";

export type RegistroTempoFora = {
  id: string;
  tipo: TipoTempoFora;
  dia: string;
  segundos: number;
  nota: string | null;
};

type Props = {
  aberto: boolean;
  aoFechar: () => void;
  hoje: string;
  /** Com um registro, o diálogo edita; sem, adiciona. */
  registro?: RegistroTempoFora | null;
};

/** Registra tempo em português fora do app (conta nas horas e na meta do dia). */
export function DialogoTempoFora({ aberto, aoFechar, hoje, registro }: Props) {
  // A chave recria o formulário a cada abertura, com os valores certos.
  return (
    <Dialogo
      aberto={aberto}
      aoFechar={aoFechar}
      titulo={registro ? "Editar tempo fora do app" : "Adicionar tempo fora do app"}
    >
      {aberto && (
        <Formulario
          key={registro?.id ?? "novo"}
          hoje={hoje}
          registro={registro ?? null}
          aoFechar={aoFechar}
        />
      )}
    </Dialogo>
  );
}

function Formulario({
  hoje,
  registro,
  aoFechar,
}: {
  hoje: string;
  registro: RegistroTempoFora | null;
  aoFechar: () => void;
}) {
  const id = useId();
  const [tipo, setTipo] = useState<TipoTempoFora>(registro?.tipo ?? "assistindo");
  const [nota, setNota] = useState(registro?.nota ?? "");
  const [erro, setErro] = useState<string | null>(null);
  const [pendente, iniciar] = useTransition();
  const minutosIniciais = registro ? Math.round(registro.segundos / 60) : 30;

  return (
    <form
      className="flex flex-col gap-5"
      onSubmit={(e) => {
        // onSubmit (e não action) para não limpar os campos quando o servidor recusa.
        e.preventDefault();
        const dados = new FormData(e.currentTarget);
        iniciar(async () => {
          const r = await salvarTempoFora(dados);
          if (!r.ok) return setErro(r.erro);
          aoFechar();
          avisar(
            registro ? "Salvo." : "Salvo. Esse tempo já entrou nas suas horas e na meta do dia.",
          );
        });
      }}
    >
      {registro && <input type="hidden" name="id" value={registro.id} />}
      <input type="hidden" name="tipo" value={tipo} />
      <p className="text-texto-suave">
        Série, podcast, conversa com amigos: tudo em português conta.
      </p>

      <div className="flex flex-col gap-2">
        <span id={`${id}-tipo`} className="font-bold">
          O que você fez?
        </span>
        <div
          role="radiogroup"
          aria-labelledby={`${id}-tipo`}
          className="flex flex-wrap gap-2"
          onKeyDown={(e) => {
            const i = tiposTempoFora.indexOf(tipo);
            const passo =
              e.key === "ArrowRight" || e.key === "ArrowDown"
                ? 1
                : e.key === "ArrowLeft" || e.key === "ArrowUp"
                  ? -1
                  : 0;
            if (!passo) return;
            e.preventDefault();
            const novo =
              tiposTempoFora[(i + passo + tiposTempoFora.length) % tiposTempoFora.length];
            setTipo(novo);
            e.currentTarget.querySelector<HTMLElement>(`[data-valor="${novo}"]`)?.focus();
          }}
        >
          {tiposTempoFora.map((t) => {
            const marcado = tipo === t;
            return (
              <button
                key={t}
                type="button"
                role="radio"
                aria-checked={marcado}
                tabIndex={marcado ? 0 : -1}
                data-valor={t}
                onClick={() => setTipo(t)}
                className={cx(
                  "flex min-h-11 flex-col items-start rounded-xl border-2 px-3 py-1.5 text-left",
                  marcado
                    ? "border-azul-acao bg-azul-claro text-azul-fundo"
                    : "border-borda bg-branco hover:border-azul-acao",
                )}
              >
                <span className="flex items-center gap-1.5 font-bold">
                  {marcado && <Icone nome="check" tamanho={16} strokeWidth={3} />}
                  {nomesTipos[t]}
                </span>
                <span className="text-texto-suave text-xs">{exemplosTipos[t]}</span>
              </button>
            );
          })}
        </div>
      </div>

      <label className="flex flex-col gap-1.5 font-bold" htmlFor={`${id}-dia`}>
        Data
        <input
          id={`${id}-dia`}
          name="dia"
          type="date"
          max={hoje}
          min="2000-01-01"
          required
          defaultValue={registro?.dia ?? hoje}
          className="border-borda bg-branco min-h-11 rounded-xl border-2 px-3 font-normal"
        />
      </label>

      <fieldset className="flex flex-col gap-1.5">
        <legend className="mb-1.5 font-bold">Duração</legend>
        <div className="flex items-center gap-2">
          <input
            id={`${id}-h`}
            name="horas"
            type="number"
            inputMode="numeric"
            min={0}
            max={12}
            step={1}
            defaultValue={Math.floor(minutosIniciais / 60)}
            aria-label="Horas"
            className="border-borda bg-branco min-h-11 w-full min-w-0 rounded-xl border-2 px-3"
          />
          <span aria-hidden="true" className="text-texto-suave">
            h
          </span>
          <input
            id={`${id}-min`}
            name="minutos"
            type="number"
            inputMode="numeric"
            min={0}
            max={59}
            step={1}
            defaultValue={minutosIniciais % 60}
            aria-label="Minutos"
            className="border-borda bg-branco min-h-11 w-full min-w-0 rounded-xl border-2 px-3"
          />
          <span aria-hidden="true" className="text-texto-suave">
            min
          </span>
        </div>
        <span className="text-texto-suave text-sm">De 1 minuto a 12 horas.</span>
      </fieldset>

      <label className="flex flex-col gap-1.5 font-bold" htmlFor={`${id}-nota`}>
        <span>
          Nota <span className="text-texto-suave font-normal">(opcional)</span>
        </span>
        <input
          id={`${id}-nota`}
          name="nota"
          maxLength={limiteNota}
          value={nota}
          onChange={(e) => setNota(e.target.value)}
          placeholder="Ex.: um episódio de série"
          aria-describedby={`${id}-cont`}
          className="border-borda bg-branco min-h-11 rounded-xl border-2 px-3 font-normal"
        />
        <span id={`${id}-cont`} className="text-texto-suave text-right text-sm font-normal">
          {nota.length} de {limiteNota} caracteres
        </span>
      </label>

      <p role="alert" className="text-coral-texto min-h-6 text-sm font-semibold">
        {erro}
      </p>
      <div className="flex flex-wrap justify-end gap-3">
        <Botao variante="secundario" onClick={aoFechar}>
          Cancelar
        </Botao>
        <Botao type="submit" disabled={pendente}>
          {pendente ? "Salvando..." : "Salvar"}
        </Botao>
      </div>
    </form>
  );
}
