-- 006_rls: segurança por linha em TODAS as tabelas.
--
-- Regras:
-- * O aluno lê e escreve só as próprias linhas.
-- * entitlements: o aluno só lê; quem escreve é o webhook do Stripe (service role).
-- * Conteúdo: leitura para quem está logado.
-- * videos.video_ref e lives.sala_url nunca saem por consulta do cliente: as tabelas
--   videos e lives ficam sem acesso para anon/authenticated, e o cliente usa as views
--   v_videos_publicos e v_lives_publicas (sem essas colunas). A entrega do video_ref e da
--   sala_url é feita só por Route Handler no servidor, com a service role.

alter table public.profiles enable row level security;
alter table public.entitlements enable row level security;
alter table public.stripe_eventos enable row level security;
alter table public.apresentadores enable row level security;
alter table public.temas enable row level security;
alter table public.series enable row level security;
alter table public.videos enable row level security;
alter table public.video_temas enable row level security;
alter table public.visualizacoes enable row level security;
alter table public.series_salvas enable row level security;
alter table public.atividade_diaria enable row level security;
alter table public.tempo_fora enable row level security;
alter table public.licao_passos enable row level security;
alter table public.conquistas enable row level security;
alter table public.conquistas_aluno enable row level security;
alter table public.palavras enable row level security;
alter table public.video_palavras enable row level security;
alter table public.palavras_aluno enable row level security;
alter table public.lives enable row level security;

-- Perfil: o próprio aluno lê e altera (a criação é feita pelo gatilho criar_perfil).
create policy "perfil: ler o próprio" on public.profiles
  for select to authenticated using (id = (select auth.uid()));
create policy "perfil: alterar o próprio" on public.profiles
  for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));
-- O aluno só altera as preferências; stripe_customer_id e datas ficam com o servidor.
-- (Revogar uma coluna não basta enquanto existir permissão na tabela inteira.)
revoke insert, update, delete on public.profiles from authenticated;
grant update (
  nome, fuso, meta_diaria_min, legendas, modo_escuro, previa_video, conta_privada,
  email_novidades, email_videos, email_semanal
) on public.profiles to authenticated;

-- Direitos de acesso: somente leitura para o aluno.
create policy "entitlements: ler os próprios" on public.entitlements
  for select to authenticated using (user_id = (select auth.uid()));

-- stripe_eventos: sem políticas (só a service role acessa).

-- Tabelas do aluno: tudo, mas só nas próprias linhas.
do $$
declare
  t text;
begin
  foreach t in array array[
    'visualizacoes', 'series_salvas', 'atividade_diaria', 'tempo_fora',
    'licao_passos', 'palavras_aluno', 'conquistas_aluno'
  ] loop
    execute format(
      'create policy "%1$s: só as próprias linhas" on public.%1$I for all to authenticated '
      'using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()))',
      t
    );
  end loop;
end;
$$;

-- Conteúdo: leitura para quem está logado.
do $$
declare
  t text;
begin
  foreach t in array array[
    'apresentadores', 'temas', 'series', 'video_temas', 'palavras', 'video_palavras', 'conquistas'
  ] loop
    execute format(
      'create policy "%1$s: leitura para logados" on public.%1$I for select to authenticated using (true)',
      t
    );
  end loop;
end;
$$;

-- Conteúdo só se lê; nenhuma escrita pelo cliente.
revoke insert, update, delete on
  public.apresentadores, public.temas, public.series, public.video_temas,
  public.palavras, public.video_palavras, public.conquistas, public.entitlements,
  public.stripe_eventos
from anon, authenticated;

-- Visitantes sem login não acessam nenhuma tabela diretamente.
revoke all on all tables in schema public from anon;

-- videos e lives: sem acesso direto do cliente (por causa de video_ref e sala_url).
revoke all on public.videos, public.lives from anon, authenticated;

-- Views públicas, sem as colunas sensíveis. Rodam com os direitos do dono
-- (security_invoker = false), por isso funcionam mesmo sem acesso à tabela.
create view public.v_videos_publicos
with (security_invoker = false) as
select
  id, serie_id, titulo, descricao, ordem, duracao_seg, nivel, pais, apresentador_id,
  provedor, miniatura, plano_minimo, adulto, desafio_dia, publicado_em
from public.videos;

create view public.v_lives_publicas
with (security_invoker = false) as
select id, titulo, inicio, duracao_min, gravacao_video_id, so_participar
from public.lives;

-- Dados para as páginas públicas do site (sem login).
create view public.v_series_publicas
with (security_invoker = false) as
select
  s.id, s.titulo, s.descricao, s.nivel, s.capa, s.ordem,
  a.nome as apresentador_nome,
  (select count(*) from public.videos v where v.serie_id = s.id)::int as episodios
from public.series s
left join public.apresentadores a on a.id = s.apresentador_id;

create view public.v_apresentadores_publicos
with (security_invoker = false) as
select id, nome, pais, temas, foto from public.apresentadores;

revoke all on public.v_videos_publicos, public.v_lives_publicas,
  public.v_series_publicas, public.v_apresentadores_publicos from anon, authenticated;
grant select on public.v_videos_publicos, public.v_lives_publicas,
  public.v_series_publicas, public.v_apresentadores_publicos to anon, authenticated;
