-- 003_progresso: tempo assistido, séries salvas, atividade diária, tempo fora do app,
-- passos da lição de hoje e conquistas.

create table public.visualizacoes (
  user_id uuid references public.profiles (id) on delete cascade,
  video_id uuid references public.videos (id) on delete cascade,
  segundos int not null default 0,
  posicao_seg int not null default 0,
  concluido boolean not null default false,
  entendimento text check (entendimento in ('quase_tudo', 'principal', 'pouco')),
  salvo boolean not null default false,
  curtido boolean not null default false,
  atualizado_em timestamptz not null default now(),
  primary key (user_id, video_id)
);

create index visualizacoes_usuario_atualizado on public.visualizacoes (user_id, atualizado_em);

create trigger visualizacoes_atualizado_em
  before update on public.visualizacoes
  for each row execute function public.tocar_atualizado_em();

create table public.series_salvas (
  user_id uuid references public.profiles (id) on delete cascade,
  serie_id uuid references public.series (id) on delete cascade,
  primary key (user_id, serie_id)
);

-- A chave primária (user_id, dia) já serve de índice para (user_id, dia).
create table public.atividade_diaria (
  user_id uuid references public.profiles (id) on delete cascade,
  dia date not null,
  segundos int not null default 0,
  primary key (user_id, dia)
);

create table public.tempo_fora (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete cascade,
  tipo text not null check (tipo in ('assistindo', 'ouvindo', 'conversando')),
  dia date not null,
  segundos int not null check (segundos > 0),
  nota text,
  criado_em timestamptz default now()
);

create index tempo_fora_usuario_dia on public.tempo_fora (user_id, dia);

create table public.licao_passos (
  user_id uuid references public.profiles (id) on delete cascade,
  dia date not null,
  video_id uuid references public.videos (id),
  assistiu boolean default false,
  entendeu boolean default false,
  participou boolean default false,
  primary key (user_id, dia)
);

create table public.conquistas (
  slug text primary key,
  nome text,
  descricao text
);

create table public.conquistas_aluno (
  user_id uuid references public.profiles (id) on delete cascade,
  slug text references public.conquistas (slug),
  obtida_em timestamptz default now(),
  primary key (user_id, slug)
);
