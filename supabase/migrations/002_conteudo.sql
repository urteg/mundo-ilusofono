-- 002_conteudo: apresentadores, temas, séries e vídeos.

create table public.apresentadores (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  pais text,
  temas text[],
  foto text
);

create table public.temas (
  id uuid primary key default gen_random_uuid(),
  slug text unique,
  nome text
);

create table public.series (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  descricao text,
  nivel text not null,
  capa text,
  apresentador_id uuid references public.apresentadores (id),
  ordem int
);

create table public.videos (
  id uuid primary key default gen_random_uuid(),
  serie_id uuid references public.series (id),
  titulo text not null,
  descricao text,
  ordem int,
  duracao_seg int not null,
  nivel text not null,
  pais text,
  apresentador_id uuid references public.apresentadores (id),
  provedor text not null default 'youtube',
  video_ref text,
  legenda_url text,
  miniatura text,
  plano_minimo text not null default 'entender'
    check (plano_minimo in ('gratis', 'entender', 'participar')),
  adulto boolean default false,
  desafio_dia int check (desafio_dia between 1 and 7),
  publicado_em timestamptz default now()
);

create index videos_serie_ordem on public.videos (serie_id, ordem);
create index videos_nivel on public.videos (nivel);

create table public.video_temas (
  video_id uuid references public.videos (id) on delete cascade,
  tema_id uuid references public.temas (id) on delete cascade,
  primary key (video_id, tema_id)
);
