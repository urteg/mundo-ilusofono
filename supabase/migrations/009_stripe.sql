-- 009_stripe: dados para o webhook do Stripe manter os acessos (entitlements).

alter table public.entitlements
  -- Primeira falha de pagamento ainda não resolvida: o acesso continua por 3 dias a partir daqui.
  add column pagamento_falhou_em timestamptz,
  -- Momento (event.created) do último evento do Stripe aplicado a esta linha.
  -- Eventos chegam fora de ordem; um evento mais antigo não sobrescreve um mais novo.
  add column stripe_evento_em timestamptz,
  add column atualizado_em timestamptz not null default now(),
  add constraint entitlements_intervalo check (intervalo is null or intervalo in ('mensal', 'anual'));

create index entitlements_assinatura on public.entitlements (stripe_subscription_id);

create trigger entitlements_atualizado_em
  before update on public.entitlements
  for each row execute function public.tocar_atualizado_em();

-- Registro dos eventos já processados (idempotência): guarda também o tipo.
alter table public.stripe_eventos add column tipo text;

-- Acha o usuário do Auth pelo e-mail (o webhook precisa disso para compras de quem
-- ainda não tem conta). Só a service role chama.
create or replace function public.usuario_por_email(p_email text)
returns uuid
language sql
security definer
set search_path = ''
stable
as $$
  select id from auth.users where lower(email) = lower(p_email) limit 1;
$$;

revoke execute on function public.usuario_por_email(text) from public, anon, authenticated;
grant execute on function public.usuario_por_email(text) to service_role;
