import type { Metadata } from "next";
import type { ReactNode } from "react";
import {
  Acordeao,
  BarraProgresso,
  Botao,
  BotaoLink,
  Cartao,
  Icone,
  nomesIcones,
  Pilula,
  SeloNivel,
  SeloPlano,
} from "@/components/ui";
import { ChipsDemo, DialogoDemo } from "./Interativos";

export const metadata: Metadata = {
  title: "Componentes",
  robots: { index: false, follow: false },
};

function Secao({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <section className="space-y-4">
      <h2 className="text-azul-fundo text-2xl">{titulo}</h2>
      {children}
    </section>
  );
}

const cores = [
  "azul",
  "azul-acao",
  "azul-fundo",
  "dourado",
  "verde",
  "coral",
  "coral-texto",
  "fogo",
  "papel",
  "areia",
  "borda",
  "texto",
  "texto-suave",
  "branco",
];

export default function PaginaUi() {
  return (
    <main className="mx-auto max-w-5xl space-y-12 px-4 py-10">
      <header className="space-y-2">
        <h1 className="text-azul-fundo text-4xl">Componentes</h1>
        <p className="font-mao text-coral-texto text-2xl">O português se vive, não só se estuda.</p>
      </header>

      <Secao titulo="Cores">
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
          {cores.map((c) => (
            <li key={c} className="space-y-1 text-sm">
              <span
                className="border-borda block h-14 rounded-xl border"
                style={{ background: `var(--${c})` }}
              />
              <code>--{c}</code>
            </li>
          ))}
        </ul>
      </Secao>

      <Secao titulo="Tipografia">
        <p className="font-titulo text-3xl font-bold">Fredoka para títulos</p>
        <p>Nunito Sans para o texto corrido, com leitura confortável em qualquer tela.</p>
        <p className="font-mao text-3xl">Caveat para anotações à mão</p>
      </Secao>

      <Secao titulo="Botões">
        <div className="flex flex-wrap items-center gap-3">
          <Botao>Começar agora</Botao>
          <Botao variante="secundario">Ver planos</Botao>
          <Botao variante="discreto">Saiba mais</Botao>
          <Botao disabled>Indisponível</Botao>
          <BotaoLink href="/">
            Ir para o início <Icone nome="seta-direita" tamanho={20} />
          </BotaoLink>
        </div>
      </Secao>

      <Secao titulo="Cartões">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Cartao as="article" className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <SeloNivel nivel={1} />
              <SeloPlano plano="gratis" />
            </div>
            <h3 className="text-xl">[PLACEHOLDER: título do vídeo]</h3>
            <p className="text-texto-suave text-sm">8 min</p>
          </Cartao>
          <Cartao as="article" className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <SeloNivel nivel={3} />
              <SeloPlano plano="entender" bloqueado />
            </div>
            <h3 className="text-xl">[PLACEHOLDER: título do vídeo]</h3>
            <BarraProgresso valor={60} rotulo="Assistido" cor="verde" />
          </Cartao>
          <Cartao as="article" tom="escuro" className="space-y-3">
            <SeloPlano plano="participar" />
            <h3 className="text-xl">Próxima live</h3>
            <p className="text-sm">Quarta, 19:00 no seu fuso</p>
          </Cartao>
        </div>
      </Secao>

      <Secao titulo="Chips (filtros)">
        <ChipsDemo />
      </Secao>

      <Secao titulo="Selos">
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4, 5, 6, 7].map((n) => (
            <SeloNivel key={n} nivel={n} />
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <SeloPlano plano="gratis" />
          <SeloPlano plano="desafio" />
          <SeloPlano plano="entender" />
          <SeloPlano plano="participar" />
          <SeloPlano plano="participar" bloqueado />
        </div>
      </Secao>

      <Secao titulo="Barra de progresso">
        <div className="max-w-md space-y-4">
          <BarraProgresso valor={12} maximo={50} rotulo="Horas até o nível 2" mostrarRotulo />
          <BarraProgresso valor={20} maximo={20} rotulo="Meta de hoje" mostrarRotulo cor="verde" />
          <BarraProgresso valor={3} maximo={7} rotulo="Desafio 7 dias" mostrarRotulo cor="coral" />
        </div>
      </Secao>

      <Secao titulo="Pílulas (meta e sequência)">
        <div className="flex flex-wrap gap-3">
          <Pilula tipo="meta" minutos={8} metaMin={20} />
          <Pilula tipo="meta" minutos={24} metaMin={20} />
          <Pilula tipo="sequencia" dias={0} />
          <Pilula tipo="sequencia" dias={12} />
        </div>
      </Secao>

      <Secao titulo="Diálogo">
        <DialogoDemo />
      </Secao>

      <Secao titulo="Acordeão">
        <Acordeao
          nome="faq-demo"
          itens={[
            {
              titulo: "Preciso saber algum português para começar?",
              conteudo: "Não. Os vídeos do primeiro nível partem do zero, com muito apoio visual.",
            },
            {
              titulo: "Os preços incluem imposto?",
              conteudo: "Não. Os preços não incluem imposto; o IVA é calculado no pagamento.",
            },
            {
              titulo: "Posso cancelar quando quiser?",
              conteudo:
                "Sim. Você cancela na sua conta e mantém o acesso até o fim do período pago.",
            },
          ]}
        />
      </Secao>

      <Secao titulo="Ícones">
        <ul className="grid grid-cols-4 gap-4 sm:grid-cols-6 lg:grid-cols-10">
          {nomesIcones.map((n) => (
            <li key={n} className="text-texto-suave flex flex-col items-center gap-1 text-xs">
              <Icone nome={n} className="text-azul-acao" />
              <code className="break-all">{n}</code>
            </li>
          ))}
        </ul>
      </Secao>
    </main>
  );
}
