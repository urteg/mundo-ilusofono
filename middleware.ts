import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Renova a sessão do Supabase, protege /app/* e tira quem já entrou de /entrar.
export async function middleware(request: NextRequest) {
  let resposta = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (lista) => {
          for (const { name, value } of lista) request.cookies.set(name, value);
          resposta = NextResponse.next({ request });
          for (const { name, value, options } of lista) resposta.cookies.set(name, value, options);
        },
      },
    },
  );

  // getUser() valida o token no servidor do Auth (não confia só no cookie).
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname, search } = request.nextUrl;

  if (!user && (pathname === "/app" || pathname.startsWith("/app/"))) {
    const destino = request.nextUrl.clone();
    destino.pathname = "/entrar";
    destino.search = `?proximo=${encodeURIComponent(pathname + search)}`;
    return copiarCookies(resposta, NextResponse.redirect(destino));
  }

  if (user && pathname === "/entrar") {
    const destino = request.nextUrl.clone();
    destino.pathname = "/app";
    destino.search = "";
    return copiarCookies(resposta, NextResponse.redirect(destino));
  }

  return resposta;
}

function copiarCookies(de: NextResponse, para: NextResponse) {
  for (const cookie of de.cookies.getAll()) para.cookies.set(cookie);
  return para;
}

export const config = {
  // Só onde a sessão importa: o app, a tela de entrada e o retorno do link.
  matcher: ["/app", "/app/:path*", "/entrar", "/auth/:path*"],
};
