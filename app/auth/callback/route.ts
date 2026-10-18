import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { caminhoSeguro } from "@/lib/redirecionamento";
import { criarClienteServidor } from "@/lib/supabase/servidor";

const parametros = z.object({
  code: z.string().min(1).max(512),
  proximo: z.string().max(512).optional(),
});

// Retorno do link do e-mail: troca o código por uma sessão e segue para ?proximo=.
export async function GET(request: NextRequest) {
  const origem = request.nextUrl.origin;
  const lido = parametros.safeParse({
    code: request.nextUrl.searchParams.get("code") ?? undefined,
    proximo: request.nextUrl.searchParams.get("proximo") ?? undefined,
  });

  if (!lido.success) {
    return NextResponse.redirect(`${origem}/entrar?erro=link`);
  }

  const supabase = await criarClienteServidor();
  const { error } = await supabase.auth.exchangeCodeForSession(lido.data.code);
  if (error) {
    return NextResponse.redirect(`${origem}/entrar?erro=link`);
  }
  return NextResponse.redirect(`${origem}${caminhoSeguro(lido.data.proximo)}`);
}
