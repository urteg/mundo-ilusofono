// Níveis do app, do 0 ao 6, com os números da Growing Participator Approach (Greg Thomson).
// A fase 1 tem duas partes no próprio programa: 1A (primeiras 30 a 40 h) e 1B (mais 50 a 60 h).
//
// Nível | fase         | começa em | duração
//   0   | 1A           |     0 h   |  40 h
//   1   | 1B           |    40 h   |  60 h
//   2   | 2            |   100 h   | 150 h
//   3   | 3            |   250 h   | 250 h
//   4   | 4            |   500 h   | 500 h
//   5   | 5            |  1000 h   | 500 h
//   6   | 6            |  1500 h   | contínua
//
// Na interface aparecem só como "Nível 0" a "Nível 6" (a sigla do método não aparece).
export const inicioDosNiveis = [0, 40, 100, 250, 500, 1000, 1500] as const;

/** Maior nível possível (6). */
export const nivelMaximo = inicioDosNiveis.length - 1;

/** Nível (0 a 6) para um total de horas. */
export function nivelPorHoras(horas: number): number {
  let nivel = 0;
  for (let i = 0; i < inicioDosNiveis.length; i++) {
    if (horas >= inicioDosNiveis[i]) nivel = i;
  }
  return nivel;
}

/** Lê um nível vindo do banco ("0" a "6") com segurança; valores estranhos viram 0. */
export function lerNivel(valor: string | number | null | undefined): number {
  const n = typeof valor === "number" ? valor : Number.parseInt(valor ?? "", 10);
  if (!Number.isFinite(n)) return 0;
  return Math.min(nivelMaximo, Math.max(0, Math.trunc(n)));
}

// Nomes das fases do método em português, fiéis à ideia de cada fase (a pessoa cresce como
// participante de uma comunidade, não "estuda uma língua"):
//   fase 1 connecting   -> níveis 0 e 1 (1A e 1B): conexões pelo aqui e agora
//   fase 2 emerging     -> nível 2: a pessoa começa a aparecer, a ser alguém para os outros
//   fase 3 knowable     -> nível 3: dá para conhecer a pessoa (e ela conhece os outros)
//   fase 4 deep personal relationships -> nível 4
//   fase 5 widening understanding      -> nível 5
//   fase 6 ever-growing                -> nível 6
export const nomesDosNiveis = [
  "Primeiras conexões",
  "Criando conexões",
  "Emergindo",
  "Tornando-se conhecido",
  "Relações profundas",
  "Ampliando o entendimento",
  "Sempre crescendo",
] as const;

/** O que a participação tem de característico em cada nível (cartão "Seu nível agora"). */
export const sentidoDosNiveis = [
  "Você se conecta pelo aqui e agora: gestos, objetos e situações que dá para ver.",
  "Conversas simples sobre o que está à vista já fazem sentido.",
  "Você começa a aparecer como pessoa: entende e conta histórias simples.",
  "Já dá para conhecer você, e você conhece os outros: histórias de vida e rotinas.",
  "Conversas sobre sentimentos, valores e o que importa para cada um.",
  "Você entende o mundo da comunidade: jeitos de falar, humor e temas de todo tipo.",
  "A participação não para: você segue crescendo na vida em português.",
] as const;
