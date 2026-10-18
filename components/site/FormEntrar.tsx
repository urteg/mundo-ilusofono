"use client";

import Link from "next/link";
import { useId, useState, type FormEvent } from "react";
import { Botao } from "@/components/ui";

const formatoEmail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// TODO(Fase 2): enviar o link de acesso pelo Supabase (magic link) e respeitar ?proximo=.
export function FormEntrar() {
  const id = useId();
  const [email, setEmail] = useState("");
  const [estado, setEstado] = useState<"inicial" | "erro" | "em-breve">("inicial");

  function enviar(e: FormEvent) {
    e.preventDefault();
    setEstado(formatoEmail.test(email.trim()) ? "em-breve" : "erro");
  }

  return (
    <form onSubmit={enviar} noValidate className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label htmlFor={`${id}-email`} className="font-bold">
          Seu e-mail
        </label>
        <input
          id={`${id}-email`}
          type="email"
          autoComplete="email"
          placeholder="voce@email.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (estado !== "inicial") setEstado("inicial");
          }}
          aria-invalid={estado === "erro"}
          aria-describedby={`${id}-msg`}
          className="border-borda bg-branco aria-invalid:border-coral-texto min-h-12 rounded-full border-2 px-5"
        />
        <p id={`${id}-msg`} role="status" className="min-h-6 text-sm font-semibold">
          {estado === "erro" && (
            <span className="text-coral-texto">
              Esse e-mail não parece certo. Confira e tente de novo.
            </span>
          )}
          {estado === "em-breve" && (
            <span className="text-azul-fundo">
              Em breve. O acesso por e-mail chega na próxima etapa do site.
            </span>
          )}
        </p>
      </div>
      <Botao type="submit" className="w-full">
        Enviar link de acesso
      </Botao>
      <p className="text-texto-suave">Sem senha. Você recebe um link e entra.</p>
      <p className="text-texto-suave">
        Ainda não tem conta? <Link href="/desafio">Comece pelo Desafio 7 Dias</Link>
      </p>
    </form>
  );
}
