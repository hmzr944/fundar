# Multi-passagers — plan d'implémentation

> **Pour agents :** SOUS-COMPÉTENCE REQUISE — utiliser `superpowers:subagent-driven-development` (recommandé) ou `superpowers:executing-plans` pour dérouler ce plan tâche par tâche. Les étapes utilisent des cases à cocher (`- [ ]`).

**Objectif :** Un dossier peut porter plusieurs passagers, et le montant réclamé est multiplié par leur nombre.

**Architecture :** Une table `passagers` liée à `claims`, alimentée au moment de la signature. Le moteur d'éligibilité reste inchangé — il calcule un montant **unitaire** ; la multiplication se fait à la création du dossier. Le mandat et la lettre listent tous les passagers. Le titulaire du compte reste le mandant unique et le seul destinataire de la facture.

**Stack :** Next.js 14 App Router, TypeScript, Supabase Postgres + RLS, pdf-lib, Vitest.

## Contraintes globales

- Le moteur `verifierEligibilite()` ne doit **pas** changer de signature : il répond pour un passager. Toute multiplication est faite en dehors.
- `montant_estime` et `montant_recupere` de `claims` restent des **totaux** — les colonnes existantes, la facturation et la commission ne changent pas de sémantique.
- Maximum **9 passagers** par dossier. Au-delà, une compagnie traite la demande comme un groupe et exige une procédure distincte.
- Le titulaire du compte est toujours le passager n° 1 et l'unique signataire.
- Aucun paiement encaissé par Volia (modèle mandat) — inchangé.
- Toute migration doit passer `./scripts/verifier-migrations.sh` (application + rejeu).
- Les tests existants (198) doivent rester verts à chaque commit.

---

## Structure de fichiers

| Fichier | Responsabilité |
|---|---|
| `supabase/migrations/0007_passagers.sql` | table `passagers`, RLS, contrainte de 9, colonne `nombre_passagers` sur `claims` |
| `lib/claims/passagers.ts` | fonctions pures : validation d'une liste de passagers, calcul du montant total |
| `lib/claims/passagers.test.ts` | tests des fonctions pures |
| `app/api/claim/route.ts` | accepte les passagers, multiplie le montant, insère les lignes |
| `lib/pdf/mandat.ts` | liste les passagers dans le mandat |
| `lib/pdf/lettre-reclamation.ts` | liste les passagers dans la lettre à la compagnie |
| `components/SaisiePassagers.tsx` | ajout/suppression de passagers dans `/claim` |
| `app/claim/page.tsx` | branche le composant et transmet la liste |
| `app/dashboard/page.tsx` | affiche « 4 passagers » sur la carte de dossier |

---

## Tâche 1 : Fonctions pures de passagers

**Fichiers :**
- Créer : `lib/claims/passagers.ts`
- Tester : `lib/claims/passagers.test.ts`

**Interfaces :**
- Consomme : rien
- Produit : `type Passager = { nom: string; prenom: string }`, `MAX_PASSAGERS: number`, `validerPassagers(liste: Passager[]): { valide: boolean; message?: string }`, `montantTotal(montantUnitaire: number | null, nombre: number): number | null`

- [ ] **Étape 1 : écrire le test qui échoue**

