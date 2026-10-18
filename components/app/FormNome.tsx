"use client";

import { useId, useState, useTransition } from "react";
import { salvarNome } from "@/app/app/conta/acoes";
import { Botao, cx } from "@/components/ui";

/** Nome editável; o e-mail aparece só para leitura (é o login por link). */
export function FormNome({ nome, email }: { nome: string | null; email: string }) {
  const id = useId();
  const [valor, setValor] = useState(nome ?? "");
  const [mensagem, setMensagem] = useState<{ ok: boolean; texto: string } | null>(null);
  const [pendente, iniciar] = useTransition();
  const inicial = (valor.trim() || email).charAt(0).toUpperCase();

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        const dados = new FormData(e.currentTarget);
        iniciar(async () => {
          const r = await salvarNome(dados);
          setMensagem(r.ok ? { ok: true, texto: "Salvo." } : { ok: false, texto: r.erro });
        });
      }}
    >
      <div className="flex items-center gap-4">
        <span
          aria-hidden="true"
          className="bg-azul-claro text-azul-acao font-titulo grid size-14 shrink-0 place-items-center rounded-full text-2xl font-bold"
        >
          {inicial}
        </span>
        <div className="flex min-w-0 flex-col">
          <span className="font-titulo text-azul-fundo truncate text-xl font-semibold">
            {valor.trim() || "Sem nome"}
          </span>
          <span className="text-texto-suave truncate text-sm">{email}</span>
        </div>
      </div>
      <label htmlFor={`${id}-nome`} className="flex flex-col gap-1.5 font-bold">
        Nome
        <input
          id={`${id}-nome`}
          name="nome"
          value={valor}
          maxLength={80}
          autoComplete="name"
          onChange={(e) => {
            setValor(e.target.value);
            setMensagem(null);
          }}
          className="border-borda bg-branco min-h-11 rounded-xl border-2 px-3 font-normal"
        />
      </label>
      <div className="flex flex-col gap-1.5">
        <label htmlFor={`${id}-email`} className="font-bold">
          E-mail
        </label>
        <input
          id={`${id}-email`}
          value={email}
          readOnly
          aria-describedby={`${id}-email-nota`}
          className="border-borda bg-papel-escuro text-texto-suave min-h-11 rounded-xl border-2 px-3"
        />
        <span id={`${id}-email-nota`} className="text-texto-suave text-sm">
          É o e-mail do seu link de acesso. Para trocar, fale com a gente.
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <Botao type="submit" variante="secundario" disabled={pendente}>
          {pendente ? "Salvando..." : "Salvar nome"}
        </Botao>
        <p
          role="status"
          className={cx("font-bold", mensagem?.ok ? "text-[#00684F]" : "text-coral-texto")}
        >
          {mensagem?.texto}
        </p>
      </div>
    </form>
  );
}
