import { expect, test } from "@playwright/test";

// Percorre o site a partir do início e confere que todo link interno leva a uma rota que existe.
test("todos os links internos levam a páginas existentes", async ({ page, request }) => {
  test.setTimeout(120_000);
  const visitadas = new Set<string>();
  const verificadas = new Map<string, number>();
  const fila = ["/"];
  const origens = new Map<string, string>();

  while (fila.length > 0) {
    const caminho = fila.shift()!;
    if (visitadas.has(caminho)) continue;
    visitadas.add(caminho);
    await page.goto(caminho);
    const hrefs = await page.$$eval("a[href]", (as) => as.map((a) => a.getAttribute("href") ?? ""));
    for (const href of hrefs) {
      if (!href.startsWith("/") || href.startsWith("//")) continue; // externos, mailto, âncoras
      const destino = href.split(/[?#]/)[0] || "/";
      if (!origens.has(destino)) origens.set(destino, caminho);
      if (!verificadas.has(destino)) {
        verificadas.set(destino, (await request.get(destino)).status());
      }
      const ehPagina = !destino.startsWith("/_next") && !/\.\w+$/.test(destino);
      if (ehPagina && verificadas.get(destino) === 200 && !visitadas.has(destino))
        fila.push(destino);
    }
  }

  const quebrados = [...verificadas]
    .filter(([, s]) => s !== 200)
    .map(([d, s]) => `${d} (${s}) em ${origens.get(d)}`);
  expect(quebrados).toEqual([]);
  // Garante que o robô chegou a todas as páginas do site.
  for (const p of ["/metodo", "/series", "/planos", "/desafio", "/recursos", "/blog", "/entrar"]) {
    expect(visitadas.has(p), p).toBe(true);
  }
});
