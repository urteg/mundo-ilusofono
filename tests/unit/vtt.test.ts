import { describe, expect, it } from "vitest";
import { deixaEm, lerVtt } from "@/lib/vtt";

const exemplo = `WEBVTT

1
00:00:00.500 --> 00:00:05.000 align:center
Olha, que dia <b>bonito</b>, né?

00:01:05.500 --> 00:01:11.000
Hoje a gente
vai passear.
`;

describe("legendas WebVTT", () => {
  it("lê tempos, ignora identificadores e tira marcação", () => {
    expect(lerVtt(exemplo)).toEqual([
      { inicio: 0.5, fim: 5, texto: "Olha, que dia bonito, né?" },
      { inicio: 65.5, fim: 71, texto: "Hoje a gente\nvai passear." },
    ]);
  });

  it("acha a legenda do instante e nada entre as deixas", () => {
    const d = lerVtt(exemplo);
    expect(deixaEm(d, 2)).toBe("Olha, que dia bonito, né?");
    expect(deixaEm(d, 30)).toBeNull();
    expect(deixaEm(d, 70)).toBe("Hoje a gente\nvai passear.");
  });

  it("arquivo vazio ou inválido não quebra", () => {
    expect(lerVtt("")).toEqual([]);
    expect(lerVtt("qualquer coisa")).toEqual([]);
  });
});