```ts
import { describe, expect, it } from "vitest";
import { MAX_PASSAGERS, montantTotal, validerPassagers } from "./passagers";

describe("montantTotal", () => {
  it("multiplie le montant unitaire par le nombre de passagers", () => {
    expect(montantTotal(600, 4)).toBe(2400);
  });

  it("rend null quand il n'y a pas de montant unitaire", () => {
    // Un dossier en revue manuelle n'a pas de montant : le multiplier
    // par quatre produirait « 0 € » au lieu de « inconnu ».
    expect(montantTotal(null, 4)).toBeNull();
  });

  it("traite un nombre absurde comme un seul passager", () => {
    expect(montantTotal(600, 0)).toBe(600);
    expect(montantTotal(600, -3)).toBe(600);
  });
});

describe("validerPassagers", () => {
  const p = (n: string) => ({ nom: n, prenom: "Alex" });

  it("accepte un passager unique", () => {
    expect(validerPassagers([p("Durand")]).valide).toBe(true);
  });

  it("refuse une liste vide", () => {
    expect(validerPassagers([]).valide).toBe(false);
  });

  it("refuse au-delà du plafond", () => {
    const trop = Array.from({ length: MAX_PASSAGERS + 1 }, (_, i) => p(`N${i}`));
    expect(validerPassagers(trop).valide).toBe(false);
  });

  it("refuse un nom vide ou fait d'espaces", () => {
    expect(validerPassagers([{ nom: "  ", prenom: "Alex" }]).valide).toBe(false);
    expect(validerPassagers([{ nom: "Durand", prenom: "" }]).valide).toBe(false);
  });

  it("refuse deux fois le même passager", () => {
    // Un doublon fait réclamer deux fois pour la même personne : la
    // compagnie rejette le dossier entier.
    expect(validerPassagers([p("Durand"), p("Durand")]).valide).toBe(false);
  });

  it("ignore la casse et les espaces pour détecter un doublon", () => {
    const liste = [
      { nom: "Durand", prenom: "Alex" },
      { nom: " durand ", prenom: "ALEX" },
    ];
    expect(validerPassagers(liste).valide).toBe(false);
  });
});
```

- [ ] **Étape 2 : lancer le test et vérifier qu'il échoue**

Commande : `npx vitest run lib/claims/passagers`
Attendu : ÉCHEC — `Cannot find module './passagers'`

- [ ] **Étape 3 : écrire l'implémentation minimale**

```ts
/**
 * Passagers d'un dossier.
 *
 * L'indemnisation EU261 est due PAR PASSAGER : une famille de quatre sur
 * un Paris–New York vaut 2 400 € et non 600. Le moteur d'éligibilité
 * continue de répondre pour une personne — la multiplication vit ici,
 * pour que la règle de droit et la règle commerciale restent séparées.
 */
export interface Passager {
  nom: string;
  prenom: string;
}

/**
 * Au-delà de neuf, une compagnie traite la demande comme un groupe et
 * exige une procédure distincte. Mieux vaut refuser que d'envoyer un
 * dossier qui sera rejeté en bloc.
 */
export const MAX_PASSAGERS = 9;

export interface VerdictPassagers {
  valide: boolean;
  message?: string;
}

function cle(p: Passager): string {
  return `${p.prenom.trim().toLowerCase()}|${p.nom.trim().toLowerCase()}`;
}

export function validerPassagers(liste: Passager[]): VerdictPassagers {
  if (liste.length === 0) {
    return { valide: false, message: "Indiquez au moins un passager." };
  }
  if (liste.length > MAX_PASSAGERS) {
    return {
      valide: false,
      message: `Au-delà de ${MAX_PASSAGERS} passagers, écrivez-nous : la compagnie exige une procédure de groupe.`,
    };
  }
  for (const p of liste) {
    if (!p.nom.trim() || !p.prenom.trim()) {
      return { valide: false, message: "Chaque passager a besoin d'un nom et d'un prénom." };
    }
  }
  const cles = liste.map(cle);
  if (new Set(cles).size !== cles.length) {
    return {
      valide: false,
      message: "Un passager apparaît deux fois. La compagnie rejetterait le dossier entier.",
    };
  }
  return { valide: true };
}

/**
 * Total réclamé. Un montant unitaire absent (dossier en revue manuelle)
 * reste absent : le multiplier afficherait « 0 € » au lieu de « inconnu ».
 */
export function montantTotal(
  montantUnitaire: number | null,
  nombre: number
): number | null {
  if (montantUnitaire === null) return null;
  const n = Number.isFinite(nombre) && nombre > 0 ? Math.floor(nombre) : 1;
  return montantUnitaire * n;
}
```

