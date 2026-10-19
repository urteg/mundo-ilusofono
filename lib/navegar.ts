// Navegação completa (sai do app, ex.: para o Stripe). Separada para os testes poderem simular.
export function irPara(url: string) {
  window.location.assign(url);
}
