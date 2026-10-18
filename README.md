# Mundo Ilusófono

Plataforma de vídeos em português brasileiro para estrangeiros: site de venda + aplicativo web do aluno.

> O português se vive, não só se estuda.

Regras do projeto: ver `CLAUDE.md`. Plano completo por fases: `docs/Instrucoes-Claude-Code-Mundo-Ilusofono.md`.

## Como rodar

Requisitos: Node 20+, pnpm. (Fases seguintes: Supabase CLI e Stripe CLI.)

```bash
pnpm install
cp .env.example .env.local   # preencha os valores
pnpm dev                     # http://localhost:3000
```

| Comando                        | O que faz                                      |
| ------------------------------ | ---------------------------------------------- |
| `pnpm dev`                     | servidor de desenvolvimento                    |
| `pnpm build` / `pnpm start`    | build de produção                              |
| `pnpm lint` / `pnpm typecheck` | ESLint e TypeScript                            |
| `pnpm test`                    | testes de unidade (Vitest)                     |
| `pnpm e2e`                     | testes de fluxo (Playwright, 1360 px e 390 px) |
| `pnpm format`                  | Prettier                                       |
| `pnpm db:reset`                | migrações + seed no Supabase local (fase 2)    |

Se o Playwright não puder baixar navegadores, aponte para um Chromium local:
`PLAYWRIGHT_CHROMIUM_PATH=/caminho/do/chrome pnpm e2e`.

## Estrutura

- `app/tokens.css`: tokens de design (cores, raio, sombra). Espelhados no `@theme` de `app/globals.css` (Tailwind v4).
- `components/ui`: Botao/BotaoLink, Cartao, Chip, SeloNivel, SeloPlano, BarraProgresso, Pilula, Dialogo, Acordeao, Icone.
- `/_ui` (`app/%5Fui`): vitrine dos componentes.
- `tests/unit`, `tests/e2e`.

## Variáveis de ambiente

Ver `.env.example`. Nenhuma chave secreta vai para o repositório nem para o cliente; só as `NEXT_PUBLIC_*` chegam ao navegador.

## Andamento

- [x] Fase 0: base
- [ ] Fase 1: site
- [ ] Fase 2: Supabase e login
- [ ] Fase 3: app, telas principais
- [ ] Fase 4: Stripe e acesso
- [ ] Fase 5: lives
- [ ] Fase 6: vocabulário
- [ ] Fase 7: V2
- [ ] Fase 8: qualidade e entrega

## Marcadores pendentes (`[PLACEHOLDER: ...]`)

Encontre todos com `grep -rn "PLACEHOLDER" app components lib supabase`.

- Títulos de vídeos (exemplos na vitrine `/_ui`).
- Pendências gerais do Márlio: foto e biografia final; depoimentos reais; títulos de séries, vídeos e dos 7 dias do Desafio; nomes dos três caminhos e horas por nível; apresentadores convidados; hospedagem dos vídeos pagos (Bunny Stream ou Mux); registro fiscal/IVA; IDs dos preços do Participar no Stripe.
