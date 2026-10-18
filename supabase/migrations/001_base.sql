-- 001_base: perfis, direitos de acesso (planos), eventos do Stripe e funções comuns.

create extension if not exists pgcrypto;

-- Atualiza a coluna atualizado_em em qualquer UPDATE.
create or replace function public.tocar_atualizado_em()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.atualizado_em := now();
  return new;
end;
$$;

create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  nome text,
  fuso text,
  meta_diaria_min int not null default 20,
  legendas boolean not null default true,
  modo_escuro boolean not null default false,
  previa_video boolean not null default true,
  conta_privada boolean not null default false,
  email_novidades boolean default true,
  email_videos boolean default true,
  email_semanal boolean default true,
  stripe_customer_id text unique,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create trigger profiles_atualizado_em
  before update on public.profiles
  for each row execute function public.tocar_atualizado_em();

-- Cria o perfil assim que um usuário é criado no Auth.
create or replace function public.criar_perfil()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, nome, fuso, meta_diaria_min)
  values (new.id, null, 'Europe/Madrid', 20)
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger ao_criar_usuario
  after insert on auth.users
  for each row execute function public.criar_perfil();

create table public.entitlements (
  user_id uuid references public.profiles (id) on delete cascade,
  produto text not null check (produto in ('desafio', 'entender', 'participar')),
  status text not null,
  intervalo text,
  renova_em timestamptz,
  stripe_subscription_id text,
  comprado_em timestamptz default now(),
  primary key (user_id, produto)
);

create table public.stripe_eventos (
  id text primary key,
  recebido_em timestamptz default now()
);