- [ ] **Étape 4 : relancer le test**

Commande : `npx vitest run lib/claims/passagers`
Attendu : SUCCÈS — 9 tests

- [ ] **Étape 5 : commit**

```bash
git add lib/claims/passagers.ts lib/claims/passagers.test.ts
git commit -m "Add passenger list validation and total computation"
```

---

## Tâche 2 : Schéma

**Fichiers :**
- Créer : `supabase/migrations/0007_passagers.sql`
- Modifier : `scripts/verifier-migrations.sh` (bloc de contrôles de cohérence)

**Interfaces :**
- Consomme : `MAX_PASSAGERS` de la tâche 1 (valeur 9, recopiée en dur dans la contrainte SQL)
- Produit : table `passagers(id, claim_id, nom, prenom, rang)`, colonne `claims.nombre_passagers`

- [ ] **Étape 1 : écrire la migration**

```sql
-- L'indemnisation EU261 est due par passager. Un dossier ne portait qu'une
-- personne : une famille de quatre valait donc 600 € au lieu de 2 400.

create table if not exists passagers (
  id uuid primary key default gen_random_uuid(),
  claim_id uuid not null references claims (id) on delete cascade,
  nom text not null check (length(trim(nom)) > 0),
  prenom text not null check (length(trim(prenom)) > 0),
  -- Rang 1 = titulaire du compte et signataire du mandat.
  rang smallint not null check (rang between 1 and 9),
  created_at timestamptz not null default now()
);

-- Deux fois le même rang, ou deux fois la même personne, ferait réclamer
-- en double et la compagnie rejetterait le dossier entier.
create unique index if not exists passagers_rang_unique
  on passagers (claim_id, rang);
create unique index if not exists passagers_identite_unique
  on passagers (claim_id, lower(trim(nom)), lower(trim(prenom)));

alter table passagers enable row level security;

drop policy if exists "passagers_select_own" on passagers;
create policy "passagers_select_own" on passagers
  for select using (
    exists (select 1 from claims where claims.id = passagers.claim_id
              and claims.user_id = auth.uid())
  );

drop policy if exists "passagers_insert_own" on passagers;
create policy "passagers_insert_own" on passagers
  for insert with check (
    exists (select 1 from claims where claims.id = passagers.claim_id
              and claims.user_id = auth.uid())
  );

-- Dénormalisé : le tableau de bord et la lettre affichent le nombre sans
-- avoir à compter à chaque lecture.
alter table claims
  add column if not exists nombre_passagers smallint not null default 1;

alter table claims
  drop constraint if exists claims_nombre_passagers_plausible;
alter table claims
  add constraint claims_nombre_passagers_plausible
    check (nombre_passagers between 1 and 9);

comment on column claims.nombre_passagers is
  'Nombre de passagers du dossier. montant_estime et montant_recupere sont des TOTAUX, déjà multipliés.';
```

- [ ] **Étape 2 : ajouter le contrôle au script de vérification**

Dans `scripts/verifier-migrations.sh`, bloc `do $$ ... end $$` des contrôles de cohérence, ajouter `'passagers'` au tableau des tables attendues :

```sql
  foreach manquant in array array[
    'claims', 'documents', 'signatures', 'consentements', 'waitlist',
    'envois_reclamation', 'notifications_email', 'reponses_compagnie',
    'factures', 'passagers'
  ] loop
```

- [ ] **Étape 3 : vérifier que la migration s'applique et se rejoue**

Commande : `./scripts/verifier-migrations.sh`
Attendu : `✓ les 7 migrations s'appliquent, se rejouent, et le schéma est cohérent.`

- [ ] **Étape 4 : commit**

```bash
git add supabase/migrations/0007_passagers.sql scripts/verifier-migrations.sh
git commit -m "Add passengers table, one claim can cover a whole booking"
```

