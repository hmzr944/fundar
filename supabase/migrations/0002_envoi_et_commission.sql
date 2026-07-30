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
