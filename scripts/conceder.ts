// Dá ou retira acessos à mão, só em desenvolvimento (Supabase local).
//
//   pnpm conceder <email> <produto> [--intervalo=mensal|anual] [--dias=30] [--status=active]
//   pnpm conceder <email> <produto> --retirar
//   pnpm conceder <email> --listar
//
// produto: desafio | entender | participar
// status:  active | past_due | canceled (past_due marca a falha de pagamento agora)
// Cria o usuário se o e-mail ainda não existir. Recusa Supabase fora da máquina local.
import { createClient } from "@supabase/supabase-js";
import { existsSync } from "node:fs";

if (existsSync(".env.local")) process.loadEnvFile(".env.local");

const produtos = ["desafio", "entender", "participar"];
const statusValidos = ["active", "past_due", "canceled"];

function sair(msg: string): never {
  console.error(msg);
  process.exit(1);
}

const args = process.argv.slice(2);
const opcoes = new Map(
  args
    .filter((a) => a.startsWith("--"))
    .map((a) => {
      const [k, v] = a.slice(2).split("=");
      return [k, v ?? "1"] as const;
    }),
);
const [email, produto] = args.filter((a) => !a.startsWith("--"));

if (!email || !email.includes("@")) {
  sair(
    "Uso: pnpm conceder <email> <produto> [--intervalo=mensal|anual] [--dias=30] [--status=active] [--retirar]",
  );
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const chave = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
if (!url || !chave)
  sair("Faltam NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY no .env.local.");
const local = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/.test(url);
if (!local && !opcoes.has("permitir-remoto")) {
  sair("Este script é só para o Supabase local. (Para outro, use --permitir-remoto, com cuidado.)");
}

const admin = createClient(url, chave, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const { data: idExistente, error: erroBusca } = await admin.rpc("usuario_por_email", {
  p_email: email,
});
if (erroBusca) sair(`Erro ao buscar o usuário: ${erroBusca.message}`);
let id = idExistente as string | null;

if (opcoes.has("listar")) {
  if (!id) sair(`Nenhum usuário com o e-mail ${email}.`);
  const { data } = await admin
    .from("entitlements")
    .select("produto, status, intervalo, renova_em, pagamento_falhou_em, stripe_subscription_id")
    .eq("user_id", id);
  console.table(data ?? []);
  process.exit(0);
}

if (!produto || !produtos.includes(produto)) sair(`Produto inválido. Use: ${produtos.join(", ")}.`);

if (opcoes.has("retirar")) {
  if (!id) sair(`Nenhum usuário com o e-mail ${email}.`);
  const { error } = await admin
    .from("entitlements")
    .delete()
    .eq("user_id", id)
    .eq("produto", produto);
  if (error) sair(`Erro: ${error.message}`);
  console.log(`Acesso ${produto} retirado de ${email}.`);
  process.exit(0);
}

if (!id) {
  const { data, error } = await admin.auth.admin.createUser({ email, email_confirm: true });
  if (error || !data.user) sair(`Erro ao criar o usuário: ${error?.message}`);
  id = data.user.id;
  console.log(`Usuário ${email} criado.`);
}

const status = opcoes.get("status") ?? "active";
if (!statusValidos.includes(status)) sair(`Status inválido. Use: ${statusValidos.join(", ")}.`);
const dias = Number(opcoes.get("dias") ?? "30");
if (!Number.isFinite(dias)) sair("--dias precisa ser um número.");
const intervalo = produto === "desafio" ? null : (opcoes.get("intervalo") ?? "mensal");
if (intervalo && !["mensal", "anual"].includes(intervalo)) sair("--intervalo: mensal ou anual.");

const agora = Date.now();
const { error } = await admin.from("entitlements").upsert(
  {
    user_id: id,
    produto,
    status,
    intervalo,
    renova_em: produto === "desafio" ? null : new Date(agora + dias * 86_400_000).toISOString(),
    comprado_em: new Date(agora).toISOString(),
    pagamento_falhou_em: status === "past_due" ? new Date(agora).toISOString() : null,
    stripe_subscription_id: null,
  },
  { onConflict: "user_id,produto" },
);
if (error) sair(`Erro: ${error.message}`);
console.log(
  `Acesso ${produto} (${status}${intervalo ? `, ${intervalo}` : ""}) concedido a ${email}` +
    (produto === "desafio" ? "." : `, por ${dias} dias.`),
);