---

## Tâche 3 : Création de dossier multi-passagers

**Fichiers :**
- Modifier : `app/api/claim/route.ts`

**Interfaces :**
- Consomme : `validerPassagers`, `montantTotal`, `Passager` (tâche 1) ; table `passagers` (tâche 2)
- Produit : le corps de requête accepte `passagers?: Passager[]` ; la réponse contient `nombrePassagers: number`

- [ ] **Étape 1 : étendre le corps de requête**

Dans `interface CorpsRequete`, ajouter :

```ts
  /** Passager 1 = titulaire du compte. Absent = dossier à un passager. */
  passagers?: Passager[];
```

Et l'import :

```ts
import {
  montantTotal,
  validerPassagers,
  type Passager,
} from "@/lib/claims/passagers";
```

- [ ] **Étape 2 : valider et multiplier avant l'insertion**

Juste après le calcul de `resultat` et avant le `if (resultat.statut === "INELIGIBLE" ...)`, insérer :

```ts
  // Le moteur répond pour une personne ; la multiplication se fait ici.
  const passagers: Passager[] = body.passagers?.length
    ? body.passagers
    : [{ nom: "", prenom: "" }];

  if (body.passagers?.length) {
    const verdictPassagers = validerPassagers(body.passagers);
    if (!verdictPassagers.valide) {
      return NextResponse.json(
        { erreur: verdictPassagers.message },
        { status: 400 }
      );
    }
  }

  const nombrePassagers = body.passagers?.length ?? 1;
  const montantDuDossier = montantTotal(resultat.montantEstime, nombrePassagers);
```

- [ ] **Étape 3 : enregistrer le total et le nombre**

Dans l'objet `.insert({ ... })`, remplacer `montant_estime: resultat.montantEstime,` par :

```ts
      montant_estime: montantDuDossier,
      nombre_passagers: nombrePassagers,
```

- [ ] **Étape 4 : insérer les lignes de passagers après création**

Juste avant le `return NextResponse.json({ id: data.id, resultat });` final :

```ts
  if (body.passagers?.length) {
    const { error: erreurPassagers } = await supabase.from("passagers").insert(
      body.passagers.map((p, i) => ({
        claim_id: data.id,
        nom: p.nom.trim(),
        prenom: p.prenom.trim(),
        rang: i + 1,
      }))
    );

    // Un dossier dont les passagers n'ont pas été enregistrés réclamerait
    // un total sans pouvoir nommer les bénéficiaires : la compagnie le
    // rejetterait. On le signale plutôt que de laisser passer.
    if (erreurPassagers) {
      return NextResponse.json(
        {
          erreur:
            "Le dossier a été créé mais les passagers n'ont pas pu être enregistrés. Contactez-nous avant de signer.",
          id: data.id,
        },
        { status: 500 }
      );
    }
  }
```

Et modifier le retour :

```ts
  return NextResponse.json({ id: data.id, resultat, nombrePassagers });
```

- [ ] **Étape 5 : vérifier la compilation et les tests**

Commande : `npx tsc --noEmit && npm test`
Attendu : exit 0, 207 tests (198 + 9 de la tâche 1)

- [ ] **Étape 6 : commit**

```bash
git add app/api/claim/route.ts
git commit -m "Multiply the claim amount by the number of passengers"
```

---

## Tâche 4 : Le mandat nomme tous les passagers

**Fichiers :**
- Modifier : `lib/pdf/mandat.ts`, `app/api/claim/[id]/mandat/route.ts`

**Interfaces :**
- Consomme : `Passager` (tâche 1), table `passagers` (tâche 2)
- Produit : `DonneesMandat` gagne `passagers: Passager[]`

- [ ] **Étape 1 : étendre l'interface**

Dans `DonneesMandat`, après `prenom: string;` :

