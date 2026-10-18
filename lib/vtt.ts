// Leitor mínimo de WebVTT para mostrar a legenda em português sobre o vídeo.

export type Deixa = { inicio: number; fim: number; texto: string };

function segundos(t: string): number {
  const partes = t.trim().split(":").map(Number);
  return partes.reduce((total, p) => total * 60 + p, 0);
}

export function lerVtt(conteudo: string): Deixa[] {
  const blocos = conteudo.replace(/\r/g, "").split(/\n{2,}/);
  const deixas: Deixa[] = [];
  for (const bloco of blocos) {
    const linhas = bloco.split("\n").filter(Boolean);
    const i = linhas.findIndex((l) => l.includes("-->"));
    if (i < 0) continue;
    const [ini, resto] = linhas[i].split("-->");
    const fim = resto.trim().split(/\s+/)[0];
    const texto = linhas
      .slice(i + 1)
      .join("\n")
      .replace(/<[^>]+>/g, "")
      .trim();
    if (texto) deixas.push({ inicio: segundos(ini), fim: segundos(fim), texto });
  }
  return deixas;
}

export function deixaEm(deixas: Deixa[], t: number): string | null {
  return deixas.find((d) => t >= d.inicio && t <= d.fim)?.texto ?? null;
}
