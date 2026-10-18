import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { semCache } from "@/lib/app/sessao-api";
import { criarClienteAdmin } from "@/lib/supabase/admin";
import { criarClienteServidor } from "@/lib/supabase/servidor";

export const dynamic = "force-dynamic";

const esquema = z.object({ confirmacao: z.string().trim().max(320) });

// "Excluir minha conta": apaga o usuário no Auth com a service role (só no servidor).
// O apagamento em cascata leva o perfil e todas as tabelas do participante.
export async function POST(req: Request) {
  // Só aceita chamadas da própria página (proteção contra envio de outro site).
  const origem = req.headers.get("origin");
  if (origem && new URL(origem).host !== new URL(req.url).host) {
    return NextResponse.json({ motivo: "origem_invalida" }, { status: 403, headers: semCache });
  }

  const supabase = await criarClienteServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ motivo: "sem_sessao" }, { status: 401, headers: semCache });

  let corpo: unknown;
  try {
    corpo = await req.json();
  } catch {
    return NextResponse.json({ motivo: "json_invalido" }, { status: 400, headers: semCache });
  }
  const lido = esquema.safeParse(corpo);
  // A confirmação é o próprio e-mail, escrito pelo participante.
  if (!lido.success || lido.data.confirmacao.toLowerCase() !== (user.email ?? "").toLowerCase()) {
    return NextResponse.json(
      { motivo: "confirmacao_invalida" },
      { status: 400, headers: semCache },
    );
  }

  // TODO Fase 4: cancelar a assinatura no Stripe antes de apagar (stripe_customer_id).
  const { error } = await criarClienteAdmin().auth.admin.deleteUser(user.id);
  if (error)
    return NextResponse.json({ motivo: "erro_ao_excluir" }, { status: 500, headers: semCache });

  // Encerra a sessão neste navegador.
  const jar = await cookies();
  for (const c of jar.getAll()) if (c.name.startsWith("sb-")) jar.delete(c.name);

  return NextResponse.json({ ok: true }, { headers: semCache });
}
