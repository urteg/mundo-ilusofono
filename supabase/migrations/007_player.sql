-- 007_player: preferências do player, temas na view pública e registro do tempo assistido.

alter table public.profiles
  add column reproducao_automatica boolean not null default true,
  add column pular_vistos boolean not null default false;

grant update (reproducao_automatica, pular_vistos) on public.profiles to authenticated;

-- A view ganha os temas (slugs) e a legenda; as colunas novas vão no fim.
create or replace view public.v_videos_publicos
with (security_invoker = false) as
select
  v.id, v.serie_id, v.titulo, v.descricao, v.ordem, v.duracao_seg, v.nivel, v.pais,
  v.apresentador_id, v.provedor, v.miniatura, v.plano_minimo, v.adulto, v.desafio_dia,
  v.publicado_em,
  coalesce(
    (select array_agg(t.slug order by t.slug)
     from public.video_temas vt join public.temas t on t.id = vt.tema_id
     where vt.video_id = v.id),
    '{}'
  ) as temas
from public.videos v;

-- Soma o tempo assistido em uma transação. Chamada só pelo servidor (/api/progresso),
-- depois de conferir sessão, plano e limites; por isso não fica disponível para o cliente.
create or replace function public.registrar_progresso(
  p_user uuid,
  p_video uuid,
  p_delta int,
  p_posicao int,
  p_dia date
)
returns table (segundos int, posicao_seg int, concluido boolean, recem_concluido boolean)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_duracao int;
  v_antes boolean;
  v_depois boolean;
begin
  select duracao_seg into v_duracao from public.videos where id = p_video;
  if v_duracao is null then
    raise exception 'video inexistente';
  end if;

  select vis.concluido into v_antes
  from public.visualizacoes vis where vis.user_id = p_user and vis.video_id = p_video;

  insert into public.visualizacoes as vis (user_id, video_id, segundos, posicao_seg, concluido)
  values (p_user, p_video, p_delta, p_posicao, p_posicao >= 0.9 * v_duracao or p_delta >= 0.9 * v_duracao)
  on conflict (user_id, video_id) do update
    set segundos = vis.segundos + excluded.segundos,
        posicao_seg = excluded.posicao_seg,
        concluido = vis.concluido
          or excluded.posicao_seg >= 0.9 * v_duracao
          or vis.segundos + excluded.segundos >= 0.9 * v_duracao
  returning vis.concluido into v_depois;

  if p_delta > 0 then
    insert into public.atividade_diaria as a (user_id, dia, segundos)
    values (p_user, p_dia, p_delta)
    on conflict (user_id, dia) do update set segundos = a.segundos + excluded.segundos;
  end if;

  if v_depois and not coalesce(v_antes, false) then
    update public.licao_passos lp set assistiu = true
    where lp.user_id = p_user and lp.dia = p_dia and lp.video_id = p_video;
  end if;

  return query
    select vis.segundos, vis.posicao_seg, vis.concluido, (v_depois and not coalesce(v_antes, false))
    from public.visualizacoes vis where vis.user_id = p_user and vis.video_id = p_video;
end;
$$;

revoke all on function public.registrar_progresso(uuid, uuid, int, int, date) from public, anon, authenticated;
grant execute on function public.registrar_progresso(uuid, uuid, int, int, date) to service_role;

-- O tempo assistido só é gravado por registrar_progresso (via /api/progresso).
-- O participante continua podendo salvar, curtir, avaliar e marcar como visto.
revoke insert, update on public.visualizacoes from authenticated;
grant insert (user_id, video_id, salvo, curtido, entendimento, concluido)
  on public.visualizacoes to authenticated;
grant update (salvo, curtido, entendimento, concluido) on public.visualizacoes to authenticated;
revoke insert, update on public.atividade_diaria from authenticated;
