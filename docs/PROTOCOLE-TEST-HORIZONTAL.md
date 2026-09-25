# Protocole expérimental — « Règle ça pour moi » (offre horizontale)

> Date : 25 septembre 2026. Fait suite à [`EVALUATION-WEDGE-VOLS.md`](EVALUATION-WEDGE-VOLS.md).
> Statut : **décisions de principe verrouillées** ([section 12](#12-décisions)). Rien n'est développé. Les paramètres chiffrés encore marqués ⚙ sont des propositions non contestées, à confirmer au moment du gel. **Tout est gelé avant la première demande.**

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
| **H4 Économie** | Le coût de résolution peut, après automatisation du travail mécanique, passer sous le revenu par dossier | Écart coût/revenu (M8) |
| **H5 Horizontalité** (signal stratégique) | Les utilisateurs reviennent avec un autre problème, sans qu'on les relance | Taux de second problème (M9) |
| **H6 Paiement** | Les utilisateurs paient réellement après un résultat | Taux de paiement (M10) |

**H1, H3 et H4 sont les preuves principales de viabilité du service.** H5 indique si l'usage commence à devenir horizontal. C'est le meilleur signal de la vision généraliste, mais son absence sur un premier échantillon ne suffit pas à l'invalider (trop peu de recul, trop peu de dossiers résolus). Il est donc lu à part ([section 9](#9-seuils-et-verdicts-point-15)). H6 est lue comme un indicateur économique, sous réserve de la validation juridique.

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

| Canal | Rôle | Ciblage | Budget max ⚙ | Compte dans M1 ? |
|---|---|---|---|---|
| **C1 Réseaux sociaux payants** (Meta : Facebook, Instagram), France, 25–65 ans, visuel et texte génériques | Canal principal | **Aucun ciblage par problème** | **1 500 €** | Oui |
| **C2 Communautés en ligne** (groupes locaux, forums d'entraide, sous-forums francophones), publication générique, en respectant les règles de chaque communauté | Canal organique | Aucun | 0 € (temps : ~5 h) | Oui |
| **C3 Recherche payante** (Google Ads) sur des requêtes génériques de litige (« réclamation sans réponse », « litige entreprise que faire ») | Contrôle | Faible | **500 €** | Oui, **analysé séparément** |
| **C4 Réseau personnel** | Amorçage, rodage du processus | — | 0 € | **Non.** Exclu de toutes les métriques de décision, conservé pour le rodage |

**Plafond total d'acquisition : 2 000 €** ⚙. Aucun canal ne dépasse son plafond. Pas de réallocation en cours de test vers le canal qui « marche le mieux » : cela optimiserait le marketing, pas l'apprentissage.

**Plafond de capacité humaine : 120 heures** de traitement sur toute la durée (**verrouillé**). Si ce plafond est atteint, on arrête l'acquisition, sans baisser la qualité de traitement.

Ce plafond protège contre l'illusion du concierge : « ça fonctionne », alors qu'un humain passe 2 h 30 derrière chaque dossier. **Plafond par dossier ⚙ : 5 heures humaines.** Au-delà, le dossier est clos « hors capacité » (M11), avec un compte rendu honnête à l'utilisateur et une orientation.

### Durée (point 4)

| Phase | Durée | Contenu |
|---|---|---|
| **P0 Préparation** | 2 semaines | Page, formulaire, mandat, mentions RGPD, journal, vérification juridique ([section 10](#10-cadre-juridique-transparence-et-limites-de-périmètre)), rodage sur 3 à 5 dossiers du réseau personnel (C4) |
| **P1 Acquisition et traitement** | 4 semaines | Canaux C1 à C3 ouverts |
| **P2 Suivi** | 8 semaines | Plus d'acquisition. Relances, escalades, résultats, paiements, fenêtre de second problème (56 jours, voir M9) |
| **P3 Analyse et décision** | 1 semaine | Calcul des métriques, verdict selon les seuils gelés |

**Durée totale : 15 semaines.** Les dossiers encore ouverts à la fin de P2 sont **suivis jusqu'à leur terme**, par engagement envers l'utilisateur. Ils sont comptés comme « en cours » dans le verdict, jamais comme des succès.

### Nombre minimal de demandes (point 5)

| Seuil | Valeur ⚙ | Rôle |
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
| **M8** | **Coût par dossier, en cascade** | Trois niveaux, par dossier pris en charge (médiane), avec le travail humain valorisé à ⚙ **35 €/h** :<br>**C0 — coût actuel** = toutes les minutes humaines + coût IA + frais d'envoi ;<br>**C1 — après automatisation du mécanique** = C0 moins les minutes « mécaniques » ;<br>**C2 — après automatisation du jugement** = C1 moins les minutes « jugement » (ne restent que la relation, l'IA et les frais).<br>C1 est jugé atteignable à court terme. C2 est un **plafond théorique** : automatiser le jugement est une hypothèse, pas un acquis | 9 |
| **M9** | **Taux de second problème** | Utilisateurs ayant déposé un **autre** problème **sans sollicitation**, dans les **56 jours** (8 semaines) suivant leur premier dépôt / utilisateurs dont le premier dossier a été pris en charge. La fenêtre de 56 jours est la plus longue que **tous** les utilisateurs peuvent avoir, y compris ceux arrivés en fin de P1. Également calculé pour un second problème **d'une autre catégorie** | 13 |
| **M10** | Taux de paiement | Paiements encaissés / dossiers où le paiement est dû (résultat convenu prouvé), par format. Voir [section 8](#8-test-de-paiement-réel-point-14) | 14 |
| **M11** | Échecs et blocages | Nombre de dossiers bloqués, avec la cause, classée : Atlas s'est trompé / l'organisation refuse / l'utilisateur n'a pas fourni / hors capacité / droit défavorable | — |

**Interdiction de solliciter un second problème :** aucun message du type « avez-vous un autre problème ? » pendant la fenêtre de 56 jours. Le compte rendu final peut seulement rappeler, en une ligne neutre, que le service reste ouvert. Sinon, M9 mesurerait l'effet de la relance, pas le comportement.

---

## 8. Test de paiement réel (point 14)

**Principe verrouillé : le prix est présenté avant la délégation, le paiement a lieu après un résultat prouvé.**

**Attribution du format :** à la qualification, **avant** la réponse sous 48 h, en alternance selon l'ordre d'arrivée des dossiers traitables (1er : A, 2e : B, 3e : A…). Le format et le montant figurent dans la réponse et dans le mandat.

| Format | Proposition | Prix ⚙ (paramètres de test, **pas des prix validés**) |
|---|---|---|
| **A. Commission** | Un pourcentage de la valeur obtenue | 20 % de la valeur, minimum 10 € |
| **B. Forfait** | Un montant fixe par dossier résolu | 19 € |

Pour un résultat non monétaire (résiliation obtenue, service rétabli), seul le format B s'applique. Les dossiers concernés sont donc attribués au format B hors alternance, et comptés à part.

**Mécanique :** quand le résultat convenu est prouvé, on envoie le compte rendu et un lien de paiement réel, avec le montant prévu au mandat. On fait **une seule relance** de paiement, à J+7. **Seul un paiement encaissé compte** dans M10. Les raisons de non-paiement sont notées (`motif_non_paiement`).

**Pas de paiement si le résultat n'est pas obtenu**, y compris quand beaucoup de travail a été fourni. Un résultat partiel donne lieu à un paiement proportionnel **seulement si le mandat le prévoyait**.

**Condition préalable :** la validation juridique de la [section 10](#10-cadre-juridique-transparence-et-limites-de-périmètre). Comme le tarif est annoncé avant la délégation, cette validation doit être obtenue **avant l'ouverture de P1**, pas seulement avant le premier encaissement. Si elle ne l'est pas à la fin de P0, deux options ⚙ :
- **reporter** le lancement ;
- **lancer sans paiement**, avec la page modifiée en conséquence. M10 est alors déclaré **non mesuré**, et M3 mesure une délégation gratuite. Cet écart est noté dans le rapport.

**Ce que M10 peut montrer :** « les gens paient, mais seulement pour certains types de problèmes » est un résultat utile. M10 est donc aussi présenté **par catégorie** (M1) dès qu'une catégorie compte au moins 5 paiements dus.

---

## 9. Seuils et verdicts (point 15)

**Tous les seuils ci-dessous sont gelés avant le lancement.** Ils ne sont plus modifiés après la première demande. Les valeurs sont des propositions ⚙ fondées sur un jugement, pas sur un historique : il n'existe aucune référence publique pour ce type de service.

**Précaution d'interprétation.** Avec environ 30 dossiers, un pourcentage mesuré est incertain d'environ ±18 points. Un seuil n'est donc **jamais une lame de couteau** : « 28 % au lieu de 30 % » ne décide rien. Aucun résultat de ce test n'est présenté comme une certitude statistique. Il indique **quelle expérience faire ensuite**.

### Préalable : l'échantillon est-il suffisant ?

Si le test compte moins de 60 demandes recevables **ou** moins de 30 dossiers pris en charge après épuisement du budget et de la durée, le verdict est :

> **« Non concluant — la promesse ou l'acquisition ne fonctionne pas. »**

Ce n'est pas une invalidation du comportement « Règle ça pour moi ». Cela signifie que la promesse ou le canal n'attirent pas assez de dossiers. On retravaille la proposition, pas le produit, avant tout nouveau test.

### Trois zones par indicateur

| Indicateur | 🟢 Favorable | 🟡 Intermédiaire | 🔴 Défavorable **clair** (voir la règle ci-dessous) | Rôle |
|---|---|---|---|---|
| **M3 Délégation** | ≥ 60 % | ni favorable, ni défavorable clair | < 40 % **et** borne haute de l'intervalle de confiance < 60 % | **Essentiel** |
| **M5 Résolution prouvée** | ≥ 50 % | idem | < 30 % **et** borne haute de l'intervalle < 50 % | **Essentiel** |
| **M8 Économie** (médiane, comparée au revenu médian par dossier résolu) | C1 ≤ revenu | idem | C1 > 2 × revenu **et** C2 > revenu | **Essentiel** |
| M2 Traitabilité | ≥ 50 % | 30 à 49 % | < 30 % | Diagnostic |
| M10 Paiement | ≥ 40 % | 20 à 39 % | < 20 % | Économique, lu à part |
| M9 Second problème | voir [lecture de l'horizontalité](#lecture-de-lhorizontalité-m9) | | | **Signal stratégique**, lu à part |

**Définition d'un résultat « défavorable clair ».** Il faut **à la fois** que la valeur mesurée soit dans la zone d'échec **et** que la borne haute de son intervalle de confiance à 95 % (méthode de Wilson) reste **sous le seuil favorable**. Autrement dit, même dans l'hypothèse la plus optimiste compatible avec les données, l'indicateur n'atteindrait pas la zone favorable. Une valeur dans la zone d'échec qui ne remplit pas cette condition est classée **intermédiaire**, avec la mention « faible ».

Nombres de dossiers correspondants, calculés à l'avance pour éviter tout débat après coup :

| Nombre de dossiers au dénominateur | M5 défavorable clair si ≤ … résolus | M3 défavorable clair si ≤ … mandats |
|---|---|---|
| 20 | 1 | 3 |
| 25 | 3 | 5 |
| 30 | 4 | 6 |
| 40 | 6 | 9 |
| 50 | 8 | 13 |
| 60 | 11 | 16 |

Pour M8, « clair » signifie que **même en automatisant le jugement** (C2), le coût dépasserait le revenu. Si C1 > 2 × revenu mais C2 ≤ revenu, le résultat est **intermédiaire** : la viabilité dépend alors de l'automatisation du jugement, qui devient l'hypothèse à tester.

### Les trois résultats possibles

**🟢 Résultat favorable.** M3, M5 et M8 sont tous trois en zone favorable.

> Sens : des particuliers délèguent réellement des problèmes à Atlas, tarif connu ; Atlas obtient des résultats prouvés ; l'économie devient tenable une fois le travail mécanique automatisé. C'est **un signal suffisant pour passer au test suivant**, pas une preuve définitive.
>
> Suite : automatiser **en priorité les étapes qui consomment le plus de minutes « mécaniques »** d'après le journal, puis refaire un test sur un volume plus grand. La lecture de M9 et M10 oriente ce test suivant : périmètre horizontal ou non, modèle de prix.

**🟡 Résultat intermédiaire.** Aucun indicateur essentiel n'est défavorable clair, mais au moins un n'est pas favorable.

> Sens : le comportement existe peut-être, mais un maillon est faible ou mal mesuré.
>
> Suite : **isoler la faiblesse** et refaire une expérience ciblée sur elle seule. Par exemple : restreindre le périmètre aux catégories les plus traitables si M5 est faible, tester une autre présentation de la prise en charge si M3 est faible, mesurer séparément le temps de jugement si M8 est faible. **Pas de développement produit avant.**

**🔴 Résultat défavorable.** Au moins un indicateur essentiel est défavorable clair.

> On abandonne ou on modifie **l'hypothèse qui correspond précisément à cet échec**, pas l'ensemble du projet par défaut :
>
> | Échec clair | Signification | Suite |
> |---|---|---|
> | M3 (délégation) | Les gens décrivent leurs problèmes mais ne délèguent pas, tarif connu | Revoir la promesse, la confiance ou le tarif. **« Règle ça pour moi » n'est pas adopté sous cette forme** |
> | M5 (résolution) | Atlas ne sait pas obtenir les résultats, même supervisé | Restreindre aux catégories où la résolution fonctionne (M1), ou revoir la capacité d'exécution |
> | M8 (économie) | Même en automatisant le jugement, le coût dépasse le revenu | Un service généraliste n'est pas tenable en l'état. Se replier sur les catégories les moins coûteuses (M1), ou revoir le modèle de prix |

### Lecture de l'horizontalité (M9)

M9 ne déclenche **jamais** à lui seul un résultat défavorable. Son absence sur un premier échantillon peut s'expliquer par le manque de recul ou le petit nombre de dossiers résolus. Il répond à une autre question : **l'usage commence-t-il à devenir horizontal ?**

| Lecture | Condition ⚙ | Conséquence |
|---|---|---|
| **Horizontalité observée** | M9 ≥ 20 %, **dont** au moins 3 seconds problèmes d'une autre catégorie | On peut commencer à dire « Atlas = l'endroit où je dépose mes problèmes ». Le test suivant reste horizontal |
| **Horizontalité émergente** | M9 entre 10 et 19 %, **ou** au moins 3 seconds problèmes d'une autre catégorie | Signal encourageant, non démontré. Le test suivant prévoit une fenêtre d'observation plus longue |
| **Horizontalité non observée** | M9 < 10 % et moins de 3 seconds problèmes d'une autre catégorie | **On ne peut pas affirmer** que l'usage est horizontal. Ce n'est pas une invalidation du service. Le test suivant doit tester l'horizontalité explicitement (fenêtre plus longue, cohorte suivie) avant que la vision généraliste serve d'argument |

### Règle complémentaire : la concentration

Si une catégorie représente **plus de 60 %** des dossiers traitables, l'offre horizontale fonctionne **en pratique comme un vertical**. Le résultat reste valable, mais la suite doit en tenir compte : entrer par cette catégorie **sans** la présenter comme l'identité d'Atlas, et regarder de près les seconds problèmes d'une autre catégorie.

### Comparateurs (vols, colis)

Pour chaque catégorie comparatrice ayant au moins 5 dossiers pris en charge, on présente M5, M8, M9 et M10 à côté de la moyenne horizontale. **Aucune décision n'est prise sur une catégorie de moins de 5 dossiers.**

---

## 10. Cadre juridique, transparence et limites de périmètre

Points à vérifier en phase P0, idéalement avec un avocat. **Ce sont des risques identifiés, pas des avis juridiques.**

### Consultation juridique

La consultation juridique à titre habituel et rémunéré est réservée à certaines professions (loi n° 71-1130 du 31 décembre 1971, art. 54 et suivants). Demander Justice a été jugé licite parce qu'il ne fournissait **ni représentation ni consultation personnalisée** (Cass. crim., 21 mars 2017).

**Décision verrouillée : ce point est résolu avant tout paiement, et puisque le tarif est annoncé avant la délégation, avant l'ouverture de P1.** On ne le contourne pas par une formulation marketing ambiguë.

- **Périmètre déclaré pour ce test :** « Atlas analyse les informations fournies, prépare des démarches et exécute les actions autorisées. »
- **À faire valider par un avocat en P0 :**
  - ce périmètre et sa rémunération au résultat ;
  - les modèles de messages de qualification, là où une analyse juridique individualisée intervient ;
  - le modèle de mandat ;
  - les conditions générales.
- **Tant que ces validations ne sont pas obtenues :** aucune formulation affirmant un droit n'est envoyée à un utilisateur, et aucun paiement n'est demandé ([section 8](#8-test-de-paiement-réel-point-14)).
- Un dossier qui exige un avis juridique personnalisé est **orienté** vers un avocat ou une association. Il n'est pas traité.

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
| S1–S2 | P0 | Page, formulaire, modèle de mandat, mentions RGPD, classeur de journal, critères de traitabilité, **validation juridique (condition de lancement)**, 3 à 5 dossiers de rodage (C4). **Gel des paramètres ⚙ et des seuils** |
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
| 3 | Pas de prix sur la page. **Principe du paiement au résultat annoncé sur la page ; montant présenté avant la délégation ; paiement après résultat prouvé** |
| 4 | **120 heures humaines maximum** au total. Journal obligatoire, avec la répartition mécanique, jugement et relation. Coût présenté en cascade (C0, C1, C2) |
| 5 | **60 demandes recevables et 30 dossiers pris en charge minimum** pour un premier signal |
| 6 | Aucun résultat présenté comme une certitude statistique. Trois résultats possibles (favorable, intermédiaire, défavorable), avec la règle du « défavorable clair » |
| 7 | Indicateurs essentiels : délégation (M3), résolution prouvée (M5), économie (M8). **Le second problème (M9) est un signal stratégique de l'horizontalité**, jamais une condition d'invalidation à lui seul |
| 8 | **Validation juridique** du périmètre, des formulations et du mandat **avant l'ouverture de P1** et avant tout paiement |
| 9 | Ne pas faire fonctionner Atlas artificiellement : critères de traitabilité fixés à l'avance, plafond par dossier, aucune sollicitation, tous les échecs conservés comme données |

### Paramètres proposés, à confirmer au moment du gel

| # | Paramètre | Proposition ⚙ |
|---|---|---|
| a | Budget d'acquisition total et répartition | 2 000 € : 1 500 € réseaux sociaux, 500 € recherche payante |
| b | Taux horaire pour valoriser le travail humain | 35 €/h |
| c | Plafond par dossier | 5 h humaines |
| d | Prix testés | 20 % de la valeur (minimum 10 €) ou 19 € par dossier |
| e | Si la validation juridique n'est pas obtenue en P0 | Reporter le lancement plutôt que lancer sans paiement |
| f | Cautions : inclure les bailleurs particuliers ? | Oui, avec prudence (mise en demeure et commission de conciliation uniquement) |
| g | Durée de conservation des données | 6 mois après clôture |
| h | Seuils de lecture de M9 | ≥ 20 % pour « observée », 10 à 19 % pour « émergente », avec au moins 3 seconds problèmes d'une autre catégorie |

Une fois ces paramètres confirmés, le protocole est **gelé**. Toute modification ultérieure est consignée, avec sa date et sa raison, dans le rapport final.
