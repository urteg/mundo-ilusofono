-- 004_vocabulario: palavras, palavras de cada vídeo e palavras do participante (repetição espaçada).

create table public.palavras (
  id uuid primary key default gen_random_uuid(),
  texto text not null,
  audio_url text,
  imagem_url text,
  definicao text,
  exemplo text,
  uso text,
  ajuda text
);

create table public.video_palavras (
  video_id uuid references public.videos (id) on delete cascade,
  palavra_id uuid references public.palavras (id) on delete cascade,
  primary key (video_id, palavra_id)
);

create table public.palavras_aluno (
  user_id uuid references public.profiles (id) on delete cascade,
  palavra_id uuid references public.palavras (id) on delete cascade,
  estado text not null default 'aprendendo' check (estado in ('aprendendo', 'aprendida')),
  intervalo_dias int default 1,
  proxima_revisao date default current_date,
  acertos int default 0,
  primary key (user_id, palavra_id)
);
