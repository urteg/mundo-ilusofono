import { createBrowserClient } from "@supabase/ssr";
import { chavePublicaSupabase, urlSupabase } from "./env";
import type { Database } from "./tipos";

/** Cliente do navegador (chave pública; tudo passa pela RLS). */
export function criarClienteNavegador() {
  return createBrowserClient<Database>(urlSupabase(), chavePublicaSupabase());
}
