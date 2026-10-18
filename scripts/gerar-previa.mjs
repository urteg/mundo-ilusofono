// Gera a prévia estática (pnpm previa). O export estático do Next não aceita as partes
// com login (middleware, /app, /auth); elas são afastadas durante o build e voltam no fim.
import { execSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, renameSync, rmSync, writeFileSync } from "node:fs";

const tmp = ".previa-tmp";
const afastar = ["middleware.ts", "app/app", "app/auth"];
const entrar = "app/entrar/page.tsx";

const entrarEstatico = `import type { Metadata } from "next";
import { CelularCena } from "@/components/site/CelularCena";
import { FormEntrar } from "@/components/site/FormEntrar";
import { Marca } from "@/components/site/Marca";

export const metadata: Metadata = { title: "Entrar", robots: { index: false, follow: false } };

export default function Entrar() {
  return (
    <main className="mx-auto grid min-h-dvh max-w-[1120px] items-center gap-12 px-4 py-10 sm:px-8 lg:grid-cols-2">
      <div className="flex min-w-0 flex-col gap-8">
        <Marca />
        <div className="flex flex-col gap-6 rounded-bolha bg-branco p-7 shadow-card sm:p-10">
          <h1 className="text-[clamp(32px,4vw,40px)] font-bold text-azul-fundo">
            Entre com seu <span className="whitespace-nowrap">e-mail</span>
          </h1>
          <FormEntrar proximo="/app" />
        </div>
      </div>
      <div className="flex justify-center overflow-hidden py-8 lg:overflow-visible">
        <CelularCena cena="feira" tituloCena="Cena ilustrada: barraca de feira com frutas" legenda="Moço, quanto tá a manga hoje?" tituloVideo="Um dia na feira" progresso={30} anotacao="vamos lá, tá?" />
      </div>
    </main>
  );
}
`;

rmSync(tmp, { recursive: true, force: true });
mkdirSync(tmp, { recursive: true });
const movidos = [];
try {
  for (const caminho of afastar) {
    if (!existsSync(caminho)) continue;
    const destino = `${tmp}/${caminho.replaceAll("/", "__")}`;
    renameSync(caminho, destino);
    movidos.push([destino, caminho]);
  }
  cpSync(entrar, `${tmp}/entrar.tsx`);
  writeFileSync(entrar, entrarEstatico);
  rmSync("out", { recursive: true, force: true });
  execSync("next build", {
    stdio: "inherit",
    env: { ...process.env, PREVIA: "1", NEXT_PUBLIC_PREVIA: "1" },
  });
  execSync("node scripts/previa.mjs", { stdio: "inherit" });
} finally {
  if (existsSync(`${tmp}/entrar.tsx`)) cpSync(`${tmp}/entrar.tsx`, entrar);
  for (const [de, para] of movidos) renameSync(de, para);
  rmSync(tmp, { recursive: true, force: true });
  rmSync(".next", { recursive: true, force: true });
}
