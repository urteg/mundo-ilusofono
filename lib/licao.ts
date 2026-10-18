import { podeAssistir, type Entitlement, type VideoAcesso } from "./entitlements";
import { lerNivel } from "./niveis";

// Lição de hoje: primeiro vídeo NÃO visto do nível do participante, na ordem da série,
// entre os que o plano libera. Se acabou o nível, passa ao próximo. Sem plano, sobram os grátis.

export type VideoLicao = VideoAcesso & {
  id: string;
  nivel: string | number;
  ordem: number | null;
  serie_ordem: number | null;
};

function nivelNumero(v: { nivel: string | number }): number {
  return lerNivel(v.nivel);
}

function naOrdem<T extends VideoLicao>(videos: T[]): T[] {
  return [...videos].sort(
    (a, b) =>
      nivelNumero(a) - nivelNumero(b) ||
      (a.serie_ordem ?? 0) - (b.serie_ordem ?? 0) ||
      (a.ordem ?? 0) - (b.ordem ?? 0),
  );
}

export function videosElegiveis<T extends VideoLicao>(
  videos: T[],
  ents: Entitlement[],
  agora: Date,
): T[] {
  return naOrdem(videos.filter((v) => podeAssistir(v, ents, agora)));
}

type Entrada<T> = {
  videos: T[];
  /** ids dos vídeos já concluídos */
  vistos: Set<string>;
  nivelParticipante: number;
  ents: Entitlement[];
  agora: Date;
};

export function recomendarVideo<T extends VideoLicao>({
  videos,
  vistos,
  nivelParticipante,
  ents,
  agora,
}: Entrada<T>): T | null {
  const elegiveis = videosElegiveis(videos, ents, agora);
  if (elegiveis.length === 0) return null;
  const naoVistos = elegiveis.filter((v) => !vistos.has(v.id));
  return (
    // 1. do nível do participante
    naoVistos.find((v) => nivelNumero(v) === nivelParticipante) ??
    // 2. do próximo nível em diante
    naoVistos.find((v) => nivelNumero(v) > nivelParticipante) ??
    // 3. qualquer um ainda não visto (ex.: níveis abaixo)
    naoVistos[0] ??
    // 4. tudo visto: rever o primeiro do nível
    elegiveis.find((v) => nivelNumero(v) === nivelParticipante) ??
    elegiveis[0]
  );
}

/** Sorteia outro vídeo elegível, diferente do atual, preferindo os não vistos. */
export function sortearOutro<T extends VideoLicao>(
  { videos, vistos, ents, agora }: Omit<Entrada<T>, "nivelParticipante">,
  atualId: string | null,
  aleatorio: () => number = Math.random,
): T | null {
  const elegiveis = videosElegiveis(videos, ents, agora).filter((v) => v.id !== atualId);
  if (elegiveis.length === 0) return null;
  const naoVistos = elegiveis.filter((v) => !vistos.has(v.id));
  const pool = naoVistos.length > 0 ? naoVistos : elegiveis;
  return pool[Math.floor(aleatorio() * pool.length) % pool.length];
}
