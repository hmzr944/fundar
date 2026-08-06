#!/usr/bin/env bash
#
# Rejoue toutes les migrations, dans l'ordre, sur une base Postgres jetable.
#
# Une migration qui échoue sur Supabase laisse le schéma à moitié appliqué et
# se corrige à chaud, en production, sur des données réelles. Ce script coûte
# vingt secondes et supprime ce risque.
#
# Usage : ./scripts/verifier-migrations.sh
set -euo pipefail

RACINE="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CLUSTER="${TMPDIR:-/tmp}/clearto-pg-verif"
PORT="${PGPORT_VERIF:-54329}"
BIN="/usr/lib/postgresql/16/bin"

# Postgres refuse de tourner en root. En conteneur CI on est souvent root :
# on bascule alors sur le compte système postgres, présent avec le paquet.
if [ "$(id -u)" -eq 0 ]; then
  COMME="setpriv --reuid=postgres --regid=postgres --clear-groups"
  install -d -o postgres -g postgres "$(dirname "$CLUSTER")"
else
  COMME=""
fi

nettoyer() {
  $COMME "$BIN/pg_ctl" -D "$CLUSTER" -m immediate stop >/dev/null 2>&1 || true
  rm -rf "$CLUSTER"
}
trap nettoyer EXIT

rm -rf "$CLUSTER"
install -d ${COMME:+-o postgres -g postgres} "$CLUSTER"
$COMME "$BIN/initdb" -D "$CLUSTER" -U postgres --auth=trust >/dev/null
$COMME "$BIN/pg_ctl" -D "$CLUSTER" -o "-p $PORT -k $CLUSTER" -l "$CLUSTER/log" start >/dev/null

export PGHOST="$CLUSTER" PGPORT="$PORT" PGUSER=postgres PGDATABASE=postgres

echo "→ doublures Supabase"
psql -v ON_ERROR_STOP=1 -q -f "$RACINE/supabase/stubs-supabase.sql"

for migration in "$RACINE"/supabase/migrations/*.sql; do
  echo "→ $(basename "$migration")"
  psql -v ON_ERROR_STOP=1 -q -f "$migration"
done

echo
echo "→ rejeu complet (les migrations doivent être idempotentes)"
for migration in "$RACINE"/supabase/migrations/*.sql; do
  psql -v ON_ERROR_STOP=1 -q -f "$migration" >/dev/null
done

echo
echo "→ contrôles de cohérence"
psql -v ON_ERROR_STOP=1 -q <<'SQL'
do $$
declare
  manquant text;
begin
  foreach manquant in array array[
    'claims', 'documents', 'signatures', 'consentements', 'waitlist',
    'envois_reclamation', 'notifications_email', 'reponses_compagnie',
    'factures', 'passagers'
  ] loop
    if to_regclass('public.' || manquant) is null then
      raise exception 'Table manquante : %', manquant;
    end if;
  end loop;

  if not exists (
    select 1 from storage.buckets
     where id = 'documents' and file_size_limit = 10485760
  ) then
    raise exception 'Bornes du bucket documents non appliquées (migration 0005).';
  end if;

  if not exists (
    select 1 from pg_indexes
     where indexname = 'signatures_une_par_dossier'
  ) then
    raise exception 'Index d''unicité de signature absent (migration 0005).';
  end if;

  if not exists (
    select 1 from pg_indexes where indexname = 'factures_une_par_dossier'
  ) then
    raise exception 'Index d''unicité de facture absent (migration 0006).';
  end if;
end
$$;
SQL

echo
echo "→ la numérotation de facture est continue et sans doublon"
psql -v ON_ERROR_STOP=1 -q <<'SQL'
do $$
declare
  utilisateur uuid;
  dossier uuid;
  numeros text[];
begin
  insert into auth.users (email) values ('test@clearto.test') returning id into utilisateur;

  for i in 1..3 loop
    insert into claims (
      user_id, numero_vol, date_vol, aeroport_depart, aeroport_arrivee,
      compagnie, statut_eligibilite, montant_estime, devise
    ) values (
      utilisateur, 'AF' || i, ('2026-01-0' || i)::date, 'CDG', 'JFK',
      'AF', 'ELIGIBLE', 600, 'EUR'
    ) returning id into dossier;

    insert into factures (claim_id, user_id, montant, devise, montant_indemnisation, taux_commission)
    values (dossier, utilisateur, 132, 'EUR', 600, 0.22);
  end loop;

  select array_agg(numero order by numero) into numeros from factures;
  raise notice 'numéros émis : %', numeros;

  if array_length(numeros, 1) <> 3 then
    raise exception 'Numérotation incorrecte.';
  end if;
  if (select count(distinct numero) from factures) <> 3 then
    raise exception 'Doublon de numéro de facture.';
  end if;
end
$$;
SQL

echo
echo "✓ les 6 migrations s'appliquent, se rejouent, et le schéma est cohérent."
