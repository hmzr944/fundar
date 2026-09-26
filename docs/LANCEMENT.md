# Lancer Atlas — guide pas à pas

> Date : 26 septembre 2026. Ce guide remplace, pour le lancement, la « phase A gratuite » de [`ANALYSE-JURIDIQUE.md`](ANALYSE-JURIDIQUE.md). Atlas est désormais **payant dès le premier dossier**.
> Ce document n'est pas un avis juridique ni comptable. Les montants sont des **estimations** à vérifier sur vos propres devis.

---

## 1. Le modèle : rentable dès le premier dossier

| Principe | Comment c'est garanti dans l'application |
|---|---|
| Aucun coût engagé sans paiement | L'analyse est gratuite et coûte quelques centimes. Atlas ne traite le dossier (courriers, suivi, relances) **qu'après paiement** : sinon, il répond « paiement requis » |
| Un dossier ne coûte jamais plus que ce qu'il rapporte | **Plafond de coût IA par dossier** (`ATLAS_MAX_COST_PER_MISSION_USD`, 3 $ par défaut). Une fois atteint, Atlas s'arrête ; une exécution en cours s'arrête avant de le dépasser |
| Zéro temps humain dans le cas normal | Atlas rédige, vérifie (règles, chiffres comparés aux pièces, deuxième relecture), suit, reprend le dossier seul aux échéances et prévient le client par e-mail. Le client envoie en un clic |
| Pas de croissance payée à perte | Pas de publicité au lancement. Voir [section 5](#5-trouver-les-premiers-clients-sans-perdre-dargent) |
| Pas de promotion qui attire des clients qui ne reviennent pas | Prix unique, pas de remise de lancement |

### Marge par dossier (estimation, pour un prix de 12 € TTC)

| Poste | Montant |
|---|---|
| Prix payé par le client | 12,00 € |
| Frais Stripe (carte européenne : environ 1,5 % + 0,25 €) | − 0,43 € |
| IA : cas courant / pire cas (plafond de 3 $ atteint) | − 1,50 € / − 2,80 € |
| Cotisations sociales en micro-entreprise (environ 21 % pour une prestation de services, à vérifier selon votre activité) | − 2,50 € |
| **Reste par dossier** | **environ 7,50 € (cas courant) à 6,30 € (pire cas)** |

Hypothèse : franchise de TVA de la micro-entreprise (pas de TVA à reverser sous le seuil). Au-dessus du seuil, ou avec une autre structure, refaites le calcul.

### Coûts fixes mensuels (estimation)

| Poste | Ordre de grandeur |
|---|---|
| Serveur (VPS ou hébergeur avec PostgreSQL) | 10 à 25 € |
| Nom de domaine | environ 1 € |
| E-mails de notification (Resend, offre gratuite jusqu'à quelques milliers par mois) | 0 € au départ |
| Médiateur de la consommation (adhésion obligatoire) | quelques dizaines à ~150 € par an selon l'organisme, soit ~5 à 12 € par mois |
| Assurance responsabilité civile professionnelle (recommandée) | ~15 à 30 € |
| **Total** | **environ 30 à 70 € par mois** |

**Point mort : environ 5 à 10 dossiers par mois.** Au-delà, chaque dossier rapporte environ 7 €.

Le prix de 12 € est un **point de départ**. Il se change sans toucher au code (`ATLAS_PRICE_CENTS`). Les concurrents spécialisés prennent 25 à 35 % des sommes récupérées : pour un dossier à 100 € et plus, 12 à 19 € restent compétitifs.

---

## 2. Ce que vous devez créer (comptes et démarches)

Dans cet ordre :

1. **Micro-entreprise** (guichet unique de l'INPI, gratuit) : vous obtenez un **SIRET**. Obligatoire pour vendre.
2. **Médiateur de la consommation** : adhérer à un organisme agréé (liste sur le site de la CECMC, economie.gouv.fr). Obligatoire dès qu'on vend à des particuliers.
3. **Assurance RC professionnelle** : recommandée.
4. **Compte Anthropic** (console.anthropic.com) : créer une **clé d'API** et fixer un **plafond de dépense mensuel**, par exemple 50 €.
5. **Compte Stripe** : activer les paiements (le SIRET est demandé), récupérer la **clé secrète**, puis créer un **webhook** :
   - adresse : `https://VOTRE-DOMAINE/api/payments/stripe-webhook` ;
   - événements : `checkout.session.completed` et `checkout.session.async_payment_succeeded` ;
   - récupérer son **secret de signature** (`whsec_…`).
6. **Compte Resend** (resend.com) : vérifier votre domaine d'envoi et créer une **clé d'API**.
7. **Un nom de domaine et un serveur** capable de faire tourner Docker (un VPS, par exemple). Atlas travaille dans le processus du serveur : les plateformes « serverless » ne conviennent pas.

---

## 3. Mise en ligne

Sur le serveur, dans le dossier du projet :

1. Copier `.env.example` en `.env` et remplir :
   - `ANTHROPIC_API_KEY` ;
   - `POSTGRES_PASSWORD` (mot de passe fort) ;
   - `ATLAS_APP_URL=https://VOTRE-DOMAINE` ;
   - `ATLAS_PRICE_CENTS=1200` ;
   - `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` ;
   - les six champs `ATLAS_LEGAL_*` (nom, SIRET, adresse, e-mail, hébergeur, médiateur) ;
   - `RESEND_API_KEY`, `ATLAS_MAIL_FROM` ;
   - `ATLAS_CRON_SECRET` (32 caractères aléatoires ou plus : `openssl rand -hex 32`).
2. Lancer :
   ```bash
   docker compose -f docker-compose.prod.yml --env-file .env up -d --build
   ```
   Cela démarre :
   - la base de données ;
   - l'application, qui applique elle-même les migrations ;
   - le planificateur des reprises (toutes les 15 minutes) ;
   - la purge quotidienne des dossiers inactifs.
3. Placer un **proxy HTTPS** devant le port 3000 (Caddy ou Nginx avec un certificat Let's Encrypt). Le proxy doit **réécrire l'en-tête `X-Forwarded-For`**, sinon la limite de tentatives de connexion peut être contournée (voir `README.md`, « Limites connues »).

⚠️ Le fichier `Dockerfile` et `docker-compose.prod.yml` **n'ont pas pu être essayés** dans l'environnement où ils ont été écrits (Docker indisponible). Le démarrage de production, lui, a été vérifié sans Docker : migrations, serveur, pages et points d'entrée protégés.

---

## 4. Vérifications avant d'ouvrir au public

- [ ] `https://VOTRE-DOMAINE/api/health` répond `{"ok":true}`.
- [ ] Les pages **Mentions légales**, **CGV** et **Confidentialité** n'affichent plus aucun `[… non renseigné]`. Tant qu'un champ manque, **le paiement reste désactivé** : c'est voulu.
- [ ] La page d'accueil affiche le prix.
- [ ] `pnpm check:integrations` (sur le serveur) : Claude OK.
- [ ] **Faire un vrai dossier soi-même**, avec une vraie carte, en mode Stripe réel : analyse, paiement, démarrage automatique, courrier « Prêt à envoyer », envoi en un clic, « J'ai envoyé », reprise programmée, e-mail reçu. Puis se rembourser depuis le tableau de bord Stripe.
- [ ] Vérifier dans le **Journal** du dossier le coût IA réel, et le comparer à l'estimation de la section 1.
- [ ] Relire vous-même les CGV. Idéalement, les faire relire une fois par un professionnel (voir [`ANALYSE-JURIDIQUE.md`](ANALYSE-JURIDIQUE.md), risques 1 et 2).

---

## 5. Trouver les premiers clients sans perdre d'argent

1. **Gratuit d'abord :** votre entourage, les groupes locaux et les forums d'entraide, en respectant leurs règles. Présentez Atlas simplement, sans promesse de résultat.
2. **Mesurer** au bout de 20 dossiers payés :
   - le coût IA réel par dossier ;
   - la part de dossiers réglés ;
   - la part de clients qui reviennent avec un autre problème ;
   - les demandes de remboursement.
3. **Publicité seulement ensuite**, par tranches de 50 à 100 €, et seulement si **le coût pour obtenir un dossier payé reste inférieur à la marge**, soit environ 7 €. Sinon, on arrête la publicité.
4. **Ne pas** baisser le prix pour « faire du volume » : c'est l'erreur de Homejoy.

---

## 6. Ce qui reste manuel pour vous

| Situation | Fréquence attendue | Que faire |
|---|---|---|
| Demande de remboursement ou de rétractation | Rare | Rembourser depuis Stripe (la part déjà réalisée peut être retenue, voir les CGV) |
| Dossier hors périmètre payé par erreur | Rare | Rembourser (engagement des CGV) |
| Dossier arrêté par le plafond de coût | Rare | Regarder le Journal ; rembourser ou terminer à la main |
| E-mail d'un client | Variable | Répondre depuis l'adresse de contact |

---

## 7. Ce qui n'est pas encore fait

- Aucune notification quand le client pose une question pendant qu'il est connecté : il voit la réponse à l'écran.
- Pas de facture PDF générée par Atlas. Stripe envoie un reçu ; activez l'envoi automatique des reçus dans Stripe.
- Pas de tableau de bord « chiffre d'affaires / marge ». Stripe et l'onglet Paramètres (coûts IA) donnent les chiffres séparément.
- Les limites connues du `README.md` restent valables (instance unique, pas de vérification de l'e-mail à l'inscription).
