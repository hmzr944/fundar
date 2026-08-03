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
