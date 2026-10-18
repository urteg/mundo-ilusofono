// Datas do dia a dia do participante, sempre como texto "AAAA-MM-DD" no fuso dele.

const cacheFormatos = new Map<string, Intl.DateTimeFormat>();

function formato(fuso: string) {
  let f = cacheFormatos.get(fuso);
  if (!f) {
    f = new Intl.DateTimeFormat("en-CA", {
      timeZone: fuso,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    cacheFormatos.set(fuso, f);
  }
  return f;
}

export const fusoPadrao = "Europe/Madrid";

/** Fuso válido ou o padrão (Madri), para nunca quebrar com um valor estranho do banco. */
export function fusoValido(fuso: string | null | undefined): string {
  if (!fuso) return fusoPadrao;
  try {
    formato(fuso);
    return fuso;
  } catch {
    return fusoPadrao;
  }
}

/** Dia (AAAA-MM-DD) em que o instante cai no fuso informado. */
export function diaNoFuso(instante: Date, fuso: string): string {
  return formato(fusoValido(fuso)).format(instante);
}

/** Soma (ou subtrai) dias de uma data AAAA-MM-DD. */
export function somarDias(dia: string, dias: number): string {
  const d = new Date(`${dia}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + dias);
  return d.toISOString().slice(0, 10);
}
