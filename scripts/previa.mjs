// Gera em .previa/ uma cópia estática do site com caminhos relativos,
// para ser aberta fora de um servidor Next (ex.: link de visualização).
// Uso: pnpm previa
import {
  cpSync,
  readdirSync,
  readFileSync,
  renameSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";

const origem = "out";
const destino = ".previa";

// Páginas incluídas: rota -> [arquivo em out/, arquivo na prévia].
// As de subpasta viram arquivos na raiz, para os caminhos relativos funcionarem.
const paginas = {
  "/": ["index.html", "index.html"],
  "/metodo": ["metodo.html", "metodo.html"],
  "/series": ["series.html", "series.html"],
  "/planos": ["planos.html", "planos.html"],
  "/desafio": ["desafio.html", "desafio.html"],
  "/recursos": ["recursos.html", "recursos.html"],
  "/blog": ["blog.html", "blog.html"],
  "/blog/para-comecar": ["blog/para-comecar.html", "blog-para-comecar.html"],
  "/blog/quando-nao-entendo": ["blog/quando-nao-entendo.html", "blog-quando-nao-entendo.html"],
  "/blog/cultura-no-dia-a-dia": [
    "blog/cultura-no-dia-a-dia.html",
    "blog-cultura-no-dia-a-dia.html",
  ],
  "/obrigado/desafio": ["obrigado/desafio.html", "obrigado-desafio.html"],
  "/obrigado/entender": ["obrigado/entender.html", "obrigado-entender.html"],
  "/obrigado/participar": ["obrigado/participar.html", "obrigado-participar.html"],
  "/entrar": ["entrar.html", "entrar.html"],
};

rmSync(destino, { recursive: true, force: true });
cpSync(origem, destino, { recursive: true });
for (const [deOut, naPrevia] of Object.values(paginas)) {
  if (deOut !== naPrevia) renameSync(join(destino, deOut), join(destino, naPrevia));
}
const manter = new Set([...Object.values(paginas).map(([, p]) => p), "_next", "marca", "icon.png"]);
for (const nome of readdirSync(destino)) {
  if (!manter.has(nome)) rmSync(join(destino, nome), { recursive: true, force: true });
}
rmSync(join(destino, "_next/static/chunks/app/%5Fui"), { recursive: true, force: true });
renameSync(join(destino, "_next"), join(destino, "n"));

// Links internos: rotas mais longas primeiro; aceita ?consulta e #âncora depois da rota.
const rotas = Object.entries(paginas).sort((a, b) => b[0].length - a[0].length);
const escapar = (t) => t.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&");

function trocarLinks(html) {
  let saida = html;
  for (const [rota, [, arquivo]] of rotas) {
    const r = escapar(rota);
    // Atributo no HTML: href="/rota", href="/rota?x=1"
    saida = saida.replace(new RegExp(`href="${r}(?=["?#])`, "g"), `href="./${arquivo}`);
    // Mesmo link dentro dos dados do React embutidos na página: \"href\":\"/rota\"
    saida = saida.replace(
      new RegExp(`(\\\\"href\\\\":\\\\")${r}(?=\\\\"|[?#])`, "g"),
      `$1./${arquivo}`,
    );
  }
  return saida;
}

// Faz os links abrirem o arquivo da prévia direto, sem o roteador do Next.
// Cobre também links montados no navegador (ex.: lista do blog), que saem como "/rota".
const mapa = Object.fromEntries(
  Object.entries(paginas).map(([rota, [, arquivo]]) => [rota, arquivo]),
);
const interceptor = `<script>(function(){var m=${JSON.stringify(mapa)};addEventListener("click",function(e){var a=e.target.closest&&e.target.closest("a[href]");if(!a)return;var h=a.getAttribute("href");if(/\\.html/.test(h)){e.stopPropagation();return}if(h.charAt(0)!=="/")return;var u=h.match(/^([^?#]*)(.*)$/);var f=m[u[1]];if(!f)return;e.preventDefault();e.stopPropagation();location.href="./"+f+u[2]},true)})()</script>`;

// O publicador recusa o caractere U+FFFD literal; em JS o escape é equivalente.
const substituto = String.fromCharCode(0xfffd);

function percorrer(dir) {
  for (const nome of readdirSync(dir)) {
    const caminho = join(dir, nome);
    if (statSync(caminho).isDirectory()) {
      percorrer(caminho);
      continue;
    }
    if (!/\.(html|js|css)$/.test(nome)) continue;
    const antes = readFileSync(caminho, "utf8");
    let depois = antes;
    if (nome.endsWith(".css")) {
      depois = depois.replace(/url\(\/_next\/static\/media\//g, "url(../media/");
    }
    depois = depois
      .replace(/(["'(]|\\")\/_next\//g, "$1./n/")
      .replace(/(["'(]|\\")\/marca\//g, "$1./marca/")
      .replace(/(["'(]|\\")\/icon\.png/g, "$1./icon.png");
    if (nome.endsWith(".html")) {
      depois = trocarLinks(depois).replace(/<body([^>]*)>/, `<body$1>${interceptor}`);
    }
    if (nome.endsWith(".js")) depois = depois.split(substituto).join("\\uFFFD");
    if (depois !== antes) writeFileSync(caminho, depois);
  }
}

percorrer(destino);
console.log("Prévia pronta em", destino);
