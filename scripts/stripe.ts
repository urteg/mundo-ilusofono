// Prepara e confere o Stripe em MODO DE TESTE, a partir de lib/precos.ts (a fonte única).
//
//   pnpm stripe:configurar  cria (se faltar) os produtos, os 5 preços com IVA incluído e a
//                           configuração do portal; imprime as linhas STRIPE_PRICE_* para o ambiente
//   pnpm stripe:verificar   confere se cada STRIPE_PRICE_* existe, está em EUR, com o valor certo
//                           e com o imposto incluído (tax_behavior = inclusive)
//
// Lê STRIPE_SECRET_KEY do ambiente (ou do .env.local). Recusa chaves de produção.
// Os ids price_ não são segredos; a chave nunca é impressa.
import { existsSync } from "node:fs";
import Stripe from "stripe";
import { precos } from "../lib/precos.ts";

if (existsSync(".env.local")) process.loadEnvFile(".env.local");

const chave = process.env.STRIPE_SECRET_KEY?.trim();
if (!chave) {
  console.error("Falta a variável de ambiente STRIPE_SECRET_KEY (chave de teste sk_test_).");
  process.exit(1);
}
if (!chave.startsWith("sk_test_") && !chave.startsWith("rk_test_")) {
  console.error(
    "STRIPE_SECRET_KEY não é uma chave de teste. Este script só roda em modo de teste.",
  );
  process.exit(1);
}
const stripe = new Stripe(chave, { apiVersion: "2026-09-30.endive" });

type Item = {
  variavel: string;
  lookup: string;
  produto: "desafio" | "entender" | "participar";
  nomeProduto: string;
  valor: number;
  intervalo: "month" | "year" | null;
};

const itens: Item[] = [
  {
    variavel: "STRIPE_PRICE_DESAFIO",
    lookup: "mi_desafio",
    produto: "desafio",
    nomeProduto: "Desafio 7 Dias",
    valor: precos.desafio,
    intervalo: null,
  },
  {
    variavel: "STRIPE_PRICE_ENTENDER_MENSAL",
    lookup: "mi_entender_mensal",
    produto: "entender",
    nomeProduto: "Entender",
    valor: precos.entender.mensal,
    intervalo: "month",
  },
  {
    variavel: "STRIPE_PRICE_ENTENDER_ANUAL",
    lookup: "mi_entender_anual",
    produto: "entender",
    nomeProduto: "Entender",
    valor: precos.entender.anual,
    intervalo: "year",
  },
  {
    variavel: "STRIPE_PRICE_PARTICIPAR_MENSAL",
    lookup: "mi_participar_mensal",
    produto: "participar",
    nomeProduto: "Participar",
    valor: precos.participar.mensal,
    intervalo: "month",
  },
  {
    variavel: "STRIPE_PRICE_PARTICIPAR_ANUAL",
    lookup: "mi_participar_anual",
    produto: "participar",
    nomeProduto: "Participar",
    valor: precos.participar.anual,
    intervalo: "year",
  },
];

const euro = (c: number) => `€${(c / 100).toFixed(2).replace(".", ",")}`;

async function produtoStripe(produto: Item["produto"], nome: string) {
  const busca = await stripe.products.search({ query: `metadata['mi_produto']:'${produto}'` });
  const achado = busca.data.find((p) => p.active);
  if (achado) return achado.id;
  const novo = await stripe.products.create({
    name: nome,
    metadata: { mi_produto: produto },
    // Serviço digital (código de imposto do Stripe para produtos eletrônicos).
    tax_code: "txcd_10000000",
  });
  return novo.id;
}

