# Mundo Ilusófono

Plataforma de vídeos em português para estrangeiros, com falantes de vários países onde a língua é falada (português pluricêntrico): site de venda + aplicativo web do participante.
Lema oficial, sempre exatamente: "O português se vive, não só se estuda."

## Regras que nunca se quebram

1. Interface SOMENTE em português do Brasil (os vídeos, sim, trazem o português de vários países). Sem seletor de idioma, sem botão de traduzir, sem textos em inglês/espanhol. `<html lang="pt-BR">`. Texto sempre como texto real (nunca em imagem), para o tradutor do navegador funcionar.
2. Todos os preços já incluem o IVA. Exibir "IVA incluído" junto dos preços (nunca "+ IVA"). Fonte única: `lib/precos.ts`. No Stripe: tax_behavior = inclusive.
3. Sem emoji em nenhum lugar (UI, código, commits, seeds). Ícones são SVG de traço.
4. Texto em minúsculas de frase (só a primeira letra maiúscula). Tratamento "você". Quem usa a plataforma é "participante", nunca "aluno".
5. Palavras proibidas na interface: "input compreensível", "i+1", "GPA", "H.I.C.C.", "nutridor". Evitar "aprender": preferir "entender".
6. Sem senha: login por link no e-mail (Supabase magic link).
7. Acessibilidade: contraste AA, alvos de toque >= 44px, foco visível, aria-label em ícones, legenda ligada por padrão, respeitar prefers-reduced-motion.
8. Responsivo de verdade: 390px a 1440px, sem rolagem horizontal.
9. Nada de depoimentos, números de alunos ou fotos inventados. Use marcadores [PLACEHOLDER: ...] visíveis e fáceis de achar com grep.
10. Nunca coloque chaves secretas no código nem no cliente. Use variáveis de ambiente.
11. Não copie nomes, textos, imagens ou identidade do Sprout nem do Dreaming Spanish: replique só as funções.

## Stack

Next.js (App Router) + TypeScript + Tailwind CSS; Supabase (Auth, Postgres, RLS); Stripe (Checkout, Customer Portal, Webhooks, Stripe Tax); Resend para e-mail; deploy na Vercel. Testes: Vitest (unidade) e Playwright (fluxos).

## Comandos

- `pnpm dev` | `pnpm build` | `pnpm lint` | `pnpm typecheck` | `pnpm test` | `pnpm e2e`
- `pnpm db:reset` aplica migrações e seed no Supabase local
- `stripe listen --forward-to localhost:3000/api/stripe/webhook`

## Convenções

- Componentes em `components/{ui,site,app}`; lógica em `lib/`; migrações em `supabase/migrations`.
- Tokens de design em `app/tokens.css` (CSS variables). O projeto usa Tailwind v4: os tokens são espelhados no bloco `@theme` de `app/globals.css` (equivale ao `tailwind.config`), gerando classes como `bg-azul-acao`, `text-texto-suave`, `font-titulo`.
- Contraste: `--azul` e `--dourado` só para elementos decorativos/grandes; texto e botões usam `--azul-acao`, `--coral-texto`, `--fogo`.
- Pastas iniciadas por `_` são privadas no App Router; a rota `/_ui` vive em `app/%5Fui`.
- Server Actions e Route Handlers validam com zod. Nunca confiar no cliente para checar plano.
- Commits curtos em português, no imperativo ("Adiciona filtros da biblioteca").
- Antes de dar uma fase por pronta: rodar lint, typecheck, test e abrir a página no navegador.

## Marcadores

Tudo o que depende do Márlio fica como `[PLACEHOLDER: ...]`. Liste-os no README.
