-- 005_lives: aulas ao vivo. sala_url é sensível: só sai pelo servidor (ver 006_rls).

create table public.lives (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  inicio timestamptz not null,
  duracao_min int default 60,
  sala_url text,
  gravacao_video_id uuid references public.videos (id),
  so_participar boolean default true
);

create index lives_inicio on public.lives (inicio);