```ts
  /**
   * Tous les passagers couverts. Le mandant reste `nom`/`prenom` — un seul
   * signataire — mais la compagnie exige de savoir pour qui la réclamation
   * est portée, faute de quoi elle n'indemnise que le signataire.
   */
  passagers: Passager[];
```

Et l'import en tête de fichier :

```ts
import type { Passager } from "@/lib/claims/passagers";
```

- [ ] **Étape 2 : imprimer la liste dans le PDF**

Dans `genererMandatPdf`, après la ligne qui imprime l'adresse du mandant, ajouter :

```ts
  if (d.passagers.length > 1) {
    saut(6);
    ligne("Passagers couverts par le présent mandat :", { gras: true, taille: 10 });
    d.passagers.forEach((p, i) => {
      ligne(`${i + 1}. ${p.prenom} ${p.nom}`, { taille: 10 });
    });
  }
```

- [ ] **Étape 3 : charger les passagers dans la route**

Dans `app/api/claim/[id]/mandat/route.ts`, après la lecture du dossier :

```ts
  const { data: passagers } = await supabase
    .from("passagers")
    .select("nom, prenom")
    .eq("claim_id", params.id)
    .order("rang");
```

Et dans l'appel à `genererMandatPdf({ ... })`, ajouter :

```ts
    passagers: passagers?.length
      ? passagers
      : [{ nom: body.nom, prenom: body.prenom }],
```

- [ ] **Étape 4 : vérifier**

Commande : `npx tsc --noEmit && npm run build`
Attendu : exit 0, `✓ Compiled successfully`

- [ ] **Étape 5 : commit**

```bash
git add lib/pdf/mandat.ts app/api/claim/\[id\]/mandat/route.ts
git commit -m "Name every covered passenger on the signed mandate"
```

---

## Tâche 5 : La lettre nomme tous les passagers

**Fichiers :**
- Modifier : `lib/pdf/lettre-reclamation.ts`, `app/api/claim/[id]/lettre/route.ts`

**Interfaces :**
- Consomme : `Passager` (tâche 1)
- Produit : `DonneesLettreReclamation` gagne `passagers: Passager[]`

- [ ] **Étape 1 : étendre l'interface**

Dans `DonneesLettreReclamation`, après `passagerAdresse: string;` :

```ts
  /** Tous les passagers du dossier, rang 1 en premier. */
  passagers: Passager[];
```

Import en tête :

```ts
import type { Passager } from "@/lib/claims/passagers";
```

- [ ] **Étape 2 : lister les passagers dans le corps de la lettre**

Après le paragraphe qui indique le vol, ajouter :

```ts
  if (d.passagers.length > 1) {
    saut(6);
    ligne(`Passengers concerned (${d.passagers.length}):`, { gras: true });
    d.passagers.forEach((p, i) => {
      ligne(`${i + 1}. ${p.prenom} ${p.nom}`);
    });
    saut(6);
    ligne(
      `The amount claimed covers all ${d.passagers.length} passengers listed above.`
    );
  }
```

- [ ] **Étape 3 : charger les passagers dans la route d'envoi**

Dans `app/api/claim/[id]/lettre/route.ts`, après la lecture du profil :

```ts
  const { data: passagers } = await supabase
    .from("passagers")
    .select("nom, prenom")
    .eq("claim_id", params.id)
    .order("rang");
```

Et dans l'appel à `genererLettreReclamationPdf({ ... })` :

```ts
    passagers: passagers?.length
      ? passagers
      : [{ nom: profil?.nom ?? "", prenom: profil?.prenom ?? "" }],
```

- [ ] **Étape 4 : vérifier**

Commande : `npx tsc --noEmit && npm run build`
Attendu : exit 0, `✓ Compiled successfully`

- [ ] **Étape 5 : commit**

```bash
git add lib/pdf/lettre-reclamation.ts app/api/claim/\[id\]/lettre/route.ts
git commit -m "List every passenger in the letter sent to the airline"
```

