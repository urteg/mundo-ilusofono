-- Dados de exemplo para o banco local (pnpm db:reset).
-- Títulos de vídeo são marcadores: o Márlio troca pelos reais.

-- Apresentadores
insert into public.apresentadores (id, nome, pais, temas, foto) values
  ('a0000000-0000-4000-8000-000000000001', 'Márlio', 'Brasil', array['cotidiano', 'cultura', 'conversa'], null),
  ('a0000000-0000-4000-8000-000000000002', '[PLACEHOLDER: apresentador convidado]', 'Brasil', array['[PLACEHOLDER: temas]'], null);

-- Temas
insert into public.temas (id, slug, nome) values
  ('b0000000-0000-4000-8000-000000000001', 'cotidiano', 'Cotidiano'),
  ('b0000000-0000-4000-8000-000000000002', 'comida', 'Comida'),
  ('b0000000-0000-4000-8000-000000000003', 'familia', 'Família'),
  ('b0000000-0000-4000-8000-000000000004', 'cidade', 'Cidade');

-- Séries (capa = nome da cena ilustrada do site)
insert into public.series (id, titulo, descricao, nivel, capa, apresentador_id, ordem) values
  ('c0000000-0000-4000-8000-000000000001', 'A cidade', '[PLACEHOLDER: descrição da série]', '0', 'mar', 'a0000000-0000-4000-8000-000000000001', 1),
  ('c0000000-0000-4000-8000-000000000002', 'A cozinha', '[PLACEHOLDER: descrição da série]', '1', 'feira', 'a0000000-0000-4000-8000-000000000001', 2),
  ('c0000000-0000-4000-8000-000000000003', 'A família', '[PLACEHOLDER: descrição da série]', '2', 'campo', 'a0000000-0000-4000-8000-000000000002', 3);

-- 12 vídeos, 4 por série. Planos: 3 grátis, 8 entender, 1 participar.
-- Os 7 primeiros formam o Desafio 7 Dias (desafio_dia 1 a 7).
insert into public.videos
  (id, serie_id, titulo, ordem, duracao_seg, nivel, pais, apresentador_id, provedor, video_ref, plano_minimo, desafio_dia)
select
  ('d0000000-0000-4000-8000-0000000000' || lpad(n::text, 2, '0'))::uuid,
  ('c0000000-0000-4000-8000-00000000000' || ((n - 1) / 4 + 1))::text::uuid,
  '[PLACEHOLDER: título do vídeo ' || n || ']',
  (n - 1) % 4 + 1,
  180 + n * 30,
  ((n - 1) / 4)::text,
  'Brasil',
  case when n <= 8 then 'a0000000-0000-4000-8000-000000000001'::uuid
       else 'a0000000-0000-4000-8000-000000000002'::uuid end,
  'youtube',
  'exemplo-ref-' || n,
  case when n in (1, 2, 5) then 'gratis' when n = 12 then 'participar' else 'entender' end,
  case when n <= 7 then n end
from generate_series(1, 12) as n;

insert into public.video_temas (video_id, tema_id)
select v.id, t.id
from public.videos v
join public.temas t on t.slug = case v.serie_id
  when 'c0000000-0000-4000-8000-000000000001' then 'cidade'
  when 'c0000000-0000-4000-8000-000000000002' then 'comida'
  else 'familia' end;

-- 5 palavras por vídeo (60 palavras). Definição e exemplo são marcadores.
with lista(texto, pos) as (
  select texto, ordinality
  from unnest(array[
    'a rua', 'o ônibus', 'a praça', 'o semáforo', 'a esquina',
    'o mercado', 'a padaria', 'o troco', 'a fila', 'o calor',
    'a calçada', 'o prédio', 'o bairro', 'a feira', 'o metrô',
    'a ponte', 'o centro', 'a loja', 'o barulho', 'a chuva',
    'a panela', 'o fogão', 'a colher', 'o arroz', 'o feijão',
    'a farinha', 'o tempero', 'a receita', 'o forno', 'a faca',
    'o prato', 'a xícara', 'o café', 'a manteiga', 'o sal',
    'a cebola', 'o alho', 'a geladeira', 'o almoço', 'a sobremesa',
    'a avó', 'o primo', 'a tia', 'o irmão', 'a mãe',
    'o pai', 'a sobrinha', 'o neto', 'a casa', 'o quintal',
    'a mesa', 'o aniversário', 'a foto', 'o abraço', 'a visita',
    'o domingo', 'a saudade', 'o cachorro', 'a varanda', 'o jantar'
  ]) with ordinality as l(texto, ordinality)
),
novas as (
  insert into public.palavras (id, texto, definicao, exemplo)
  select
    ('e0000000-0000-4000-8000-0000000000' || lpad(pos::text, 2, '0'))::uuid,
    texto,
    '[PLACEHOLDER: definição]',
    '[PLACEHOLDER: exemplo]'
  from lista
  returning id
)
select count(*) from novas;

