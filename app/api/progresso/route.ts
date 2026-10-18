import { NextResponse } from "next/server";
import { verificarAcessoVideo } from "@/lib/app/acesso-video";
import { participanteDaApi, semCache } from "@/lib/app/sessao-api";
import { criarLimitador, decidirBatimento, esquemaBatimento } from "@/lib/progresso-api";
import { criarClienteAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

// No máximo 12 batimentos por minuto por participante (o normal são 4).
const podeEnviar = criarLimitador(12);

export async function POST(req: Request) {
  const participante = await participanteDaApi();
  if (!participante)
    return NextResponse.json({ motivo: "sem_sessao" }, { status: 401, headers: semCache });
  if (!podeEnviar(participante.id)) {
    return NextResponse.json({ motivo: "muitas_requisicoes" }, { status: 429, headers: semCache });
  }

  let corpo: unknown;
  try {
    corpo = await req.json();
  } catch {
    return NextResponse.json({ motivo: "json_invalido" }, { status: 400, headers: semCache });
  }
  const lido = esquemaBatimento.safeParse(corpo);
  if (!lido.success)
    return NextResponse.json({ motivo: "dados_invalidos" }, { status: 400, headers: semCache });

  const { video, motivo } = await verificarAcessoVideo(lido.data.video_id, participante);
  const admin = criarClienteAdmin();
  const { data: anterior } = await admin
    .from("visualizacoes")
    .select("atualizado_em")
    .eq("user_id", participante.id)
    .eq("video_id", lido.data.video_id)
    .maybeSingle();

  const decisao = decidirBatimento(lido.data, {
    existe: Boolean(video),
    podeAssistir: video !== null && motivo === null,
    duracaoSeg: video?.duracao_seg ?? 0,
    ultimoEm: anterior ? Date.parse(anterior.atualizado_em) : null,
    agora: Date.now(),
  });
  if (!decisao.ok) {
    return NextResponse.json(
      { motivo: decisao.motivo },
      { status: decisao.status, headers: semCache },
    );
  }

  const { data, error } = await admin.rpc("registrar_progresso", {
    p_user: participante.id,
    p_video: lido.data.video_id,
    p_delta: decisao.delta,
    p_posicao: decisao.posicao,
    p_dia: participante.hoje,
  });
  if (error)
    return NextResponse.json({ motivo: "erro_ao_salvar" }, { status: 500, headers: semCache });

  const linha = data?.[0];
  return NextResponse.json(
    {
      segundos: linha?.segundos ?? 0,
      concluido: linha?.concluido ?? false,
      recemConcluido: linha?.recem_concluido ?? false,
    },
    { headers: semCache },
  );
}
