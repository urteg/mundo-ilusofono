// Compartilhar um link: Web Share quando existe; se não, copia o endereço.

export type ResultadoCompartilhar = "compartilhado" | "copiado" | "cancelado" | "erro";

export async function compartilhar(
  titulo: string,
  caminho: string,
): Promise<ResultadoCompartilhar> {
  const url = new URL(caminho, window.location.origin).toString();
  if (typeof navigator.share === "function") {
    try {
      await navigator.share({ title: titulo, url });
      return "compartilhado";
    } catch (e) {
      if ((e as Error).name === "AbortError") return "cancelado";
    }
  }
  try {
    await navigator.clipboard.writeText(url);
    return "copiado";
  } catch {
    return "erro";
  }
}

export const mensagemCompartilhar: Record<ResultadoCompartilhar, string | null> = {
  compartilhado: null,
  cancelado: null,
  copiado: "Link copiado.",
  erro: "Não foi possível copiar o link.",
};
