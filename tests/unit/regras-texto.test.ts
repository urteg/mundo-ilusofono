import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

// Varre o código da interface e o conteúdo atrás de emoji e palavras proibidas (CLAUDE.md).
const pastas = ["app", "components", "lib", "content"];
const extensoes = /\.(tsx?|mdx|css)$/;

function arquivos(dir: string): string[] {
  return readdirSync(dir).flatMap((nome) => {
    const caminho = join(dir, nome);
    if (statSync(caminho).isDirectory()) return arquivos(caminho);
    return extensoes.test(nome) ? [caminho] : [];
  });
}

const todos = pastas.flatMap(arquivos);
const emoji = /\p{Extended_Pictographic}/u;
const proibidas = /input compreens|\bi\+1\b|\bGPA\b|H\.I\.C\.C|nutridor|\baprend/i;

describe("regras de texto", () => {
  it("encontra arquivos para varrer", () => {
    expect(todos.length).toBeGreaterThan(20);
  });

  it.each(todos)("%s sem emoji", (arquivo) => {
    expect(readFileSync(arquivo, "utf8")).not.toMatch(emoji);
  });

  it.each(todos)("%s sem palavras proibidas", (arquivo) => {
    expect(readFileSync(arquivo, "utf8")).not.toMatch(proibidas);
  });
});
