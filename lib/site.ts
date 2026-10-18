export const site = {
  nome: "Mundo Ilusófono",
  lema: "O português se vive, não só se estuda.",
  descricao:
    "Vídeos em português, com gente de vários países, para quem quer entender a língua de verdade, com lives e conversa em grupo.",
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, ""),
  email: "marliobps@gmail.com",
};

export const navegacao = [
  { href: "/metodo", rotulo: "Como funciona" },
  { href: "/series", rotulo: "Séries" },
  { href: "/planos", rotulo: "Planos" },
  { href: "/recursos", rotulo: "Recursos" },
];

export const rodape = [
  {
    titulo: "Explorar",
    links: [
      { href: "/", rotulo: "Início" },
      { href: "/series", rotulo: "Séries" },
      { href: "/planos", rotulo: "Planos" },
      { href: "/desafio", rotulo: "Desafio 7 Dias" },
    ],
  },
  {
    titulo: "Recursos",
    links: [
      { href: "/metodo", rotulo: "Método" },
      { href: "/recursos", rotulo: "Perguntas frequentes" },
      { href: "/blog", rotulo: "Blog" },
    ],
  },
  {
    titulo: "Empresa",
    links: [{ href: `mailto:${site.email}`, rotulo: "Contato" }],
  },
];
