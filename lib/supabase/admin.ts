import "server-only";
import { createClient } from "@supabase/supabase-js";
import { urlSupabase } from "./env";
import type { Database } from "./tipos";

/**
 * Cliente com a service role: ignora a RLS. Só no servidor, só onde for indispensável
 * (webhook do Stripe, entrega de video_ref e sala_url depois de checar o plano).
 */
export function criarClienteAdmin() {
  const chave = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!chave) throw new Error("Falta SUPABASE_SERVICE_ROLE_KEY (veja .env.example).");
  return createClient<Database>(urlSupabase(), chave, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
