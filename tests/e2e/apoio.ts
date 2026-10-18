import { expect, type APIRequestContext, type Page } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import { existsSync } from "node:fs";

// Apoio aos testes que usam o Supabase local (pnpm db:start).
export const MAILPIT = "http://127.0.0.1:54324";

if (existsSync(".env.local")) process.loadEnvFile(".env.local");

/** Cliente com a service role, só para preparar e limpar dados nos testes. */
export function adminTeste() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: { persistSession: false, autoRefreshToken: false },
    },
  );
}

export async function linkDoEmail(
  request: APIRequestContext,
  email: string,
  depoisDe = 0,
): Promise<string> {
  for (let tentativa = 0; tentativa < 40; tentativa++) {
    const busca = await (
      await request.get(`${MAILPIT}/api/v1/search?query=${encodeURIComponent(`to:${email}`)}`)
    ).json();
    const recente = (busca.messages ?? []).find(
      (m: { Created: string }) => new Date(m.Created).getTime() >= depoisDe,
    );
    if (recente) {
      const mensagem = await (await request.get(`${MAILPIT}/api/v1/message/${recente.ID}`)).json();
      expect(mensagem.Subject).toBe("Seu link para entrar no Mundo Ilusófono");
      const link = /href="([^"]+)"/.exec(mensagem.HTML)?.[1];
      if (link) return link.replaceAll("&amp;", "&");
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`Nenhum e-mail para ${email}`);
}

/** Entra pelo link do e-mail e termina em /app. */
export async function entrar(page: Page, request: APIRequestContext, email: string) {
  const inicio = Date.now() - 1000;
  await page.goto("/entrar");
  await page.getByLabel("Seu e-mail").fill(email);
  await page.getByRole("button", { name: "Enviar link de acesso" }).click();
  await expect(page.getByRole("heading", { name: "Olhe o seu e-mail" })).toBeVisible();
  await page.goto(await linkDoEmail(request, email, inicio));
  await expect(page).toHaveURL(/\/app$/);
}
