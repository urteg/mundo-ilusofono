# Mundo Ilusófono

Plataforma de vídeos em português brasileiro para estrangeiros: site de venda + aplicativo web do participante.

> O português se vive, não só se estuda.

Regras do projeto: ver `CLAUDE.md`. Plano completo por fases: `docs/Instrucoes-Claude-Code-Mundo-Ilusofono.md`.

## Como rodar

Requisitos: Node 20+, pnpm e Docker (para o Supabase local). O Supabase CLI já vem nas dependências.

```bash
pnpm install
pnpm db:start                # sobe o Supabase local (banco, login e Mailpit)
pnpm exec supabase status    # mostra URL e chaves locais
cp .env.example .env.local   # preencha com os valores do status
pnpm dev                     # http://localhost:3000
```

E-mails de login no ambiente local: abra o Mailpit em http://127.0.0.1:54324.
Usuário de teste do seed: `teste@exemplo.com` (plano Entender ativo).

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
- [x] Fase 2: Supabase, RLS e login por link no e-mail
- [ ] Fase 3: app, telas principais (feito: casca do app, pílulas de meta e sequência, Lição de hoje, tempo fora do app; falta: Assistir, Séries, Vídeo, Progresso, Conta)
- [ ] Fase 4: Stripe e acesso (botões de compra levam a `/entrar`; ver `TODO(Fase 4)`)
- [ ] Fase 5: lives
- [ ] Fase 6: vocabulário
- [ ] Fase 7: V2
- [ ] Fase 8: qualidade e entrega

## Banco de dados

Migrações em `supabase/migrations/` (001_base a 006_rls) e dados de exemplo em `supabase/seed.sql`.

- RLS ligada em todas as tabelas. O participante lê e escreve só o que é dele; `entitlements` é só leitura para o participante; conteúdo é leitura para quem está logado.
- `videos.video_ref` e `lives.sala_url` nunca saem por consulta do cliente: as tabelas `videos` e `lives` não têm acesso para `anon`/`authenticated`. O cliente usa as views `v_videos_publicos` e `v_lives_publicas`. O site público usa também `v_series_publicas` e `v_apresentadores_publicos`.
- Clientes: `lib/supabase/cliente.ts` (navegador), `servidor.ts` (servidor com cookies, e cliente público sem sessão para páginas estáticas), `admin.ts` (service role, só no servidor).

## Supabase real: o que configurar

1. Criar o projeto em supabase.com (região na UE, ex.: Frankfurt) e anotar URL, chave `anon` e `service_role` (Project Settings > API). Colocar nas variáveis da Vercel; a `service_role` nunca vai para o navegador.
2. Aplicar as migrações: `pnpm exec supabase link --project-ref <ref>` e `pnpm exec supabase db push`. Não rodar o `seed.sql` em produção.
3. Authentication > URL Configuration: Site URL = endereço do site (ex.: `https://mundoilusofono.com`); Redirect URLs = `https://mundoilusofono.com/auth/callback` (e o endereço de prévia da Vercel, se usar).
4. Authentication > Sign In / Providers > Email: ligado; "Confirm email" pode ficar ligado (o link de acesso já confirma).
5. Authentication > Emails > SMTP Settings: usar o Resend (host `smtp.resend.com`, porta 465, usuário `resend`, senha = chave da API do Resend, remetente de um domínio verificado no Resend). Sem SMTP próprio, o Supabase limita a poucos e-mails por hora.
6. Authentication > Emails > Templates: em "Magic Link" e "Confirm signup", assunto "Seu link para entrar no Mundo Ilusófono" e o HTML de `supabase/templates/link-acesso.html`.
7. Authentication > Rate Limits: revisar o limite de e-mails por hora depois de ligar o SMTP.

## Blog

Cada post é um arquivo `.mdx` em `content/blog/` que exporta `meta` (título, resumo, data, categoria, cena).
Para publicar, crie o arquivo e acrescente-o em `lib/blog.ts`.

## Prévia estática

`pnpm previa` gera em `.previa/` uma cópia do site com caminhos relativos, usada no link de visualização.

## Marcadores pendentes (`[PLACEHOLDER: ...]`)

Encontre todos com `grep -rn "PLACEHOLDER" app components lib content`.

**Textos e decisões**

- Início: frase do topo; número de participantes (só quando for verdadeiro).
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

**Fora do site**: hospedagem dos vídeos pagos (Bunny Stream ou Mux); registro fiscal/IVA; criar no Stripe os preços com IVA incluído (Entender €7,99 e €55, Participar €13,99 e €99, Desafio €9,90) e arquivar os antigos.
