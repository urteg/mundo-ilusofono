// Perguntas frequentes da página Recursos.
// [PLACEHOLDER: respostas finais do Márlio] As respostas abaixo são rascunhos curtos.

export type Pergunta = { pergunta: string; resposta: string };
export type CategoriaFaq = { id: string; nome: string; perguntas: Pergunta[] };

export const faq: CategoriaFaq[] = [
  {
    id: "basico",
    nome: "Básico",
    perguntas: [
      {
        pergunta: "Preciso saber alguma coisa de português?",
        // revisar com o Márlio
        resposta: "Não. Os primeiros vídeos são feitos para quem começa do zero, com muita imagem.",
      },
      {
        pergunta: "Quanto tempo por dia?",
        // revisar com o Márlio
        resposta:
          "Você escolhe a meta: 10, 20, 30 ou 45 minutos. Pouco todo dia vale mais que muito de vez em quando.",
      },
      {
        pergunta: "Funciona no celular?",
        // revisar com o Márlio
        resposta:
          "Sim. O app abre no navegador do celular, do tablet ou do computador, sem instalar nada.",
      },
      {
        pergunta: "Qual português eu vou ouvir?",
        // revisar com o Márlio
        resposta: "O português do Brasil, do jeito que se fala no dia a dia.",
      },
    ],
  },
  {
    id: "como-assistir",
    nome: "Como assistir",
    perguntas: [
      {
        pergunta: "Deixo a legenda ligada?",
        // revisar com o Márlio
        resposta: "A legenda em português vem ligada. Você pode desligar quando quiser.",
      },
      {
        pergunta: "Posso mudar a velocidade?",
        // revisar com o Márlio
        resposta: "Pode: 0,75x, 1x ou 1,25x. Comece no normal e só reduza se precisar.",
      },
      {
        pergunta: "Posso ver o mesmo vídeo de novo?",
        // revisar com o Márlio
        resposta:
          "Pode, e é uma boa ideia. Na segunda vez você entende mais, e o tempo também conta.",
      },
    ],
  },
  {
    id: "nao-entendo",
    nome: "Quando não entendo",
    perguntas: [
      {
        pergunta: "Entendi pouco. E agora?",
        // revisar com o Márlio
        resposta: "Escolha um vídeo de um nível abaixo. Entender o principal já basta.",
      },
      {
        pergunta: "Devo traduzir as palavras?",
        // revisar com o Márlio
        resposta: "Não precisa. Deixe passar: elas voltam em outros vídeos e o sentido aparece.",
      },
      {
        pergunta: "Posso usar o dicionário?",
        // revisar com o Márlio
        resposta: "De vez em quando, sem problema. Mas tente primeiro entender pela cena.",
      },
    ],
  },
  {
    id: "falar",
    nome: "Falar",
    perguntas: [
      {
        pergunta: "Quando eu começo a falar?",
        // revisar com o Márlio
        resposta: "Quando tiver vontade. A fala vem depois de muita escuta, sem pressa.",
      },
      {
        pergunta: "Onde eu converso?",
        // revisar com o Márlio
        resposta: "Nas lives e na conversa em grupo do plano Participar.",
      },
      {
        pergunta: "E se eu errar?",
        // revisar com o Márlio
        resposta: "Errar faz parte. Nas conversas ninguém te corrige no meio da frase.",
      },
    ],
  },
  {
    id: "pagamento",
    nome: "Planos e pagamento",
    perguntas: [
      {
        pergunta: "Os preços incluem imposto?",
        // revisar com o Márlio
        resposta: "Sim. O IVA já está incluído no preço que você vê.",
      },
      {
        pergunta: "Posso cancelar?",
        // revisar com o Márlio
        resposta:
          "Pode, a qualquer momento, pela sua conta. O acesso vai até o fim do período pago.",
      },
      {
        pergunta: "Posso trocar de plano?",
        // revisar com o Márlio
        resposta: "Pode, quando quiser. A diferença é ajustada na próxima cobrança.",
      },
      {
        pergunta: "O Desafio 7 Dias é uma assinatura?",
        // revisar com o Márlio
        resposta: "Não. É um pagamento único, sem renovação.",
      },
    ],
  },
];
