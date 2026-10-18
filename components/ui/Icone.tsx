import type { SVGProps } from "react";

const caminhos = {
  play: <path d="M7 5v14l12-7z" />,
  pausa: (
    <>
      <path d="M8 5v14" />
      <path d="M16 5v14" />
    </>
  ),
  cadeado: (
    <>
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </>
  ),
  fogo: <path d="M12 3c1 3 5 5 5 10a5 5 0 0 1-10 0c0-2 1-3.5 2-4.5 0 2 1 3 2 3 0-3-1-5 1-8.5z" />,
  alvo: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1" />
    </>
  ),
  relogio: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  fechar: (
    <>
      <path d="M6 6l12 12" />
      <path d="M18 6L6 18" />
    </>
  ),
  "seta-direita": (
    <>
      <path d="M5 12h14" />
      <path d="M13 6l6 6-6 6" />
    </>
  ),
  "seta-baixo": <path d="M6 9l6 6 6-6" />,
  busca: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-4-4" />
    </>
  ),
  menu: (
    <>
      <path d="M4 7h16" />
      <path d="M4 12h16" />
      <path d="M4 17h16" />
    </>
  ),
  usuario: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </>
  ),
  calendario: (
    <>
      <rect x="4" y="5" width="16" height="16" rx="2" />
      <path d="M4 10h16" />
      <path d="M9 3v4" />
      <path d="M15 3v4" />
    </>
  ),
  coracao: <path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10z" />,
  salvar: <path d="M7 4h10v17l-5-4-5 4z" />,
  filtro: <path d="M4 5h16l-6 8v6l-4-2v-4z" />,
  legenda: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M7 13h4" />
      <path d="M13 13h4" />
      <path d="M7 16h10" />
    </>
  ),
  trofeu: (
    <>
      <path d="M8 4h8v5a4 4 0 0 1-8 0z" />
      <path d="M8 6H5a3 3 0 0 0 3 4" />
      <path d="M16 6h3a3 3 0 0 1-3 4" />
      <path d="M12 13v4" />
      <path d="M8 20h8" />
    </>
  ),
  "ao-vivo": (
    <>
      <circle cx="12" cy="12" r="2" />
      <path d="M8 8a6 6 0 0 0 0 8" />
      <path d="M16 8a6 6 0 0 1 0 8" />
    </>
  ),
} as const;

export type NomeIcone = keyof typeof caminhos;
export const nomesIcones = Object.keys(caminhos) as NomeIcone[];

type Props = Omit<SVGProps<SVGSVGElement>, "children"> & {
  nome: NomeIcone;
  tamanho?: number;
  /** Texto para leitores de tela. Sem rótulo, o ícone é decorativo. */
  rotulo?: string;
};

export function Icone({ nome, tamanho = 24, rotulo, ...resto }: Props) {
  return (
    <svg
      width={tamanho}
      height={tamanho}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={rotulo ? "img" : undefined}
      aria-label={rotulo}
      aria-hidden={rotulo ? undefined : true}
      focusable="false"
      {...resto}
    >
      {caminhos[nome]}
    </svg>
  );
}
