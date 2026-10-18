// Lê as variáveis públicas do Supabase e avisa claramente se faltarem.
export function urlSupabase(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) throw new Error("Falta NEXT_PUBLIC_SUPABASE_URL (veja .env.example).");
  return url;
}

export function chavePublicaSupabase(): string {
  const chave = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!chave) throw new Error("Falta NEXT_PUBLIC_SUPABASE_ANON_KEY (veja .env.example).");
  return chave;
}
