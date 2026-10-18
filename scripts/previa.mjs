// Gera em .previa/ uma cópia estática do site com caminhos relativos,
// para ser aberta fora de um servidor Next (ex.: link de visualização).
// Uso: PREVIA=1 pnpm next build && node scripts/previa.mjs
import {
  cpSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
  renameSync,
} from "node:fs";
import { join } from "node:path";

const origem = "out";
const destino = ".previa";
rmSync(destino, { recursive: true, force: true });
cpSync(origem, destino, { recursive: true });
for (const lixo of [
  "_ui.html",
  "_next/static/chunks/app/%5Fui",
  "opengraph-image",
  "robots.txt",
  "sitemap.xml",
  "404.html",
  "index.txt",
  "_ui.txt",
]) {
  rmSync(join(destino, lixo), { recursive: true, force: true });
}

function percorrer(dir) {
  for (const nome of readdirSync(dir)) {
    const caminho = join(dir, nome);
    if (statSync(caminho).isDirectory()) percorrer(caminho);
    else if (/\.(html|js|css)$/.test(nome)) {
      const antes = readFileSync(caminho, "utf8");
      const depois = (
        nome.endsWith(".css")
          ? antes.replace(/url\(\/_next\/static\/media\//g, "url(../media/")
          : antes
      )
        .replace(/(["'(]|\\")\/_next\//g, "$1./n/")
        .replace(/(["'(]|\\")\/marca\//g, "$1./marca/")
        .replace(/(["'(]|\\")\/icon\.png/g, "$1./icon.png");
      // O publicador recusa o caractere U+FFFD literal; em JS o escape é equivalente.
      const final = nome.endsWith(".js") ? depois.replaceAll("\uFFFD", "\\uFFFD") : depois;
      if (final !== antes) writeFileSync(caminho, final);
    }
  }
}
renameSync(join(destino, "_next"), join(destino, "n"));
percorrer(destino);
console.log("Prévia pronta em", destino);
