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
