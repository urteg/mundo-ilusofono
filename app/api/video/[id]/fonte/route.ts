import { NextResponse } from "next/server";
import { z } from "zod";
import { verificarAcessoVideo } from "@/lib/app/acesso-video";
import { participanteDaApi, semCache } from "@/lib/app/sessao-api";

export const dynamic = "force-dynamic";

// Entrega provedor e video_ref só para quem pode assistir. Sem plano: 403 com o motivo.
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const id = z
    .string()
    .uuid()
    .safeParse((await params).id);
  if (!id.success)
    return NextResponse.json({ motivo: "id_invalido" }, { status: 400, headers: semCache });

  const participante = await participanteDaApi();
  if (!participante)
    return NextResponse.json({ motivo: "sem_sessao" }, { status: 401, headers: semCache });

  const { video, motivo } = await verificarAcessoVideo(id.data, participante);
  if (!video)
    return NextResponse.json({ motivo: "video_inexistente" }, { status: 404, headers: semCache });
  if (motivo) return NextResponse.json({ motivo }, { status: 403, headers: semCache });

  return NextResponse.json(
    { provedor: video.provedor, referencia: video.video_ref, legendas: video.legenda_url },
    { headers: semCache },
  );
}
