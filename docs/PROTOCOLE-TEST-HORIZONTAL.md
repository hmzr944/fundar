# Protocole expérimental — « Règle ça pour moi » (offre horizontale)

> Date : 25 septembre 2026. Fait suite à [`EVALUATION-WEDGE-VOLS.md`](EVALUATION-WEDGE-VOLS.md).
> Statut : **protocole à valider avant lancement.** Rien n'est développé. Les paramètres chiffrés (budgets, prix, seuils) sont des **choix proposés**, marqués ⚙. Ils doivent être confirmés, puis **gelés avant la première demande**.

---

## Sommaire

0. [Ce que le test cherche à établir](#0-ce-que-le-test-cherche-à-établir)
1. [Hypothèses testées](#1-hypothèses-testées)
2. [Proposition affichée](#2-proposition-affichée-point-1)
3. [Acquisition, budget et durée](#3-acquisition-budget-et-durée-points-2-à-5)
4. [Données demandées à l'utilisateur](#4-données-demandées-à-lutilisateur-point-6)
5. [Déroulé d'un dossier : manuel ou Atlas](#5-déroulé-dun-dossier--manuel-ou-atlas-point-7)
6. [Journalisation](#6-journalisation-point-8)
7. [Métriques](#7-métriques-points-9-à-13)
8. [Test de paiement réel](#8-test-de-paiement-réel-point-14)
9. [Seuils et verdicts](#9-seuils-et-verdicts-point-15)
10. [Cadre juridique, transparence et limites de périmètre](#10-cadre-juridique-transparence-et-limites-de-périmètre)
11. [Calendrier](#11-calendrier)
12. [Décisions à confirmer avant le lancement](#12-décisions-à-confirmer-avant-le-lancement)

---

## 0. Ce que le test cherche à établir

Le comportement central d'Atlas :

> **j'ai un problème → je le donne à Atlas → Atlas s'en occupe → le problème est réellement réglé.**

Six questions, dans cet ordre de priorité :

1. **Quels problèmes les gens confient-ils spontanément ?**
2. **Atlas peut-il réellement les résoudre**, avec une preuve du résultat ?
3. **Quel travail humain et IA cela demande-t-il ?**
4. **Quelle valeur cela produit-il** pour l'utilisateur ?
5. **Les gens reviennent-ils avec un autre problème ?**
6. **Acceptent-ils de payer ?**

**Ce que le test ne cherche pas :** maximiser le nombre de prospects, optimiser une landing page, ou choisir un secteur. **Le nombre de demandes n'est jamais, à lui seul, un critère de succès.** Il sert seulement à vérifier que l'échantillon est suffisant pour conclure.

---

## 1. Hypothèses testées

| # | Hypothèse | Métrique principale |
|---|---|---|
| **H1 Délégation** | Des particuliers confient un problème réel à un intermédiaire généraliste, sans qu'on leur désigne une catégorie | Taux de délégation (M3) |
| **H2 Traitabilité** | Une part suffisante de ces problèmes peut être prise en charge par écrit, sans identifiants, avec un résultat vérifiable | Taux de traitabilité (M2) |
| **H3 Résolution** | Atlas, supervisé, obtient réellement le résultat | Taux de résolution prouvée (M5) |
| **H4 Économie** | Le coût de résolution peut, après automatisation du travail mécanique, passer sous le revenu par dossier | Écart coût/revenu (M8) |
| **H5 Récurrence** | Les utilisateurs reviennent avec un autre problème, sans qu'on les relance | Taux de second problème (M9) |
| **H6 Paiement** | Les utilisateurs paient réellement après un résultat | Taux de paiement (M10) |

Les vols et les colis ne sont **pas** des offres séparées. Ce sont des **catégories comparatrices** observées dans le flux horizontal. Si le flux n'en contient pas assez, la comparaison se fait sur les catégories qui émergent réellement.

---

## 2. Proposition affichée (point 1)

**Une seule page. Une seule promesse.** Aucune variante concurrente, pour ne pas transformer le test en concours de marketing.

### Texte de la page (⚙ version proposée)

> # Atlas — Règle ça pour moi.
>
> Vous avez un problème avec une entreprise ou une organisation, et pas l'envie ou le temps de vous en occuper ?
>
> Décrivez la situation et envoyez les documents que vous avez. Atlas analyse votre cas et vous dit, **sous 48 h ouvrées**, s'il peut prendre en charge les démarches pour essayer de le régler.
>
> Si oui, et si vous êtes d'accord, Atlas s'en occupe : réclamations, relances, recours. Il vous tient informé jusqu'au résultat, **y compris s'il n'y arrive pas**.
>
> *Par exemple : un remboursement qui n'arrive pas, une facture contestée, un colis jamais reçu, un abonnement impossible à résilier, une caution non rendue, des frais bancaires, une réclamation restée sans réponse… ou autre chose.*
>
> **[Décrire mon problème]**
>
> Service en phase de test, gratuit pendant cette phase. Aucun mot de passe ne vous sera demandé.

### Règles de rédaction

- **Les exemples sont dans un ordre tiré au hasard à chaque affichage**, pour ne pas orienter les dépôts vers la première catégorie citée.
- **Aucune promesse de résultat**, ni de taux de succès (leçon DoNotPay).
- **« Gratuit pendant cette phase »** : le test de paiement a lieu **après** le résultat ([section 8](#8-test-de-paiement-réel-point-14)). Annoncer la gratuité puis faire payer serait trompeur. On demandera donc une **contribution volontaire proposée à un prix donné**, pas un paiement dû. Voir la section 8 pour la manière d'en tirer un vrai signal.
  - *Alternative ⚙ :* annoncer dès la page « paiement uniquement en cas de résultat, montant indiqué avant de commencer ». Le test de paiement est alors plus fort, mais l'acquisition plus faible. Choix à trancher ([section 12](#12-décisions-à-confirmer-avant-le-lancement)).

---

## 3. Acquisition, budget et durée (points 2 à 5)

### Le canal influence les problèmes reçus

Une annonce sur Google achetée sur « colis non reçu » ne produit que des problèmes de colis. **Les canaux ciblés par type de problème faussent la distribution naturelle.** Chaque demande est donc étiquetée par canal, et **seuls les canaux non ciblés comptent pour mesurer la distribution naturelle (M1)**.

### Canaux (point 2) et budget maximal (point 3)

| Canal | Rôle | Ciblage | Budget max ⚙ | Compte dans M1 ? |
|---|---|---|---|---|
| **C1 Réseaux sociaux payants** (Meta : Facebook, Instagram), France, 25–65 ans, visuel et texte génériques | Canal principal | **Aucun ciblage par problème** | **1 500 €** | Oui |
| **C2 Communautés en ligne** (groupes locaux, forums d'entraide, sous-forums francophones), publication générique, en respectant les règles de chaque communauté | Canal organique | Aucun | 0 € (temps : ~5 h) | Oui |
| **C3 Recherche payante** (Google Ads) sur des requêtes génériques de litige (« réclamation sans réponse », « litige entreprise que faire ») | Contrôle | Faible | **500 €** | Oui, **analysé séparément** |
| **C4 Réseau personnel** | Amorçage, rodage du processus | — | 0 € | **Non.** Exclu de toutes les métriques de décision, conservé pour le rodage |

**Plafond total d'acquisition : 2 000 €** ⚙. Aucun canal ne dépasse son plafond. Pas de réallocation en cours de test vers le canal qui « marche le mieux » : cela optimiserait le marketing, pas l'apprentissage.

**Plafond de capacité humaine ⚙ : 120 heures** de traitement sur toute la durée. Si ce plafond est atteint, on arrête l'acquisition, sans baisser la qualité de traitement.

### Durée (point 4)

| Phase | Durée | Contenu |
|---|---|---|
| **P0 Préparation** | 2 semaines | Page, formulaire, mandat, mentions RGPD, journal, vérification juridique ([section 10](#10-cadre-juridique-transparence-et-limites-de-périmètre)), rodage sur 3 à 5 dossiers du réseau personnel (C4) |
| **P1 Acquisition et traitement** | 4 semaines | Canaux C1 à C3 ouverts |
| **P2 Suivi** | 8 semaines | Plus d'acquisition. Relances, escalades, résultats, fenêtre de second problème |
| **P3 Analyse et décision** | 1 semaine | Calcul des métriques, verdict selon les seuils gelés |

**Durée totale : 15 semaines.** Les dossiers encore ouverts à la fin de P2 sont **suivis jusqu'à leur terme**, par engagement envers l'utilisateur. Ils sont comptés comme « en cours » dans le verdict, jamais comme des succès.

### Nombre minimal de demandes (point 5)

| Seuil | Valeur ⚙ | Rôle |
|---|---|---|
| Demandes recevables (hors C4, hors spam et doublons) | **≥ 60** | En dessous, le verdict est **« données insuffisantes »**, pas un échec du produit |
| Dossiers pris en charge avec mandat | **≥ 30** | Base de calcul des métriques de résolution, d'économie et de paiement |
| Arrêt anticipé de l'acquisition | **150 demandes** ou plafond humain atteint | Protège la qualité de traitement |

**Précision statistique :** avec 30 dossiers, l'intervalle de confiance à 95 % d'un pourcentage est d'environ ±18 points. Les seuils de la section 9 sont donc des **zones de décision**, pas des mesures précises. Un résultat proche d'une frontière est classé dans la zone la plus prudente.

---

## 4. Données demandées à l'utilisateur (point 6)

### Au dépôt (formulaire)

| Champ | Obligatoire | Pourquoi |
|---|---|---|
| Description libre du problème | Oui | C'est la donnée principale de M1. **Pas de liste déroulante de catégories**, qui orienterait la réponse |
| Organisation concernée | Oui | Qualification |
| Dates clés (achat, incident, premières démarches) | Si connues | Délais légaux |
| Montant en jeu | Si connu | Mesure de la valeur |
| Ce qui a déjà été tenté | Oui (texte libre) | Mesure de la friction réelle |
| Résultat souhaité | Oui | Définit le succès du dossier |
| Pièces : e-mails transférés, factures, contrats, captures | Si disponibles | Instruction |
| Adresse e-mail, prénom | Oui | Contact |
| Canal d'arrivée | Automatique | Analyse par canal |
| Consentement au traitement des données, et accord pour être recontacté | Oui | RGPD |

### À la prise en charge

- **Mandat signé** : actions autorisées, organisation visée, durée, possibilité de révocation. Signature électronique simple.
- Pièces complémentaires si nécessaire.

### À la clôture

- **Preuve du résultat** : capture du virement, du remboursement, de l'avoir, de l'arrêt du prélèvement, ou e-mail de l'organisation.

### Jamais demandé

Mots de passe ou identifiants, codes bancaires, numéro de carte, pièce d'identité (sauf si l'organisation l'exige explicitement : dans ce cas, c'est l'utilisateur qui l'envoie directement), IBAN (les remboursements sont versés **directement à l'utilisateur** par l'organisation). Atlas ne manipule **aucun fonds**.

---

## 5. Déroulé d'un dossier : manuel ou Atlas (point 7)

**Outil interne :** l'application Atlas actuelle, **sans modification**. Elle fournit déjà les missions, la lecture de documents, la rédaction de livrables et des statuts calculés à partir des preuves. Les actions sortantes, que l'application ne sait pas faire, sont réalisées par l'opérateur humain.

| Étape | Atlas (application actuelle) | Humain (opérateur) | Utilisateur |
|---|---|---|---|
| 1. Réception | — | Crée la mission, importe les pièces | Dépose le problème |
| 2. Qualification : traitable ou non, droit applicable, résultat possible | Analyse, plan, questions de clarification | **Valide ou corrige** la qualification | Répond aux questions |
| 3. Réponse sous 48 h : prise en charge, refus motivé ou orientation | Rédige la réponse | Relit, envoie | Accepte, signe le mandat |
| 4. Préparation des démarches (réclamation, mise en demeure, saisine) | Rédige | **Relit, corrige** | — |
| 5. Envoi : e-mail depuis l'adresse dossier d'Atlas, formulaire web, lettre recommandée électronique | — | **Exécute** et conserve la preuve d'envoi | Envoie lui-même si l'organisation exige que la demande vienne du titulaire du compte (compté comme « action utilisateur ») |
| 6. Suivi et relances | Rédige les relances | Tient l'échéancier, envoie | — |
| 7. Escalade (médiateur, association, signalement) | Prépare le dossier | Soumet | Signe si nécessaire |
| 8. Vérification | Contrôle que la preuve correspond au résultat attendu | Valide | Fournit la preuve |
| 9. Compte rendu | Rédige : obtenu, non obtenu, pourquoi, ce qui reste | Relit, envoie | — |

**Hors périmètre, orienté vers un professionnel ou un organisme gratuit :** toute procédure judiciaire, et les domaines listés en [section 10](#10-cadre-juridique-transparence-et-limites-de-périmètre).

**Règle de résultat :** un dossier n'est « résolu » **que sur preuve externe**. « Réclamation envoyée », « l'entreprise a promis » ou « accord de principe » ne sont pas des résultats.

---

## 6. Journalisation (point 8)

Un classeur partagé (tableur), avec quatre onglets. Aucun développement.

### Onglet `demandes` (une ligne par dépôt)

`id_demande` · `date` · `canal` (C1 à C4) · `utilisateur_id` · `description` · `organisation` · `categorie` (**codée après coup**, voir M1) · `montant_en_jeu` · `deja_tente` · `traitable` (oui/non) · `motif_non_traitable` · `delai_reponse_h` · `mandat_signe` (oui/non) · `motif_refus_utilisateur`

### Onglet `actions` (une ligne par action, **sans exception**)

`id_action` · `id_demande` · `horodatage` · `acteur` (atlas / humain / utilisateur) · `type` (analyse, rédaction, envoi, formulaire, relance, escalade, vérification, contact utilisateur, compte rendu) · `nature_travail_humain` (**mécanique** : copier, envoyer, remplir, planifier / **jugement** : qualifier, corriger le fond, décider / **relation** : échanger avec l'utilisateur) · `minutes` · `canal_sortant` · `preuve` (lien vers la pièce) · `issue` (effet obtenu, sans effet, échec, erreur) · `cout_ia_eur` (repris du journal de coût de la mission Atlas) · `frais_eur` (recommandé, etc.)

### Onglet `resultats` (une ligne par dossier pris en charge)

`id_demande` · `statut_final` (résolu prouvé / partiellement résolu prouvé / non résolu / en cours / abandonné par l'utilisateur) · `resultat_obtenu` (texte) · `montant_recupere_eur` · `montant_economise_eur` (récurrent, ramené à 12 mois) · `resultat_non_monetaire` · `preuve` · `date_resultat` · `nb_relances` · `escalade` (oui/non, vers qui) · `blocage` (raison exacte et ce qu'il aurait fallu)

### Onglet `relation` (une ligne par utilisateur)

`utilisateur_id` · `date_premier_depot` · `second_probleme` (oui/non) · `date_second` · `second_meme_categorie` (oui/non) · `sollicite` (**toujours non pour compter dans M9**) · `paiement_propose` · `format_paiement` · `paye` (oui/non) · `montant_paye` · `verbatim` (citation libre, avec accord)

**Règles :**
- une action non journalisée n'a pas eu lieu ;
- les minutes sont saisies **au moment de l'action**, pas estimées après coup ;
- le codage des catégories est fait par deux personnes sur un échantillon de 20 demandes pour vérifier leur accord.

---

## 7. Métriques (points 9 à 13)

| # | Métrique | Définition exacte | Point |
|---|---|---|---|
| **M1** | **Distribution naturelle** | Répartition des demandes des canaux non ciblés (C1, C2, C3) par catégorie codée après coup, sans grille imposée à l'utilisateur. Le tableau affiché pour chaque catégorie : demandes · traitables · pris en charge · résolus prouvés · coût médian · valeur médiane | — |
| **M2** | Taux de traitabilité | Demandes jugées traitables / demandes recevables | 12 |
| **M3** | Taux de délégation | Mandats signés / demandes traitables auxquelles Atlas a proposé une prise en charge | — |
| **M4** | Autonomie d'Atlas | Part des minutes de travail produites par Atlas (rédaction, analyse) plutôt que par l'humain ; et part des dossiers **sans aucune correction de fond** par l'humain | — |
| **M5** | **Taux de résolution prouvée** | Dossiers « résolu prouvé » ou « partiellement résolu prouvé » / dossiers pris en charge. Les dossiers en cours comptent comme **non résolus** au moment du verdict | 10 |
| **M6** | Valeur obtenue | Montant récupéré, plus montant économisé ramené à 12 mois, par dossier résolu (médiane et total). Les résultats non monétaires sont décrits et comptés à part | 11 |
| **M7** | Délai de résolution | Médiane entre le mandat et la preuve du résultat | — |
| **M8** | **Coût complet par dossier** | (minutes humaines × taux horaire ⚙ **35 €/h**) + coût IA + frais d'envoi, par dossier pris en charge. Présenté aussi **hors minutes « mécaniques »**, pour estimer le coût après automatisation | 9 |
| **M9** | **Taux de second problème** | Utilisateurs ayant déposé un **autre** problème **sans sollicitation**, dans les **60 jours** suivant leur premier dépôt / utilisateurs dont le premier dossier a été pris en charge. Également calculé pour un second problème **d'une autre catégorie** | 13 |
| **M10** | Taux de paiement | Voir [section 8](#8-test-de-paiement-réel-point-14) | 14 |
| **M11** | Échecs et blocages | Nombre de dossiers bloqués, avec la cause, classée : Atlas s'est trompé / l'organisation refuse / l'utilisateur n'a pas fourni / hors capacité / droit défavorable | — |

**Interdiction de solliciter un second problème :** aucun message du type « avez-vous un autre problème ? » pendant la fenêtre de 60 jours. Le compte rendu final peut seulement rappeler, en une ligne neutre, que le service reste ouvert. Sinon, M9 mesurerait l'effet de la relance, pas le comportement.

---

## 8. Test de paiement réel (point 14)

**Moment :** juste après l'envoi du compte rendu d'un dossier **résolu avec preuve**.

**Formats**, attribués **en alternance** (dossier pair : A ; impair : B) ⚙ :

| Format | Proposition | Prix ⚙ (paramètres de test, **pas des prix validés**) |
|---|---|---|
| **A. Commission** | Un pourcentage de la valeur obtenue | 20 % de la valeur, minimum 10 € |
| **B. Forfait** | Un montant fixe par dossier résolu | 19 € |

Pour les résultats non monétaires, seul le format B s'applique.

**Mécanique :** un lien de paiement réel (prestataire de paiement standard), avec le montant pré-rempli. Le message indique honnêtement : « Ce service était gratuit pendant le test. Si vous voulez soutenir Atlas, voici ce que nous facturerions. » **Seul un paiement effectivement encaissé compte.** Une intention déclarée (« oui je paierais ») est notée à part et n'entre pas dans M10.

**Limite assumée :** un paiement volontaire après un service gratuit **sous-estime** probablement le vrai consentement à payer. Un paiement dû, annoncé avant, le mesurerait mieux. D'où les seuils prudents de la section 9, et l'alternative proposée en section 2.

**M10** = paiements encaissés / comptes rendus de résolution envoyés avec proposition de paiement, par format.

---

## 9. Seuils et verdicts (point 15)

**Tous les seuils ci-dessous sont gelés avant le lancement.** Ils ne sont plus modifiés après la première demande. Les valeurs sont des propositions ⚙, fondées sur un jugement et non sur un historique (aucune référence publique n'existe pour ce type de service).

### Préalable : l'échantillon est-il suffisant ?

Si moins de 60 demandes recevables **ou** moins de 30 dossiers pris en charge après épuisement du budget et de la durée, le verdict est :

> **« Non concluant — la promesse ou l'acquisition ne fonctionne pas. »**

Ce n'est pas une invalidation du comportement « Règle ça pour moi ». Cela signifie que la promesse ou le canal ne convertissent pas. On retravaille la proposition, et non le produit, avant tout nouveau test.

### Zones par métrique

| Métrique | ✅ Zone validée | 🟡 Zone prometteuse | ❌ Zone invalidante | Critique ? |
|---|---|---|---|---|
| M2 Traitabilité | ≥ 50 % | 30 à 49 % | < 30 % | Non |
| M3 Délégation | ≥ 60 % | 40 à 59 % | < 40 % | **Oui** |
| M5 Résolution prouvée | ≥ 50 % | 30 à 49 % | < 30 % | **Oui** |
| M8 Coût hors travail mécanique, comparé au revenu potentiel médian par dossier résolu | Coût ≤ revenu | Coût entre 1 et 2 fois le revenu | Coût > 2 fois le revenu | **Oui** |
| M9 Second problème (60 jours, non sollicité) | ≥ 20 % | 10 à 19 % | < 10 % | **Oui** |
| M10 Paiement effectif | ≥ 40 % | 20 à 39 % | < 20 % | Oui |
| Concentration M1 : part de la première catégorie parmi les dossiers traitables | ≤ 60 % | — | — | Non (oriente la suite, voir ci-dessous) |

« Revenu potentiel » = valeur obtenue × format A, ou forfait B, selon ce qui a été le mieux accepté.

### Définition des trois verdicts

**✅ Hypothèse validée.** Toutes les métriques critiques (M3, M5, M8, M9) sont en zone validée, M10 est au moins en zone prometteuse, et M2 au moins en zone prometteuse.

> Sens : des particuliers confient spontanément des problèmes variés à Atlas, Atlas les résout avec preuve, une partie revient avec un autre problème, et l'économie devient tenable une fois le travail mécanique automatisé.
>
> Suite : automatiser **en priorité les étapes qui consomment le plus de minutes « mécaniques »** d'après le journal. Puis un second test, payant dès le départ, sur un volume plus grand.

**🟡 Hypothèse prometteuse mais insuffisamment démontrée.** Aucune métrique critique en zone invalidante, mais au moins une en zone prometteuse. Ou bien : tout est validé sauf M10.

> Sens : le comportement existe, mais un maillon reste faible ou mal mesuré.
>
> Suite : un seul test ciblé sur le maillon faible, par exemple un paiement annoncé dès la page si M10 est faible, ou un périmètre restreint aux catégories les plus traitables si M5 est faible. **Pas de développement produit avant.**

**❌ Hypothèse invalidée.** Au moins une métrique critique en zone invalidante.

> Lecture selon la métrique qui échoue :
>
> | Échec | Signification | Suite |
> |---|---|---|
> | M3 (délégation) | Les gens décrivent leurs problèmes mais ne délèguent pas | Revoir la promesse ou la confiance. **Atlas « Règle ça pour moi » n'est pas adopté tel quel** |
> | M5 (résolution) | Atlas ne sait pas obtenir les résultats, même supervisé | Restreindre à un vertical où le taux de résolution est bon, ou revoir la capacité d'exécution |
> | M8 (économie) | Le coût de jugement humain reste trop élevé même après automatisation du mécanique | Un modèle généraliste n'est pas tenable en l'état : se replier sur les catégories les moins coûteuses d'après M1 |
> | M9 (récurrence) | Les gens utilisent Atlas comme un service ponctuel, pas comme l'endroit où déposer leurs problèmes | **Le comportement central de la vision n'est pas observé.** Un vertical rentable reste possible, mais ce ne serait plus Atlas tel que conçu |

### Règle complémentaire : la concentration

Si une catégorie représente **plus de 60 %** des dossiers traitables, l'offre horizontale fonctionne **en pratique comme un vertical**. Le verdict reste valable, mais la suite doit en tenir compte : entrer par cette catégorie **sans** la présenter comme l'identité d'Atlas, et vérifier que M9 (second problème d'une autre catégorie) reste au-dessus de 10 %.

### Comparateurs (vols, colis)

Pour chaque catégorie comparatrice ayant au moins 5 dossiers pris en charge, on présente M5, M8 et M9 à côté de la moyenne horizontale. **Aucune décision n'est prise sur une catégorie de moins de 5 dossiers.**

---

## 10. Cadre juridique, transparence et limites de périmètre

Points à vérifier en phase P0, idéalement avec un avocat. **Ce sont des risques identifiés, pas des avis juridiques.**

### Consultation juridique

La consultation juridique à titre habituel et rémunéré est réservée à certaines professions (loi n° 71-1130 du 31 décembre 1971, art. 54 et suivants). Demander Justice a été jugé licite parce qu'il ne fournissait **ni représentation ni consultation personnalisée** (Cass. crim., 21 mars 2017).

- **Pendant la phase gratuite, le risque est plus faible.** Mais la qualification d'un dossier (« vos frais sont injustifiés ») ressemble à une consultation.
- **Avant le test de paiement, faire valider la formulation.** Atlas « prend en charge des démarches de réclamation » ; il ne « donne pas un avis juridique ». L'orientation vers un avocat se fait dès qu'un dossier l'exige.

### Mandat et fonds

- Le mandat est écrit, limité et révocable.
- **Atlas n'encaisse jamais l'argent de l'utilisateur.** Cela évite toute question de réglementation des services de paiement.

### Données personnelles (RGPD)

- Mentions d'information exactes ; finalité : traitement du dossier et évaluation du test.
- Durée de conservation limitée (⚙ 6 mois après clôture, sauf accord).
- Minimisation ([section 4](#4-données-demandées-à-lutilisateur-point-6)). Suppression sur demande.
- Si des données sont transmises à un fournisseur de modèle d'IA hors UE, cela doit être mentionné.

### Transparence sur l'humain et l'IA

Vous avez indiqué que l'utilisateur n'a pas besoin de savoir qu'un humain supervise. C'est compatible avec le test, **à trois conditions** :

1. **Ne rien affirmer de faux.** Ni « 100 % automatisé », ni « aucun humain ne lit vos données ». Le RGPD impose d'indiquer qui traite les données : la mention « traitées par l'équipe Atlas et des outils d'IA » est exacte et suffit.
2. **Les messages envoyés aux organisations** au nom de l'utilisateur indiquent qu'ils émanent d'Atlas, mandaté par l'utilisateur. Si un message est rédigé par une IA et qu'un interlocuteur interagit avec un système automatisé, l'obligation de transparence de l'AI Act (art. 50, applicable depuis le 2 août 2026) peut s'appliquer.
3. **Aucune pratique commerciale trompeuse** sur la nature du service.

**Recommandation :** ne pas mettre la supervision humaine en avant, mais ne pas la nier. Cela ne fausse pas le test : l'utilisateur délègue à « Atlas », et c'est ce comportement qu'on mesure.

### Hors périmètre (orientation vers un tiers compétent)

- Procédures judiciaires.
- Droit pénal, droit de la famille, droit du travail, droit des étrangers, santé.
- Dettes réclamées **à** l'utilisateur (recouvrement).
- Situations de détresse ou de vulnérabilité manifeste : orientation vers les services sociaux et les associations.
- Litiges entre particuliers, **sauf** le bailleur pour la caution. À confirmer ⚙ : la caution fait partie des exemples annoncés, mais le bailleur est souvent un particulier.

### Arrêt d'un dossier

Menace de poursuites contre l'utilisateur, demande qui excède le mandat, ou risque d'aggraver la situation de l'utilisateur : on arrête, on l'explique à l'utilisateur et on l'oriente.

---

## 11. Calendrier

| Semaine | Phase | Livrables |
|---|---|---|
| S1–S2 | P0 | Page, formulaire, modèle de mandat, mentions RGPD, classeur de journal, validation juridique, 3 à 5 dossiers de rodage (C4). **Gel des paramètres ⚙ et des seuils** |
| S3–S6 | P1 | Acquisition C1 à C3 ; qualification sous 48 h ; traitement |
| S7–S14 | P2 | Suivi, relances, escalades, résultats, tests de paiement, fin de la fenêtre de 60 jours pour les derniers dépôts |
| S15 | P3 | Calcul des métriques, tableau M1, verdict, rapport |

Point d'étape hebdomadaire pendant P1 et P2 : on vérifie les plafonds, on classe les blocages, et **on ne modifie aucun seuil**.

---

## 12. Décisions à confirmer avant le lancement

| # | Décision | Proposition ⚙ |
|---|---|---|
| 1 | Paiement annoncé dès la page, ou contribution proposée après le résultat | Contribution après le résultat (meilleure acquisition, signal de paiement plus faible) |
| 2 | Budget d'acquisition total et répartition | 2 000 € : 1 500 € réseaux sociaux, 500 € recherche payante |
| 3 | Plafond d'heures humaines | 120 h |
| 4 | Taux horaire pour valoriser le travail humain | 35 €/h |
| 5 | Prix testés | 20 % de la valeur (minimum 10 €) ou 19 € par dossier |
| 6 | Seuils de la section 9 | Tels que proposés |
| 7 | Cautions : inclure les bailleurs particuliers ? | Oui, avec prudence (mise en demeure et commission de conciliation uniquement) |
| 8 | Validation juridique avant le test de paiement | Oui, obligatoire |
| 9 | Durée de conservation des données | 6 mois après clôture |

Une fois ces décisions prises, le protocole est **gelé**. Toute modification ultérieure est consignée avec sa date et sa raison dans le rapport final.