---

## Tâche 6 : Saisie des passagers dans le tunnel

**Fichiers :**
- Créer : `components/SaisiePassagers.tsx`
- Modifier : `app/claim/page.tsx`

**Interfaces :**
- Consomme : `Passager`, `MAX_PASSAGERS`, `validerPassagers` (tâche 1) ; `POST /api/claim` (tâche 3)
- Produit : composant `<SaisiePassagers valeur onChange />`

- [ ] **Étape 1 : créer le composant**

```tsx
"use client";

import { useId } from "react";
import Icone from "@/components/Icone";
import { MAX_PASSAGERS, type Passager } from "@/lib/claims/passagers";

/**
 * Passagers du dossier.
 *
 * Le premier est le titulaire du compte : ses champs viennent de l'étape
 * d'identité et ne sont pas ressaisis ici. Les suivants sont ajoutés un à
 * un — c'est le cas d'une famille, où l'indemnisation est due à chacun.
 */
export default function SaisiePassagers({
  titulaire,
  compagnons,
  onChange,
}: {
  titulaire: Passager;
  compagnons: Passager[];
  onChange: (compagnons: Passager[]) => void;
}) {
  const id = useId();
  const total = compagnons.length + 1;

  function modifier(index: number, champ: keyof Passager, valeur: string) {
    onChange(
      compagnons.map((p, i) => (i === index ? { ...p, [champ]: valeur } : p))
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between">
        <span className="etiquette">Passagers du dossier</span>
        <span className="text-[13px] text-[var(--texte-attenue)]">
          {total} sur ce vol
        </span>
      </div>

      <p className="rounded-[var(--radius-interne)] bg-[var(--bg-eleve-2)] p-3 text-[13px] leading-relaxed text-[var(--texte-attenue)]">
        L&apos;indemnisation est due <strong>à chaque passager</strong>. Ajoutez
        les personnes qui voyageaient avec vous sur la même réservation : le
        montant réclamé sera multiplié d&apos;autant.
      </p>

      <div className="flex items-center gap-2 rounded-[var(--radius-interne)] border border-[var(--bordure)] p-3 text-[15px]">
        <Icone nom="coche-cercle" taille={17} className="text-[var(--color-succes-600)]" />
        {titulaire.prenom} {titulaire.nom}
        <span className="ml-auto text-[13px] text-[var(--texte-attenue)]">vous</span>
      </div>

      {compagnons.map((p, i) => (
        <div key={i} className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
          <input
            aria-label={`Prénom du passager ${i + 2}`}
            className="champ"
            placeholder="Prénom"
            value={p.prenom}
            onChange={(e) => modifier(i, "prenom", e.target.value)}
          />
          <input
            aria-label={`Nom du passager ${i + 2}`}
            className="champ"
            placeholder="Nom"
            value={p.nom}
            onChange={(e) => modifier(i, "nom", e.target.value)}
          />
          <button
            type="button"
            aria-label={`Retirer le passager ${i + 2}`}
            onClick={() => onChange(compagnons.filter((_, j) => j !== i))}
            className="bouton bouton-fantome !px-3"
          >
            <Icone nom="interdit" taille={17} />
          </button>
        </div>
      ))}

      {total < MAX_PASSAGERS && (
        <button
          type="button"
          onClick={() => onChange([...compagnons, { nom: "", prenom: "" }])}
          className="bouton bouton-secondaire self-start !py-2 !px-4 text-sm"
          id={`${id}-ajouter`}
        >
          Ajouter un passager
        </button>
      )}
    </div>
  );
}
```

- [ ] **Étape 2 : brancher dans `/claim`**

Dans `app/claim/page.tsx`, ajouter l'état à côté de `identite` :

```tsx
  const [compagnons, setCompagnons] = useState<Passager[]>([]);
```

Imports :

