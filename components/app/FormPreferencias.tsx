"use client";

import { useEffect, useId, useState, useTransition } from "react";
import { salvarPreferenciasConta } from "@/app/app/conta/acoes";
import { Botao, Interruptor, cx } from "@/components/ui";
import { metasDiarias, type TemaConta } from "@/lib/conta";
import { aplicarTema } from "./TemaApp";
import { SeletorFuso } from "./SeletorFuso";

export type Preferencias = {
  meta_diaria_min: number;
  legendas: boolean;
  tema: TemaConta;
  previa_video: boolean;
  email_novidades: boolean;
  email_videos: boolean;
  email_semanal: boolean;
  fuso: string;
  fuso_escolhido: boolean;
};

const opcoesTema: { valor: TemaConta; rotulo: string }[] = [
  { valor: "sistema", rotulo: "Seguir o sistema" },
  { valor: "claro", rotulo: "Claro" },
  { valor: "escuro", rotulo: "Escuro" },
];

/** Preferências da conta, salvas de uma vez com "Salvar". */
export function FormPreferencias({ inicial }: { inicial: Preferencias }) {
  const id = useId();
  const [p, setP] = useState(inicial);
  const [doNavegador, setDoNavegador] = useState<string | null>(null);
  const [mensagem, setMensagem] = useState<{ ok: boolean; texto: string } | null>(null);
  const [pendente, iniciar] = useTransition();

  useEffect(() => {
    try {
      setDoNavegador(Intl.DateTimeFormat().resolvedOptions().timeZone);
    } catch {}
  }, []);

  const mudar = <K extends keyof Preferencias>(chave: K, valor: Preferencias[K]) => {
    setMensagem(null);
    setP((atual) => ({ ...atual, [chave]: valor }));
  };

  const sn = (v: boolean) => (v ? "1" : "0");

  return (
    <form
      className="flex flex-col gap-6"
      onSubmit={(e) => {
        e.preventDefault();
        const dados = new FormData(e.currentTarget);
        iniciar(async () => {
          const r = await salvarPreferenciasConta(dados);
          if (r.ok) aplicarTema(p.tema);
          setMensagem(r.ok ? { ok: true, texto: "Salvo." } : { ok: false, texto: r.erro });
        });
      }}
    >
      {(
        [
          "meta_diaria_min",
          "legendas",
          "tema",
          "previa_video",
          "email_novidades",
          "email_videos",
          "email_semanal",
          "fuso",
          "fuso_escolhido",
        ] as const
      ).map((c) => (
        <input
          key={c}
          type="hidden"
          name={c}
          value={typeof p[c] === "boolean" ? sn(p[c] as boolean) : String(p[c])}
        />
      ))}

      <Grupo id={`${id}-meta`} titulo="Meta diária">
        <Opcoes
          rotulo={`${id}-meta`}
          opcoes={metasDiarias.map((m) => ({ valor: String(m), rotulo: `${m} min` }))}
          valor={String(p.meta_diaria_min)}
          aoMudar={(v) => mudar("meta_diaria_min", Number(v))}
        />
      </Grupo>

      <SeletorFuso
        valor={p.fuso}
        doNavegador={doNavegador}
        aoMudar={(f) => {
          setMensagem(null);
          setP((a) => ({ ...a, fuso: f, fuso_escolhido: f !== doNavegador }));
        }}
      />

      <Grupo id={`${id}-tema`} titulo="Modo escuro">
        <Opcoes
          rotulo={`${id}-tema`}
          opcoes={opcoesTema}
          valor={p.tema}
          aoMudar={(v) => mudar("tema", v as TemaConta)}
        />
      </Grupo>

      <div className="border-borda flex flex-col gap-1 border-t pt-4">
        <Interruptor
          ligado={p.legendas}
          aoMudar={(v) => mudar("legendas", v)}
          rotulo="Legendas ligadas nos vídeos"
        />
        <Interruptor
          ligado={p.previa_video}
          aoMudar={(v) => mudar("previa_video", v)}
          rotulo="Prévia do vídeo ao passar o mouse"
        />
      </div>

      <fieldset className="border-borda flex flex-col gap-1 border-t pt-4">
        <legend className="float-left mb-2 w-full font-bold">E-mails</legend>
        <Interruptor
          ligado={p.email_novidades}
          aoMudar={(v) => mudar("email_novidades", v)}
          rotulo="Novidades do Mundo Ilusófono"
        />
        <Interruptor
          ligado={p.email_videos}
          aoMudar={(v) => mudar("email_videos", v)}
          rotulo="Vídeos novos"
        />
        <Interruptor
          ligado={p.email_semanal}
          aoMudar={(v) => mudar("email_semanal", v)}
          rotulo="Resumo da semana"
        />
      </fieldset>

      <div className="flex flex-wrap items-center gap-4">
        <Botao type="submit" disabled={pendente}>
          {pendente ? "Salvando..." : "Salvar preferências"}
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

function Grupo({
  id,
  titulo,
  children,
}: {
  id: string;
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <span id={id} className="font-bold">
        {titulo}
      </span>
      {children}
    </div>
  );
}

/** Grupo de opções exclusivas (role="radiogroup") com setas para mudar. */
function Opcoes({
  rotulo,
  opcoes,
  valor,
  aoMudar,
}: {
  rotulo: string;
  opcoes: { valor: string; rotulo: string }[];
  valor: string;
  aoMudar: (v: string) => void;
}) {
  return (
    <div
      role="radiogroup"
      aria-labelledby={rotulo}
      className="flex flex-wrap gap-2"
      onKeyDown={(e) => {
        const i = opcoes.findIndex((o) => o.valor === valor);
        const passo =
          e.key === "ArrowRight" || e.key === "ArrowDown"
            ? 1
            : e.key === "ArrowLeft" || e.key === "ArrowUp"
              ? -1
              : 0;
        if (!passo) return;
        e.preventDefault();
        const novo = opcoes[(i + passo + opcoes.length) % opcoes.length];
        aoMudar(novo.valor);
        e.currentTarget.querySelector<HTMLElement>(`[data-valor="${novo.valor}"]`)?.focus();
      }}
    >
      {opcoes.map((o) => {
        const marcado = o.valor === valor;
        return (
          <button
            key={o.valor}
            type="button"
            role="radio"
            aria-checked={marcado}
            tabIndex={marcado ? 0 : -1}
            data-valor={o.valor}
            onClick={() => aoMudar(o.valor)}
            className={cx(
              "min-h-11 rounded-full border-2 px-4 font-bold",
              marcado
                ? "border-azul-acao bg-azul-acao text-branco"
                : "border-borda bg-branco text-texto hover:border-azul-acao",
            )}
          >
            {o.rotulo}
          </button>
        );
      })}
    </div>
  );
}
