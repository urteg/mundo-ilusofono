"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { carregarMaisVideos } from "@/app/app/assistir/acoes";
import type { CartaoBiblioteca as Dados } from "@/lib/app/catalogo";
import { CartaoBiblioteca } from "./CartaoBiblioteca";
import { EsqueletoCartao, classesGrade } from "./Esqueletos";

/** Grade com rolagem infinita: carrega 24 por vez quando o fim da lista aparece. */
export function GradeVideos({
  iniciais,
  proximo: proximoInicial,
  consulta,
}: {
  iniciais: Dados[];
  proximo: string | null;
  consulta: string;
}) {
  const [itens, setItens] = useState(iniciais);
  const [proximo, setProximo] = useState(proximoInicial);
  const [carregando, iniciar] = useTransition();
  const [erro, setErro] = useState(false);
  const fim = useRef<HTMLDivElement>(null);

  const carregar = () => {
    if (!proximo || carregando) return;
    setErro(false);
    iniciar(async () => {
      try {
        const r = await carregarMaisVideos(consulta, proximo);
        setItens((atual) => {
          const ids = new Set(atual.map((v) => v.id));
          return [...atual, ...r.itens.filter((v) => !ids.has(v.id))];
        });
        setProximo(r.proximo);
      } catch {
        setErro(true);
      }
    });
  };

  useEffect(() => {
    const el = fim.current;
    if (!el || !proximo) return;
    const obs = new IntersectionObserver((e) => e[0]?.isIntersecting && carregar(), {
      rootMargin: "600px",
    });
    obs.observe(el);
    return () => obs.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [proximo, carregando]);

  return (
    <>
      <ul className={classesGrade} aria-label="Vídeos">
        {itens.map((v) => (
          <li key={v.id} className="flex">
            <CartaoBiblioteca video={v} />
          </li>
        ))}
        {carregando &&
          Array.from({ length: 4 }, (_, i) => (
            <li key={`esq-${i}`} aria-hidden="true">
              <EsqueletoCartao />
            </li>
          ))}
      </ul>
      <div ref={fim} className="flex justify-center py-6">
        {proximo && !carregando && (
          <button
            type="button"
            onClick={carregar}
            className="text-azul-acao min-h-11 px-4 font-bold underline underline-offset-4"
          >
            {erro ? "Não carregou. Tentar de novo" : "Carregar mais vídeos"}
          </button>
        )}
      </div>
    </>
  );
}
