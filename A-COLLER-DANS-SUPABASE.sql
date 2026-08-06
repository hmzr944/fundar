-- Toutes les migrations Clearto, dans l'ordre 0001 -> 0007.
-- Fichier genere pour un collage unique dans le SQL Editor Supabase.
-- La reference versionnee reste supabase/migrations/*.sql

-- ============================================================
-- 0001_init.sql
-- ============================================================
-- Clearto V1 — schéma initial.
-- Une seule base, un seul repo (§C5). Région Supabase attendue: eu-central-1 (RGPD).

create extension if not exists "pgcrypto";

-- Profil complémentaire à auth.users (magic link only, pas de mot de passe).
create table if not exists profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  nom text,
  prenom text,
  adresse text,
  iban text,
  created_at timestamptz not null default now()
);

alter table profiles enable row level security;

drop policy if exists "profiles_select_own" on profiles;
create policy "profiles_select_own" on profiles
  for select using (auth.uid() = id);

drop policy if exists "profiles_upsert_own" on profiles;
create policy "profiles_upsert_own" on profiles
  for insert with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on profiles;
create policy "profiles_update_own" on profiles
  for update using (auth.uid() = id);

-- Un dossier = un vol perturbé + son verdict d'éligibilité + son suivi.
create table if not exists claims (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  numero_vol text not null,
  date_vol date not null,
  aeroport_depart text not null,
  aeroport_arrivee text not null,
  compagnie text not null,
  statut_eligibilite text not null check (
    statut_eligibilite in ('ELIGIBLE', 'INELIGIBLE', 'REVIEW_MANUEL', 'WAITLIST')
  ),
  montant_estime numeric,
  devise text check (devise in ('EUR', 'GBP')),
  motif text,
  explication text,
  -- Bascule sans migration une fois l'enregistrement Inkassodienstleister obtenu (§5).
  modele_juridique text not null default 'MANDAT' check (
    modele_juridique in ('MANDAT', 'CESSION')
  ),
  statut_dossier text not null default 'SOUMIS' check (
    statut_dossier in ('SOUMIS', 'EN_COURS', 'PAYE', 'REFUSE')
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table claims enable row level security;

drop policy if exists "claims_select_own" on claims;
create policy "claims_select_own" on claims
  for select using (auth.uid() = user_id);

drop policy if exists "claims_insert_own" on claims;
create policy "claims_insert_own" on claims
  for insert with check (auth.uid() = user_id);

drop policy if exists "claims_update_own" on claims;
create policy "claims_update_own" on claims
  for update using (auth.uid() = user_id);

-- Statut mis à jour manuellement par les fondateurs via l'interface Supabase (§F3) :
-- aucune interface d'admin dédiée en V1.

create table if not exists documents (
  id uuid primary key default gen_random_uuid(),
  claim_id uuid not null references claims (id) on delete cascade,
  type text not null check (
    type in ('CARTE_EMBARQUEMENT', 'CONFIRMATION_RESERVATION', 'MANDAT_SIGNE', 'LETTRE_RECLAMATION')
  ),
  -- Storage privé, jamais public (carte d'embarquement = donnée sensible, code-barres décodable).
  storage_path text not null,
  created_at timestamptz not null default now()
);

alter table documents enable row level security;

drop policy if exists "documents_select_own" on documents;
create policy "documents_select_own" on documents
  for select using (
    exists (select 1 from claims where claims.id = documents.claim_id and claims.user_id = auth.uid())
  );

drop policy if exists "documents_insert_own" on documents;
create policy "documents_insert_own" on documents
  for insert with check (
    exists (select 1 from claims where claims.id = documents.claim_id and claims.user_id = auth.uid())
  );

-- Preuve de signature du mandat : horodatage serveur + hash du PDF signé.
create table if not exists signatures (
  id uuid primary key default gen_random_uuid(),
  claim_id uuid not null references claims (id) on delete cascade,
  hash_sha256 text not null,
  signed_at timestamptz not null default now(),
  ip_address text
);

alter table signatures enable row level security;

drop policy if exists "signatures_select_own" on signatures;
create policy "signatures_select_own" on signatures
  for select using (
    exists (select 1 from claims where claims.id = signatures.claim_id and claims.user_id = auth.uid())
  );

drop policy if exists "signatures_insert_own" on signatures;
create policy "signatures_insert_own" on signatures
  for insert with check (
    exists (select 1 from claims where claims.id = signatures.claim_id and claims.user_id = auth.uid())
  );

-- Preuve d'acceptation des CGV / mention d'obligation de paiement (§C6).
create table if not exists consentements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  claim_id uuid references claims (id) on delete cascade,
  type text not null check (type in ('CGV', 'MANDAT')),
  accepted_at timestamptz not null default now(),
  ip_address text
);

alter table consentements enable row level security;

drop policy if exists "consentements_select_own" on consentements;
create policy "consentements_select_own" on consentements
  for select using (auth.uid() = user_id);

drop policy if exists "consentements_insert_own" on consentements;
create policy "consentements_insert_own" on consentements
  for insert with check (auth.uid() = user_id);

-- Compagnies WAITLIST (§3.2 étape 6) : capture d'email sans compte, pas de RLS nécessaire
-- côté lecture (jamais lu par le client), écriture ouverte via la clé anonyme.
create table if not exists waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  compagnie text not null,
  numero_vol text,
  created_at timestamptz not null default now()
);

alter table waitlist enable row level security;

drop policy if exists "waitlist_insert_anyone" on waitlist;
create policy "waitlist_insert_anyone" on waitlist
  for insert with check (true);

-- Storage : bucket privé pour cartes d'embarquement, confirmations et mandats
-- signés (§7 : donnée sensible, accès en storage privé, URL signées à
-- expiration courte générées côté serveur).
insert into storage.buckets (id, name, public)
values ('documents', 'documents', false)
on conflict (id) do nothing;

-- Chemin attendu : "<user_id>/<claim_id>/<fichier>" — le premier segment
-- du chemin doit correspondre à l'utilisateur authentifié.
drop policy if exists "documents_storage_select_own" on storage.objects;
create policy "documents_storage_select_own" on storage.objects
  for select using (
    bucket_id = 'documents' and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "documents_storage_insert_own" on storage.objects;
create policy "documents_storage_insert_own" on storage.objects
  for insert with check (
    bucket_id = 'documents' and (storage.foldername(name))[1] = auth.uid()::text
  );


-- ============================================================
-- 0002_envoi_et_commission.sql
-- ============================================================
-- Corrige deux trous du chemin critique "le client reçoit son argent" :
--   1) on ne savait pas si la réclamation était réellement partie, ni à qui ;
--   2) rien ne permettait de suivre l'argent récupéré ni la commission due.

-- ── 1. Traçabilité de l'envoi de la réclamation ────────────────────────────
-- statut_dossier passait à EN_COURS même quand rien n'était envoyé.
-- On sépare désormais "lettre générée" de "réclamation réellement transmise".

create table if not exists envois_reclamation (
  id uuid primary key default gen_random_uuid(),
  claim_id uuid not null references claims (id) on delete cascade,
  -- EMAIL / FORMULAIRE_WEB / COURRIER, tel que résolu par config/airline-contacts.ts
  mode text not null check (mode in ('EMAIL', 'FORMULAIRE_WEB', 'COURRIER')),
  -- Destinataire effectif. Conservé pour preuve en cas de litige.
  destinataire text not null,
  envoye_le timestamptz not null default now(),
  -- Renseigné à la main par les fondateurs pour un envoi non automatisable.
  envoi_manuel boolean not null default false,
  reference_externe text
);

alter table envois_reclamation enable row level security;

drop policy if exists "envois_select_own" on envois_reclamation;
create policy "envois_select_own" on envois_reclamation
  for select using (
    exists (
      select 1 from claims
      where claims.id = envois_reclamation.claim_id
        and claims.user_id = auth.uid()
    )
  );

-- Insertion réservée au serveur (service_role) : un client ne doit pas
-- pouvoir déclarer lui-même que sa réclamation a été envoyée.

-- Distingue "prêt à partir" de "réellement parti".
alter table claims
  add column if not exists reclamation_envoyee_le timestamptz;

comment on column claims.reclamation_envoyee_le is
  'Non nul uniquement si la réclamation a réellement été transmise à la compagnie. Tant que c''est nul, le dossier ne doit pas être présenté comme "en cours" au client.';

-- ── 2. Suivi de l'argent ───────────────────────────────────────────────────
-- Modèle mandat : la compagnie paie le client, qui reverse ensuite 22 %.
-- Sans ces colonnes, impossible de savoir ce qui a été récupéré ni facturé.

alter table claims
  add column if not exists montant_recupere numeric,
  add column if not exists devise_recuperee text,
  add column if not exists recupere_le date,
  add column if not exists commission_encaissee_le date;

-- Le taux est stocké par dossier : s'il change un jour, les anciens dossiers
-- gardent le taux réellement accepté par le client dans son mandat.
alter table claims
  add column if not exists taux_commission numeric not null default 0.22;

-- Postgres n'a pas de "add constraint if not exists" : on retire d'abord,
-- sinon rejouer cette migration échoue et laisse les suivantes non appliquées.
alter table claims
  drop constraint if exists claims_taux_commission_plausible;
alter table claims
  add constraint claims_taux_commission_plausible
    check (taux_commission > 0 and taux_commission <= 0.5);

-- Commission due, calculée par la base pour éviter toute divergence.
alter table claims
  add column if not exists commission_due numeric
    generated always as (
      case
        when montant_recupere is null then null
        else round(montant_recupere * taux_commission, 2)
      end
    ) stored;

comment on column claims.commission_due is
  'Calculée automatiquement : montant_recupere x taux_commission. Nulle tant que rien n''a été récupéré.';

-- Un dossier payé doit avoir un montant récupéré : évite un PAYE vide qui
-- ferait croire à tort que l'affaire est bouclée.
alter table claims
  drop constraint if exists claims_paye_implique_montant;
alter table claims
  add constraint claims_paye_implique_montant
    check (statut_dossier <> 'PAYE' or montant_recupere is not null);

-- ── 3. Anti-doublon ───────────────────────────────────────────────────────
-- Sans cela, le même vol pouvait générer plusieurs dossiers, donc plusieurs
-- réclamations envoyées à la compagnie pour un seul passager.
create unique index if not exists claims_dossier_unique
  on claims (user_id, numero_vol, date_vol);

-- ── 4. Preuve du consentement CGV ─────────────────────────────────────────
-- On enregistrait "CGV acceptées" sans savoir QUELLE version l'avait été.
-- En cas de litige, un consentement non rattaché à un texte daté est faible.
alter table consentements
  add column if not exists version_document text;

comment on column consentements.version_document is
  'Version du texte accepté (ex. "cgv-2026-07-30"). Doit correspondre à VERSION_CGV dans config/legal.ts.';


-- ============================================================
-- 0003_rgpd_et_notifications.sql
-- ============================================================
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

drop policy if exists "claims_update_own_champs_libres" on claims;
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


-- ============================================================
-- 0004_reponses_compagnie.sql
-- ============================================================
-- Instrumentation du seul chiffre qui justifie la commission.
--
-- On savait quand la réclamation partait et quand l'argent arrivait, mais
-- rien de ce qui se passe entre les deux : la compagnie a-t-elle répondu,
-- en combien de temps, et a-t-elle refusé ? Or c'est exactement là que se
-- joue l'argument commercial. Un passager qui fait la démarche seul obtient
-- facilement le premier envoi ; ce qu'il n'obtient pas, c'est la suite d'un
-- refus. Sans ces données, on ne peut ni le démontrer ni le chiffrer.

-- ── 1. Journal des réponses reçues ────────────────────────────────────────

create table if not exists reponses_compagnie (
  id uuid primary key default gen_random_uuid(),
  claim_id uuid not null references claims (id) on delete cascade,
  -- Date figurant sur la réponse, pas la date de saisie : c'est elle qui
  -- mesure le délai réel de la compagnie.
  recue_le date not null,
  nature text not null check (
    nature in (
      'ACCUSE_RECEPTION',
      'DEMANDE_INFO',
      'REFUS',
      'BON_ACHAT',
      'PAIEMENT_ANNONCE'
    )
  ),
  -- Motif tel qu'invoqué par la compagnie, recopié sans reformulation
  -- ("circonstance extraordinaire : météo", "vol opéré à l'heure"...).
  -- C'est ce corpus qui permettra de savoir quels refus sont contestables.
  motif_invoque text,
  montant_propose numeric,
  devise_proposee text check (devise_proposee in ('EUR', 'GBP')),
  notes text,
  saisie_le timestamptz not null default now()
);

create index if not exists reponses_compagnie_par_dossier
  on reponses_compagnie (claim_id, recue_le);

alter table reponses_compagnie enable row level security;

-- Le client voit les réponses de la compagnie sur SON dossier. C'est
-- délibéré : un refus caché au passager est exactement ce qu'on reproche
-- au secteur. L'écriture reste réservée au serveur (service_role, qui
-- contourne RLS) — aucune policy d'insertion n'est créée.
drop policy if exists "reponses_select_own" on reponses_compagnie;
create policy "reponses_select_own" on reponses_compagnie
  for select using (
    exists (
      select 1 from claims
      where claims.id = reponses_compagnie.claim_id
        and claims.user_id = auth.uid()
    )
  );

-- ── 2. Report de la première réponse sur le dossier ───────────────────────
-- Dénormalisé volontairement : les statistiques par compagnie se calculent
-- alors sans fenêtre glissante, et le tableau de bord reste lisible.

alter table claims
  add column if not exists premiere_reponse_le date,
  add column if not exists premiere_reponse_nature text;

comment on column claims.premiere_reponse_le is
  'Date de la PREMIÈRE réponse de la compagnie. Maintenue par trigger depuis reponses_compagnie, jamais saisie à la main.';

create or replace function maj_premiere_reponse_claim()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  envoyee timestamptz;
begin
  select reclamation_envoyee_le into envoyee
    from claims where id = new.claim_id;

  -- Une réponse à une réclamation jamais transmise est une erreur de
  -- saisie, pas une donnée. La laisser passer fausserait tous les délais.
  if envoyee is null then
    raise exception
      'Réponse impossible : la réclamation du dossier % n''a pas encore été transmise.',
      new.claim_id;
  end if;

  if new.recue_le < envoyee::date then
    raise exception
      'Réponse datée du % alors que la réclamation est partie le %.',
      new.recue_le, envoyee::date;
  end if;

  update claims
     set premiere_reponse_le = new.recue_le,
         premiere_reponse_nature = new.nature
   where id = new.claim_id
     and (premiere_reponse_le is null or new.recue_le < premiere_reponse_le);

  return new;
end;
$$;

drop trigger if exists reponses_maj_premiere on reponses_compagnie;
create trigger reponses_maj_premiere
  after insert on reponses_compagnie
  for each row execute function maj_premiere_reponse_claim();

-- ── 3. Extension de la protection des champs sensibles ────────────────────
-- Sans cela, un client pourrait déclarer lui-même que la compagnie a
-- répondu, via la policy claims_update_own. Les deux nouvelles colonnes
-- rejoignent donc la liste protégée (cf. migration 0003).

create or replace function protege_champs_sensibles_claims()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  role_appelant text;
begin
  -- Les triggers se déclenchent aussi pour le serveur, contrairement à RLS.
  if current_user in ('service_role', 'supabase_admin', 'postgres') then
    return new;
  end if;

  begin
    role_appelant :=
      nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role';
  exception when others then
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
     or new.premiere_reponse_le is distinct from old.premiere_reponse_le
     or new.premiere_reponse_nature is distinct from old.premiere_reponse_nature
     or new.modele_juridique is distinct from old.modele_juridique then
    raise exception 'Ces champs ne peuvent pas être modifiés par le client.';
  end if;

  return new;
end;
$$;


-- ============================================================
-- 0005_bornes_upload_et_mandat_unique.sql
-- ============================================================
-- Deux garde-fous qui manquaient sur des chemins où le client décide seul.

-- ── 1. Bornes réelles sur les dépôts de fichiers ──────────────────────────
-- Le formulaire se contente d'un attribut `accept`, qui n'est qu'une
-- suggestion pour le sélecteur de fichiers du navigateur. Rien n'empêchait
-- un compte de déposer plusieurs gigaoctets, ni un type arbitraire, dans un
-- bucket dont le quota gratuit est d'un gigaoctet au total.
--
-- Contrairement à toute vérification faite dans la page, celle-ci est
-- appliquée par le stockage et ne se contourne pas.

update storage.buckets
   set file_size_limit = 10485760, -- 10 Mo, aligné sur lib/validation/fichier.ts
       allowed_mime_types = array[
         'image/jpeg',
         'image/png',
         'image/heic',
         'image/heif',
         'image/webp',
         'application/pdf'
       ]
 where id = 'documents';

-- ── 2. Un mandat ne se signe qu'une fois ──────────────────────────────────
-- La route du mandat pouvait être rejouée : chaque appel écrasait le PDF,
-- ajoutait une signature et un consentement de plus, et permettait surtout
-- de remplacer après coup l'IBAN ou l'identité d'un dossier déjà transmis à
-- la compagnie. La preuve de signature perdait alors toute valeur, puisque
-- plusieurs empreintes contradictoires coexistaient pour un même dossier.

-- Nettoyage préalable : ne conserver que la première signature de chaque
-- dossier, sans quoi l'index unique ne peut pas être créé.
delete from signatures s
 where exists (
   select 1 from signatures plus_ancienne
    where plus_ancienne.claim_id = s.claim_id
      and plus_ancienne.signed_at < s.signed_at
 );

create unique index if not exists signatures_une_par_dossier
  on signatures (claim_id);

comment on index signatures_une_par_dossier is
  'Un dossier ne peut porter qu''une signature. Toute resignature doit passer par une révocation explicite du mandat, jamais par un simple rejeu de la route.';


-- ============================================================
-- 0006_facturation_et_relances.sql
-- ============================================================
-- Le seul endroit où l'argent nous revient, et il n'existait pas.
--
-- Dans le modèle mandat, la compagnie verse l'indemnisation AU PASSAGER.
-- Il nous doit ensuite la commission, qu'il envoie de son plein gré, après
-- avoir déjà obtenu ce qu'il voulait. Rien dans le produit ne facturait, ne
-- relançait, ni même ne permettait d'apprendre qu'il avait été payé — on ne
-- pouvait le savoir que s'il se dénonçait spontanément.

-- ── 1. Le passager déclare avoir été payé ─────────────────────────────────
-- Colonnes distinctes de montant_recupere / recupere_le, qui restent
-- réservées au serveur : la déclaration du client est une information, pas
-- une vérité comptable. Elle déclenche la facturation, elle ne la remplace
-- pas.

alter table claims
  add column if not exists paiement_declare_le date,
  add column if not exists montant_declare numeric;

comment on column claims.paiement_declare_le is
  'Date à laquelle LE CLIENT déclare avoir reçu son indemnisation. À confirmer avant facturation : montant_recupere reste la valeur comptable.';

-- Suivi des relances, pour ne pas écrire trois fois la même semaine.
alter table claims
  add column if not exists derniere_relance_paiement_le date,
  add column if not exists nombre_relances_paiement integer not null default 0;

-- ── 2. Factures ───────────────────────────────────────────────────────────
-- Numérotation par séquence : une facturation française doit être continue
-- et sans trou. Un compteur calculé à la volée (max + 1) produirait des
-- doublons dès deux facturations simultanées.

create sequence if not exists factures_numero_seq;

create table if not exists factures (
  id uuid primary key default gen_random_uuid(),
  claim_id uuid not null references claims (id) on delete restrict,
  user_id uuid not null references auth.users (id) on delete restrict,
  -- Numéro lisible, ex. "2026-0001". Attribué par trigger, jamais à la main.
  numero text not null unique,
  montant numeric not null check (montant > 0),
  devise text not null check (devise in ('EUR', 'GBP')),
  -- Base de calcul, conservée pour que la facture reste explicable des
  -- années plus tard même si le taux par défaut a changé depuis.
  montant_indemnisation numeric not null,
  taux_commission numeric not null,
  emise_le timestamptz not null default now(),
  payee_le timestamptz,
  -- Lien de paiement (Stripe Checkout) quand il est disponible.
  lien_paiement text,
  storage_path text
);

-- Une seule facture par dossier : refacturer produirait deux créances pour
-- une seule commission.
create unique index if not exists factures_une_par_dossier
  on factures (claim_id);

create or replace function attribuer_numero_facture()
returns trigger
language plpgsql
as $$
begin
  if new.numero is null or new.numero = '' then
    new.numero := to_char(now(), 'YYYY') || '-' ||
                  lpad(nextval('factures_numero_seq')::text, 4, '0');
  end if;
  return new;
end;
$$;

drop trigger if exists factures_numero on factures;
create trigger factures_numero
  before insert on factures
  for each row execute function attribuer_numero_facture();

alter table factures enable row level security;

-- Le client voit ses factures. Il n'en crée aucune : une facture émise par
-- son destinataire n'a aucune valeur.
drop policy if exists "factures_select_own" on factures;
create policy "factures_select_own" on factures
  for select using (auth.uid() = user_id);

-- ── 3. Le client peut déclarer son paiement, rien d'autre ─────────────────
-- Les colonnes de déclaration sont volontairement absentes de la liste
-- protégée par le trigger de la migration 0003 : c'est le seul champ que le
-- client doit pouvoir écrire lui-même. En revanche il ne doit toujours pas
-- toucher au montant réellement encaissé ni au statut.


-- ============================================================
-- 0007_passagers.sql
-- ============================================================
-- L'indemnisation EU261 est due PAR PASSAGER, et un dossier n'en portait
-- qu'un seul. Une famille de quatre sur un Paris–New York valait donc
-- 600 € dans le produit, contre 2 400 € en droit.

create table if not exists passagers (
  id uuid primary key default gen_random_uuid(),
  claim_id uuid not null references claims (id) on delete cascade,
  nom text not null check (length(trim(nom)) > 0),
  prenom text not null check (length(trim(prenom)) > 0),
  -- Rang 1 = titulaire du compte, signataire du mandat. Le plafond de 9
  -- est repris de MAX_PASSAGERS (lib/claims/passagers.ts) : au-delà, une
  -- compagnie exige une procédure de groupe et rejette le dossier tel quel.
  rang smallint not null check (rang between 1 and 9),
  created_at timestamptz not null default now()
);

-- Deux fois le même rang, ou deux fois la même personne, ferait réclamer
-- en double — et la compagnie rejette alors le dossier entier, pas
-- seulement la ligne fautive.
create unique index if not exists passagers_rang_unique
  on passagers (claim_id, rang);

create unique index if not exists passagers_identite_unique
  on passagers (claim_id, lower(trim(nom)), lower(trim(prenom)));

create index if not exists passagers_par_dossier
  on passagers (claim_id, rang);

alter table passagers enable row level security;

drop policy if exists "passagers_select_own" on passagers;
create policy "passagers_select_own" on passagers
  for select using (
    exists (
      select 1 from claims
      where claims.id = passagers.claim_id
        and claims.user_id = auth.uid()
    )
  );

drop policy if exists "passagers_insert_own" on passagers;
create policy "passagers_insert_own" on passagers
  for insert with check (
    exists (
      select 1 from claims
      where claims.id = passagers.claim_id
        and claims.user_id = auth.uid()
    )
  );

-- Aucune policy de mise à jour ni de suppression : le mandat signé nomme
-- la liste, et la modifier après coup détruirait la valeur probante de la
-- signature. Un changement passe par une révocation, comme pour l'IBAN.

-- Dénormalisé pour que le tableau de bord et la lettre affichent le nombre
-- sans recompter à chaque lecture.
alter table claims
  add column if not exists nombre_passagers smallint not null default 1;

alter table claims
  drop constraint if exists claims_nombre_passagers_plausible;
alter table claims
  add constraint claims_nombre_passagers_plausible
    check (nombre_passagers between 1 and 9);

comment on column claims.nombre_passagers is
  'Nombre de passagers du dossier. montant_estime et montant_recupere restent des TOTAUX, déjà multipliés : la facturation et la commission sont inchangées.';


