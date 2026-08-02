# Volia — V1

Service de vérification d'éligibilité et de prise en charge de réclamation
EU261/UK261 pour vols retardés, annulés ou surbookés. Rémunéré uniquement au
succès (22 % du montant récupéré). Voir le prompt produit dans l'historique
du repo pour le cahier des charges complet.

## Stack

- Next.js (App Router) + TypeScript, hébergé sur Vercel (tier gratuit).
- Supabase (Postgres + Auth magic link + Storage), région `eu-central-1`.
- `pdf-lib` pour la génération serveur des PDF (mandat, lettre de réclamation).
- `react-signature-canvas` pour la signature du mandat.
- Resend pour l'email transactionnel.
- Statut de vol : AviationStack par défaut, abstrait derrière
  `FlightStatusProvider` (`lib/flight-status/`) pour pouvoir changer de
  fournisseur sans toucher au reste du produit.

## Démarrer

```bash
npm install
cp .env.example .env.local   # renseigner les clés Supabase / AviationStack / Resend
npm run dev
```

Appliquer le schéma sur un projet Supabase (région `eu-central-1`) :

```bash
supabase db push   # ou exécuter supabase/migrations/0001_init.sql manuellement
```

## Tests

Le moteur d'éligibilité (`lib/eligibility/engine.ts`) est le seul morceau de
code qui mérite d'être bien testé — c'est la seule variable qui protège
l'économie unitaire du produit.

```bash
npm test
```

43 tests couvrent l'arbre de décision complet (§3 du cahier des charges) :
champ d'application territorial, seuils de retard, barème par distance,
fenêtre de préavis d'annulation, prescription (dont la règle allemande de
décompte en fin d'année civile), circonstances extraordinaires et filtre de
protection de trésorerie par compagnie.

## Structure

```
lib/eligibility/    moteur d'éligibilité, distance, aéroports, compagnies (fonctions pures)
config/              airline-policy.ts (ACCEPT/WAITLIST/REJECT), jurisdictions.ts (prescription)
lib/flight-status/   FlightStatusProvider + implémentation AviationStack
lib/pdf/             génération du mandat et de la lettre de réclamation
lib/email/           envoi transactionnel (Resend)
lib/supabase/        clients navigateur / serveur / admin
supabase/migrations/ schéma SQL (claims, documents, signatures, consentements, waitlist)
app/check/           F1 — vérificateur d'éligibilité, sans inscription
app/claim/           F2 — capture d'identité, upload, signature du mandat
app/dashboard/       F3 — suivi des dossiers (statut mis à jour manuellement via Supabase)
app/[compagnie]/…    SEO programmatique
app/[aeroport]/…
app/vol/[numeroVol]/
```

## Contraintes produit à ne jamais casser

- Pas d'accès aux boîtes mail (pas de scope Gmail/Outlook restricted).
- Vocabulaire interdit dans le code, l'UI et les emails : « avocat »,
  « robot lawyer », « IA juridique », « garantie de gain ».
- Le moteur d'éligibilité doit pouvoir refuser un dossier et le dire
  honnêtement — ne jamais cacher un refus derrière un mur d'email.
- Aucun paiement encaissé par l'utilisateur en V1.
- Le bouton final de souscription doit porter la mention exacte
  « Commander avec obligation de paiement » (§312j BGB).
- Le filtre de protection de trésorerie (`config/airline-policy.ts`) est
  codé en dur et s'ajuste à la main chaque semaine selon le comportement de
  paiement réel observé — ne pas essayer de le rendre "intelligent".
