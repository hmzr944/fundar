# Lancer Atlas — guide pas à pas

> Date : 26 septembre 2026. Ce guide remplace, pour le lancement, la « phase A gratuite » de [`ANALYSE-JURIDIQUE.md`](ANALYSE-JURIDIQUE.md).
> Ce document n'est pas un avis juridique ni comptable. Les montants sont des **estimations** à vérifier sur vos propres devis.

---

## 1. Le modèle : le client ne paie que si c'est réglé

**Pourquoi ce choix.** Payer 12 € d'avance à un service inconnu freine beaucoup de gens. Un abonnement convient mal à un besoin qui revient quelques fois par an : on s'abonne, on résilie. La commission au résultat supprime le risque pour le client. C'est aussi le modèle que les spécialistes (vols, litiges) ont imposé, et Atlas le propose à un taux plus bas (20 %, plafonné à 30 €, contre 25 à 35 % sans plafond).

| Pour le client | Comment ça marche dans l'application |
|---|---|
| Rien à payer pour essayer | Analyse gratuite. Atlas dit s'il peut s'occuper du dossier **avant** toute demande de carte |
| Rien à payer si ça échoue | « Clore sans succès » : aucune commission |
| Une seule saisie de carte | La carte est enregistrée une fois chez Stripe (aucun débit). Les dossiers suivants démarrent en un clic |
| Il voit ce qu'Atlas lui rapporte | Sur le tableau de bord : « Atlas vous a fait récupérer X € » |

| Pour vous | Comment c'est garanti |
|---|---|
| Le client paie sans rien avoir à faire | À « Mon problème est réglé », la commission est prélevée automatiquement sur la carte enregistrée. Si la banque demande une validation, un lien de paiement est envoyé par e-mail et affiché dans le dossier |
| Jamais deux prélèvements | Un dossier ne se clôture qu'une fois ; la clôture est verrouillée avant tout prélèvement |
| Un dossier ne coûte jamais plus qu'une somme fixée | **Plafond de coût IA par dossier** (`ATLAS_MAX_COST_PER_MISSION_USD`, 3 $ par défaut) |
| Zéro temps humain dans le cas normal | Atlas rédige, vérifie, suit et relance seul. Le client envoie en un clic |

**Commission par défaut** (modifiable sans toucher au code, voir `.env.example`) : 20 % de la somme récupérée, **au minimum 5 € et au maximum 30 €** ; **5 €** quand le résultat n'est pas une somme d'argent (abonnement résilié, service rétabli).

| Somme récupérée | Commission |
|---|---|
| 20 € | 5 € (minimum) |
| 80 € | 16 € |
| 180 € et plus | 30 € (plafond) |
| Résiliation obtenue | 5 € |

### Est-ce rentable ? (estimation)

Hypothèses, **à vérifier sur vos 20 premiers dossiers** : commission moyenne de 15 € ; IA à 1,50 € par dossier en moyenne (2,60 € au pire, plafond atteint) ; frais Stripe d'environ 0,50 € par prélèvement ; cotisations d'environ 21 % en micro-entreprise.

| Part des dossiers réglés | Ce que rapporte un dossier pris en charge, en moyenne |
|---|---|
| 20 % | environ 0,80 € |
| 35 % | environ 2,50 € |
| 50 % | environ 4,20 € |
| 70 % | environ 6,50 € |

- **Seuil de rentabilité d'un dossier : environ 15 % de dossiers réglés** (environ 25 % si l'IA atteint toujours son plafond).
- Coûts fixes de 30 à 70 € par mois (tableau ci-dessous) : avec 50 % de réussite, il faut **environ 7 à 17 dossiers pris en charge par mois** pour les couvrir.
- En mode paiement d'avance (12 €), chaque dossier payé rapportait environ 7,50 €, mais beaucoup moins de gens passaient le cap. Au lancement, le nombre de dossiers compte plus que la marge par dossier : c'est lui qui fait revenir les clients et parler d'Atlas.

### Les deux risques de ce modèle, et que surveiller

1. **Le client déclare « sans succès » alors que c'est réglé.** Aucun contrôle automatique n'est possible sans accès à ses comptes. Surveiller la part de dossiers « sans succès » dont le dernier courrier a reçu une réponse positive. Si elle dépasse 10 %, envisager de demander une preuve (capture du virement) pour les grosses sommes.
2. **Le client ne clôture jamais.** L'e-mail de fin de dossier lui demande de le faire. Si plus de 30 % des dossiers terminés restent ouverts après 60 jours, envisager d'exiger la clôture d'un dossier avant d'en ouvrir un nouveau. Ce n'est **pas** fait aujourd'hui, pour ne pas ajouter de friction.

Le mode « prix d'avance » reste disponible : `ATLAS_BILLING_MODE=upfront` et `ATLAS_PRICE_CENTS=1200`.

