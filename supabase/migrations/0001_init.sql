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
