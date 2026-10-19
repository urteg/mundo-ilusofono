import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { caminhoSeguro } from "@/lib/redirecionamento";
import { criarClienteServidor } from "@/lib/supabase/servidor";

const parametros = z.object({
  token_hash: z.string().min(1).max(512),
  type: z.enum(["email", "magiclink", "signup"]).default("email"),
  proximo: z.string().max(512).optional(),
});

// Link do e-mail com token_hash: funciona em qualquer navegador (inclusive em outro aparelho
// e para contas criadas pelo webhook do Stripe, que não começaram o login no navegador).
export async function GET(request: NextRequest) {
  const origem = request.nextUrl.origin;
  const p = request.nextUrl.searchParams;
  const lido = parametros.safeParse({
    token_hash: p.get("token_hash") ?? undefined,
    type: p.get("type") ?? undefined,
    proximo: p.get("proximo") ?? undefined,
  });
  if (!lido.success) return NextResponse.redirect(`${origem}/entrar?erro=link`);

  const supabase = await criarClienteServidor();
  const { error } = await supabase.auth.verifyOtp({
    token_hash: lido.data.token_hash,
    type: lido.data.type,
  });
  if (error) return NextResponse.redirect(`${origem}/entrar?erro=link`);
  return NextResponse.redirect(`${origem}${caminhoSeguro(lido.data.proximo)}`);
}
