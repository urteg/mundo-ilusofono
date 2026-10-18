// Cenas ilustradas do site (components/site/cenas). A capa de uma série pode ser o nome de uma delas.
export const nomesCenas = ["mar", "campo", "feira", "conversa"] as const;
export type CenaSerie = (typeof nomesCenas)[number];

export function cenaDaCapa(capa: string | null | undefined, reserva: CenaSerie = "mar"): CenaSerie {
  return nomesCenas.includes(capa as CenaSerie) ? (capa as CenaSerie) : reserva;
}
