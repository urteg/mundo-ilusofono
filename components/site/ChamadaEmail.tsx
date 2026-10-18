"use client";

import { useId, useState, type FormEvent } from "react";
import { BotaoLink } from "@/components/ui";

const formatoEmail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Campo de e-mail da chamada final. Por enquanto só valida; nada é enviado. */
export function ChamadaEmail() {
  const id = useId();
  const [email, setEmail] = useState("");
  const [estado, setEstado] = useState<"inicial" | "erro" | "em-breve">("inicial");

  function enviar(e: FormEvent) {
    e.preventDefault();
    setEstado(formatoEmail.test(email.trim()) ? "em-breve" : "erro");
  }

  return (
    <form
      onSubmit={enviar}
      noValidate
      className="flex w-full max-w-xl flex-col gap-3 text-left"
      aria-describedby={`${id}-msg`}
    >
      <label htmlFor={`${id}-email`} className="text-branco font-bold">
        Seu e-mail
      </label>
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          id={`${id}-email`}
          type="email"
          name="email"
          autoComplete="email"
          placeholder="voce@email.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (estado !== "inicial") setEstado("inicial");
          }}
          aria-invalid={estado === "erro"}
          className="bg-branco text-texto placeholder:text-texto-suave focus-visible:border-dourado min-h-12 flex-1 rounded-full border-2 border-transparent px-5"
        />
        <button
          type="submit"
          className="border-branco font-titulo text-branco hover:bg-branco hover:text-azul-acao min-h-12 rounded-full border-2 px-6 text-[17px] font-semibold"
        >
          Quero receber
        </button>
      </div>
      <p id={`${id}-msg`} role="status" className="text-branco min-h-6 font-semibold">
        {estado === "erro" && "Esse e-mail não parece certo. Confira e tente de novo."}
        {estado === "em-breve" && "Em breve. Os avisos por e-mail ainda estão sendo preparados."}
      </p>
      <div className="flex justify-center sm:justify-start">
        <BotaoLink href="/desafio" variante="dourado" className="min-h-14 px-8 text-[19px]">
          Comece o Desafio
        </BotaoLink>
      </div>
    </form>
  );
}
