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
