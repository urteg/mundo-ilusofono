import type { ReactNode } from "react";
import { BotaoLink, Cartao, Marcador, cx } from "@/components/ui";
import { site } from "@/lib/site";
import { CenaCampo, CenaConversa, CenaFeira, CenaMar } from "./cenas";
import type { CenaSerie } from "@/lib/dados-publicos";

/** Largura máxima e margens laterais do site. */
export function Envoltorio({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cx("mx-auto w-full max-w-[1200px] px-4 sm:px-8", className)}>{children}</div>
  );
}

/** Anotação em letra de mão (Caveat). */
export function Mao({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span className={cx("font-mao text-coral-texto text-[28px] leading-none", className)}>
      {children}
    </span>
  );
}

/** Mostra o texto ou, se for um marcador [PLACEHOLDER: ...], o realce de pendência. */
export function TextoOuMarcador({ texto }: { texto: string }) {
  return texto.startsWith("[PLACEHOLDER") ? <Marcador>{texto}</Marcador> : <>{texto}</>;
}

/** Abertura das páginas internas: anotação à mão, título e texto de apoio. */
export function Abertura({
  mao,
  titulo,
  children,
  centro = false,
}: {
  mao: string;
  titulo: string;
  children?: ReactNode;
  centro?: boolean;
}) {
  return (
    <section>
      <Envoltorio
        className={cx(
          "flex max-w-[920px] flex-col gap-4 pt-16 pb-14 sm:pt-20",
          centro && "items-center text-center",
        )}
      >
        <Mao className="text-[30px]">{mao}</Mao>
        <h1 className="text-azul-fundo text-[clamp(44px,6vw,72px)] font-bold">{titulo}</h1>
        {children && <div className="text-texto-suave text-xl">{children}</div>}
      </Envoltorio>
    </section>
  );
}

const cenas = { mar: CenaMar, campo: CenaCampo, feira: CenaFeira, conversa: CenaConversa };

export function CenaPorNome({
  nome,
  titulo,
  className,
}: {
  nome: CenaSerie;
  titulo?: string;
  className?: string;
}) {
  const C = cenas[nome];
  return <C titulo={titulo} className={className} />;
}

export function Apresentador({ nome, temas }: { nome: string; temas: string }) {
  return (
    <Cartao as="li" className="flex flex-col items-start gap-3 p-6">
      <div className="bg-areia grid size-20 place-items-center rounded-full p-1 text-center text-[11px]">
        <Marcador>[PLACEHOLDER: foto]</Marcador>
      </div>
      <b className="font-titulo text-azul-fundo text-xl font-semibold">
        <TextoOuMarcador texto={nome} />
      </b>
      <span className="text-texto-suave">
        <TextoOuMarcador texto={temas} />
      </span>
    </Cartao>
  );
}

/** Faixa azul de chamada final, com o lema por padrão e o botão do Desafio. */
export function FaixaChamada({
  titulo = site.lema,
  texto,
  rotuloBotao = "Comece o Desafio",
  children,
}: {
  titulo?: string;
  texto?: ReactNode;
  rotuloBotao?: string;
  children?: ReactNode;
}) {
  return (
    <section className="bg-azul-acao text-branco py-20">
      <Envoltorio className="flex flex-col items-center gap-6 text-center">
        <h2 className="text-branco text-[clamp(34px,4vw,48px)]">{titulo}</h2>
        {texto && <p className="text-azul-claro max-w-xl text-lg">{texto}</p>}
        {children ?? (
          <BotaoLink href="/desafio" variante="dourado" className="min-h-14 px-8 text-[19px]">
            {rotuloBotao}
          </BotaoLink>
        )}
      </Envoltorio>
    </section>
  );
}
