import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { chavePublicaSupabase, urlSupabase } from "./env";
import type { Database } from "./tipos";

/** Cliente do servidor com a sessão do aluno (cookies). Respeita a RLS. */
export async function criarClienteServidor() {
  const loja = await cookies();
  return createServerClient<Database>(urlSupabase(), chavePublicaSupabase(), {
    cookies: {
      getAll: () => loja.getAll(),
      setAll: (lista) => {
        try {
          for (const { name, value, options } of lista) loja.set(name, value, options);
        } catch {
          // Chamado de um Server Component: quem renova a sessão é o middleware.
        }
      },
    },
  });
}

/**
 * Cliente sem sessão, para páginas públicas estáticas (site). Só enxerga o que o papel
 * anon pode ler: as views v_*_publicas.
 */
export function criarClientePublico() {
  return createClient<Database>(urlSupabase(), chavePublicaSupabase(), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
