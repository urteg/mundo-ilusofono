# Mundo Ilusófono: instruções para construir no Claude Code

Como usar: abra o Claude Code nesta pasta, com o `CLAUDE.md` na raiz, e cole os prompts de fase da seção 8, um por vez (cada fase termina com verificação). Mantenha junto, na pasta `docs/`: `Mapa-Sprout-Dreaming-e-Fusao.md`, este arquivo e as exportações do Claude Design (telas e tokens).

## 1. CLAUDE.md

Ver `../CLAUDE.md` (fonte de verdade).

## 2. Pré-requisitos (faça uma vez)

1. Supabase: criar projeto (ou usar o CLI local). Anotar URL, anon key e service role key.
2. Stripe (modo de teste): produtos já criados: Entender `prod_VSoqh0jh3KoqDP`, Participar `prod_VSp09Q6KVHqGkw`, Desafio `prod_VSon5dQInRGmVn`. Decisão de 18/10/2026: os preços já incluem o IVA (tax_behavior = inclusive). Criar os preços novos: Entender €7,99/mês e €55/ano; Participar €13,99/mês e €99/ano; Desafio €9,90 (pagamento único). Arquivar os preços antigos (€6,99, €49, €12,99, €89 e €9, sem imposto). Copiar os `price_...` para as variáveis de ambiente.
3. Resend: criar chave de API e domínio (ou usar o SMTP do Supabase no teste).
4. Instalar: Node 20+, pnpm, Supabase CLI, Stripe CLI.

Variáveis: ver `.env.example`.

## 3. Estrutura de pastas

```
app/
  (site)/ page.tsx, metodo, series, planos, desafio, recursos, blog, obrigado/[produto]
  entrar/
  app/ (layout com barra superior, protegido)
    page.tsx                 Início "Lição de hoje"
    assistir/ series/ series/[id]/ video/[id]/ video/[id]/vocabulario/
    palavras/ lives/ progresso/ progresso/fora/ planos/ conta/
  api/stripe/{checkout,portal,webhook}/route.ts
  api/progresso/route.ts     batimento de tempo assistido
components/{ui,site,app}
lib/{supabase,stripe,entitlements,progress,streak,time,filters}
supabase/{migrations,seed.sql}
docs/ (design, mapa, instruções)
```

## 4. Tokens (app/tokens.css)

```css
:root {
  --azul: #0984e3;
  --azul-acao: #0665b8;
  --azul-fundo: #0a3d62;
  --dourado: #e3ba14;
  --verde: #00b894;
  --coral: #ff6b35;
  --coral-texto: #c2410c;
  --fogo: #9a3412;
  --papel: #fdfaf4;
  --areia: #ece4d2;
  --borda: #cfc6b2;
  --texto: #1e272e;
  --texto-suave: #4a5560;
  --branco: #ffffff;
  --raio-card: 22px;
  --sombra: 0 4px 16px rgba(30, 39, 46, 0.1);
}
```

Fontes (next/font/google): Fredoka (500, 600, 700), Nunito Sans (400, 600, 700), Caveat (600).

## 5. Banco de dados (migração inicial)

