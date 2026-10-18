import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { Envoltorio, Mao } from "@/components/site/Secao";
import { BotaoLink, Icone, Marcador } from "@/components/ui";
import { formatarEuro, precos } from "@/lib/precos";

const produtos = ["desafio", "entender", "participar"] as const;
type Produto = (typeof produtos)[number];

export const dynamicParams = false;

export function generateStaticParams() {
  return produtos.map((produto) => ({ produto }));
}

export const metadata: Metadata = {
  title: "Obrigado",
  robots: { index: false, follow: false },
};

const conteudo: Record<Produto, { mao: string; titulo: string; texto: string; extra: ReactNode }> =
  {
    desafio: {
      mao: "que legal, vamos lá!",
      titulo: "Seu Desafio 7 Dias está garantido",
      texto: "Olhe o seu e-mail e entre pelo link que mandamos. Não precisa de senha.",
      extra: (
        <div className="bg-papel-escuro flex flex-col gap-2.5 rounded-[18px] p-6 text-left">
          <h2 className="font-titulo text-azul-fundo text-xl font-semibold">
            Como começar o dia 1
          </h2>
          <ol className="flex list-decimal flex-col gap-1.5 pl-5">
            <li>Entre pelo link do e-mail.</li>
            <li>Abra a &ldquo;Lição de hoje&rdquo;: o vídeo do dia 1 já está lá.</li>
            <li>Assista sem pausar. O que não entender, deixe passar.</li>
          </ol>
          <p className="text-texto-suave">Amanhã o dia 2 é liberado, e assim até o sétimo dia.</p>
        </div>
      ),
    },
    entender: {
      mao: "bem-vindo, bem-vinda!",
      titulo: "Você agora é do plano Entender",
      texto:
        "Olhe o seu e-mail e entre pelo link que mandamos. A biblioteca inteira já está aberta.",
      extra: (
        <p className="text-texto-suave">
          Próximo passo: escolha a sua meta diária e assista à primeira lição.
        </p>
      ),
    },
    participar: {
      mao: "a gente se vê ao vivo!",
      titulo: "Você agora é do plano Participar",
      texto:
        "Olhe o seu e-mail e entre pelo link que mandamos. Os vídeos, as lives e a conversa em grupo já estão abertos.",
      extra: (
        <div className="bg-azul-claro flex items-center gap-3.5 rounded-[18px] p-5 text-left">
          <Icone nome="calendario" tamanho={28} className="text-azul-acao shrink-0" />
          <span>
            Próxima live: <Marcador>[PLACEHOLDER: dia e hora no seu fuso]</Marcador>. Dá para
            adicionar ao calendário dentro do app.
          </span>
        </div>
      ),
    },
  };

type Props = { params: Promise<{ produto: string }> };

export default async function Obrigado({ params }: Props) {
  const { produto } = await params;
  if (!produtos.includes(produto as Produto)) notFound();
  const c = conteudo[produto as Produto];
  const recibo =
    produto === "desafio"
      ? `${formatarEuro(precos.desafio)} + IVA, pagamento único. O recibo foi para o seu e-mail.`
      : "O IVA foi somado no pagamento. O recibo está no seu e-mail.";

  return (
    <section className="py-16 sm:py-20">
      <Envoltorio className="max-w-[720px]">
        <div className="rounded-bolha bg-branco shadow-card flex flex-col items-center gap-5 p-8 text-center sm:p-12">
          <span className="grid size-[72px] place-items-center rounded-full bg-[#D7F3EC] text-[#00684F]">
            <Icone nome="check" tamanho={36} strokeWidth={2.5} />
          </span>
          <Mao className="text-[30px]">{c.mao}</Mao>
          <h1 className="text-azul-fundo text-[clamp(32px,4.4vw,44px)] font-bold">{c.titulo}</h1>
          <p className="text-texto-suave text-lg">{c.texto}</p>
          <div className="w-full">{c.extra}</div>
          <BotaoLink href="/entrar" className="min-h-[52px] px-8">
            Entrar no app
          </BotaoLink>
          <p className="text-texto-suave text-sm">{recibo}</p>
          <Link href="/" className="inline-flex min-h-11 items-center text-sm font-bold">
            Voltar ao site
          </Link>
        </div>
      </Envoltorio>
    </section>
  );
}
