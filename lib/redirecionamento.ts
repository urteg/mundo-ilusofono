const padrao = "/app";

/**
 * Valida o ?proximo= para evitar redirecionamento aberto: só aceita caminhos internos
 * ("/app/planos"), nunca outro site ("https://...", "//site", "/\\site").
 */
export function caminhoSeguro(valor: string | null | undefined, reserva = padrao): string {
  if (!valor) return reserva;
  let caminho: string;
  try {
    caminho = decodeURIComponent(valor).trim();
  } catch {
    return reserva;
  }
  if (!caminho.startsWith("/")) return reserva;
  if (caminho.startsWith("//") || caminho.startsWith("/\\")) return reserva;
  // Caracteres de controle (ex.: "/\t/site") e barras invertidas confundem os navegadores.
  if (/[\u0000-\u001f\\]/.test(caminho)) return reserva;
  try {
    const url = new URL(caminho, "http://interno.invalid");
    if (url.origin !== "http://interno.invalid") return reserva;
    return url.pathname + url.search + url.hash;
  } catch {
    return reserva;
  }
}