```sql
create extension if not exists pgcrypto;

create table profiles(
  id uuid primary key references auth.users on delete cascade,
  nome text, fuso text, meta_diaria_min int not null default 20,
  legendas boolean not null default true, modo_escuro boolean not null default false,
  previa_video boolean not null default true, conta_privada boolean not null default false,
  email_novidades boolean default true, email_videos boolean default true, email_semanal boolean default true,
  stripe_customer_id text unique, criado_em timestamptz not null default now()
);

create table entitlements(
  user_id uuid references profiles(id) on delete cascade,
  produto text not null check (produto in ('desafio','entender','participar')),
  status text not null, intervalo text, renova_em timestamptz,
  stripe_subscription_id text, comprado_em timestamptz default now(),
  primary key (user_id, produto)
);

create table apresentadores(id uuid primary key default gen_random_uuid(), nome text not null, pais text, temas text[], foto text);
create table temas(id uuid primary key default gen_random_uuid(), slug text unique, nome text);
create table series(
  id uuid primary key default gen_random_uuid(), titulo text not null, descricao text,
  nivel text not null, capa text, apresentador_id uuid references apresentadores(id), ordem int
);
create table videos(
  id uuid primary key default gen_random_uuid(), serie_id uuid references series(id),
  titulo text not null, descricao text, ordem int, duracao_seg int not null,
  nivel text not null, pais text, apresentador_id uuid references apresentadores(id),
  provedor text not null default 'youtube', video_ref text, legenda_url text, miniatura text,
  plano_minimo text not null default 'entender' check (plano_minimo in ('gratis','entender','participar')),
  adulto boolean default false, desafio_dia int check (desafio_dia between 1 and 7),
  publicado_em timestamptz default now()
);
create table video_temas(video_id uuid references videos(id) on delete cascade, tema_id uuid references temas(id) on delete cascade, primary key(video_id,tema_id));

create table visualizacoes(
  user_id uuid references profiles(id) on delete cascade, video_id uuid references videos(id) on delete cascade,
  segundos int not null default 0, posicao_seg int not null default 0, concluido boolean not null default false,
  entendimento text check (entendimento in ('quase_tudo','principal','pouco')), salvo boolean not null default false,
  curtido boolean not null default false, atualizado_em timestamptz not null default now(),
  primary key (user_id, video_id)
);
create table series_salvas(user_id uuid references profiles(id) on delete cascade, serie_id uuid references series(id) on delete cascade, primary key(user_id,serie_id));
create table atividade_diaria(user_id uuid references profiles(id) on delete cascade, dia date not null, segundos int not null default 0, primary key(user_id,dia));
create table tempo_fora(id uuid primary key default gen_random_uuid(), user_id uuid references profiles(id) on delete cascade,
  tipo text not null check (tipo in ('assistindo','ouvindo','conversando')), dia date not null, segundos int not null check (segundos>0), nota text, criado_em timestamptz default now());
create table licao_passos(user_id uuid references profiles(id) on delete cascade, dia date not null, video_id uuid references videos(id),
  assistiu boolean default false, entendeu boolean default false, participou boolean default false, primary key(user_id,dia));

create table palavras(id uuid primary key default gen_random_uuid(), texto text not null, audio_url text, imagem_url text, definicao text, exemplo text, uso text, ajuda text);
create table video_palavras(video_id uuid references videos(id) on delete cascade, palavra_id uuid references palavras(id) on delete cascade, primary key(video_id,palavra_id));
create table palavras_aluno(user_id uuid references profiles(id) on delete cascade, palavra_id uuid references palavras(id) on delete cascade,
  estado text not null default 'aprendendo' check (estado in ('aprendendo','aprendida')), intervalo_dias int default 1, proxima_revisao date default current_date, acertos int default 0,
  primary key(user_id,palavra_id));

create table lives(id uuid primary key default gen_random_uuid(), titulo text not null, inicio timestamptz not null, duracao_min int default 60,
  sala_url text, gravacao_video_id uuid references videos(id), so_participar boolean default true);

create table conquistas(slug text primary key, nome text, descricao text);
create table conquistas_aluno(user_id uuid references profiles(id) on delete cascade, slug text references conquistas(slug), obtida_em timestamptz default now(), primary key(user_id,slug));

create table stripe_eventos(id text primary key, recebido_em timestamptz default now());
```

RLS: ligar em todas as tabelas. Aluno lê/escreve só as próprias linhas (`auth.uid() = user_id`) em `profiles`, `visualizacoes`, `series_salvas`, `atividade_diaria`, `tempo_fora`, `licao_passos`, `palavras_aluno`, `conquistas_aluno`; `entitlements` somente leitura para o aluno (escrita só pelo webhook com service role). `series`, `videos`, `apresentadores`, `temas`, `palavras`, `lives`, `conquistas`: leitura para usuários logados; `video_ref` e `sala_url` de conteúdo pago só saem por Route Handler que confere `entitlements` no servidor.

Seed: 3 séries (a cidade, a cozinha, a família), 12 vídeos de exemplo com títulos `[PLACEHOLDER]` e níveis variados (alguns `gratis`, outros `entender`, 1 `participar`), 2 apresentadores, 4 temas, 5 palavras por vídeo, 3 lives futuras com horários alternados (quarta 19:00 e sexta 12:00, Europe/Madrid), 5 conquistas, 1 usuário de teste.

## 6. Regras de negócio (implementar em `lib/`)

- Acesso (`lib/entitlements.ts`): `podeAssistir(video, entitlements)`: `gratis` sempre; `entender` se tiver `entender` ou `participar` ativo; `participar` só com `participar`. O `desafio` libera apenas vídeos com `desafio_dia`, um por dia a partir de `comprado_em`. Status `past_due` mantém acesso por 3 dias; `canceled` perde o acesso quando `renova_em` passar.
- Meta e sequência (`lib/streak.ts`): meta cumprida no dia se `atividade_diaria.segundos >= meta_diaria_min*60` (dia no fuso do aluno). Sequência = dias consecutivos cumpridos terminando hoje ou ontem. Se quebrar, volta a zero sem mensagem de culpa. Troféu aos 30 dias.
- Tempo assistido (`/api/progresso`): o player manda um batimento a cada 15 s enquanto toca e a aba está ativa, com `video_id`, `delta` (max 20 s) e `posicao_seg`. Atualiza `visualizacoes` e `atividade_diaria`. `concluido` aos 90%. Rejeitar deltas absurdos.
- Horas (`lib/progress.ts`): horas = (soma de `visualizacoes.segundos` + soma de `tempo_fora.segundos`) / 3600. Nível pela tabela de horas `[PLACEHOLDER: horas por nível, a definir pelo Márlio]`; valor provisório: 0, 50, 150, 300, 600, 1000, 1500 (7 degraus).
- Lição de hoje: recomendar o primeiro vídeo não visto do nível do aluno, respeitando o plano; `licao_passos` marca Assistir (ao concluir o vídeo), Entender (ao salvar as palavras ou concluir o vocabulário) e Participar (ao entrar numa live ou marcar "conversei").
- Repetição espaçada (`lib/srs.ts`): acertou, intervalo x2 (1, 2, 4, 8, 16, 32 dias); errou, volta a 1. Palavra vira `aprendida` com 5 acertos seguidos.
- Lives: horários vêm do banco e são convertidos para o fuso do aluno com `Intl.DateTimeFormat`. Contagem regressiva no cliente. Gerar `.ics` no servidor. Entender vê só gravações; Participar vê ao vivo + gravações.
- Conquistas (V2): `primeiros-passos`, `sequencia-30`, `semanas-seguidas`, etc., avaliadas no mesmo Route Handler dos batimentos.

