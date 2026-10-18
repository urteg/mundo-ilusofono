import { somarDias } from "./datas";
import { metaCumprida, type Atividade, type Sequencia } from "./streak";

// Calendário do mês, semana atual e estatísticas do painel de progresso.
// Todas as datas são "AAAA-MM-DD" já no fuso do participante (ver lib/datas.ts).

export const nomesMeses = [
  "janeiro",
  "fevereiro",
  "março",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
] as const;

export const diasDaSemanaCurtos = ["seg", "ter", "qua", "qui", "sex", "sáb", "dom"] as const;
export const diasDaSemana = [
  "segunda-feira",
  "terça-feira",
  "quarta-feira",
  "quinta-feira",
  "sexta-feira",
  "sábado",
  "domingo",
] as const;

/** Soma, por dia, o tempo no app (atividade_diaria) e o tempo fora do app (tempo_fora). */
export function segundosPorDia(...fontes: Atividade[][]): Map<string, number> {
  const mapa = new Map<string, number>();
  for (const fonte of fontes) {
    for (const { dia, segundos } of fonte) {
      mapa.set(dia, (mapa.get(dia) ?? 0) + Math.max(0, segundos));
    }
  }
  return mapa;
}

/** Lista de atividades (uma por dia) a partir do mapa, para a sequência e a meta. */
export function atividadesDoMapa(mapa: Map<string, number>): Atividade[] {
  return [...mapa].map(([dia, segundos]) => ({ dia, segundos }));
}

/** Dia da semana com segunda = 0 e domingo = 6. */
export function diaDaSemana(dia: string): number {
  return (new Date(`${dia}T12:00:00Z`).getUTCDay() + 6) % 7;
}

/** Mês "AAAA-MM" válido vindo da URL; se não, o mês de hoje. Não deixa ir além do mês atual. */
export function lerMes(valor: string | string[] | undefined | null, hoje: string): string {
  const atual = hoje.slice(0, 7);
  const v = Array.isArray(valor) ? valor[0] : valor;
  const m = /^(\d{4})-(\d{2})$/.exec(v ?? "");
  if (!m) return atual;
  const ano = Number(m[1]);
  const mes = Number(m[2]);
  if (ano < 2000 || mes < 1 || mes > 12) return atual;
  return v! > atual ? atual : v!;
}

export function somarMeses(mes: string, n: number): string {
  const [a, m] = mes.split("-").map(Number);
  const total = a * 12 + (m - 1) + n;
  return `${Math.floor(total / 12)}-${String((total % 12) + 1).padStart(2, "0")}`;
}

export function diasNoMes(mes: string): number {
  const [a, m] = mes.split("-").map(Number);
  return new Date(Date.UTC(a, m, 0)).getUTCDate();
}

export function nomeDoMes(mes: string): string {
  const [a, m] = mes.split("-").map(Number);
  return `${nomesMeses[m - 1]} de ${a}`;
}

/** "25 minutos", "1 minuto", "1 h 05 min". */
export function textoMinutos(segundos: number): string {
  const min = Math.floor(segundos / 60);
  if (min < 60) return min === 1 ? "1 minuto" : `${min} minutos`;
  const h = Math.floor(min / 60);
  const resto = min % 60;
  return resto === 0 ? `${h} h` : `${h} h ${String(resto).padStart(2, "0")} min`;
}

/** "18 h", "2 h 30 min", "45 min", "0 min" (horas somadas no painel). */
export function textoHoras(segundos: number): string {
  const min = Math.floor(Math.max(0, segundos) / 60);
  const h = Math.floor(min / 60);
  const resto = min % 60;
  if (h === 0) return `${resto} min`;
  return resto === 0 ? `${h} h` : `${h} h ${resto} min`;
}

export type CelulaDia = {
  dia: string;
  numero: number;
  segundos: number;
  minutos: number;
  cumprida: boolean;
  hoje: boolean;
  futuro: boolean;
  /** "12 de outubro, 25 minutos" */
  rotulo: string;
};

export type MesCalendario = {
  mes: string;
  titulo: string;
  /** Semanas de segunda a domingo; null = dia de outro mês. */
  semanas: (CelulaDia | null)[][];
  anterior: string;
  /** null quando o mês mostrado já é o atual (não há futuro para ver). */
  proximo: string | null;
  totalSegundos: number;
};

