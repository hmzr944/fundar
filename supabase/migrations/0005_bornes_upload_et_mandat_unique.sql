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
