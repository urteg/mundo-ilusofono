"use client";

import { useState, useTransition } from "react";
import { excluirTempoFora } from "@/app/app/progresso/acoes";
import { Botao, Dialogo, Icone } from "@/components/ui";
import { textoHoras } from "@/lib/calendario";
import { nomesTipos } from "@/lib/tempo-fora";
import { avisar } from "./Avisos";
import { DialogoTempoFora, type RegistroTempoFora } from "./DialogoTempoFora";

const formatoData = new Intl.DateTimeFormat("pt-BR", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

export function dataCurta(dia: string) {
  return formatoData.format(new Date(`${dia}T12:00:00Z`)).replace(/\./g, "");
}

/** Lista dos registros de tempo fora do app, com adicionar, editar e excluir. */
export function ListaTempoFora({
  registros,
  hoje,
}: {
  registros: RegistroTempoFora[];
  hoje: string;
}) {
  const [editando, setEditando] = useState<RegistroTempoFora | null>(null);
  const [novo, setNovo] = useState(false);
  const [excluindo, setExcluindo] = useState<RegistroTempoFora | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [pendente, iniciar] = useTransition();
  const total = registros.reduce((t, r) => t + r.segundos, 0);

  const acoes = (r: RegistroTempoFora) => (
    <div className="flex gap-1">
      <button
        type="button"
        onClick={() => setEditando(r)}
        className="text-azul-acao hover:bg-areia inline-flex min-h-11 items-center gap-1.5 rounded-full px-3 font-bold"
      >
        Editar<span className="sr-only">: {descricao(r)}</span>
      </button>
      <button
        type="button"
        onClick={() => {
          setErro(null);
          setExcluindo(r);
        }}
        className="text-coral-texto hover:bg-areia inline-flex min-h-11 items-center gap-1.5 rounded-full px-3 font-bold"
      >
        Excluir<span className="sr-only">: {descricao(r)}</span>
      </button>
    </div>
  );

  return (
    <div className="flex flex-col gap-5">
      <div>
        <Botao onClick={() => setNovo(true)} className="gap-2">
          <Icone nome="mais" tamanho={20} />
          Adicionar tempo
        </Botao>
      </div>

      {registros.length === 0 ? (
        <div className="rounded-card bg-branco shadow-card p-7">
          <p className="text-lg font-bold">Nenhum registro ainda.</p>
          <p className="text-texto-suave">
            Assistiu a uma série, ouviu um podcast ou conversou em português? Adicione aqui: conta
            nas suas horas e na meta do dia.
          </p>
        </div>
      ) : (
        <div className="rounded-card bg-branco shadow-card overflow-hidden">
          {/* Tabela no desktop */}
          <table className="hidden w-full text-left md:table">
            <caption className="sr-only">Registros de tempo fora do app</caption>
            <thead className="border-borda border-b">
              <tr className="text-texto-suave text-sm">
                <th scope="col" className="px-6 py-4">
                  Tipo
                </th>
                <th scope="col" className="px-3 py-4">
                  Data
                </th>
                <th scope="col" className="px-3 py-4">
                  Duração
                </th>
                <th scope="col" className="px-3 py-4">
                  Nota
                </th>
                <th scope="col" className="px-6 py-4">
                  <span className="sr-only">Ações</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {registros.map((r) => (
                <tr
                  key={r.id}
                  className="border-borda border-b last:border-0"
                  data-testid="registro"
                >
                  <td className="px-6 py-3 font-bold">{nomesTipos[r.tipo]}</td>
                  <td className="px-3 py-3 whitespace-nowrap">{dataCurta(r.dia)}</td>
                  <td className="px-3 py-3 whitespace-nowrap">{textoHoras(r.segundos)}</td>
                  <td className="text-texto-suave px-3 py-3 break-words">{r.nota}</td>
                  <td className="px-6 py-1 text-right">{acoes(r)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* Lista no celular */}
          <ul className="md:hidden">
            {registros.map((r) => (
              <li
                key={r.id}
                className="border-borda flex flex-col gap-1 border-b p-4 last:border-0"
                data-testid="registro-celular"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <span className="font-bold">{nomesTipos[r.tipo]}</span>
                  <span className="whitespace-nowrap">{textoHoras(r.segundos)}</span>
                </div>
                <span className="text-texto-suave text-sm">{dataCurta(r.dia)}</span>
                {r.nota && <p className="text-texto-suave text-sm break-words">{r.nota}</p>}
                {acoes(r)}
              </li>
            ))}
          </ul>
          <p className="bg-papel-escuro px-6 py-4 font-bold" data-testid="total-fora">
            Total fora do app: {textoHoras(total)}
          </p>
        </div>
      )}

      <DialogoTempoFora
        aberto={novo || editando !== null}
        registro={editando}
        hoje={hoje}
        aoFechar={() => {
          setNovo(false);
          setEditando(null);
        }}
      />

      <Dialogo
        aberto={excluindo !== null}
        aoFechar={() => setExcluindo(null)}
        titulo="Excluir este registro?"
        rodape={
          <>
            <Botao variante="secundario" onClick={() => setExcluindo(null)}>
              Cancelar
            </Botao>
            <Botao
              disabled={pendente}
              className="bg-coral-texto border-coral-texto hover:bg-fogo"
              onClick={() =>
                excluindo &&
                iniciar(async () => {
                  const r = await excluirTempoFora(excluindo.id);
                  if (!r.ok) return setErro(r.erro);
                  setExcluindo(null);
                  avisar("Registro excluído.");
                })
              }
            >
              {pendente ? "Excluindo..." : "Excluir"}
            </Botao>
          </>
        }
      >
        {excluindo && (
          <p>{descricao(excluindo)}. Esse tempo sai das suas horas e da meta daquele dia.</p>
        )}
        {erro && (
          <p role="alert" className="text-coral-texto mt-3 font-semibold">
            {erro}
          </p>
        )}
      </Dialogo>
    </div>
  );
}

function descricao(r: RegistroTempoFora) {
  return `${nomesTipos[r.tipo]}, ${dataCurta(r.dia)}, ${textoHoras(r.segundos)}`;
}