export function montarMes(
  mes: string,
  porDia: Map<string, number>,
  hoje: string,
  metaMin: number,
): MesCalendario {
  const total = diasNoMes(mes);
  const primeiro = `${mes}-01`;
  const celulas: (CelulaDia | null)[] = Array(diaDaSemana(primeiro)).fill(null);
  let totalSegundos = 0;
  for (let n = 1; n <= total; n++) {
    const dia = `${mes}-${String(n).padStart(2, "0")}`;
    const segundos = porDia.get(dia) ?? 0;
    totalSegundos += segundos;
    const futuro = dia > hoje;
    celulas.push({
      dia,
      numero: n,
      segundos,
      minutos: Math.floor(segundos / 60),
      cumprida: metaCumprida(segundos, metaMin),
      hoje: dia === hoje,
      futuro,
      rotulo: `${n} de ${nomesMeses[Number(mes.slice(5)) - 1]}, ${
        futuro ? "ainda não chegou" : textoMinutos(segundos)
      }${dia === hoje ? " (hoje)" : ""}`,
    });
  }
  while (celulas.length % 7 !== 0) celulas.push(null);
  const semanas: (CelulaDia | null)[][] = [];
  for (let i = 0; i < celulas.length; i += 7) semanas.push(celulas.slice(i, i + 7));
  const atual = hoje.slice(0, 7);
  return {
    mes,
    titulo: nomeDoMes(mes),
    semanas,
    anterior: somarMeses(mes, -1),
    proximo: mes < atual ? somarMeses(mes, 1) : null,
    totalSegundos,
  };
}

export type DiaSemana = {
  dia: string;
  inicial: string;
  nome: string;
  cumprida: boolean;
  praticou: boolean;
  hoje: boolean;
  futuro: boolean;
};

/** Os sete dias (segunda a domingo) da semana de hoje. */
export function semanaAtual(
  porDia: Map<string, number>,
  hoje: string,
  metaMin: number,
): DiaSemana[] {
  const segunda = somarDias(hoje, -diaDaSemana(hoje));
  return diasDaSemana.map((nome, i) => {
    const dia = somarDias(segunda, i);
    const segundos = porDia.get(dia) ?? 0;
    return {
      dia,
      inicial: nome[0].toUpperCase(),
      nome,
      cumprida: metaCumprida(segundos, metaMin),
      praticou: segundos > 0,
      hoje: dia === hoje,
      futuro: dia > hoje,
    };
  });
}

/** Dias com algum tempo registrado (no app ou fora). */
export function diasPraticados(porDia: Map<string, number>): number {
  let n = 0;
  for (const s of porDia.values()) if (s > 0) n++;
  return n;
}

/**
 * Semanas seguidas (segunda a domingo) com pelo menos um dia praticado.
 * A semana atual só conta se já teve prática; se ainda não teve, a contagem segue da anterior.
 */
export function semanasSeguidas(porDia: Map<string, number>, hoje: string): number {
  const praticouNaSemana = (segunda: string) => {
    for (let i = 0; i < 7; i++) if ((porDia.get(somarDias(segunda, i)) ?? 0) > 0) return true;
    return false;
  };
  let segunda = somarDias(hoje, -diaDaSemana(hoje));
  if (!praticouNaSemana(segunda)) segunda = somarDias(segunda, -7);
  let n = 0;
  while (praticouNaSemana(segunda)) {
    n++;
    segunda = somarDias(segunda, -7);
  }
  return n;
}

/** Frase da sequência: sempre acolhe, nunca culpa. */
export function textoSequencia(seq: Sequencia): { destaque: string; resto: string } {
  if (seq.dias === 0) {
    return {
      destaque: "Hoje é um bom dia para começar.",
      resto: "Qualquer vídeo conta, e cada dia é um novo começo.",
    };
  }
  const destaque = seq.dias === 1 ? "1 dia seguido." : `${seq.dias} dias seguidos.`;
  if (seq.cumpridaHoje) {
    return { destaque, resto: "Se pular um dia, tudo bem: você continua daqui." };
  }
  return {
    destaque,
    resto: "Um vídeo hoje soma mais um dia. Se não der, tudo bem: você continua daqui.",
  };
}
