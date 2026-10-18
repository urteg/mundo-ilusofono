// Gera em .previa/ uma cópia estática do site com caminhos relativos,
// para ser aberta fora de um servidor Next (ex.: link de visualização).
// Uso: pnpm previa
import { cpSync, readdirSync, readFileSync, renameSync, rmSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const origem = "out";
const destino = ".previa";
// Páginas incluídas na prévia (rota -> arquivo).
const paginas = { "/": "index.html", "/metodo": "metodo.html", "/series": "series.html", "/planos": "planos.html" };

rmSync(destino, { recursive: true, force: true });
cpSync(origem, destino, { recursive: true });
for (const nome of readdirSync(destino)) {
  const manter = Object.values(paginas).includes(nome) || ["_next", "marca", "icon.png"].includes(nome);
  if (!manter) rmSync(join(destino, nome), { recursive: true, force: true });
}
rmSync(join(destino, "_next/static/chunks/app/%5Fui"), { recursive: true, force: true });
renameSync(join(destino, "_next"), join(destino, "n"));

// Faz os links entre as páginas da prévia abrirem o arquivo certo, sem o roteador do Next.
const interceptor =
  '<script>addEventListener("click",function(e){var a=e.target.closest&&e.target.closest("a[href$=\'.html\']");if(a)e.stopPropagation()},true)</script>';

function percorrer(dir) {
  for (const nome of readdirSync(dir)) {
    const caminho = join(dir, nome);
    if (statSync(caminho).isDirectory()) {
      percorrer(caminho);
      continue;
    }
    if (!/\.(html|js|css)$/.test(nome)) continue;
    const antes = readFileSync(caminho, "utf8");
    let depois = (
      nome.endsWith(".css") ? antes.replace(/url\(\/_next\/static\/media\//g, "url(../media/") : antes
    )
      .replace(/(["'(]|\\")\/_next\//g, "$1./n/")
      .replace(/(["'(]|\\")\/marca\//g, "$1./marca/")
      .replace(/(["'(]|\\")\/icon\.png/g, "$1./icon.png");
    if (nome.endsWith(".html")) {
      for (const [rota, arquivo] of Object.entries(paginas)) {
        const r = rota.replace("/", "\\/");
        depois = depois
          .replace(new RegExp(`href="${r}"`, "g"), `href="./${arquivo}"`)
          .replace(new RegExp(`\\\\"href\\\\":\\\\"${r}\\\\"`, "g"), `\\"href\\":\\"./${arquivo}\\"`);
      }
      depois = depois.replace("<body", interceptor + "<body");
      depois = depois.replace(/<body([^>]*)>/, `<body$1>${interceptor}`).replace(interceptor + "<body", "<body");
    }
    // O publicador recusa o caractere U+FFFD literal; em JS o escape é equivalente.
    if (nome.endsWith(".js")) depois = depois.replaceAll("�", "\\uFFFD");
    if (depois !== antes) writeFileSync(caminho, depois);
  }
}
percorrer(destino);
console.log("Prévia pronta em", destino);
