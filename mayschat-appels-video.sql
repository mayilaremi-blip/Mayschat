-- =====================================================================
-- MAYSCHAT : appels vidéo (ajout à la base de données)
-- À coller dans Supabase > SQL Editor > New query, puis "Run".
-- À exécuter UNE SEULE FOIS, après le premier script.
-- =====================================================================

-- Chaque membre reçoit ses signaux d'appel sur un canal privé "user:<son id>".
-- Personne ne peut lire le canal d'un autre membre.
create policy "recevoir ses signaux d'appel" on realtime.messages
  for select to authenticated
  using (
    realtime.messages.extension = 'broadcast'
    and (select realtime.topic()) = 'user:' || (select auth.uid())::text
  );

-- Envoi d'un signal à un autre membre. L'expéditeur est toujours l'utilisateur
-- connecté : il est impossible d'usurper l'identité de quelqu'un d'autre.
create or replace function public.send_signal(target uuid, kind text, data jsonb default '{}'::jsonb)
returns void
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then
    raise exception 'Connexion requise';
  end if;
  if target = auth.uid() then
    raise exception 'Appel à soi-même impossible';
  end if;
  if kind not in ('offer','answer','ice','decline','busy','hangup') then
    raise exception 'Signal inconnu';
  end if;
  if length(data::text) > 20000 then
    raise exception 'Signal trop volumineux';
  end if;
  if not exists (select 1 from public.profiles where id = target) then
    raise exception 'Membre inconnu';
  end if;
  perform realtime.send(
    jsonb_build_object('from', auth.uid(), 'kind', kind, 'data', data),
    'signal',
    'user:' || target::text,
    true
  );
end $$;

revoke all on function public.send_signal(uuid, text, jsonb) from public, anon;
grant execute on function public.send_signal(uuid, text, jsonb) to authenticated;

-- Fin du script.
