import type { Metadata } from "next";
import { Envoltorio, Mao } from "@/components/site/Secao";
import { BotaoLink } from "@/components/ui";

export const metadata: Metadata = {
  title: "Conta excluída",
  robots: { index: false, follow: false },
};

export default function Pagina() {
  return (
    <Envoltorio className="flex flex-col items-center gap-5 py-20 text-center">
      <Mao>até a próxima</Mao>
      <h1 className="text-azul-fundo text-[clamp(32px,4vw,44px)] font-bold">
        Sua conta foi excluída
      </h1>
      <p className="text-texto-suave max-w-xl text-lg">
        Apagamos o seu perfil e todos os seus dados. Se quiser voltar um dia, é só criar uma conta
        nova com o seu e-mail.
      </p>
      <BotaoLink href="/">Voltar ao início</BotaoLink>
    </Envoltorio>
  );
}
