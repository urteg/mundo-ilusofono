-- 008_conta: preferências da conta (tema e fuso) e limites do tempo fora do app.

-- Tema do app: segue o sistema por padrão; o participante pode fixar claro ou escuro.
-- Substitui modo_escuro (sim/não), que não tinha como dizer "seguir o sistema".
alter table public.profiles
  add column tema text not null default 'sistema' check (tema in ('sistema', 'claro', 'escuro')),
  add column fuso_escolhido boolean not null default false,
  drop column modo_escuro;

-- fuso_escolhido = o participante escolheu o fuso na conta; enquanto for falso,
-- o app usa o fuso do navegador.
grant update (tema, fuso_escolhido) on public.profiles to authenticated;

-- Nome com tamanho razoável.
alter table public.profiles
  add constraint profiles_nome_tamanho check (nome is null or char_length(nome) <= 80);

-- Tempo fora do app: até 12 h por registro e nota de até 140 caracteres.
alter table public.tempo_fora
  add constraint tempo_fora_limite check (segundos <= 12 * 3600),
  add constraint tempo_fora_nota_tamanho check (nota is null or char_length(nota) <= 140);
