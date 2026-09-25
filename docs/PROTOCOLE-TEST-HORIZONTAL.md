# Protocole expérimental — « Règle ça pour moi » (offre horizontale)

> Date : 25 septembre 2026. Fait suite à [`EVALUATION-WEDGE-VOLS.md`](EVALUATION-WEDGE-VOLS.md).
> **Version simple, à lire d'abord :** [`FEUILLE-DE-ROUTE.md`](FEUILLE-DE-ROUTE.md).
> Statut : **décisions et paramètres verrouillés** ([section 12](#12-décisions)). Rien n'est développé. Restent à faire avant le premier euro dépensé : validation juridique, test synthétique des règles de verdict, gel formel ([section 12](#étapes-avant-le-premier-euro-dépensé)). La page d'accueil, le mandat et les modèles de messages peuvent encore être ajustés **à la suite de l'avis de l'avocat** ; les règles de la section 9, non.

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
12. [Décisions](#12-décisions)
13. [Annexe A — Exemple synthétique de 30 dossiers](#annexe-a--exemple-synthétique-de-30-dossiers)

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

Ces questions correspondent à cinq niveaux, chacun conditionnant le suivant :

| Niveau | Question | Métriques |
|---|---|---|
| 1. Acquisition | Quelqu'un apporte-t-il spontanément un problème ? | Volume recevable, M1 |
| 2. Délégation | Accepte-t-il réellement qu'Atlas s'en occupe, tarif connu ? | M3 |
| 3. Exécution | Atlas obtient-il un résultat vérifiable ? | M2, M5, M11 |
| 4. Économie | Ce résultat peut-il être produit à un coût compatible avec un modèle commercial ? | M8, M10 |
| 5. Réutilisation | La personne revient-elle spontanément avec un autre problème ? | M9 |

### Principe directeur : ne pas faire fonctionner Atlas artificiellement

Le test doit pouvoir **échouer**. Tout ce qui le ferait réussir artificiellement est interdit :

- **Pas de tri favorable des dossiers.** Les critères de traitabilité sont fixés à l'avance ([section 5](#5-déroulé-dun-dossier--manuel-ou-atlas-point-7)). Un dossier qui les remplit est proposé à la prise en charge, même s'il paraît difficile.
- **Pas d'effort héroïque invisible.** Chaque minute est journalisée. Un dossier qui dépasse le plafond par dossier est clos « hors capacité », sans travail supplémentaire hors journal.
- **Pas de sollicitation** d'un second problème, ni d'un paiement plus insistant que prévu.
- **Chaque échec est une donnée** : problème non traitable, dossier bloqué, coût excessif, personne qui ne revient pas, paiement limité à certains types de problèmes. Tout est enregistré avec sa cause, rien n'est retiré de l'analyse.

**Ce que le test ne cherche pas :** maximiser le nombre de prospects, optimiser une landing page, ou choisir un secteur. **Le nombre de demandes n'est jamais, à lui seul, un critère de succès.** Il sert seulement à vérifier que l'échantillon est suffisant pour conclure.

---

## 1. Hypothèses testées

| # | Hypothèse | Métrique principale |
|---|---|---|
| **H1 Délégation** | Des particuliers confient un problème réel à un intermédiaire généraliste, sans qu'on leur désigne une catégorie | Taux de délégation (M3) |
| **H2 Traitabilité** | Une part suffisante de ces problèmes peut être prise en charge par écrit, sans identifiants, avec un résultat vérifiable | Taux de traitabilité (M2) |
| **H3 Résolution** | Atlas, supervisé, obtient réellement le résultat | Taux de résolution prouvée (M5) |
| **H4 Économie** | Le coût de résolution, après automatisation du travail mécanique, reste compatible avec les commissions observées sur le marché (20 à 35 % de la valeur obtenue) | Ratios coût/valeur (M8) |
| **H5 Horizontalité** (signal stratégique) | Les utilisateurs reviennent avec un autre problème, sans qu'on les relance | Taux de second problème (M9) |
| **H6 Paiement** | Les utilisateurs paient réellement après un résultat | Taux de paiement (M10) |

**H1, H3 et H4 sont les preuves principales de viabilité du service.** H5 indique si l'usage commence à devenir horizontal. C'est le meilleur signal de la vision généraliste, mais son absence sur un premier échantillon ne suffit pas à l'invalider (trop peu de recul, trop peu de dossiers résolus). Il est donc lu à part ([section 9](#9-seuils-et-verdicts-point-15)). H6 est lue comme un indicateur économique, sous réserve de la validation juridique.

Les vols et les colis ne sont **pas** des offres séparées. Ce sont des **catégories comparatrices** observées dans le flux horizontal. Si le flux n'en contient pas assez, la comparaison se fait sur les catégories qui émergent réellement.

---

## 2. Proposition affichée (point 1)

**Une seule page. Une seule promesse.** Aucune variante concurrente, pour ne pas transformer le test en concours de marketing.

### Texte de la page (sous réserve de l'avis juridique)

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
> Atlas est en phase de test, avec une **tarification au résultat** : vous ne payez que si le résultat convenu ensemble est obtenu. Le montant vous est indiqué avant que vous ne confiiez votre dossier. Aucun mot de passe ne vous sera demandé.

### Règles de rédaction

- **Les exemples sont dans un ordre tiré au hasard à chaque affichage**, pour ne pas orienter les dépôts vers la première catégorie citée.
- **Aucune promesse de résultat**, ni de taux de succès (leçon DoNotPay).
- **Pas de prix sur la page.** Le but premier est d'apprendre quels problèmes les gens veulent déléguer. Un montant affiché filtrerait la demande avant qu'on l'observe.
- **Mais le principe du paiement au résultat est annoncé dès la page**, et **le montant exact est communiqué avant la délégation** : dans la réponse sous 48 h et dans le mandat. Personne ne découvre un paiement au dernier moment.
- **Le « résultat convenu » est écrit dans le mandat** : ce qui doit être obtenu pour que le paiement soit dû (par exemple « remboursement de 180 € de frais de résiliation »). Il sert à la fois de condition de paiement et de définition du succès pour M5.
- **Le périmètre est décrit sans ambiguïté**, sans formule marketing qui contournerait la contrainte juridique : « Atlas analyse les informations que vous fournissez, prépare les démarches et exécute les actions que vous autorisez. » La page ne promet ni conseil ni avis juridique ([section 10](#10-cadre-juridique-transparence-et-limites-de-périmètre)).

---

## 3. Acquisition, budget et durée (points 2 à 5)

### Le canal influence les problèmes reçus

Une annonce sur Google achetée sur « colis non reçu » ne produit que des problèmes de colis. **Les canaux ciblés par type de problème faussent la distribution naturelle.** Chaque demande est donc étiquetée par canal, et **seuls les canaux non ciblés comptent pour mesurer la distribution naturelle (M1)**.

### Canaux (point 2) et budget maximal (point 3)

| Canal | Rôle | Ciblage | Budget max | Compte dans M1 ? |
|---|---|---|---|---|
| **C1 Réseaux sociaux payants** (Meta : Facebook, Instagram), France, 25–65 ans, visuel et texte génériques | Canal principal | **Aucun ciblage par problème** | **1 500 €** | Oui |
| **C2 Communautés en ligne** (groupes locaux, forums d'entraide, sous-forums francophones), publication générique, en respectant les règles de chaque communauté | Canal organique | Aucun | 0 € (temps : ~5 h) | Oui |
| **C3 Recherche payante** (Google Ads) sur des requêtes génériques de litige (« réclamation sans réponse », « litige entreprise que faire ») | Contrôle | Faible | **500 €** | Oui, **analysé séparément** |
| **C4 Réseau personnel** | Amorçage, rodage du processus | — | 0 € | **Non.** Exclu de toutes les métriques de décision, conservé pour le rodage |

**Plafond total d'acquisition : 2 000 €** (verrouillé). Aucun canal ne dépasse son plafond. Pas de réallocation en cours de test vers le canal qui « marche le mieux » : cela optimiserait le marketing, pas l'apprentissage.

**Plafond de capacité humaine : 120 heures** de traitement sur toute la durée (**verrouillé**). Si ce plafond est atteint, on arrête l'acquisition, sans baisser la qualité de traitement.

Ce plafond protège contre l'illusion du concierge : « ça fonctionne », alors qu'un humain passe 2 h 30 derrière chaque dossier. **Plafond par dossier : 5 heures humaines (verrouillé).** Quand le cumul des minutes d'un dossier atteint 300, le travail s'arrête ; seul le compte rendu de clôture est encore rédigé. Le dossier est classé « hors capacité » (M11), avec un compte rendu honnête à l'utilisateur et une orientation. Ce dossier :
- **reste compté** dans les demandes reçues, dans le dénominateur de M5 (comme non résolu) et dans le coût M8 ;
- voit **toutes ses minutes réelles** enregistrées, compte rendu compris. Elles ne sont **jamais tronquées à 5 h**.

Sans cette règle, on aurait : dossier difficile → arrêt à 5 h → coût artificiellement plafonné → économie apparente. Le test doit au contraire révéler les problèmes trop coûteux à traiter.

### Durée (point 4)

| Phase | Durée | Contenu |
|---|---|---|
| **P0 Préparation** | 2 semaines | Page, formulaire, mandat, mentions RGPD, journal, vérification juridique ([section 10](#10-cadre-juridique-transparence-et-limites-de-périmètre)), rodage sur dossiers fictifs, puis sur 3 à 5 dossiers du réseau personnel (C4) **après** validation juridique |
| **P1 Acquisition et traitement** | 4 semaines | Canaux C1 à C3 ouverts |
| **P2 Suivi** | 8 semaines | Plus d'acquisition. Relances, escalades, résultats, paiements, fenêtre de second problème (56 jours, voir M9) |
| **P3 Analyse et décision** | 1 semaine | Calcul des métriques, verdict selon les seuils gelés |

**Durée totale : 15 semaines.** Les dossiers encore ouverts à la fin de P2 sont **suivis jusqu'à leur terme**, par engagement envers l'utilisateur. Ils sont comptés comme « en cours » dans le verdict, jamais comme des succès.

### Nombre minimal de demandes (point 5)

| Seuil | Valeur | Rôle |
|---|---|---|
| Demandes recevables (hors C4, hors spam et doublons) | **≥ 60** | En dessous, le verdict est **« données insuffisantes »**, pas un échec du produit |
| Dossiers pris en charge avec mandat | **≥ 30** | Base de calcul des métriques de résolution, d'économie et de paiement |
| Arrêt anticipé de l'acquisition | **150 demandes** ou plafond humain atteint | Protège la qualité de traitement |

**Précision statistique :** avec 30 dossiers, l'intervalle de confiance à 95 % d'un pourcentage est d'environ ±18 points. Les seuils de la section 9 sont donc des **zones de décision**, pas des mesures précises. Un échec n'est retenu que s'il est **clair** au sens de la section 9. Une valeur proche d'une frontière donne un résultat intermédiaire, jamais un verdict définitif.

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

- **Mandat signé** : actions autorisées, organisation visée, **résultat convenu**, **modalité et montant de paiement au résultat** (format A ou B, voir [section 8](#8-test-de-paiement-réel-point-14)), durée, possibilité de révocation. Signature électronique simple.
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

**Critères de traitabilité, fixés avant le lancement.** Un dossier est traitable si et seulement si les cinq conditions sont réunies :

1. une règle, un contrat ou une obligation écrite fonde la demande, ou l'organisation a un processus de réclamation identifiable ;
2. les démarches peuvent être faites **par écrit** (e-mail, formulaire, courrier, médiateur), sans les identifiants de l'utilisateur ;
3. le résultat attendu est **vérifiable par une preuve externe** ;
4. le dossier est hors des exclusions de la [section 10](#10-cadre-juridique-transparence-et-limites-de-périmètre) ;
5. les délais légaux ne sont pas manifestement dépassés.

Un dossier non traitable reçoit une réponse motivée et, si possible, une orientation. Il reste une donnée de M1 et M2.

**Messages de qualification :** ils décrivent ce qu'Atlas peut faire (« une réclamation peut être adressée à X sur la base de Y ; nous pouvons la préparer et l'envoyer »). Ils suivent des **modèles validés juridiquement** en P0. Tant que cette validation n'est pas obtenue, aucune formulation affirmant un droit (« ces frais sont injustifiés ») n'est envoyée.

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

`utilisateur_id` · `date_premier_depot` · `second_probleme` (oui/non) · `date_second` · `second_meme_categorie` (oui/non) · `sollicite` (**toujours non pour compter dans M9**) · `format_paiement` (A/B, attribué à la qualification) · `montant_annonce` · `paiement_du` (oui si résultat convenu prouvé) · `paye` (oui/non) · `montant_paye` · `motif_non_paiement` · `verbatim` (citation libre, avec accord)

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
| **M3** | Taux de délégation | Mandats signés / demandes traitables auxquelles Atlas a proposé une prise en charge, **tarif annoncé**. Calculé aussi par format de paiement (A/B) | — |
| **M4** | Autonomie d'Atlas | Part des minutes de travail produites par Atlas (rédaction, analyse) plutôt que par l'humain ; et part des dossiers **sans aucune correction de fond** par l'humain | — |
| **M5** | **Taux de résolution prouvée** | Dossiers « résolu prouvé » ou « partiellement résolu prouvé » / dossiers pris en charge. Les dossiers en cours comptent comme **non résolus** au moment du verdict | 10 |
| **M6** | Valeur obtenue | Montant récupéré, plus montant économisé ramené à 12 mois, par dossier résolu (médiane et total). Les résultats non monétaires sont décrits et comptés à part | 11 |
| **M7** | Délai de résolution | Médiane entre le mandat et la preuve du résultat | — |
| **M8** | **Économie, en cascade** | Trois niveaux de coût, sur **tous** les dossiers avec mandat, travail humain valorisé à **35 €/h** (coût analytique, pas un prix facturé) :<br>**C0 — coût actuel** = toutes les minutes humaines réelles + coût IA + frais d'envoi ;<br>**C1 — après automatisation du mécanique** = C0 moins les minutes « mécaniques » ;<br>**C2 — après automatisation du jugement** = C1 moins les minutes « jugement ».<br>Rapportés à la **valeur produite** V (ratios r1 = C1/V et r2 = C2/V), **pas aux prix testés**. Définition exacte en [section 9.3](#93-les-trois-indicateurs-essentiels). C2 est un plafond théorique : automatiser le jugement est une hypothèse | 9 |
| **M9** | **Taux de second problème** | Utilisateurs ayant déposé un **autre** problème **sans sollicitation**, dans les **56 jours** (8 semaines) suivant leur premier dépôt / utilisateurs dont le premier dossier a été pris en charge. La fenêtre de 56 jours est la plus longue que **tous** les utilisateurs peuvent avoir, y compris ceux arrivés en fin de P1. Également calculé pour un second problème **d'une autre catégorie** | 13 |
| **M10** | Taux de paiement | Paiements encaissés / dossiers où le paiement est dû (résultat convenu prouvé). Définition exacte en [section 9.5](#95-indicateurs-lus-à-part--ils-ne-modifient-jamais-le-verdict-principal) | 14 |
| **M11** | Échecs et blocages | Nombre de dossiers bloqués, avec la cause, classée : Atlas s'est trompé / l'organisation refuse / l'utilisateur n'a pas fourni / hors capacité / droit défavorable | — |

**Interdiction de solliciter un second problème :** aucun message du type « avez-vous un autre problème ? » pendant la fenêtre de 56 jours. Le compte rendu final peut seulement rappeler, en une ligne neutre, que le service reste ouvert. Sinon, M9 mesurerait l'effet de la relance, pas le comportement.

---

## 8. Test de paiement réel (point 14)

**Principe verrouillé : le prix est présenté avant la délégation, le paiement a lieu après un résultat prouvé.**

**Attribution du format : aléatoire 1:1, décidée au moment où le dossier devient éligible** (déclaré traitable, avant l'offre). Pas d'alternance fixe, ni de blocs successifs (« dossiers 1 à 15 : 19 € »), parce que la nature des dossiers peut évoluer au fil du test.

- **Séquence générée au gel :** blocs permutés de 4 (deux A et deux B dans un ordre aléatoire par bloc), ce qui garantit l'équilibre 1:1 au fil de l'eau. La graine du générateur est consignée dans le protocole gelé, et le fichier de séquence est mis en lecture seule avec son empreinte (SHA-256) notée.
- **Consommation :** chaque nouveau dossier éligible à résultat monétaire prend la **prochaine ligne non utilisée**. L'opérateur ne voit pas les lignes suivantes, et aucune ligne n'est sautée.
- **Résultat non monétaire :** la formule A n'a pas de sens. Ces dossiers reçoivent B **hors tirage**, sont identifiés comme tels et sont exclus de toute comparaison A/B.
- **Traçabilité :** dossier → formule attribuée → montant obtenu → montant dû → montant effectivement payé.

Le format et le montant figurent dans la réponse et dans le mandat. Le but n'est pas de trouver « le bon prix », mais de mesurer si des personnes paient réellement.

| Format | Proposition | Prix (paramètres de test, **pas des prix validés**) |
|---|---|---|
| **A. Commission** | Un pourcentage de la valeur obtenue | 20 % de la valeur, minimum 10 € |
| **B. Forfait** | Un montant fixe par dossier résolu | 19 € |

**Mécanique :** quand le résultat convenu est prouvé, on envoie le compte rendu et un lien de paiement réel, avec le montant prévu au mandat. On fait **une seule relance** de paiement, à J+7. **Seul un paiement encaissé compte** dans M10. Les raisons de non-paiement sont notées (`motif_non_paiement`).

**Pas de paiement si le résultat n'est pas obtenu**, y compris quand beaucoup de travail a été fourni. Un résultat partiel donne lieu à un paiement proportionnel **seulement si le mandat le prévoyait**.

**Condition préalable :** la validation juridique de la [section 10](#10-cadre-juridique-transparence-et-limites-de-périmètre). Comme le tarif est annoncé avant la délégation, cette validation doit être obtenue **avant l'ouverture de P1**, pas seulement avant le premier encaissement. Si elle ne l'est pas à la fin de P0, **le lancement est reporté** (décision verrouillée). On ne lance pas de variante sans paiement.

**Ce que M10 peut montrer :** « les gens paient, mais seulement pour certains types de problèmes » est un résultat utile. M10 est donc aussi présenté **par catégorie** (M1) dès qu'une catégorie compte au moins 5 paiements dus.

---

## 9. Seuils et verdicts (point 15)

Cette section est la **spécification complète** des règles de verdict. Elle est gelée avec le protocole. Un exemple entièrement calculé figure en [annexe A](#annexe-a--exemple-synthétique-de-30-dossiers).

### 9.1 Règles générales, non modifiables après le gel

1. **Date de coupure :** tous les indicateurs sont calculés à la fin de la semaine S14. Un dossier encore ouvert à cette date compte comme **non résolu**.
2. **Méthode d'intervalle unique :** intervalle de score de **Wilson**, bilatéral, à **95 %**, avec z = 1,959964 et **sans correction de continuité**. Pour k succès sur n :
   - p̂ = k / n
   - centre = (p̂ + z²/2n) / (1 + z²/n)
   - demi-largeur = z × √( p̂(1−p̂)/n + z²/4n² ) / (1 + z²/n)
   - borne basse = centre − demi-largeur ; borne haute = centre + demi-largeur
3. **Aucun recalcul** avec une autre méthode, un autre niveau de confiance ou une autre définition de dénominateur, quel que soit le résultat. Les valeurs sont comparées **non arrondies**.
4. **Double calcul :** le tableur de calcul est préparé et vérifié sur l'exemple de l'annexe A **avant le gel**. Au moment de la coupure, deux personnes calculent séparément ; tout écart est résolu en revenant à la présente définition, pas par discussion.
5. **Aucun dossier n'est exclu** d'un dénominateur en dehors des exclusions écrites ci-dessous. Les dossiers « hors capacité », « abandonné » et « en cours » restent comptés.

### 9.2 Préalable : taille d'échantillon

| Condition | Seuil |
|---|---|
| Demandes recevables (canaux C1 à C3, hors spam et doublons) | ≥ 60 |
| Dossiers avec mandat signé | ≥ 30 |

Si l'une des deux conditions n'est pas remplie à la fin de P1 (budget ou durée épuisés), le verdict est **NON CONCLUANT** : la promesse ou l'acquisition ne fonctionnent pas. Aucun autre indicateur n'est interprété comme un verdict.

### 9.3 Les trois indicateurs essentiels

**Règle de classement des indicateurs en proportion (M3, M5)** : avec *F* le seuil favorable et *E* le seuil d'échec,

- **FAVORABLE** si p̂ ≥ F ;
- **DÉFAVORABLE CLAIR** si p̂ < E **et** borne haute de Wilson < E. Autrement dit, tout l'intervalle de confiance est dans la zone d'échec ;
- **INTERMÉDIAIRE (faible)** si p̂ < E mais que la borne haute atteint E ;
- **INTERMÉDIAIRE** dans tous les autres cas (E ≤ p̂ < F).

| | **M3 Délégation** | **M5 Résolution prouvée** |
|---|---|---|
| Numérateur | Mandats signés dans les **14 jours** suivant l'offre de prise en charge | Dossiers avec mandat dont le **résultat convenu** (écrit au mandat) est **entièrement** obtenu **et prouvé** à la coupure |
| Dénominateur | Dossiers déclarés traitables **et** ayant reçu une offre de prise en charge avec son tarif | **Tous** les dossiers avec mandat signé, y compris hors capacité, abandonnés et en cours |
| F (favorable) | 0,60 | 0,50 |
| E (échec) | 0,40 | 0,30 |
| Exclusions | Aucune | Aucune. Les résultats partiels sont rapportés à part (M5b) et **ne comptent pas** dans M5 |

Nombres de succès correspondant à un **défavorable clair**, calculés à l'avance :

| n (dénominateur) | 20 | 25 | 30 | 35 | 40 | 50 | 60 |
|---|---|---|---|---|---|---|---|
| M5 : défavorable clair si k ≤ | 1 | 3 | 4 | 5 | 6 | 8 | 11 |
| M3 : défavorable clair si k ≤ | 3 | 5 | 6 | 8 | 9 | 13 | 16 |

Exemple : sur 30 dossiers, 8 résolus (26,7 %) donnent un résultat **INTERMÉDIAIRE (faible)**, pas un échec. L'intervalle de confiance va de 14,2 % à 44,4 %, donc ne se situe pas entièrement sous 30 %. Il en faut 4 ou moins (13,3 %, intervalle de 5,3 % à 29,7 %) pour un **défavorable clair**.

**M8 Économie : défini indépendamment des prix testés.** Si l'on comparait le coût au revenu tiré des prix de test (19 € ou 20 %), le verdict économique dépendrait surtout de ces prix arbitraires, et non du coût réel. M8 compare donc le coût à la **valeur produite** pour l'utilisateur.

| Élément | Définition |
|---|---|
| Coût C0 | Somme, sur **tous** les dossiers avec mandat, de : minutes humaines réelles × 35 €/60 + coût IA réel + frais d'envoi. **Minutes jamais tronquées** au plafond de 5 h |
| Coût C1 | C0 moins les minutes « mécaniques » |
| Coût C2 | C1 moins les minutes « jugement » (ne restent que la relation, l'IA et les frais) |
| Valeur V | Somme, sur les dossiers **résolus au sens de M5**, de : montant récupéré + montant économisé ramené à 12 mois. Un résultat non monétaire est valorisé **forfaitairement à 19 €** |
| Ratios | r1 = C1 / V et r2 = C2 / V (sur les totaux, pas sur des médianes) |

Classement de M8. Les seuils se réfèrent aux commissions observées sur le marché de la réclamation déléguée, 20 à 35 % de la valeur :

- **FAVORABLE** si r1 ≤ 0,20. Même sans automatiser le jugement, une commission dans la fourchette du marché couvrirait le coût ;
- **DÉFAVORABLE CLAIR** si r1 > 0,50 **et** r2 > 0,35. Même en automatisant le jugement, le coût dépasserait la commission la plus haute observée ;
- **INTERMÉDIAIRE** dans tous les autres cas. Si r1 > 0,50 mais r2 ≤ 0,35, la mention est « dépend de l'automatisation du jugement ».

Si V = 0, M8 est DÉFAVORABLE CLAIR. M8 n'a pas d'intervalle de confiance : la prudence vient de la double condition.

Rapporté pour information seulement, sans effet sur le verdict : le revenu aux prix testés, divisé par C0 et par C1.

### 9.4 Verdict principal

Il est déterminé uniquement par M3, M5 et M8, dans cet ordre de règles :

1. Préalable non rempli → **NON CONCLUANT**
2. Au moins un indicateur **DÉFAVORABLE CLAIR** → **DÉFAVORABLE**, en nommant chaque indicateur concerné
3. Les trois **FAVORABLES** → **FAVORABLE**
4. Sinon → **INTERMÉDIAIRE**, en nommant chaque indicateur non favorable et sa mention (« faible », « dépend de l'automatisation du jugement »)

| Verdict | Signification | Suite |
|---|---|---|
| **FAVORABLE** | Délégation, résolution et économie potentielle suffisantes pour **passer au test suivant**. Ce n'est pas une preuve définitive | Automatiser en priorité les étapes qui consomment le plus de minutes « mécaniques », puis refaire un test sur un volume plus grand. M9 et M10 orientent ce test suivant |
| **INTERMÉDIAIRE** | Un maillon est faible ou mal mesuré | **Isoler la faiblesse** et refaire une expérience ciblée sur elle seule. Pas de développement produit avant |
| **DÉFAVORABLE** | Un maillon essentiel échoue clairement | Abandonner ou modifier **l'hypothèse qui correspond à l'échec** : M3 → promesse, confiance ou tarif ; M5 → capacité d'exécution ou périmètre ; M8 → modèle généraliste ou modèle économique |
| **NON CONCLUANT** | Pas assez de dossiers | Retravailler la proposition ou l'acquisition, pas le produit |

### 9.5 Indicateurs lus à part : ils ne modifient jamais le verdict principal

**M9 — Horizontalité (signal stratégique)**

| Élément | Définition |
|---|---|
| Dénominateur n9 | Utilisateurs ayant signé au moins un mandat |
| Numérateur k9 | Parmi eux, ceux qui ont déposé, **sans sollicitation**, un **problème distinct** (autre incident ou autre organisation) dans les **56 jours** suivant leur **premier dépôt** |
| K | Parmi ces k9, nombre dont le second problème est d'une **autre catégorie** que le premier |
| Lecture | **OBSERVÉE** si k9/n9 ≥ 0,20 **et** K ≥ 3 · **ÉMERGENTE** si non observée **et** (k9/n9 ≥ 0,10 **ou** K ≥ 3) · **NON OBSERVÉE** sinon |

L'intervalle de Wilson est publié pour information. M9 est sans effet sur le verdict principal, comme décidé.

**M10 — Paiement (économique)**

| Élément | Définition |
|---|---|
| Dénominateur | Dossiers résolus au sens de M5 dont la demande de paiement a été envoyée au moins 14 jours avant la coupure |
| Numérateur | Paiements **encaissés** dans les 14 jours suivant la demande (une seule relance, à J+7) |
| Classement | Règle des proportions avec F = 0,40 et E = 0,20 |
| Minimum | Moins de 10 paiements dus : **NON CLASSABLE** |

M10 est aussi rapporté par formule (A ou B) et par catégorie, pour les groupes d'au moins 5 paiements dus. **Aucun seuil de comparaison entre A et B** : le but est de savoir si des gens paient réellement, pas de trouver le bon prix.

**Diagnostics sans seuil de verdict :** M2 (traitabilité), M4, M6, M7, M11, la concentration par catégorie (au-delà de 60 %, l'offre horizontale fonctionne en pratique comme un vertical) et les comparateurs (vols, colis). Aucune décision n'est prise sur une catégorie de moins de 5 dossiers.

---

## 10. Cadre juridique, transparence et limites de périmètre

Points à vérifier en phase P0, idéalement avec un avocat. **Ce sont des risques identifiés, pas des avis juridiques.**

### Consultation juridique

La consultation juridique à titre habituel et rémunéré est réservée à certaines professions (loi n° 71-1130 du 31 décembre 1971, art. 54 et suivants). Demander Justice a été jugé licite parce qu'il ne fournissait **ni représentation ni consultation personnalisée** (Cass. crim., 21 mars 2017).

**Décision verrouillée : ce point est résolu avant tout paiement, et puisque le tarif est annoncé avant la délégation, avant l'ouverture de P1.** On ne le contourne pas par une formulation marketing ambiguë.

- **Périmètre déclaré pour ce test :** « Atlas analyse les informations fournies, prépare des démarches et exécute les actions autorisées. »
- **Règle de lancement :** avocat valide → acquisition démarre. **Aucune acquisition**, payante ou organique, avant la validation. Le rodage (C4) avant validation se limite à des **dossiers fictifs**.
- **Ce qu'on demande à l'avocat :** définir précisément ce qu'Atlas peut faire dans le cadre du test, pour chacune de ces six catégories d'activité, qui restent strictement distinctes :

  | Catégorie | Exemple | Question posée à l'avocat |
  |---|---|---|
  | Traitement administratif | Classer les pièces, tenir l'échéancier, envoyer un formulaire | Autorisé tel quel ? |
  | Analyse documentaire | Relever dans une facture ou un contrat les montants, les dates, les clauses | Autorisé tel quel ? |
  | Rédaction | Rédiger une réclamation ou une relance au nom de l'utilisateur | Sous quelles conditions (mandat, modèles) ? |
  | Communication avec l'organisation | Envoyer, relancer, saisir un médiateur au nom de l'utilisateur | Mentions obligatoires, étendue du mandat ? |
  | Formulation juridique | Citer un texte ou une règle dans une réclamation (« en application de l'article… ») | Autorisé ? Avec quels modèles validés ? |
  | Conseil juridique individualisé | Dire à l'utilisateur si ses chances sont bonnes, ou s'il devrait agir en justice | **Exclu du test** sauf avis contraire explicite de l'avocat. Orientation systématique |

- **À faire valider également :** la rémunération au résultat, le modèle de mandat, les conditions générales, les modèles de messages de qualification, l'inclusion des cautions de bailleurs particuliers, et la durée de conservation des données au regard de sa finalité et des modalités de suppression.
- **Tant que ces validations ne sont pas obtenues :** aucune formulation affirmant un droit n'est envoyée à un utilisateur, et aucun paiement n'est demandé ([section 8](#8-test-de-paiement-réel-point-14)).
- Un dossier qui exige un avis juridique personnalisé est **orienté** vers un avocat ou une association. Il n'est pas traité.

### Mandat et fonds

- Le mandat est écrit, limité et révocable.
- **Atlas n'encaisse jamais l'argent de l'utilisateur.** Cela évite toute question de réglementation des services de paiement.

### Données personnelles (RGPD)

- Mentions d'information exactes ; finalité : traitement du dossier et évaluation du test.
- Durée de conservation : 6 mois après clôture, **sous réserve de validation juridique** de la finalité précise et des modalités de suppression.
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
- Litiges entre particuliers, **sauf** les cautions de bailleurs particuliers, incluses **uniquement dans le périmètre validé par l'avocat**. Si celui-ci ne les valide pas, le mot « caution » est retiré des exemples de la page avant le lancement.

### Arrêt d'un dossier

Menace de poursuites contre l'utilisateur, demande qui excède le mandat, ou risque d'aggraver la situation de l'utilisateur : on arrête, on l'explique à l'utilisateur et on l'oriente.

---

## 11. Calendrier

| Semaine | Phase | Livrables |
|---|---|---|
| S1–S2 | P0 | Page, formulaire, modèle de mandat, mentions RGPD, classeur de journal, critères de traitabilité, **validation juridique (condition de lancement)**, test synthétique des règles de verdict (annexe A), rodage sur dossiers fictifs, puis 3 à 5 dossiers réels du réseau personnel (C4) **après** validation juridique. **Gel formel** |
| S3–S6 | P1 | Acquisition C1 à C3 ; qualification sous 48 h ; traitement |
| S7–S14 | P2 | Suivi, relances, escalades, résultats, paiements dus, fin de la fenêtre de 56 jours pour les derniers dépôts |
| S15 | P3 | Calcul des métriques, tableau M1, verdict, rapport |

Point d'étape hebdomadaire pendant P1 et P2 : on vérifie les plafonds, on classe les blocages, et **on ne modifie aucun seuil**.

---

## 12. Décisions

### Verrouillées

| # | Décision |
|---|---|
| 1 | L'offre horizontale « Règle ça pour moi » est l'hypothèse principale. Les vols et les colis sont des comparateurs, pas des produits distincts |
| 2 | **Aucun nouveau développement** avant la fin du test. L'application Atlas actuelle sert d'outil interne, sans modification |
| 3 | Pas de prix sur la page. Principe du paiement au résultat annoncé sur la page ; montant présenté avant la délégation ; paiement après résultat prouvé |
| 4 | **Budget d'acquisition : 2 000 € maximum** (1 500 € réseaux sociaux, 500 € recherche payante) |
| 5 | **Travail humain valorisé à 35 €/h**, comme coût analytique, pas comme prix facturé |
| 6 | **120 h humaines au total ; 5 h par dossier**, avec comptabilisation des minutes réelles au-delà, et maintien dans les dénominateurs |
| 7 | **Prix testés : 20 % de la valeur (minimum 10 €) ou 19 €**, attribués **au hasard 1:1** par une séquence scellée au gel |
| 8 | **Validation juridique bloquante :** aucune acquisition avant la validation. En cas de retard, **report du lancement** |
| 9 | **Cautions de bailleurs particuliers incluses**, sous réserve de validation juridique |
| 10 | **Conservation 6 mois**, sous réserve de validation juridique de la finalité et de la suppression |
| 11 | **60 demandes recevables et 30 mandats minimum** ; sinon, non concluant |
| 12 | Règles de verdict de la section 9, **y compris la méthode statistique**, gelées. Aucun recalcul avec une autre méthode |
| 13 | **Second problème (M9) :** seuils fixés (section 9.5), lu à part, **sans effet sur le verdict principal** |
| 14 | Ne pas faire fonctionner Atlas artificiellement : éligibilité décidée avant tout traitement, décision appliquée systématiquement, aucun traitement spécial, toutes les issues enregistrées |

### Étapes avant le premier euro dépensé

1. **Validation juridique** (section 10), puis ajustements qui en découlent (page, mandat, modèles).
2. **Test synthétique des règles de verdict :** reproduire à l'identique, dans le tableur réel, tous les résultats de l'annexe A (dont les variantes A.5), par deux personnes séparément.
3. **Gel :** génération et scellement de la séquence aléatoire des prix, empreinte des fichiers, date de gel inscrite en tête de ce document.
4. Rodage sur des dossiers fictifs, puis ouverture de P1.

Après le gel, toute modification est consignée avec sa date et sa raison dans le rapport final. **Elle ne peut pas porter sur les règles de la section 9.**

---

## Annexe A — Exemple synthétique de 30 dossiers

**Données entièrement fictives**, construites pour tester les règles de la section 9. Elles ne constituent pas une prévision. Le même tableur servira au calcul réel.

### A.1 Entonnoir

| Étape | Nombre |
|---|---|
| Demandes recevables (C1 à C3) | 64 |
| Dossiers traitables, ayant tous reçu une offre avec tarif | 41 |
| Mandats signés sous 14 jours | 30 |

Préalable : 64 ≥ 60 et 30 ≥ 30, **rempli**.

### A.2 Les 30 dossiers avec mandat

Coûts : minutes × 35 €/60, plus IA, plus frais. C0 = tout ; C1 = sans le mécanique ; C2 = sans le mécanique ni le jugement. Formule A = 20 % de la valeur (minimum 10 €) ; B = 19 €.

| # | Catégorie | Formule | Minutes méca / jugement / relation | Statut à la coupure | Valeur retenue pour M8 (€) | Montant dû (€) | Payé | C0 (€) | C1 (€) | C2 (€) | Second problème (catégorie) |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Colis | A | 25 / 20 / 15 | résolu | 45 | 10,00 | oui | 35,60 | 21,02 | 9,35 | — |
| 2 | Télécom | B | 40 / 45 / 25 | résolu | 180 | 19,00 | oui | 65,27 | 41,93 | 15,68 | — |
| 3 | Énergie | A | 70 / 90 / 40 | en cours | 0 | — | — | 123,97 | 83,13 | 30,63 | — |
| 4 | Abonnement | B — non monétaire, hors tirage | 20 / 15 / 10 | résolu | 19 | 19,00 | non | 26,65 | 14,98 | 6,23 | Banque |
| 5 | Caution | B | 55 / 70 / 35 | résolu | 850 | 19,00 | oui | 100,03 | 67,95 | 27,12 | — |
| 6 | Colis | A | 20 / 15 / 10 | non résolu | 0 | — | — | 26,75 | 15,08 | 6,33 | — |
| 7 | Banque | A | 30 / 40 / 20 | résolu | 96 | 19,20 | non | 53,40 | 35,90 | 12,57 | — |
| 8 | Voyage | B | 45 / 50 / 25 | en cours | 0 | — | — | 71,50 | 45,25 | 16,08 | Colis |
| 9 | Colis | B | 15 / 10 / 10 | résolu | 35 | 19,00 | non | 20,82 | 12,07 | 6,23 | — |
| 10 | Télécom | A | 90 / 170 / 60 (total 320) | hors capacité | 0 | — | — | 194,17 | 141,67 | 42,50 | — |
| 11 | Autre | B | 35 / 60 / 30 | non résolu | 0 | — | — | 74,22 | 53,80 | 18,80 | — |
| 12 | Abonnement | A | 20 / 20 / 15 | résolu | 120 | 24,00 | oui | 32,58 | 20,92 | 9,25 | Télécom |
| 13 | Caution | A | 60 / 95 / 40 | en cours | 0 | — | — | 120,85 | 85,85 | 30,43 | — |
| 14 | Colis | B | 25 / 20 / 15 | résolu | 80 | 19,00 | oui | 35,60 | 21,02 | 9,35 | — |
| 15 | Banque | B | 25 / 30 / 15 | non résolu | 0 | — | — | 41,53 | 26,95 | 9,45 | — |
| 16 | Énergie | B | 65 / 80 / 35 | abandonné | 0 | — | — | 107,10 | 69,18 | 22,52 | — |
| 17 | Colis | A | 15 / 10 / 5 | résolu | 25 | 10,00 | oui | 17,80 | 9,05 | 3,22 | — |
| 18 | Télécom | B | 35 / 45 / 20 | non résolu | 0 | — | — | 59,33 | 38,92 | 12,67 | Colis |
| 19 | Voyage | A | 50 / 55 / 25 | résolu | 600 | 120,00 | non | 77,43 | 48,27 | 16,18 | — |
| 20 | Autre | B — non monétaire, hors tirage | 100 / 160 / 60 (total 320) | hors capacité | 0 | — | — | 188,97 | 130,63 | 37,30 | — |
| 21 | Colis | A | 20 / 15 / 10 | non résolu | 0 | — | — | 26,75 | 15,08 | 6,33 | — |
| 22 | Abonnement | B | 15 / 10 / 10 | résolu | 45 | 19,00 | oui | 20,82 | 12,07 | 6,23 | — |
| 23 | Banque | A | 30 / 35 / 20 | en cours | 0 | — | — | 50,38 | 32,88 | 12,47 | — |
| 24 | Colis | B | 20 / 20 / 10 | non résolu | 0 | — | — | 29,67 | 18,00 | 6,33 | — |
| 25 | Caution | B | 50 / 65 / 35 | non résolu | 0 | — | — | 94,10 | 64,93 | 27,02 | — |
| 26 | Télécom | A | 30 / 30 / 15 | résolu | 90 | 18,00 | non | 44,55 | 27,05 | 9,55 | — |
| 27 | Colis | A | 15 / 15 / 10 | non résolu | 0 | — | — | 23,73 | 14,98 | 6,23 | — |
| 28 | Autre | A | 40 / 60 / 30 | non résolu | 0 | — | — | 77,23 | 53,90 | 18,90 | Énergie |
| 29 | Abonnement | B — non monétaire, hors tirage | 15 / 10 / 10 | non résolu | 0 | — | — | 20,72 | 11,97 | 6,13 | — |
| 30 | Colis | B | 20 / 15 / 10 | non résolu | 0 | — | — | 26,75 | 15,08 | 6,33 | — |

Les dossiers 10 et 20 ont dépassé le plafond de 5 h (300 minutes). Ils ont été clos « hors capacité » à 320 minutes, compte rendu de clôture compris. **Les 320 minutes réelles** entrent dans le coût, et les deux dossiers restent dans le dénominateur de M5.

### A.3 Calculs

| Indicateur | Calcul | Intervalle de Wilson à 95 % | Classement |
|---|---|---|---|
| **M3** | 30 / 41 = 73,2 % | 58,1 % – 84,3 % | 73,2 % ≥ 60 % → **FAVORABLE** |
| **M5** | 12 / 30 = 40,0 % | 24,6 % – 57,7 % | 30 % ≤ 40 % < 50 % → **INTERMÉDIAIRE** |
| **M8** | C0 = 1 888,27 € · C1 = 1 249,52 € · C2 = 447,43 € · V = 2 185 € (11 résultats monétaires = 2 166 €, plus 1 non monétaire à 19 €) · r1 = 57,2 % · r2 = 20,5 % | — | r1 > 50 % mais r2 ≤ 35 % → **INTERMÉDIAIRE, dépend de l'automatisation du jugement** |
| M9 | k9 = 5 (dossiers 4, 8, 12, 18, 28) sur n9 = 30 → 16,7 % ; K = 5 (autre catégorie à chaque fois) | 7,3 % – 33,6 % | Pas « observée » (16,7 % < 20 %) ; 16,7 % ≥ 10 % → **ÉMERGENTE** |
| M10 | 12 paiements dus, 7 encaissés → 58,3 % | 32,0 % – 80,7 % | ≥ 10 dus ; 58,3 % ≥ 40 % → **FAVORABLE** |
| M10 par formule | A : 3 / 6 (50 %) · B monétaire : 4 / 5 (80 %) · B non monétaire : 0 / 1 | — | Rapporté pour A et B monétaire (≥ 5 paiements dus). **Aucune comparaison A/B n'est tirée** |
| Information | Revenu aux prix testés : 315,20 € = 16,7 % de C0 et 25,2 % de C1 | — | Sans effet sur le verdict |

### A.4 Verdict

Application de 9.4 : préalable rempli → aucun indicateur défavorable clair → les trois ne sont pas favorables →

> **INTERMÉDIAIRE**. Indicateurs non favorables : **M5** (résolution de 40 %) et **M8** (dépend de l'automatisation du jugement).
> Lecture à part : horizontalité **ÉMERGENTE** ; paiement **FAVORABLE**.
>
> **Suite imposée :** aucune construction du produit. Une expérience ciblée sur la résolution (par exemple, sur quelles catégories M5 est-il bas ?) et sur le temps de jugement (quelle part peut être outillée ?). Le revenu aux prix testés ne couvre que 17 % du coût actuel : il faudra en tenir compte pour les prix du test suivant.

### A.5 Variantes : ce qui change le verdict, et ce qui ne le change pas

Toutes choses égales par ailleurs :

| Variante | Calcul | Classement de l'indicateur | Verdict principal |
|---|---|---|---|
| 4 résolus sur 30 | 13,3 % ; intervalle 5,3 % – 29,7 %, entièrement < 30 % | M5 **DÉFAVORABLE CLAIR** | **DÉFAVORABLE** (M5) |
| 8 résolus sur 30 | 26,7 % ; intervalle 14,2 % – 44,4 %, qui atteint 30 % | M5 **INTERMÉDIAIRE (faible)** | **INTERMÉDIAIRE** |
| 16 résolus sur 30 | 53,3 % ≥ 50 % | M5 **FAVORABLE** | **INTERMÉDIAIRE** (M8 reste non favorable) |
| 16 résolus, et r1 = 18 % | — | M5 et M8 **FAVORABLES** | **FAVORABLE** |
| r1 = 57 % et r2 = 40 % | Double condition remplie | M8 **DÉFAVORABLE CLAIR** | **DÉFAVORABLE** (M8) |
| Aucun second problème (k9 = 0) | 0 % | M9 **NON OBSERVÉE** | **Inchangé** : M9 ne modifie jamais le verdict principal |
| 55 demandes recevables | 55 < 60 | — | **NON CONCLUANT** |
