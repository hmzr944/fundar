-- ── 1. Policies Storage manquantes ────────────────────────────────────────
-- Il n'existait que SELECT et INSERT. Deux conséquences :
--   * le code utilise `upsert: true` (mandat, lettre, justificatif), ce qui
--     exige UPDATE : une re-signature ou un remplacement de pièce échouait ;
--   * sans DELETE, impossible de purger les fichiers d'un compte supprimé,
--     donc les cartes d'embarquement survivaient indéfiniment au compte.

-- `create policy if not exists` n'existe pas en Postgres : on droppe d'abord
-- pour que la migration puisse être rejouée sans erreur.
drop policy if exists "documents_storage_update_own" on storage.objects;
create policy "documents_storage_update_own" on storage.objects
  for update using (
    bucket_id = 'documents' and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "documents_storage_delete_own" on storage.objects;
create policy "documents_storage_delete_own" on storage.objects
  for delete using (
    bucket_id = 'documents' and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ── 2. Verrouillage du statut de dossier ──────────────────────────────────
-- `claims_update_own` autorisait un UPDATE sans restriction de colonnes :
-- un client pouvait passer son propre dossier en PAYE, changer le montant
-- ou le modèle juridique. Le statut et l'argent relèvent des fondateurs
-- (service_role), pas du client.

drop policy if exists "claims_update_own" on claims;

create policy "claims_update_own_champs_libres" on claims
  for update using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Filet de sécurité au niveau base : un client ne peut pas s'auto-déclarer
-- payé. Seul service_role (qui contourne RLS) peut écrire ces colonnes.
create or replace function protege_champs_sensibles_claims()
returns trigger
language plpgsql
as $$
declare
  role_appelant text;
begin
  -- Détection du serveur, volontairement redondante.
  --
  -- Un trigger s'exécute AUSSI pour service_role (contrairement à RLS, qui
  -- est contourné). Si la détection échoue, le trigger bloque les écritures
  -- légitimes du serveur : le passage en EN_COURS après un envoi réussi
  -- échouerait, et le dossier resterait marqué "non envoyé" alors que la
  -- compagnie a bien reçu la réclamation.
  --
  -- PostgREST fait `SET LOCAL ROLE service_role`, donc current_user suffit
  -- dans la quasi-totalité des cas. On garde le second test en secours pour
  -- les accès directs (psql, migrations, tâches d'administration).
  if current_user in ('service_role', 'supabase_admin', 'postgres') then
    return new;
  end if;

  begin
    role_appelant :=
      nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role';
  exception when others then
    -- Réglage absent ou non-JSON : on considère simplement que ce n'est
    -- pas le serveur, plutôt que de faire échouer la transaction.
    role_appelant := null;
  end;

  if role_appelant = 'service_role' then
    return new;
  end if;

  if new.statut_dossier is distinct from old.statut_dossier
     or new.montant_recupere is distinct from old.montant_recupere
     or new.commission_encaissee_le is distinct from old.commission_encaissee_le
     or new.taux_commission is distinct from old.taux_commission
     or new.reclamation_envoyee_le is distinct from old.reclamation_envoyee_le
     or new.modele_juridique is distinct from old.modele_juridique then
    raise exception 'Ces champs ne peuvent pas être modifiés par le client.';
  end if;

  return new;
end;
$$;

drop trigger if exists claims_protege_champs_sensibles on claims;
create trigger claims_protege_champs_sensibles
  before update on claims
  for each row execute function protege_champs_sensibles_claims();

-- ── 3. File d'attente des notifications ───────────────────────────────────
-- Les fondateurs changent le statut à la main dans Supabase : le client
-- n'était jamais prévenu et devait revenir "au cas où". Un envoi direct
-- depuis un trigger est fragile (pas de reprise sur échec), d'où une file
-- persistée que l'on vide via un endpoint dédié.

create table if not exists notifications_email (
  id uuid primary key default gen_random_uuid(),
  claim_id uuid not null references claims (id) on delete cascade,
  destinataire text not null,
  type_notification text not null,
  statut text not null default 'EN_ATTENTE'
    check (statut in ('EN_ATTENTE', 'ENVOYEE', 'ECHEC')),
  tentatives integer not null default 0,
  derniere_erreur text,
  creee_le timestamptz not null default now(),
  envoyee_le timestamptz
);

create index if not exists notifications_email_a_traiter
  on notifications_email (statut, creee_le)
  where statut = 'EN_ATTENTE';

-- RLS activée sans policy : lecture et écriture réservées au serveur
-- (service_role contourne RLS). Un client n'a rien à y faire.
alter table notifications_email enable row level security;

create or replace function file_notification_changement_statut()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  email_client text;
begin
  if new.statut_dossier is distinct from old.statut_dossier then
    select u.email into email_client from auth.users u where u.id = new.user_id;

    if email_client is not null then
      insert into notifications_email (claim_id, destinataire, type_notification)
      values (new.id, email_client, 'STATUT_' || new.statut_dossier);
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists claims_notifie_changement_statut on claims;
create trigger claims_notifie_changement_statut
  after update on claims
  for each row execute function file_notification_changement_statut();
