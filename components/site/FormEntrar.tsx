"use client";

import Link from "next/link";
import { useId, useRef, useState, type FormEvent } from "react";
import { Botao, Icone } from "@/components/ui";
import { criarClienteNavegador } from "@/lib/supabase/cliente";

const formatoEmail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

type Estado =
  | { tipo: "inicial" }
  | { tipo: "enviando" }
  | { tipo: "enviado"; email: string }
  | { tipo: "erro"; mensagem: string };

type Props = { proximo: string; erroInicial?: string };

export function FormEntrar({ proximo, erroInicial }: Props) {
  const id = useId();
  const campo = useRef<HTMLInputElement>(null);
  const [email, setEmail] = useState("");
  const [estado, setEstado] = useState<Estado>(
    erroInicial ? { tipo: "erro", mensagem: erroInicial } : { tipo: "inicial" },
  );

  async function enviar(e: FormEvent) {
    e.preventDefault();
    const limpo = email.trim().toLowerCase();
    if (!formatoEmail.test(limpo)) {
      setEstado({
        tipo: "erro",
        mensagem: "Esse e-mail não parece certo. Confira e tente de novo.",
      });
      campo.current?.focus();
      return;
    }
    // Na prévia estática não há servidor para receber o login.
    if (process.env.NEXT_PUBLIC_PREVIA === "1") {
      setEstado({
        tipo: "erro",
        mensagem: "Esta é só uma prévia do site. O login funciona na versão publicada.",
      });
      return;
    }
    setEstado({ tipo: "enviando" });
    const retorno = new URL("/auth/callback", window.location.origin);
    retorno.searchParams.set("proximo", proximo);
    const { error } = await criarClienteNavegador().auth.signInWithOtp({
      email: limpo,
      options: { emailRedirectTo: retorno.toString(), shouldCreateUser: true },
    });
    if (error) {
      const muitas = error.status === 429 || /rate limit/i.test(error.message);
      setEstado({
        tipo: "erro",
        mensagem: muitas
          ? "Você pediu muitos links em pouco tempo. Espere um minuto e tente de novo."
          : "Não conseguimos enviar o link agora. Tente de novo em alguns segundos.",
      });
      return;
    }
    setEstado({ tipo: "enviado", email: limpo });
  }

  if (estado.tipo === "enviado") {
    return (
      <div className="flex flex-col items-start gap-4" role="status">
        <span className="grid size-14 place-items-center rounded-full bg-[#D7F3EC] text-[#00684F]">
          <Icone nome="check" tamanho={28} strokeWidth={2.5} />
        </span>
        <h2 className="text-azul-fundo text-[28px]">Olhe o seu e-mail</h2>
        <p className="text-texto-suave">
          Mandamos um link para <b className="text-texto break-all">{estado.email}</b>. Abra o
          e-mail e toque no link para entrar.
        </p>
        <p className="text-texto-suave text-sm">
          Não chegou? Olhe a caixa de spam ou peça outro link em um minuto.
        </p>
        <Botao
          variante="secundario"
          onClick={() => {
            setEstado({ tipo: "inicial" });
            setEmail("");
            requestAnimationFrame(() => campo.current?.focus());
          }}
        >
          Usar outro e-mail
        </Botao>
      </div>
    );
  }

  const enviando = estado.tipo === "enviando";
  const erro = estado.tipo === "erro" ? estado.mensagem : null;

  return (
    <form onSubmit={enviar} noValidate className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label htmlFor={`${id}-email`} className="font-bold">
          Seu e-mail
        </label>
        <input
          ref={campo}
          id={`${id}-email`}
          type="email"
          name="email"
          autoComplete="email"
          inputMode="email"
          placeholder="voce@email.com"
          value={email}
          disabled={enviando}
          onChange={(e) => {
            setEmail(e.target.value);
            if (estado.tipo === "erro") setEstado({ tipo: "inicial" });
          }}
          aria-invalid={erro ? true : undefined}
          aria-describedby={`${id}-msg`}
          className="border-borda bg-branco aria-invalid:border-coral-texto min-h-12 rounded-full border-2 px-5 disabled:opacity-70"
        />
        <p id={`${id}-msg`} role="alert" className="text-coral-texto min-h-6 text-sm font-semibold">
          {erro}
        </p>
      </div>
      <Botao type="submit" className="w-full" disabled={enviando} aria-busy={enviando}>
        {enviando ? "Enviando..." : "Enviar link de acesso"}
      </Botao>
      <p className="text-texto-suave">Sem senha. Você recebe um link e entra.</p>
      <p className="text-texto-suave">
        Ainda não tem conta? <Link href="/desafio">Comece pelo Desafio 7 Dias</Link>
      </p>
    </form>
  );
}
