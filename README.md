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

- [x] Fase 0: base (tokens, fontes, componentes, vitrine `/_ui`)
- [x] Fase 1: site (Início, Como funciona, Séries, Planos, Desafio, Recursos, Blog, Obrigado, 404)
- [ ] Fase 2: Supabase e login (`/entrar` hoje só valida o e-mail; ver `TODO(Fase 2)`)
- [ ] Fase 3: app, telas principais
- [ ] Fase 4: Stripe e acesso (botões de compra levam a `/entrar`; ver `TODO(Fase 4)`)
- [ ] Fase 5: lives
- [ ] Fase 6: vocabulário
- [ ] Fase 7: V2
- [ ] Fase 8: qualidade e entrega

## Blog

Cada post é um arquivo `.mdx` em `content/blog/` que exporta `meta` (título, resumo, data, categoria, cena).
Para publicar, crie o arquivo e acrescente-o em `lib/blog.ts`.

## Prévia estática

`pnpm previa` gera em `.previa/` uma cópia do site com caminhos relativos, usada no link de visualização.

## Marcadores pendentes (`[PLACEHOLDER: ...]`)

Encontre todos com `grep -rn "PLACEHOLDER" app components lib content`.

**Textos e decisões**

- Início: frase do topo; número de alunos (só quando for verdadeiro).
- Caminhos e níveis: nomes dos três caminhos, subníveis e horas de cada um; nomes finais dos níveis (`components/ui/SeloEtapa.tsx`); horas dos 4 degraus da escada (Como funciona).
- Desafio 7 Dias: título e frase de cada um dos 7 dias.
- Séries: títulos das 6 séries de exemplo (`lib/dados-publicos.ts`).
- Perguntas frequentes: respostas finais (rascunhos em `lib/faq.ts`, cada um marcado "revisar com o Márlio").
- Blog: títulos, resumos e textos dos 3 posts (`content/blog/`).
- Obrigado Participar: dia e hora da próxima live (virá do banco na Fase 5).

**Pessoas e mídia**

- Foto e biografia do Márlio.
- Apresentadores convidados: nome, temas e foto.
- Depoimentos reais (texto e vídeo), com nome e país.
- Vídeo de exemplo de 30 segundos (Início).
- PDF do roteiro de níveis (Recursos; enquanto não existir, o botão fica desabilitado).
- Títulos dos vídeos de exemplo (vitrine `/_ui`).

**Fora do site**: hospedagem dos vídeos pagos (Bunny Stream ou Mux); registro fiscal/IVA; IDs dos preços do Participar no Stripe.
