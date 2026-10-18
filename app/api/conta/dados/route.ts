import { NextResponse } from "next/server";
import { semCache } from "@/lib/app/sessao-api";
import { criarClienteServidor } from "@/lib/supabase/servidor";

export const dynamic = "force-dynamic";

// "Baixar meus dados": o que é do participante, lido com a sessão dele (a RLS garante o resto).
export async function GET() {
  const supabase = await criarClienteServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ motivo: "sem_sessao" }, { status: 401, headers: semCache });

  const [perfil, visualizacoes, tempoFora] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
    supabase
      .from("visualizacoes")
      .select(
        "video_id, segundos, posicao_seg, concluido, entendimento, salvo, curtido, atualizado_em",
      ),
    supabase.from("tempo_fora").select("tipo, dia, segundos, nota, criado_em").order("dia"),
  ]);
  if (perfil.error || visualizacoes.error || tempoFora.error) {
    return NextResponse.json({ motivo: "erro_ao_ler" }, { status: 500, headers: semCache });
  }

  const dados = {
    exportado_em: new Date().toISOString(),
    email: user.email,
    profile: perfil.data,
    visualizacoes: visualizacoes.data,
    tempo_fora: tempoFora.data,
  };
  return new NextResponse(JSON.stringify(dados, null, 2), {
    headers: {
      ...semCache,
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": 'attachment; filename="meus-dados-mundo-ilusofono.json"',
    },
  });
}
