import { createClient } from "@supabase/supabase-js";
import { existsSync } from "node:fs";
import { describe, expect, it } from "vitest";

// Exclusão de conta (privacidade): apagar o usuário no Auth leva todos os dados dele junto.

if (existsSync(".env.local")) process.loadEnvFile(".env.local");
const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false, autoRefreshToken: false } },
);

const VIDEO = "d0000000-0000-4000-8000-000000000001";
const SERIE = "c0000000-0000-4000-8000-000000000001";

const tabelas = [
  "visualizacoes",
  "series_salvas",
  "atividade_diaria",
  "tempo_fora",
  "licao_passos",
  "palavras_aluno",
  "conquistas_aluno",
  "entitlements",
] as const;

describe("excluir conta", () => {
  it("apaga perfil e todas as linhas do participante, sem tocar nos outros", async () => {
    const criar = async (n: string) => {
      const { data, error } = await admin.auth.admin.createUser({
        email: `exclusao-${n}-${Date.now()}@exemplo.com`,
        email_confirm: true,
      });
      if (error) throw error;
      return data.user.id;
    };
    const [id, outro] = [await criar("a"), await criar("b")];
    const { data: palavra } = await admin.from("palavras").select("id").limit(1).single();
    const { data: conquista } = await admin.from("conquistas").select("slug").limit(1).single();

    for (const uid of [id, outro]) {
      const inserts = await Promise.all([
        admin.from("visualizacoes").insert({ user_id: uid, video_id: VIDEO, segundos: 30 }),
        admin.from("series_salvas").insert({ user_id: uid, serie_id: SERIE }),
        admin.from("atividade_diaria").insert({ user_id: uid, dia: "2026-10-18", segundos: 60 }),
        admin
          .from("tempo_fora")
          .insert({ user_id: uid, tipo: "ouvindo", dia: "2026-10-18", segundos: 60 }),
        admin.from("licao_passos").insert({ user_id: uid, dia: "2026-10-18", video_id: VIDEO }),
        admin.from("palavras_aluno").insert({ user_id: uid, palavra_id: palavra!.id }),
        admin.from("conquistas_aluno").insert({ user_id: uid, slug: conquista!.slug }),
        admin.from("entitlements").insert({ user_id: uid, produto: "entender", status: "active" }),
      ]);
      for (const r of inserts) expect(r.error).toBeNull();
    }

    const { error } = await admin.auth.admin.deleteUser(id);
    expect(error).toBeNull();

    expect((await admin.from("profiles").select("id").eq("id", id)).data).toEqual([]);
    for (const t of tabelas) {
      const { data, error: e } = await admin.from(t).select("user_id").eq("user_id", id);
      expect(e, t).toBeNull();
      expect(data, t).toEqual([]);
      // O outro participante continua com os dados dele.
      expect((await admin.from(t).select("user_id").eq("user_id", outro)).data, t).toHaveLength(1);
    }
    await admin.auth.admin.deleteUser(outro);
  });
});
