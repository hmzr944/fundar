# Récupérer le projet sur votre machine

Tout le travail est poussé sur GitHub, branche
`claude/refund-radar-v1-spec-r16nyk`. Rien ne dépend de la machine sur
laquelle il a été écrit.

Comptez une heure, dont quarante minutes d'attente et de copier-coller.

---

## 1. Le code — 5 minutes

Il vous faut **Node 20 ou plus** (`node -v`) et **git**.

```bash
git clone https://github.com/hmzr944/fundar.git
cd fundar
git checkout claude/refund-radar-v1-spec-r16nyk
npm install
```

Vérifiez tout de suite que la logique métier tourne chez vous :

```bash
npm test        # 198 tests, aucune dépendance externe
```

Si ces tests passent, le moteur d'éligibilité, la facturation, les
validations et les relances fonctionnent sur votre machine. Aucune clé
n'est nécessaire pour cette étape.

---

## 2. Supabase — 20 minutes

C'est la seule dépendance sans laquelle rien ne marche.

1. Créer un compte sur [supabase.com](https://supabase.com), puis un projet.
2. **Région : Frankfurt (`eu-central-1`)**. Ce n'est pas un détail de
   performance — les CGV annoncent un hébergement en Union européenne.
3. Dans *SQL Editor*, exécuter les six migrations **dans l'ordre**, une par
   une, en copiant le contenu de chaque fichier de `supabase/migrations/` :

   ```
   0001_init.sql
   0002_envoi_et_commission.sql
   0003_rgpd_et_notifications.sql
   0004_reponses_compagnie.sql
   0005_bornes_upload_et_mandat_unique.sql
   0006_facturation_et_relances.sql
   ```

   Elles ont été rejouées deux fois de suite sur un Postgres nu : elles
   s'appliquent et se rejouent sans erreur. Si l'une échoue, arrêtez-vous
   et envoyez-moi le message — ne continuez pas sur un schéma partiel.

4. Vérifier que les bornes du bucket sont bien posées :

   ```sql
   select id, file_size_limit, allowed_mime_types
     from storage.buckets where id = 'documents';
   ```
   Attendu : `10485760` et six types MIME.

5. Récupérer les clés dans *Project Settings → API*.

---

## 3. Les variables — 10 minutes

```bash
cp .env.example .env.local
```

Le minimum pour que le site tourne en local :

```
NEXT_PUBLIC_SUPABASE_URL=https://<votre-projet>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<clé anon>
SUPABASE_SERVICE_ROLE_KEY=<clé service_role — ne jamais la publier>
NEXT_PUBLIC_SITE_URL=http://localhost:3000
ADMIN_EMAILS=<votre email>
```

Facultatif au début, indispensable avant le premier client :
`RESEND_API_KEY`, `RESEND_FROM_EMAIL` (domaine vérifié chez Resend),
`CRON_SECRET`, les `ENTREPRISE_*` et `STRIPE_SECRET_KEY`.

Sans clé de statut de vol (`AVIATIONSTACK_API_KEY`), le mode démo prend le
relais **hors production uniquement** : les vols sont inventés de façon
déterministe, ce qui suffit pour parcourir l'interface.

```bash
npm run dev     # http://localhost:3000
```

---

## 4. La recette, sur votre propre vol — 20 minutes

C'est l'étape que je n'ai pas pu faire à votre place, faute d'un Supabase
joignable et d'un navigateur fonctionnel en fin de session.

1. `/check` avec un vol ancien → le parcours déclaratif doit s'ouvrir
2. Aller jusqu'au bout de `/claim` : identité, IBAN, signature, justificatif
   → vous devez **recevoir le mandat PDF par email**
3. `/dashboard` → « Transmettre à la compagnie » → doit afficher **l'URL du
   formulaire Air France**, surtout pas un faux succès
4. `/admin` (avec votre email dans `ADMIN_EMAILS`) → saisir une réponse de
   compagnie
5. Déclarer un paiement côté client, puis clôturer côté admin → **la facture
   doit arriver par email**, avec le bon numéro et le bon montant

**L'étape 5 est celle à ne pas sauter** : c'est la seule qui vérifie que
vous serez payé.

Regardez aussi le rendu sur votre téléphone. C'est là que se fera la
majorité des dossiers, et c'est ce que je n'ai pas pu vérifier
visuellement.

---

## 5. Mettre en ligne — 15 minutes

1. Compte [vercel.com](https://vercel.com), importer le dépôt GitHub.
2. Recopier toutes les variables d'environnement dans *Settings →
   Environment Variables*, avec `NEXT_PUBLIC_SITE_URL` pointant sur le vrai
   domaine.
3. `vercel.json` déclare déjà les deux tâches planifiées : la file de
   notifications (horaire) et les relances de paiement (quotidienne). Elles
   s'activent seules dès que `CRON_SECRET` est défini.

---

## Et ensuite

`docs/LANCEMENT.md` liste ce qui reste et qui n'est pas du code : contacts
compagnies, mentions légales, déclaration au procureur, assurance.
`docs/PLAN-COMMERCIAL.md` dit quoi faire des vingt premiers dossiers.

Si vous voulez fusionner cette branche dans `main`, ouvrez une pull request
depuis GitHub — mais ce n'est pas nécessaire pour déployer : Vercel sait
déployer n'importe quelle branche.
