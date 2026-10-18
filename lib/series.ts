// Duração no formato da interface: "4:10" para um vídeo, "1 h 12 min" para uma série.

export function duracaoVideo(segundos: number): string {
  const s = Math.max(0, Math.round(segundos));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const r = String(s % 60).padStart(2, "0");
  return h > 0 ? `${h}:${String(m).padStart(2, "0")}:${r}` : `${m}:${r}`;
}

export function duracaoTotal(segundos: number[]): string {
  const total = segundos.reduce((t, s) => t + Math.max(0, s || 0), 0);
  const minutos = Math.round(total / 60);
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  if (h === 0) return `${Math.max(m, total > 0 ? 1 : 0)} min`;
  return m === 0 ? `${h} h` : `${h} h ${m} min`;
}

export function resumoSerie(episodios: { duracao_seg: number }[]): string {
  const n = episodios.length;
  return `${n} ${n === 1 ? "episódio" : "episódios"} · ${duracaoTotal(episodios.map((e) => e.duracao_seg))}`;
}