async function configurar() {
  const linhas: string[] = [];
  const ids: Record<string, string> = {};
  for (const item of itens) {
    const existente = (await stripe.prices.list({ lookup_keys: [item.lookup], active: true }))
      .data[0];
    let id: string | undefined = existente?.id;
    if (
      existente &&
      (existente.unit_amount !== item.valor || existente.tax_behavior !== "inclusive")
    ) {
      // Valor mudou em lib/precos.ts: cria um preço novo e transfere a chave de busca.
      id = undefined;
    }
    if (!id) {
      const produtoId = await produtoStripe(item.produto, item.nomeProduto);
      const novo = await stripe.prices.create({
        product: produtoId,
        currency: "eur",
        unit_amount: item.valor,
        tax_behavior: "inclusive",
        lookup_key: item.lookup,
        transfer_lookup_key: true,
        nickname: `${item.nomeProduto}${item.intervalo ? (item.intervalo === "month" ? " mensal" : " anual") : ""}`,
        ...(item.intervalo ? { recurring: { interval: item.intervalo } } : {}),
      });
      id = novo.id;
      console.log(`Criado ${item.variavel}: ${euro(item.valor)} com IVA incluído.`);
    }
    ids[item.variavel] = id;
    linhas.push(`${item.variavel}=${id}`);
  }

  // Portal: trocar entre os 4 preços, atualizar cartão, ver recibos, cancelar no fim do período.
  const porProduto = new Map<string, string[]>();
  for (const item of itens.filter((i) => i.intervalo)) {
    const preco = await stripe.prices.retrieve(ids[item.variavel]);
    const produto = typeof preco.product === "string" ? preco.product : preco.product.id;
    porProduto.set(produto, [...(porProduto.get(produto) ?? []), preco.id]);
  }
  const recursos: Stripe.BillingPortal.ConfigurationCreateParams.Features = {
    customer_update: { enabled: true, allowed_updates: ["address", "name", "tax_id"] },
    invoice_history: { enabled: true },
    payment_method_update: { enabled: true },
    subscription_cancel: { enabled: true, mode: "at_period_end", proration_behavior: "none" },
    subscription_update: {
      enabled: true,
      default_allowed_updates: ["price"],
      proration_behavior: "create_prorations",
      products: [...porProduto].map(([product, prices]) => ({ product, prices })),
    },
  };
  const atuais = await stripe.billingPortal.configurations.list({ is_default: true, limit: 1 });
  if (atuais.data[0]) {
    await stripe.billingPortal.configurations.update(atuais.data[0].id, { features: recursos });
  } else {
    await stripe.billingPortal.configurations.create({ features: recursos });
  }
  console.log("Portal configurado: trocar de plano, cartão, recibos e cancelar no fim do período.");
  console.log("\nCopie para as variáveis de ambiente (não são segredos):\n");
  console.log(linhas.join("\n"));
}

async function verificar() {
  let ok = true;
  for (const item of itens) {
    const id = process.env[item.variavel]?.trim();
    if (!id) {
      console.log(`FALTA  ${item.variavel}`);
      ok = false;
      continue;
    }
    try {
      const p = await stripe.prices.retrieve(id);
      const problemas = [
        p.currency !== "eur" && `moeda ${p.currency}`,
        p.unit_amount !== item.valor &&
          `valor ${euro(p.unit_amount ?? 0)} (esperado ${euro(item.valor)})`,
        p.tax_behavior !== "inclusive" && `tax_behavior ${p.tax_behavior} (esperado inclusive)`,
        (p.recurring?.interval ?? null) !== item.intervalo &&
          `intervalo ${p.recurring?.interval ?? "único"}`,
        !p.active && "inativo",
      ].filter(Boolean);
      console.log(
        `${problemas.length ? "ERRO " : "OK   "} ${item.variavel} ${euro(item.valor)} ${problemas.join("; ")}`,
      );
      if (problemas.length) ok = false;
    } catch {
      console.log(`ERRO  ${item.variavel}: preço não encontrado nesta conta de teste`);
      ok = false;
    }
  }
  process.exit(ok ? 0 : 1);
}

const comando = process.argv[2];
if (comando === "configurar") await configurar();
else if (comando === "verificar") await verificar();
else {
  console.error("Uso: pnpm stripe:configurar | pnpm stripe:verificar");
  process.exit(1);
}