### Coûts fixes mensuels (estimation)

| Poste | Ordre de grandeur |
|---|---|
| Serveur (VPS ou hébergeur avec PostgreSQL) | 10 à 25 € |
| Nom de domaine | environ 1 € |
| E-mails de notification (Resend, offre gratuite jusqu'à quelques milliers par mois) | 0 € au départ |
| Médiateur de la consommation (adhésion obligatoire) | quelques dizaines à ~150 € par an selon l'organisme, soit ~5 à 12 € par mois |
| Assurance responsabilité civile professionnelle (recommandée) | ~15 à 30 € |
| **Total** | **environ 30 à 70 € par mois** |

Hypothèse : franchise de TVA de la micro-entreprise (pas de TVA à reverser sous le seuil). Au-dessus du seuil, ou avec une autre structure, refaites le calcul.

---

## Les erreurs des autres, vérifiées une par une

Reprise des recherches de [`FEUILLE-DE-ROUTE.md`](FEUILLE-DE-ROUTE.md), section 2, appliquées à Atlas tel qu'il est lancé. La leçon commune : **la plupart n'ont pas manqué de clients ; chaque client leur coûtait plus qu'il ne rapportait, et elles ont grandi avant de s'en apercevoir.** D'où la page **Économie** (réservée à vous, `ATLAS_ADMIN_EMAILS`), qui calcule ce que rapporte chaque dossier et affiche une alerte reliée à chacune de ces erreurs.

| Qui | Leur erreur | Ce qu'Atlas fait contre | Ce qui reste à surveiller |
|---|---|---|---|
| **Homejoy, Magic** | Chaque client coûtait plus qu'il ne rapportait, et elles l'ont vu trop tard | Page Économie : commissions, frais Stripe, coût IA (y compris celui des analyses gratuites sans suite), cotisations, **reste par dossier**. Alerte « À corriger » si ce reste devient négatif | Ne jamais payer un client plus cher que ce reste |
| **Homejoy** | Grandir avant que le cœur du service fonctionne | Alerte tant que moins de 20 dossiers sont clôturés : **pas de publicité payante d'ici là** | Tenir cette règle, même si les premiers retours sont bons |
| **Homejoy** | Promotions qui attirent des clients qui ne reviennent pas | Pas de remise ni d'offre de lancement. « Gratuit si ça échoue » n'est pas une promotion : c'est le prix permanent, le même pour tous. Part des clients revenus avec un 2e dossier affichée | Ne pas relancer les clients pour gonfler ce chiffre |
| **Magic** | Trouver de la demande est facile ; la servir rentablement est difficile. Les inscriptions ne prouvent rien | La page ne compte pas les inscriptions : elle compte les dossiers pris en charge, réglés, et l'argent qui reste. Coût des analyses gratuites suivi ; limite d'analyses par jour (`ATLAS_ANALYSES_PER_DAY`) | Risque propre à la commission au résultat : **travailler sans être payé**. Alerte si plus de 30 % des dossiers finis ne sont jamais clôturés |
| **Facebook M** | Un assistant « tout faire » bute sur la variété ; des humains faisaient le travail en cachette | Atlas refuse, **avant** toute carte, les dossiers qu'il ne sait pas traiter. Plafond de coût IA par dossier. La page d'accueil dit clairement qu'Atlas est une intelligence artificielle. Alerte si plus de 10 % des dossiers connaissent un échec ou un arrêt | **Votre temps n'est pas mesuré automatiquement.** Notez dans un tableur chaque intervention (dossier, minutes). Au-delà de 15 minutes par dossier en moyenne, le modèle ne tient plus |
| **DoNotPay** | Promettre plus que ce qui est prouvé ; sanctionné par l'autorité de protection des consommateurs | Aucun résultat garanti (page d'accueil, CGV). La relecture automatique bloque les promesses dans les courriers. Le compteur dit « Récupéré avec Atlas », et non « Atlas vous a fait récupérer » : le montant est **déclaré par le client**, et le rôle d'Atlas n'est pas prouvé. Alerte si moins de 15 % des dossiers sont réglés | **Ne jamais publier dans une publicité un total « X € récupérés »** : ce sont des déclarations, pas des faits vérifiés. Le slogan « Règle ça pour moi » reste une promesse : toujours l'accompagner de « sans garantie de résultat » |
| **Trim** | Une seule fonction étroite ne fait pas une entreprise | Atlas reste horizontal (tout litige écrit avec une entreprise), et mesure le retour des clients | Ne pas se refermer sur un seul type de dossier sans que les chiffres le justifient |
| **Zappos, DoorDash** (réussites) | Ont fait à la main avant d'automatiser | La liste de vérification (section 4) impose un vrai dossier de bout en bout | **À faire par vous : 5 vrais problèmes de votre entourage traités avec Atlas avant d'ouvrir au public**, en notant tout ce qui coince |

