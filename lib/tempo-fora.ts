import { z } from "zod";

// Tempo em português fora do app: validação compartilhada pelo diálogo e pelas Server Actions.

export const tiposTempoFora = ["assistindo", "ouvindo", "conversando"] as const;
export type TipoTempoFora = (typeof tiposTempoFora)[number];

export const nomesTipos: Record<TipoTempoFora, string> = {
  assistindo: "Assistindo",
  ouvindo: "Ouvindo",
  conversando: "Conversando",
};

export const exemplosTipos: Record<TipoTempoFora, string> = {
  assistindo: "série, filme, vídeo",
  ouvindo: "podcast, música, rádio",
  conversando: "com amigos, família, colegas",
};

export const limiteMinutos = 12 * 60;
export const limiteNota = 140;

const inteiro = (max: number) =>
  z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? 0 : v),
    z.coerce.number().int().min(0).max(max),
  );

const esquema = z.object({
  tipo: z.enum(tiposTempoFora, { error: "Escolha o que você fez." }),
  dia: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Escolha a data."),
  horas: inteiro(12),
  minutos: inteiro(59),
  nota: z
    .string()
    .trim()
    .max(limiteNota, `A nota pode ter até ${limiteNota} caracteres.`)
    .optional()
    .transform((v) => v || null),
});

export type TempoForaValido = {
  tipo: TipoTempoFora;
  dia: string;
  segundos: number;
  nota: string | null;
};

export type Validacao = { ok: true; dados: TempoForaValido } | { ok: false; erro: string };

/** Valida os campos do formulário. `hoje` é a data AAAA-MM-DD no fuso do participante. */
export function validarTempoFora(entrada: Record<string, unknown>, hoje: string): Validacao {
  const r = esquema.safeParse(entrada);
  if (!r.success) {
    const campo = r.error.issues[0]?.path[0];
    const erro =
      campo === "horas" || campo === "minutos"
        ? "A duração vai de 1 minuto a 12 horas."
        : (r.error.issues[0]?.message ?? "Confira os campos.");
    return { ok: false, erro };
  }
  const { tipo, dia, horas, minutos, nota } = r.data;
  const total = horas * 60 + minutos;
  if (total <= 0 || total > limiteMinutos)
    return { ok: false, erro: "A duração vai de 1 minuto a 12 horas." };
  const data = new Date(`${dia}T12:00:00Z`);
  if (Number.isNaN(data.getTime()) || data.toISOString().slice(0, 10) !== dia)
    return { ok: false, erro: "Escolha uma data válida." };
  if (dia > hoje) return { ok: false, erro: "A data não pode ser no futuro." };
  if (dia < "2000-01-01") return { ok: false, erro: "Escolha uma data válida." };
  return { ok: true, dados: { tipo, dia, segundos: total * 60, nota } };
}

/** Lê os campos de um FormData para validarTempoFora. */
export function camposDoFormulario(dados: FormData) {
  return {
    tipo: dados.get("tipo"),
    dia: dados.get("dia"),
    horas: dados.get("horas"),
    minutos: dados.get("minutos"),
    nota: dados.get("nota") ?? undefined,
  };
}
