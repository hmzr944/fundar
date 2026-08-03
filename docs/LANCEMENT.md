# Checklist de lancement

Tout ce qui reste entre le code actuel et la première commission encaissée.
Rien ici ne demande d'écrire du code.

---

## 1. Base de données — 10 minutes

Les six migrations ont été rejouées sur un Postgres nu, dans l'ordre, deux
fois de suite : elles s'appliquent et sont idempotentes. Pour le revérifier
après n'importe quelle modification :

```bash
./scripts/verifier-migrations.sh
```

Puis, sur Supabase (SQL Editor, ou `supabase db push`), dans cet ordre :

```
0001_init.sql
0002_envoi_et_commission.sql
0003_rgpd_et_notifications.sql
0004_reponses_compagnie.sql
0005_bornes_upload_et_mandat_unique.sql
0006_facturation_et_relances.sql
```

**Vérification après coup** — la migration 0005 pose des bornes que rien
d'autre ne garantit :

```sql
select id, file_size_limit, allowed_mime_types from storage.buckets
 where id = 'documents';
-- Attendu : 10485760 et six types MIME.
```

---

## 2. Variables d'environnement

`.env.example` fait foi. Les indispensables, par ordre de blocage :

| Variable | Sans elle |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` / `..._ANON_KEY` | rien ne fonctionne |
| `SUPABASE_SERVICE_ROLE_KEY` | pas d'envoi, pas de facture, pas de suppression RGPD |
| `RESEND_API_KEY` + `RESEND_FROM_EMAIL` | aucun email ne part |
| `ADMIN_EMAILS` | `/admin` en 404 pour tout le monde, vous compris |
| `CRON_SECRET` | notifications et relances désactivées (503) |
| `ENTREPRISE_*` | **aucune facture ne peut être émise** |
| `STRIPE_SECRET_KEY` | facultatif : la facture bascule sur virement |
| `NEXT_PUBLIC_SITE_URL` | liens erronés dans les emails et le sitemap |

`RESEND_FROM_EMAIL` doit appartenir à un domaine **vérifié chez Resend**,
sinon les envois vers les compagnies partent en spam ou sont rejetés.

---

## 3. Tâches planifiées

`vercel.json` déclare les deux crons. Vercel n'appelle qu'en GET, ce que les
deux routes acceptent désormais.

| Route | Fréquence | Rôle |
|---|---|---|
| `/api/notifications/traiter` | horaire | vide la file des emails de changement de statut |
| `/api/relances/traiter` | quotidien, 9 h | demande aux clients s'ils ont été payés |

Les deux exigent `Authorization: Bearer $CRON_SECRET`. Vercel l'injecte
automatiquement si `CRON_SECRET` est défini dans le projet.

Test manuel :

```bash
curl -X POST https://<votre-domaine>/api/relances/traiter \
  -H "Authorization: Bearer $CRON_SECRET"
```

---

## 4. Contacts compagnies

Trois entrées sont pré-remplies (`config/airline-contacts.ts`) : **AF, KL,
BA**, toutes en `FORMULAIRE_WEB`. Aucune ne déclenche d'envoi automatique —
un formulaire ne se remplit pas par email — mais l'URL s'affiche dans le
tableau de bord au lieu d'être à rechercher à chaque dossier.

**Aucune adresse email n'est renseignée, et c'est volontaire.** Une URL
fausse se voit tout de suite (404) ; un email faux envoie l'identité,
l'itinéraire et la carte d'embarquement d'un client à un inconnu, sans que
personne ne s'en aperçoive.

À faire :
- vérifier les trois URL une fois (les compagnies déplacent ces pages) ;
- ajouter LH et IB sur le même modèle ;
- n'ajouter une entrée `EMAIL` qu'après avoir confirmé l'adresse dans les
  conditions générales de transport de la compagnie.

Un test échouera au premier contact `EMAIL` ajouté : c'est voulu, il force
une relecture.

---

## 5. Juridique

- **CGV** (`app/cgv/page.tsx`) : lever les `[À COMPLÉTER]` — raison sociale,
  forme juridique, siège, immatriculation. Incrémenter `VERSION_CGV` dans
  `config/legal.ts` à chaque modification de fond : chaque consentement est
  enregistré avec cette valeur, c'est ce qui prouve quel texte a été accepté.
- **Déclaration au procureur de la République** du tribunal judiciaire de
  votre siège, **avant tout exercice** — articles R124-1 et suivants du Code
  des procédures civiles d'exécution. Vos CGV décrivent l'activité comme du
  recouvrement amiable de créances, ce qui déclenche ces obligations.
- **Assurance responsabilité civile professionnelle**, exigée par les mêmes
  articles.
- Le compte bancaire dédié aux fonds encaissés pour autrui est
  *probablement* sans objet dans le modèle mandat, puisque l'argent ne
  transite jamais par vous — à faire confirmer par le même juriste, en même
  temps que les CGV.
- **Table de prescription** (`config/jurisdictions.ts`) : les valeurs sont
  marquées indicatives. Faites-les valider, elles décident de qui reçoit un
  refus.

---

## 6. Avant le premier vrai client

Un passage complet en conditions réelles, sur votre propre vol :

1. `/check` avec un vol ancien → parcours déclaratif → verdict « à vérifier »
2. `/claim` → identité, IBAN, signature, justificatif → mandat PDF reçu
3. `/dashboard` → « Transmettre à la compagnie » → doit afficher l'URL du
   formulaire, **pas** un faux succès
4. `/admin` → saisir une réponse compagnie → vérifier le tableau par compagnie
5. Déclarer un paiement côté client → clôturer côté admin → **la facture doit
   arriver par email avec le bon numéro et le bon montant**

L'étape 5 est celle à ne pas sauter : c'est la seule qui vérifie que vous
serez payé.

---

## 7. Ce qu'on ne fait pas maintenant

Rappel de `docs/PLAN-COMMERCIAL.md` : pas de publicité payante, pas de
nouvelle fonctionnalité avant vingt commissions encaissées, pas d'ouverture
à d'autres pays, pas de taux publié sous dix dossiers par compagnie.
