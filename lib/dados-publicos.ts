// Dados de exemplo das páginas públicas até a Fase 2 trazer o banco.
// Nenhum título real ainda: todos são marcadores para o Márlio preencher.

export type CenaSerie = "mar" | "campo" | "feira" | "conversa";

export type SeriePublica = {
  id: string;
  titulo: string;
  nivel: number;
  episodios: number;
  cena: CenaSerie;
};

export const seriesPublicas: SeriePublica[] = [
  {
    id: "a-cidade",
    titulo: "[PLACEHOLDER: título da série 1]",
    nivel: 1,
    episodios: 12,
    cena: "mar",
  },
  {
    id: "a-cozinha",
    titulo: "[PLACEHOLDER: título da série 2]",
    nivel: 2,
    episodios: 8,
    cena: "feira",
  },
  {
    id: "a-familia",
    titulo: "[PLACEHOLDER: título da série 3]",
    nivel: 2,
    episodios: 10,
    cena: "campo",
  },
  {
    id: "serie-4",
    titulo: "[PLACEHOLDER: título da série 4]",
    nivel: 3,
    episodios: 6,
    cena: "conversa",
  },
  {
    id: "serie-5",
    titulo: "[PLACEHOLDER: título da série 5]",
    nivel: 4,
    episodios: 14,
    cena: "mar",
  },
  {
    id: "serie-6",
    titulo: "[PLACEHOLDER: título da série 6]",
    nivel: 5,
    episodios: 9,
    cena: "feira",
  },
];

export type ApresentadorPublico = { nome: string; temas: string };

export const apresentadores: ApresentadorPublico[] = [
  { nome: "Márlio", temas: "Cotidiano, cultura, conversa" },
  { nome: "[PLACEHOLDER: apresentador convidado]", temas: "[PLACEHOLDER: temas]" },
  { nome: "[PLACEHOLDER: apresentador convidado]", temas: "[PLACEHOLDER: temas]" },
];