```tsx
import SaisiePassagers from "@/components/SaisiePassagers";
import { validerPassagers, type Passager } from "@/lib/claims/passagers";
```

Rendre le composant dans l'étape d'identité, sous les champs existants :

```tsx
          <SaisiePassagers
            titulaire={{ nom: identite.nom, prenom: identite.prenom }}
            compagnons={compagnons}
            onChange={setCompagnons}
          />
```

- [ ] **Étape 3 : transmettre la liste à l'API**

Dans `soumettreDossierComplet`, dans le `body: JSON.stringify({ ... })` de l'appel à `/api/claim`, ajouter :

```tsx
        passagers: [
          { nom: identite.nom, prenom: identite.prenom },
          ...compagnons,
        ],
```

Et juste avant cet appel, valider côté client pour donner l'erreur au bon endroit :

```tsx
    const verdictPassagers = validerPassagers([
      { nom: identite.nom, prenom: identite.prenom },
      ...compagnons,
    ]);
    if (!verdictPassagers.valide) {
      setErreur(verdictPassagers.message ?? "Vérifiez la liste des passagers.");
      return false;
    }
```

- [ ] **Étape 4 : vérifier**

Commande : `npx tsc --noEmit && npm test && npm run build`
Attendu : exit 0, 207 tests, `✓ Compiled successfully`

- [ ] **Étape 5 : commit**

```bash
git add components/SaisiePassagers.tsx app/claim/page.tsx
git commit -m "Let a claim cover everyone on the same booking"
```

---

## Tâche 7 : Affichage du nombre dans le tableau de bord

**Fichiers :**
- Modifier : `app/dashboard/page.tsx`

**Interfaces :**
- Consomme : `claims.nombre_passagers` (tâche 2)
- Produit : rien

- [ ] **Étape 1 : lire la colonne**

Dans le `.select(...)` de `dossiers`, ajouter `nombre_passagers` à la liste des colonnes.

- [ ] **Étape 2 : afficher sous le numéro de vol**

Sous le `<p>` qui affiche `{dossier.date_vol}` :

```tsx
                  {dossier.nombre_passagers > 1 && (
                    <p className="mt-0.5 text-sm text-[var(--texte-attenue)]">
                      {dossier.nombre_passagers} passagers · montant total
                    </p>
                  )}
```

- [ ] **Étape 3 : vérifier**

Commande : `npx tsc --noEmit && npm run build`
Attendu : exit 0

- [ ] **Étape 4 : commit**

```bash
git add app/dashboard/page.tsx
git commit -m "Show the passenger count on each claim card"
```

---

## Recette manuelle (après la tâche 7)

À faire sur `localhost` avec un Supabase à jour :

1. `/check` sur un vol éligible → verdict à 600 €
2. « Lancer ma réclamation » → à l'étape identité, ajouter **3 compagnons**
3. Vérifier que l'écran annonce **4 passagers**
4. Aller au bout, signer → **le mandat PDF reçu liste les 4 noms**
5. `/dashboard` → la carte affiche « 4 passagers » et **2 400 €** estimés
6. En base : `select nombre_passagers, montant_estime from claims order by created_at desc limit 1;` → `4` et `2400`
7. Tenter d'ajouter deux fois la même personne → message d'erreur, pas d'enregistrement

---

## Hors périmètre, volontairement

- **Un IBAN par passager.** La compagnie verse au signataire, qui répartit. Ajouter des IBAN multiples supposerait que Volia encaisse et redistribue — un autre métier, avec un autre statut réglementaire.
- **Passagers mineurs.** Le mandat suppose un signataire majeur pour tout le monde. Le cas d'un parent signant pour ses enfants est juridiquement solide mais mérite une mention aux CGV, à traiter avec le juriste.
- **Modifier les passagers après signature.** Le mandat signé nomme la liste ; la changer invaliderait la preuve. Passe par une révocation, comme le changement d'IBAN.