## 7. Stripe

- Checkout (`POST /api/stripe/checkout`): valida `{produto, intervalo}` com zod; mapeia para `STRIPE_PRICE_*`; obtém/cria cliente por e-mail e grava `stripe_customer_id`; cria a sessão com `mode: 'subscription'` (ou `'payment'` para o Desafio), `automatic_tax: {enabled: true}`, `billing_address_collection: 'required'`, `tax_id_collection: {enabled: true}`, `customer_update: {address:'auto', name:'auto'}`, `success_url: /obrigado/{produto}`, `cancel_url: /planos`; devolve a URL.
- Webhook (`POST /api/stripe/webhook`): verificar assinatura com `STRIPE_WEBHOOK_SECRET`; idempotência guardando `event.id` em `stripe_eventos`; tratar `checkout.session.completed`, `customer.subscription.created|updated|deleted`, `invoice.payment_failed`; atualizar `entitlements`; se o usuário não existir no Supabase, criá-lo e enviar o link de acesso.
- Portal (`POST /api/stripe/portal`): só logado; cria sessão do Customer Portal e redireciona. Configurar no painel: trocar de plano (entre os 4 preços), atualizar cartão, ver recibos, cancelar.
- Imposto: preços com IVA incluído (tax_behavior = inclusive); Stripe Tax ligado. O registro fiscal (IVA Espanha/UE) será definido com o gestor antes do modo real. Cartão de teste: `4242 4242 4242 4242`.

## 8. Fases

- Fase 0, base: projeto, tokens, fontes, ESLint, Prettier, Vitest, Playwright, `.env.example`, README, componentes base em `components/ui` e página `/_ui`. Verificação: `/_ui` mostra todos os componentes em desktop e 390px, sem rolagem horizontal.
- Fase 1, site: Início, Método, Séries (pública), Planos (alternador mensal/anual), Desafio 7 Dias, Recursos e FAQ, Blog, Obrigado (3 produtos). Navegação e rodapé comuns, "IVA incluído", metadados e Open Graph. Verificação: grep de PLACEHOLDER, nenhuma palavra proibida, Lighthouse a11y > 90.
- Fase 2, Supabase e login: migrações com RLS, seed, `pnpm db:reset`, `/entrar` com magic link, criação de `profiles`, middleware protegendo `/app/*`, teste de RLS com segundo usuário.
- Fase 3, app: layout com barra superior/inferior, Lição de hoje, Assistir, Séries, Vídeo (`<VideoPlayer>` youtube/file), Progresso, Horas fora do app, Conta, `/api/progresso`, `lib/streak.ts`, `lib/progress.ts`, testes de unidade.
- Fase 4, Stripe e acesso: checkout, webhook, portal, `lib/entitlements.ts` no servidor, `/app/planos`, testes do webhook.
- Fase 5, lives: `/app/lives`, contagem regressiva, fuso, `.ics`, gravações, bloqueios, link da sala só pelo servidor.
- Fase 6, vocabulário: `/app/video/[id]/vocabulario`, `/app/palavras`, flashcards com `lib/srs.ts`.
- Fase 7, V2: conquistas, perfil, curtir/compartilhar, comentários, notificações, modo escuro, prévia, e-mail semanal (Resend).
- Fase 8, qualidade e entrega: a11y, responsivo 390/768/1360, desempenho, segurança (RLS, zod, CSP, rate limit), e2e, README final.

## 9. Definição de pronto

1. Todas as rotas existem e navegam entre si.
2. Nenhum texto fora do português; nenhum emoji; todos os preços com "IVA incluído".
3. Compra de teste dos 3 produtos cria o acesso correto; o portal abre; cancelar funciona.
4. Login por e-mail funciona; `/app/*` sem sessão volta para `/entrar`.
5. Entender não entra ao vivo; Participar entra; gratuitos veem o convite.
6. Meta diária, sequência e horas atualizam enquanto o vídeo toca.
7. 390 px e 1360 px sem rolagem horizontal; Lighthouse de acessibilidade acima de 90.
8. Nenhuma chave secreta no repositório nem no cliente.
9. README completo e lista de marcadores pendentes.

## 10. O que o Márlio ainda precisa fornecer

Foto e biografia final; depoimentos reais; títulos de séries, vídeos e dos 7 dias do Desafio; nomes dos três caminhos e horas por nível; apresentadores convidados; decisão de hospedagem dos vídeos pagos (candidatos: Bunny Stream, Mux); registro fiscal/IVA com o gestor antes do modo real; IDs dos preços do Participar no Stripe.