insert into public.video_palavras (video_id, palavra_id)
select
  ('d0000000-0000-4000-8000-0000000000' || lpad(v::text, 2, '0'))::uuid,
  ('e0000000-0000-4000-8000-0000000000' || lpad(((v - 1) * 5 + k)::text, 2, '0'))::uuid
from generate_series(1, 12) as v, generate_series(1, 5) as k;

-- 3 lives futuras, alternando quarta 19:00 e sexta 12:00 (horário de Madri),
-- sempre a partir de agora: próxima quarta, sexta da semana seguinte, quarta da outra.
with agora as (
  select now() at time zone 'Europe/Madrid' as local
),
quarta as (
  select case
    when date_trunc('week', local) + interval '2 days 19 hours' > local
      then date_trunc('week', local) + interval '2 days 19 hours'
    else date_trunc('week', local) + interval '9 days 19 hours'
  end as inicio_local
  from agora
)
insert into public.lives (titulo, inicio, duracao_min, sala_url, so_participar)
select titulo, (inicio_local + deslocamento) at time zone 'Europe/Madrid', 60, sala, true
from quarta,
  (values
    ('[PLACEHOLDER: tema da live 1]', interval '0', 'https://exemplo.invalid/sala-1'),
    ('[PLACEHOLDER: tema da live 2]', interval '9 days' - interval '7 hours', 'https://exemplo.invalid/sala-2'),
    ('[PLACEHOLDER: tema da live 3]', interval '14 days', 'https://exemplo.invalid/sala-3')
  ) as l(titulo, deslocamento, sala);

-- Conquistas
insert into public.conquistas (slug, nome, descricao) values
  ('primeiros-passos', 'Primeiros passos', 'Concluir 5 séries do nível inicial.'),
  ('sequencia-7', 'Uma semana seguida', 'Cumprir a meta diária 7 dias seguidos.'),
  ('sequencia-30', 'Trinta dias seguidos', 'Cumprir a meta diária 30 dias seguidos.'),
  ('semanas-seguidas', 'Semanas seguidas', 'Assistir em 4 semanas seguidas.'),
  ('primeira-live', 'Primeira live', 'Participar de uma live ao vivo.');

-- Usuário de teste (login por link: use teste@exemplo.com e abra o e-mail no Mailpit local).
-- O gatilho criar_perfil cria o perfil automaticamente.
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, email_change, email_change_token_new, recovery_token
) values (
  '00000000-0000-0000-0000-000000000000', 'f0000000-0000-4000-8000-000000000001',
  'authenticated', 'authenticated', 'teste@exemplo.com', '', now(),
  '{"provider": "email", "providers": ["email"]}', '{}', now(), now(), '', '', '', ''
);

insert into auth.identities (
  id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at
) values (
  gen_random_uuid(), 'f0000000-0000-4000-8000-000000000001', 'f0000000-0000-4000-8000-000000000001',
  '{"sub": "f0000000-0000-4000-8000-000000000001", "email": "teste@exemplo.com", "email_verified": true}',
  'email', now(), now(), now()
);

-- Plano Entender ativo para o usuário de teste (útil nas próximas fases).
insert into public.entitlements (user_id, produto, status, intervalo, renova_em)
values ('f0000000-0000-4000-8000-000000000001', 'entender', 'active', 'mensal', now() + interval '30 days');
