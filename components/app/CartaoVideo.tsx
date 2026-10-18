import Link from "next/link";
import { CenaPorNome, TextoOuMarcador } from "@/components/site/Secao";
import { BarraProgresso, SeloNivel, cx } from "@/components/ui";
import type { VideoCartao } from "@/lib/app/licao-hoje";
import { lerNivel } from "@/lib/niveis";

export function duracao(seg: number): string {
  const m = Math.floor(seg / 60);
  return `${m}:${String(seg % 60).padStart(2, "0")}`;
}

/** Cartão de vídeo: miniatura, nível, título, apresentador e barra de progresso na base. */
export function CartaoVideo({
  video,
  grande = false,
  href,
}: {
  video: VideoCartao;
  grande?: boolean;
  href: string;
}) {
  const pct =
    video.duracao_seg > 0 ? Math.min(100, (video.posicao_seg / video.duracao_seg) * 100) : 0;
  return (
    <article className="rounded-card bg-branco shadow-card relative flex flex-col overflow-hidden">
      <div className="relative">
        <CenaPorNome
          nome={video.cena}
          className={cx("block w-full", grande ? "aspect-video" : "aspect-[16/8]")}
        />
        <span className="bg-azul-fundo/90 text-branco absolute right-3 bottom-3 rounded-lg px-2 py-0.5 text-[13px] font-extrabold tabular-nums">
          {duracao(video.duracao_seg)}
        </span>
      </div>
      <BarraProgresso
        valor={Math.round(pct)}
        rotulo="Quanto você já assistiu"
        cor="verde"
        className="[&>div]:h-1.5 [&>div]:rounded-none"
      />
      <div className={cx("flex flex-col gap-2", grande ? "p-6" : "p-4")}>
        <SeloNivel nivel={lerNivel(video.nivel)} className="self-start" />
        <h2 className={cx("text-azul-fundo", grande ? "text-[clamp(22px,2.6vw,30px)]" : "text-lg")}>
          <Link href={href} className="after:absolute after:inset-0">
            <TextoOuMarcador texto={video.titulo} />
          </Link>
        </h2>
        {video.apresentador && (
          <span className="text-texto-suave">
            com <TextoOuMarcador texto={video.apresentador} />
          </span>
        )}
      </div>
    </article>
  );
}