**Point juridique propre à la commission au résultat.** Une rémunération proportionnelle aux sommes récupérées ressemble au métier du recouvrement de créances (CPCE, art. R124-1 et suivants, voir [`ANALYSE-JURIDIQUE.md`](ANALYSE-JURIDIQUE.md)). Atlas reste en dehors tant que **le client agit pour lui-même** : c'est lui qui envoie les courriers, Atlas ne contacte jamais l'entreprise et **n'encaisse jamais l'argent récupéré**. Ne changez pas cela sans avis d'un professionnel ; posez-lui aussi la question de la commission.

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
   - le mode de paiement : rien à mettre pour la commission au résultat (réglages par défaut) ; pour un prix d'avance, `ATLAS_BILLING_MODE=upfront` et `ATLAS_PRICE_CENTS=1200` ;
   - `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` ;
   - les six champs `ATLAS_LEGAL_*` (nom, SIRET, adresse, e-mail, hébergeur, médiateur) ;
   - `RESEND_API_KEY`, `ATLAS_MAIL_FROM` ;
   - `ATLAS_CRON_SECRET` (32 caractères aléatoires ou plus : `openssl rand -hex 32`) ;
   - `ATLAS_ADMIN_EMAILS=votre@adresse` : ouvre la page **Économie** à votre compte, et à lui seul.
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
- [ ] La page d'accueil affiche la commission (« Vous ne payez que si votre problème est réglé… »).
- [ ] `pnpm check:integrations` (sur le serveur) : Claude OK.
- [ ] **Faire un vrai dossier soi-même**, avec une vraie carte, en mode Stripe réel : analyse, enregistrement de la carte (aucun débit), démarrage automatique, courrier « Prêt à envoyer », envoi en un clic, « J'ai envoyé », reprise programmée, e-mail reçu, puis « Mon problème est réglé » avec un montant : vérifier le prélèvement dans Stripe, puis se rembourser depuis le tableau de bord Stripe.
- [ ] Vérifier dans le **Journal** du dossier le coût IA réel, et le comparer à l'estimation de la section 1.
- [ ] Relire vous-même les CGV. Idéalement, les faire relire une fois par un professionnel (voir [`ANALYSE-JURIDIQUE.md`](ANALYSE-JURIDIQUE.md), risques 1 et 2).

---

## 5. Trouver les premiers clients sans perdre d'argent

1. **Gratuit d'abord :** votre entourage, les groupes locaux et les forums d'entraide, en respectant leurs règles. Présentez Atlas simplement, sans promesse de résultat.
2. **Mesurer** sur la page **Économie**, au bout de 20 dossiers clôturés :
   - le coût IA réel par dossier ;
   - la part de dossiers réglés, la commission moyenne, et la part de dossiers jamais clôturés ;
   - la part de clients qui reviennent avec un autre problème ;
   - les demandes de remboursement.
3. **Publicité seulement ensuite**, par tranches de 50 à 100 €, et seulement si **le coût pour obtenir un dossier pris en charge reste inférieur à ce qu'il rapporte en moyenne** (environ 4 € avec 50 % de réussite, voir la section 1). Sinon, on arrête la publicité.
4. **Ne pas** baisser la commission pour « faire du volume » : c'est l'erreur de Homejoy. Le client ne paie déjà rien en cas d'échec.

---

## 6. Ce qui reste manuel pour vous

| Situation | Fréquence attendue | Que faire |
|---|---|---|
| Contestation d'une commission | Rare | Rembourser depuis Stripe si le client se trompe de bouton ou de montant |
| Commission non réglée (lien de paiement ignoré, carte expirée) | Occasionnelle | Le dossier affiche la commission due ; relancer une fois par e-mail, sans plus |
| Demande de suppression de la carte | Rare | La supprimer du client dans le tableau de bord Stripe |
| Dossier arrêté par le plafond de coût | Rare | Regarder le Journal ; terminer à la main ou prévenir le client |
| E-mail d'un client | Variable | Répondre depuis l'adresse de contact |

---

## 7. Ce qui n'est pas encore fait

- Aucune notification quand le client pose une question pendant qu'il est connecté : il voit la réponse à l'écran.
- Pas de facture PDF générée par Atlas. Stripe envoie un reçu ; activez l'envoi automatique des reçus dans Stripe.
- La page Économie estime les frais Stripe, la conversion dollar-euro du coût IA et les cotisations : Stripe fait foi pour l'argent réellement encaissé. Les dossiers supprimés par leurs clients ne sont pas comptés.
- Votre propre temps passé sur les dossiers n'est pas mesuré par l'application (voir « Les erreurs des autres », Facebook M).
- Les limites connues du `README.md` restent valables (instance unique, pas de vérification de l'e-mail à l'inscription).
