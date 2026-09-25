# Atlas — « Règle ça pour moi » : quel premier problème prendre entièrement en charge ?

> Recherche de *wedge* menée à partir de la vision originelle d'Atlas (agent d'exécution autonome pour particuliers).
> Date : 25 septembre 2026. Périmètre principal : France / Union européenne, avec des repères américains quand ils éclairent le marché.

---

## Sommaire

0. [Réponse courte](#0-réponse-courte)
1. [Méthode, conventions et limites de cette recherche](#1-méthode-conventions-et-limites)
2. [Vision et wedge : les critères de choix](#2-vision-et-wedge--les-critères-de-choix)
3. [Fiches problèmes documentées](#3-fiches-problèmes-documentées)
4. [Ce que font réellement les solutions existantes](#4-ce-que-font-réellement-les-solutions-existantes)
5. [Contraintes juridiques et de sécurité communes](#5-contraintes-juridiques-et-de-sécurité-communes)
6. [Comparaison des problèmes](#6-comparaison-des-problèmes)
7. [Recommandation de wedge](#7-recommandation-de-wedge)
8. [Protocole de test MVP](#8-protocole-de-test-mvp)
9. [Écart avec le code actuel d'Atlas](#9-écart-avec-le-code-actuel-datlas)
10. [Informations manquantes prioritaires](#10-informations-manquantes-prioritaires)
11. [Sources](#11-sources)

---

## 0. Réponse courte

**Question posée :** existe-t-il un problème que les gens seraient heureux de ne plus résoudre eux-mêmes, et qu'Atlas peut raisonnablement prendre **entièrement** en charge ?

**Réponse (INTERPRÉTATION) : oui, une famille de problèmes coche toutes les cases :**

> **« Une entreprise me doit de l'argent après un incident, j'y ai droit, mais je ne vais pas me battre pour l'obtenir. »**

Ce sont les incidents de consommation où **le droit est écrit**, où **le canal de réclamation est écrit** (formulaire web, e-mail, courrier, médiateur en ligne) et où **le résultat est vérifiable de l'extérieur** : l'argent arrive, ou pas.

Premier cas à tester : **la perturbation aérienne (vol annulé ou retardé)**, traitée de bout en bout. Ce n'est pas parce que c'est l'exemple fondateur d'Atlas. C'est le cas où les traces publiques sont les plus nettes :

| Critère | Ce que disent les données |
|---|---|
| Le droit est clair | 250 / 400 / 600 € selon la distance, dès 3 h de retard, confirmé par la réforme adoptée en juillet 2026 (FAIT) |
| Les gens ne vont pas au bout seuls | Seuls 55 % des passagers éligibles réclament. Les compagnies rejettent 58 % des demandes jugées éligibles par AirHelp et 31 % restent sans réponse (SOURCE : AirHelp, donc partiale) |
| Les gens délèguent déjà et paient pour ça | Commissions de 27 % + TVA (Flightright) à 35 % TTC (AirHelp), jusqu'à 50 % en cas de procédure (FAIT : tarifs publics) |
| Le résultat est vérifiable | Un virement arrive sur le compte de l'utilisateur, ou il n'arrive pas |
| Tout passe par écrit | Formulaire de la compagnie, puis médiateur, puis juge. Aucun appel téléphonique n'est indispensable |

**Deux réserves importantes :**

1. **Ce marché est concurrentiel.** Atlas ne gagnera pas en étant « un AirHelp de plus ». La différence possible est de traiter **tout l'incident** : rebooking, remboursement du billet, frais d'hôtel et de repas, indemnité, bagage, suivi jusqu'au virement. Puis de réutiliser la même mécanique sur d'autres incidents : colis, énergie, caution, abonnement. C'est cette **capacité transversale** qui mène vers la vision. Le cas aérien n'est que la porte d'entrée.
2. **Le téléphone n'est pas nécessaire pour ce wedge.** C'est une conclusion forte de cette recherche (INTERPRÉTATION) : pour la plupart des problèmes documentés, la loi impose un canal écrit (résiliation « en 3 clics », médiateurs en ligne, formulaires des compagnies). L'agent vocal et le *smart routing* restent des hypothèses d'architecture à tester **plus tard**. Ils ne conditionnent pas l'entrée sur le marché.

---

## 1. Méthode, conventions et limites

### Conventions de marquage

Chaque affirmation importante porte l'un de ces marqueurs :

| Marqueur | Sens |
|---|---|
| **FAIT** | Donnée vérifiable (texte de loi, tarif public, chiffre officiel), citée avec sa source |
| **SOURCE** | Chiffre publié par un acteur intéressé (entreprise, lobby) : à lire comme une indication, pas comme une preuve |
| **INTERPRÉTATION** | Ce que j'en déduis |
| **HYPOTHÈSE** | Ce qui reste à tester |
| **MANQUANT** | Ce que je n'ai pas trouvé et qu'il faudrait mesurer |

### Limites de la collecte (à lire avant de s'appuyer sur les chiffres)

- **La plupart des pages primaires étaient inaccessibles depuis l'environnement de recherche** (proxy réseau) : ftc.gov, forum Que Choisir, energie-mediateur.fr, Reddit, TechCrunch, etc. Les chiffres proviennent donc **des extraits de résultats de moteur de recherche**, pas d'une lecture intégrale des rapports. Tout chiffre destiné à une décision ou à un pitch doit être **revérifié sur le document source** (liens en [section 11](#11-sources)).
- **Reddit et les forums n'ont pas pu être lus directement.** Les « traces réelles » viennent donc surtout de sources institutionnelles : rapports des médiateurs, DGCCRF, DREES, enquêtes d'associations. Elles sont plus solides en volume, mais plus pauvres en verbatim. **Recueillir des verbatims fait partie du test MVP** ([section 8](#8-protocole-de-test-mvp)).
- Certains chiffres « grand public » (abonnements oubliés notamment) viennent de blogs qui citent des études sans lien. Ils sont marqués comme peu fiables.

---

## 2. Vision et wedge : les critères de choix

**Vision (inchangée) :** Atlas est un agent d'exécution personnel qui, progressivement, règle des problèmes réels à la place de l'utilisateur, dans le périmètre de son mandat.

**Wedge :** le premier problème qui permet de commencer à construire cette vision. On ne le choisit pas parce qu'il ressemble au produit final. Voici les critères retenus pour l'évaluer ; chacun est noté en [section 6](#6-comparaison-des-problèmes).

| # | Critère | Pourquoi il compte pour *cette* vision |
|---|---|---|
| C1 | **Douleur de délégation** : l'utilisateur sait quoi faire mais ne le fait pas | C'est exactement la promesse « Règle ça pour moi » |
| C2 | **Valeur mesurable par cas** (en € ou en heures) | Rend les métriques « argent récupéré » et « temps pris en charge » testables |
| C3 | **Fréquence** (par personne et en volume national) | Conditionne l'acquisition et la rétention |
| C4 | **Exécutabilité** : Atlas peut-il agir sans intégration inaccessible ? | Un wedge qui dépend d'intégrations impossibles ne se teste pas |
| C5 | **Vérifiabilité externe du résultat** | Principe produit : ne jamais confondre réponse, tentative et résultat |
| C6 | **Risque juridique / sécurité** (inversé : 5 = faible) | Un mauvais wedge peut tuer l'entreprise (cf. DoNotPay) |
| C7 | **Chemin vers la vision** : les briques construites sont-elles réutilisables ? | Le wedge doit bâtir le socle de l'agent généraliste |
| C8 | **Espace concurrentiel** (5 = peu de solutions qui vont jusqu'au bout) | Détermine si Atlas peut se différencier |

---

## 3. Fiches problèmes documentées

Chaque fiche répond aux 15 questions du cahier des charges. Pour la lisibilité, elles sont regroupées en quatre blocs : **Tâche**, **Enjeux**, **Existant**, **Faisabilité pour Atlas**.

---

### P1. Vol annulé ou retardé : indemnisation, remboursement, frais

**Tâche (Q1–Q5)**

- **Tâche exacte :** vérifier l'éligibilité (distance, retard à l'arrivée, cause), réclamer l'indemnité forfaitaire, le remboursement du billet ou le réacheminement, et le remboursement des frais engagés (repas, hôtel). Relancer, saisir le médiateur (MTV en France), puis éventuellement le juge.
- **Fréquence :**
  - FAIT/SOURCE : AirHelp estime qu'environ 13 millions de passagers par an laissent plus de 6 milliards de dollars d'indemnités non réclamées dans le monde. Chiffre d'un acteur intéressé, périmètre mondial.
  - MANQUANT : le volume France des vols éligibles par an. La DGAC ne publie pas de total de saisines facilement trouvable.
  - INTERPRÉTATION : pour un individu, c'est un événement **rare** (quelques fois par décennie pour un voyageur occasionnel). Les pics arrivent avec les grèves et l'été.
- **Étapes :** 6 à 12 selon l'escalade. Collecte des preuves (carte d'embarquement, e-mail d'annulation), calcul, formulaire compagnie, attente (30 jours maximum pour répondre avec la réforme, FAIT), relance, médiateur, procédure.
- **Temps :** MANQUANT (pas de mesure publique du temps passé par un particulier). HYPOTHÈSE : 1 à 3 h actives, étalées sur 1 à 12 mois. Le témoignage « AirHelp m'a payé 6 ans plus tard » (TravelUpdate) montre que la durée peut être extrême.
- **Acteurs :** compagnie, agence ou OTA si le billet a été acheté par un intermédiaire, médiateur, DGAC (régulateur, qui ne résout pas les cas individuels, FAIT), tribunal.

**Enjeux (Q6–Q7)**

- **Si l'on ne fait rien :** perte sèche de 250 à 600 € par passager (FAIT, montants maintenus par la réforme 2026), multipliée par le nombre de passagers du foyer.
- **Valeur :** élevée par cas. Une famille de 4 sur un long-courrier peut récupérer 2 400 €. Le délai de réclamation passe à 9 mois avec la réforme (SOURCE secondaire, à vérifier dans le texte final).

**Existant (Q8–Q11)**

- **Comment les gens font aujourd'hui :** ils ne réclament pas (45 %, SOURCE AirHelp), réclament seuls, ou passent par une société de réclamation. Principales raisons du non-recours selon AirHelp : méconnaissance des droits (63 %), croyance de ne pas être éligible (47 %), ne pas savoir comment faire (42 %).
- **Solutions :** AirHelp (35 % TTC, jusqu'à 50 % en justice), Flightright (27 % + TVA), ClaimCompass, Skycop… (FAIT : tarifs publics).
- **Ce qu'elles font réellement :** elles traitent **l'indemnité forfaitaire** et portent les dossiers en justice, souvent via mandat ou cession de créance.
- **Ce qui reste manuel (INTERPRÉTATION) :** le réacheminement le jour J, le remboursement du billet quand l'avoir est imposé, les frais annexes, le bagage, la coordination avec l'hôtel et la location de voiture, et **la vérification que l'argent est bien arrivé**. Les sociétés de réclamation ne traitent qu'**une ligne** de l'incident.

**Faisabilité pour Atlas (Q12–Q15)**

- **Exécution réelle possible ?** Oui, pour tout ce qui est écrit : lecture de l'e-mail d'annulation, calcul d'éligibilité, remplissage du formulaire web de la compagnie (navigateur piloté), e-mail de relance, saisine du médiateur en ligne. Le contentieux nécessite un partenaire juridique.
- **Intégrations :** lecture de la boîte e-mail (ou simple transfert de l'e-mail par l'utilisateur au départ), navigateur automatisé pour les formulaires, donnée de vol (API de statut de vol), preuve de paiement (capture d'écran du relevé au départ, agrégation bancaire DSP2 plus tard).
- **Contraintes :** mandat écrit de l'utilisateur. Certaines compagnies refusent les demandes venant d'intermédiaires ; Ryanair a mené une bataille publique contre les « claim chasers » (SOURCE : dépôt SEC Ryanair 2017). Données personnelles (RGPD).
- **MVP minimal :** voir [section 8](#8-protocole-de-test-mvp).

---

### P2. Abonnements à résilier et prélèvements non voulus

**Tâche**

- **Tâche exacte :** repérer les abonnements actifs, décider lesquels arrêter, résilier (en ligne, en 3 clics depuis le 1er juin 2023, FAIT), puis **vérifier que les prélèvements s'arrêtent**. Contester les prélèvements indus : un prélèvement SEPA est contestable sous 8 semaines (FAIT, cité par des sources secondaires).
- **Fréquence :**
  - FAIT : les ventes en ligne et les magasins dominent les 310 000+ signalements SignalConso de 2024 (DGCCRF). Il n'existe pas de catégorie « abonnements » isolée dans les extraits consultés.
  - Chiffres grand public **peu fiables** : de 31,50 € à 49 €/mois d'abonnements numériques selon les sources, et « 2,1 abonnements inutilisés par foyer, 970 €/an » attribué à UFC-Que Choisir par un blog, sans lien vérifiable. MANQUANT : la source primaire.
  - FAIT : la DGCCRF a infligé 68 500 € d'amende à Basic-Fit en juillet 2023, notamment pour défaut d'information sur la résiliation.
- **Étapes :** de 2 à 3 (cas simple) à plus de 8 (salle de sport qui refuse : mise en demeure, opposition bancaire, médiateur). Un témoignage du forum Que Choisir rapporte une salle exigeant 8 mensualités avant d'accepter la résiliation (extrait de recherche).
- **Temps :** de 5 minutes (cas simple) à plusieurs heures (cas conflictuel). MANQUANT : aucune mesure.
- **Acteurs :** le fournisseur, la banque, parfois l'App Store ou Google Play, le médiateur.

**Enjeux**

- **Si l'on ne fait rien :** des prélèvements continuent indéfiniment. Ce sont de petits montants, mais récurrents.
- **Valeur :** faible par cas (5 à 50 €/mois), mais cumulative. INTERPRÉTATION : la valeur ressentie tient autant à la **tranquillité** qu'à l'argent.

**Existant**

- **Solutions :** Resilier.fr et lettre-resiliation.com (génération et envoi de lettres, payants), applications bancaires qui listent les abonnements, Rocket Money aux États-Unis (résiliation « concierge » en Premium).
- **Ce qui reste manuel :** se connecter au compte du fournisseur pour cliquer, gérer les refus, **vérifier l'arrêt effectif** du prélèvement.

**Faisabilité pour Atlas**

- **Exécution :** partielle. La résiliation en 3 clics exige souvent **d'être connecté au compte client**, donc de manipuler les identifiants de l'utilisateur, ce qui constitue un risque de sécurité majeur. L'envoi d'une lettre recommandée électronique ou d'un e-mail de résiliation reste possible sans identifiants.
- **Intégrations :** lecture bancaire (DSP2 via un agrégateur agréé) pour la détection et la vérification ; e-mail ; LRE (lettre recommandée électronique).
- **Contraintes :** conservation d'identifiants (à éviter), DSP2 (lecture seule via un prestataire agréé), mandat.
- **MVP minimal :** l'utilisateur envoie trois relevés bancaires. Atlas liste les prélèvements récurrents, l'utilisateur coche ceux à arrêter, Atlas envoie les résiliations par canal écrit, puis vérifie sur le relevé suivant.

---

### P3. Facture d'énergie contestée (rattrapage, estimation, erreur de compteur)

**Tâche**

- **Tâche exacte :** contester une facture de régularisation ou une consommation estimée, faire appliquer la limite légale de rattrapage (14 mois, art. L224-11 C. conso — INTERPRÉTATION à confirmer juridiquement pour chaque cas), obtenir un échéancier ou un avoir, saisir le Médiateur national de l'énergie (MNE).
- **Fréquence :**
  - FAIT (MNE, rapport 2024) : 29 460 litiges reçus, dont 11 678 saisines (-17 %) et 7 142 recevables ; délai moyen d'instruction de 98 jours.
  - FAIT : les niveaux de consommation sont le 1er motif (2 471 saisines recevables, 35 % des dossiers instruits). Un tiers des recommandations porte sur des factures litigieuses de plus d'un an, **au montant moyen supérieur à 2 000 €**.
- **Étapes :** 5 à 8. Réclamation écrite au fournisseur, attente de 2 mois (obligatoire avant le médiateur), saisine en ligne, échanges de pièces, recommandation, application.
- **Temps :** plus de 3 mois de délai (FAIT : 98 jours de médiation, plus les 2 mois préalables). Temps actif : MANQUANT.
- **Acteurs :** fournisseur, gestionnaire de réseau (Enedis/GRDF), MNE.

**Enjeux**

- **Si l'on ne fait rien :** payer une facture potentiellement indue de plusieurs centaines à plusieurs milliers d'euros, avec un risque de coupure ou de réduction de puissance.
- **Valeur :** très élevée par cas, mais **rare** par foyer.

**Existant**

- **Solutions :** le MNE (gratuit), les associations de consommateurs, des comparateurs (Selectra, Hello Watt) qui publient des guides. Aucune solution identifiée ne prend le dossier en charge de bout en bout contre rémunération au résultat. MANQUANT : vérifier plus finement.
- **Ce qui reste manuel :** presque tout.

**Faisabilité pour Atlas**

- **Exécution :** bonne sur le fond. Dossier documentaire (factures, relevés, index), règles écrites, canal écrit (formulaire MNE en ligne, 82 % de saisines en ligne pour la médiation télécom par comparaison, FAIT).
- **Intégrations :** lecture de documents (**déjà présente dans Atlas**), e-mail, formulaire web.
- **Contraintes :** qualité de l'analyse juridique (responsabilité en cas d'erreur), mandat.
- **MVP minimal :** « Envoyez-nous votre facture de régularisation ». Atlas détermine si la limite de rattrapage s'applique, rédige et envoie la réclamation, puis suit le dossier jusqu'à la médiation.

---

### P4. Litiges télécom (box, mobile) : facturation, résiliation, panne

- **Fréquence :** FAIT (Médiation des communications électroniques, rapport 2024) : 7 417 saisines (-4 %, 3e année de baisse), 49 % recevables, 82 % en ligne, délai de traitement de 93 jours (contre 72 en 2023).
- **Valeur :** moyenne. Frais de résiliation contestés, mois facturés pendant une panne, hausses tarifaires.
- **Existant :** médiation gratuite. Aux États-Unis, la négociation de factures télécom est le cœur de Rocket Money (35 à 60 % de la première année d'économies, FAIT : page d'aide) et de Pine AI.
- **INTERPRÉTATION :** la **négociation** à l'américaine se transpose mal en France, où les offres sont moins négociables et les frais de résiliation plafonnés. Le levier français est plutôt « changer d'offre et résilier proprement », ce que fait déjà Papernest gratuitement (rémunéré par commission des fournisseurs, FAIT).
- **Faisabilité :** même profil que P2 et P3.

---

### P5. Colis perdu, commande non livrée, remboursement e-commerce

- **Fréquence :**
  - FAIT (DGCCRF 2024) : les ventes en ligne représentent **144 620 signalements** SignalConso, la première catégorie ; 109 441 signalements portent sur les produits achetés en ligne.
  - FAIT (Médiateur du groupe La Poste, rapport 2025) : 5 668 saisines « colis », 2 123 recevables, 64 % de médiations favorables ou partiellement favorables au consommateur.
- **Étapes :** 3 à 7. Réclamation au vendeur (responsable de plein droit de la livraison au consommateur, INTERPRÉTATION à confirmer au cas par cas), réclamation au transporteur (délai court, par exemple 15 jours cité pour Colissimo), rétrofacturation par carte (*chargeback*), médiateur.
- **Valeur :** de 20 à plusieurs centaines d'euros. **Fréquence individuelle élevée** (INTERPRÉTATION : c'est l'incident de consommation le plus courant).
- **Existant :** service client du vendeur, contestation bancaire (*chargeback*), SignalConso (signalement, pas résolution). Aucune offre d'exécution de bout en bout identifiée en France.
- **Faisabilité :** bonne à l'écrit (e-mail au vendeur, formulaire du transporteur, chargeback guidé). La vérification est simple : remboursement reçu.

---

### P6. Dépôt de garantie non restitué

- **Fréquence et gravité :**
  - FAIT (étude CLCV sur 160 dossiers, **ancienne : 2010**) : dépôt non restitué dans 37,5 % des cas, sans justificatif dans 28,7 % des cas, délai légal dépassé dans 31,9 % des cas.
  - SOURCE (baromètre Lockli 2026, acteur privé) : les dépôts non restitués représentent 34 % des litiges locatifs, et 47 % des locataires ne récupèrent pas 100 % de leur dépôt.
- **Étapes :** mise en demeure, calcul des pénalités de retard (10 % du loyer par mois de retard, INTERPRÉTATION à confirmer), commission départementale de conciliation, juge des contentieux de la protection.
- **Valeur :** 1 mois de loyer hors charges (vide) ou 2 mois (meublé), soit plusieurs centaines à plus de 2 000 €. Fréquence : à chaque déménagement.
- **Existant :** ADIL (conseil gratuit), CLCV, modèles de lettres. Demander Justice propose l'envoi de mises en demeure puis la saisine du tribunal ; la Cour de cassation a jugé en 2017 que cela ne constitue pas un exercice illégal de la profession d'avocat, en l'absence de représentation (FAIT).
- **Faisabilité :** bonne à l'écrit. Risque relationnel : le bailleur est un particulier, et la « négociation » par un agent peut être mal perçue.

---

### P7. Sinistre et remboursement d'assurance

- **Fréquence :** FAIT (Médiation de l'assurance, rapport 2024) : **36 537 saisines, +19 %, record historique** ; délai moyen de 7 mois ; 10 130 litiges résolus (+43 %).
- **Valeur :** très variable (de 100 € à plusieurs dizaines de milliers d'euros).
- **INTERPRÉTATION :** le volume croît. Mais les dossiers sont **hétérogènes** (auto, habitation, santé, prévoyance, emprunteur) et exigent souvent une **expertise** contradictoire. C'est trop large pour un premier wedge et risqué juridiquement : l'intermédiation en assurance est réglementée.

---

### P8. Retard de train (garantie G30, règlement UE 2021/782)

- **Tâche :** demander la compensation (25 à 75 % du billet en bon d'achat selon le retard, sous 90 jours, FAIT : SNCF).
- **Valeur :** faible (quelques euros à quelques dizaines, souvent **en bon d'achat**).
- **INTERPRÉTATION :** la friction est déjà faible (formulaire en ligne) et la valeur basse. C'est un bon **cas de démonstration** à ajouter à un wedge « transport », pas un wedge seul.
- **MANQUANT :** le taux de non-réclamation G30. Non publié dans les sources consultées.

---

### P9. Déménagement (transfert et résiliation des contrats)

- **Existant :** Papernest prend en charge gratuitement les résiliations et souscriptions (énergie, box, assurance, réexpédition). Le service est rémunéré par commission des fournisseurs partenaires (FAIT : site Papernest).
- **INTERPRÉTATION :**
  - C'est **la preuve la plus nette que des particuliers délèguent déjà l'exécution** d'une démarche administrative multi-acteurs en France.
  - Mais le modèle « gratuit pour l'utilisateur, payé par le fournisseur » crée un conflit d'intérêts qu'Atlas, mandataire de l'utilisateur, ne devrait pas reproduire.
  - Le terrain est occupé. Ce serait un bon **deuxième cas** (après un wedge de récupération) plutôt qu'un premier.

---

### P10. Non-recours aux droits sociaux

- **FAIT (DREES) :** un tiers (34 %) des foyers éligibles au RSA ne le demandent pas au cours d'un trimestre moyen ; un sur cinq de façon durable. Ces foyers perdent en moyenne **330 €/mois**, soit environ 750 M€ par trimestre non versés. Le manque d'information est le premier motif déclaré.
- **INTERPRÉTATION :** c'est la plus grande « valeur non réclamée » documentée. **Ce n'est pourtant pas un bon wedge :**
  1. l'accès aux comptes CAF passe par des identifiants personnels (FranceConnect), dont l'usage par un tiers est problématique ;
  2. le public est vulnérable, ce qui rend un modèle à la commission éthiquement discutable ;
  3. des acteurs publics et associatifs gratuits existent (« Territoires zéro non-recours », simulateurs).

  À garder comme **terrain de vision** (Atlas comme agent qui fait valoir les droits de l'utilisateur), pas comme entrée commerciale.

---

### P11. Attente téléphonique et service client en général

- **Traces :**
  - SOURCE : une étude publiée par un acteur australo-néo-zélandais estime **9,7 h/personne/an** d'attente en Nouvelle-Zélande et **11,1 h** en Australie en 2024 pour des réclamations.
  - Plusieurs sondages (qualité variable) placent l'attente comme **1er grief** du service client téléphonique (61 %).
  - MANQUANT : une mesure équivalente pour la France.
- **Existant, et signal majeur :**
  - FAIT : Google a testé dès 2024 « Talk to a Live Representative » : Google appelle, navigue dans le serveur vocal, patiente, puis rappelle l'utilisateur quand un humain décroche.
  - FAIT : en janvier 2025, « Ask for Me » appelle des commerces (garages, salons) pour s'informer des prix.
  - SOURCE (TechCrunch, 24/09/2026, lu en extrait) : **« Call for Me » de Gemini passe de vrais appels pour l'utilisateur**. Il est limité aux États-Unis et aux Pixel, et porte sur des cas simples (stock, réservation, rendez-vous).
  - SOURCE : Pine AI (États-Unis) appelle les services clients pour négocier, résilier et réclamer. Abonnement dès 30 $/mois ou forfait de 2 à 10 $ par tâche remboursé en cas d'échec. Il revendique 93 % de succès en négociation et environ 400 $ d'économies moyennes (chiffres auto-déclarés).
- **INTERPRÉTATION :** la brique « patienter et parler au service client » est en train d'être **banalisée par les plateformes** (Google). La valeur défendable n'est pas l'appel lui-même. C'est **la responsabilité de bout en bout du dossier** : savoir quoi demander, relancer, escalader, vérifier le résultat. Cela confirme de ne pas faire du téléphone le cœur du wedge.

---

## 4. Ce que font réellement les solutions existantes

| Acteur | Ce qu'il exécute vraiment | Ce qu'il ne fait pas | Modèle | Leçon pour Atlas |
|---|---|---|---|---|
| **AirHelp / Flightright** (UE) | Réclamation de l'indemnité EU261, contentieux | Billet, frais, bagage, suivi global de l'incident | 27 % + TVA à 35 % TTC, jusqu'à 50 % en justice | Les gens **paient cher** pour déléguer quand l'argent est au bout. Mais c'est mono-tâche |
| **Rocket Money** (US) | Négociation de factures, résiliations | Litiges, réclamations complexes | 35 à 60 % des économies de la 1re année, choisi par l'utilisateur | Modèle au résultat viable à grande échelle |
| **Trim** (US) | Négociation de factures | — | Commission | **Service grand public arrêté en 2022** après rachat par OneMain. Le modèle seul n'a pas suffi |
| **DoNotPay** (US) | Lettres, formulaires | Qualité juridique non testée | Abonnement | **FTC, janvier 2025** : 193 000 $ d'amende et interdiction de prétendre remplacer un avocat sans preuve. Leçon : **ne jamais revendiquer un résultat non démontré**, ce qu'Atlas applique déjà avec ses statuts dérivés des preuves |
| **Pine AI** (US) | Appels et e-mails aux services clients | Hors États-Unis | Abonnement ou forfait par tâche remboursable | Le concurrent le plus proche de la vision. À surveiller |
| **Google (Talk to a Live Rep, Ask for Me, Call for Me)** | Appel, attente, prise d'information | Suivi de dossier, escalade, vérification | Gratuit, intégré | La brique téléphonique devient une commodité |
| **Papernest** (FR) | Résiliation et souscription de contrats au déménagement | Litiges | Gratuit, payé par les fournisseurs | La délégation administrative existe en France. Conflit d'intérêts à éviter |
| **Demander Justice** (FR) | Mises en demeure, saisine du tribunal sans représentation | Plaidoirie, conseil | Forfaits | Cadre jurisprudentiel favorable (Cass. crim. 2017) pour l'assistance sans représentation |
| **Médiateurs publics** (énergie, télécom, assurance, La Poste) | Instruisent les litiges, gratuitement | Ne préparent pas le dossier de l'utilisateur ; délais de 3 à 7 mois | Gratuit | Un canal d'escalade écrit, gratuit, **déjà en ligne**, qu'Atlas peut utiliser comme « bras de levier » |

---

## 5. Contraintes juridiques et de sécurité communes

| Sujet | Ce qui est établi | Conséquence pour Atlas |
|---|---|---|
| **Mandat** | Le mandat (art. 1984 et s. C. civ.) permet d'agir au nom d'autrui (INTERPRÉTATION : cadre standard des sociétés de réclamation) | Un mandat explicite, limité par type d'action, révocable et daté. C'est la matérialisation du « périmètre de permissions » de la vision |
| **Transparence IA** | L'AI Act (art. 50) impose d'informer une personne qu'elle interagit avec une IA, **à partir du 2 août 2026** (FAIT, sous réserve d'ajustements par l'« omnibus numérique » à vérifier) | Tout e-mail ou appel d'Atlas doit se déclarer comme agent IA mandaté |
| **Exercice du droit** | L'assistance sans représentation ni consultation personnalisée n'est pas un exercice illégal (Cass. crim., 21 mars 2017, Demander Justice) | Atlas peut préparer et envoyer. Le contentieux avec représentation passe par un partenaire avocat |
| **Allégations** | FTC c. DoNotPay (2025) | Ne jamais annoncer un taux de succès ou une qualité non mesurés |
| **Accès e-mail** | Les scopes Gmail en lecture sont « restreints » : audit CASA annuel obligatoire, de quelques centaines à plusieurs milliers de dollars (FAIT, doc Google et prestataires) | Au départ : **transfert d'e-mail** par l'utilisateur (adresse dédiée) plutôt que l'accès complet à la boîte |
| **Accès bancaire** | Lecture via agrégateur agréé DSP2. Paiement : jamais au démarrage | La vérification « argent arrivé » se fait d'abord par justificatif fourni par l'utilisateur |
| **Identifiants** | Se connecter aux comptes de l'utilisateur implique de détenir ses mots de passe : risque maximal (INTERPRÉTATION) | À exclure du MVP. Privilégier les canaux qui ne demandent pas de connexion (e-mail, formulaires publics, LRE, médiateurs) |
| **Enregistrement d'appels** | Consentement, RGPD, information (pour la phase téléphone) | Reporté : pas de téléphone dans le wedge |
| **Conflit d'intérêts** | Modèles « payés par le fournisseur » (Papernest) | Atlas se positionne comme mandataire de l'utilisateur, payé par lui ou au résultat |

---

## 6. Comparaison des problèmes

Notes de 1 à 5 (INTERPRÉTATION, fondée sur les fiches ci-dessus). Pour C6 et C8, 5 = favorable (risque faible, concurrence faible).

| Problème | C1 Délégation | C2 Valeur / cas | C3 Fréquence | C4 Exécutable | C5 Vérifiable | C6 Risque | C7 Vers la vision | C8 Concurrence | **Total /40** |
|---|---|---|---|---|---|---|---|---|---|
| P1 Vol perturbé (incident complet) | 5 | 5 | 2 | 4 | 5 | 4 | 4 | 2 | **31** |
| P5 Colis / e-commerce | 4 | 2 | 5 | 4 | 5 | 4 | 4 | 4 | **32** |
| P3 Facture d'énergie | 4 | 5 | 2 | 4 | 4 | 3 | 4 | 4 | **30** |
| P6 Dépôt de garantie | 4 | 4 | 2 | 4 | 5 | 3 | 4 | 4 | **30** |
| P2 Abonnements / prélèvements | 3 | 2 | 4 | 3 | 5 | 3 | 4 | 3 | **27** |
| P4 Télécom | 3 | 3 | 3 | 3 | 4 | 4 | 3 | 3 | **26** |
| P9 Déménagement | 4 | 2 | 2 | 3 | 4 | 4 | 4 | 2 | **25** |
| P7 Assurance | 4 | 4 | 3 | 2 | 3 | 2 | 3 | 4 | **25** |
| P8 Train | 2 | 1 | 3 | 5 | 4 | 5 | 2 | 3 | **25** |
| P10 Droits sociaux | 3 | 5 | 3 | 1 | 3 | 1 | 4 | 3 | **23** |
| P11 Appel « générique » | 4 | 2 | 4 | 3 | 2 | 2 | 5 | 1 | **23** |

**Lecture (INTERPRÉTATION) :** quatre problèmes forment un groupe de tête très serré (P1, P5, P3, P6). **Ils partagent la même structure** :

> incident → droit écrit → réclamation écrite → attente → relance → escalade (médiateur ou juge) → paiement vérifiable.

Cette structure est la **vraie** découverte de la recherche. Le wedge n'est pas un secteur. C'est **une boucle d'exécution** réutilisable d'un secteur à l'autre. C'est exactement le cycle de la vision (intention → … → vérification → relance → résultat → compte rendu), dans sa version la plus accessible.

---

## 7. Recommandation de wedge

### Le wedge : « Récupérer l'argent qu'on vous doit après un incident »

- **Promesse (HYPOTHÈSE à tester) :** « Transférez-nous l'e-mail du problème. On s'occupe de tout jusqu'à ce que l'argent soit sur votre compte, et on vous dit exactement où on en est. »
- **Premier cas vertical : la perturbation aérienne.** Elle obtient un point de moins que les colis (P5) dans la grille. Elle passe pourtant devant, car une phase concierge supervisée coûte cher par dossier : il faut une valeur par cas suffisante pour la financer et un consentement à payer déjà observé. Les colis (20 à 100 €) ne permettent de tester ni l'un ni l'autre. Quatre raisons :
  1. la valeur par cas est la plus élevée et la plus claire (250 à 600 € par passager, FAIT) ;
  2. un droit européen stable, **confirmé et clarifié par la réforme de juillet 2026** (applicable mi-2027 ; délai de réponse de 30 jours imposé aux compagnies) ;
  3. un consentement à payer **déjà prouvé** (commissions de 27 à 35 %) ;
  4. un événement déclencheur net (l'e-mail d'annulation), qui sert d'entrée naturelle à la délégation.
- **Deuxième cas, à ajouter dès que la boucle fonctionne :** colis et commandes en ligne (P5). C'est le plus fréquent, et il sert à tester si la boucle se généralise vraiment. Ensuite : facture d'énergie (P3) et dépôt de garantie (P6).

### Pourquoi cette porte mène à la vision

| Brique construite par le wedge | Réutilisée ensuite pour… |
|---|---|
| Mandat explicite par type d'action | Tout le périmètre de permissions de l'agent personnel |
| Réception d'incidents par transfert d'e-mail | Connecteur e-mail complet (quand l'audit CASA sera justifié) |
| Exécution sur formulaires web et e-mails sortants | Toute démarche écrite |
| **Attente longue et relance planifiée** (semaines ou mois) | Le cycle « ATTENTE → VÉRIFICATION → RELANCE » de la vision |
| Escalade vers les médiateurs | Énergie, télécom, assurance, La Poste, consommation |
| Vérification du résultat par preuve externe | Principe produit : « résultat obtenu » ≠ « action tentée » |
| Métriques « € récupérés » et « heures prises en charge » | Proposition de valeur générale |

### Ce qu'Atlas ne doit **pas** faire dans ce wedge

- Se présenter comme « un AirHelp moins cher ». Il faut se différencier par **l'incident complet** et **la multiplicité des incidents**, pas par le prix.
- Ajouter le téléphone avant d'avoir prouvé la boucle écrite.
- Se connecter aux comptes de l'utilisateur avec ses identifiants.
- Annoncer des taux de succès avant d'en avoir mesuré (leçon DoNotPay).

### Modèle économique : hypothèses à tester, pas à supposer

Aucun prix n'est validé. Le test doit comparer au moins deux options :

- **Commission au résultat.** Repère marché : 27 à 35 % (FAIT). HYPOTHÈSE : un taux plus bas est tenable si le coût d'exécution par dossier est faible, **à mesurer**.
- **Forfait par dossier remboursé en cas d'échec.** Repère : Pine, 2 à 10 $ par tâche (SOURCE).

Le coût réel d'un dossier (tokens, temps humain de supervision, envois recommandés) est **MANQUANT**. C'est la première donnée à produire.

---

## 8. Protocole de test MVP

**Principe : concierge d'abord.** Un humain supervise chaque action d'Atlas. On mesure avant d'automatiser.

### Étape 1 — 20 à 30 dossiers réels (4 à 6 semaines)

- **Recrutement :** proches, groupes de voyageurs, forums. MANQUANT : le canal d'acquisition, qui fait partie du test.
- **Entrée :** l'utilisateur transfère l'e-mail d'annulation ou de retard (et ses justificatifs) à une adresse dédiée, puis signe un mandat simple.
- **Atlas (supervisé) :**
  1. qualifie le dossier (éligibilité, montants dus : indemnité, billet, frais) ;
  2. remplit le formulaire de la compagnie ;
  3. planifie la relance à J+30 ;
  4. saisit le médiateur si besoin ;
  5. demande à l'utilisateur la preuve de paiement ;
  6. clôture avec un compte rendu.
- **Aucun** accès à la boîte e-mail, à la banque ou aux comptes. Aucun téléphone.

### Ce qu'on mesure

| Mesure | Pourquoi |
|---|---|
| % d'utilisateurs qui délèguent vraiment (signent le mandat) après avoir vu la proposition | Valide C1, la promesse « Règle ça pour moi » |
| Temps humain de supervision par dossier, et coût API par dossier | Coût réel d'exécution, base du modèle économique |
| % de dossiers payés, délai jusqu'au paiement, montant moyen récupéré | Valide C2 et C5 |
| % de dossiers où Atlas a dû demander quelque chose à l'utilisateur, et quoi | Mesure la frontière de responsabilité réelle |
| Nombre d'autres problèmes que l'utilisateur **demande spontanément** à déléguer | Signal le plus important pour la vision : le wedge ouvre-t-il vers l'agent généraliste ? |
| Consentement à payer (commission ou forfait), demandé après le résultat | Modèle économique |
| Verbatims sur la charge mentale | Les traces qualitatives qui manquent à cette recherche |

### Critères de décision (proposés, à ajuster)

- **Continuer** si : au moins 60 % délèguent, au moins 50 % des dossiers éligibles sont payés en moins de 90 jours, le coût d'exécution est inférieur à 15 % de la valeur récupérée, et au moins un tiers des utilisateurs proposent spontanément un autre problème.
- **Pivoter de cas** (vers P5, P3 ou P6) si la boucle fonctionne mais que l'acquisition aérienne est trop rare ou trop chère.
- **Remettre en cause le wedge** si les utilisateurs ne délèguent pas même quand le résultat est gratuit pour eux.

---

## 9. Écart avec le code actuel d'Atlas

Le MVP actuel (voir `README.md`) est un **assistant d'exécution de missions** :

- **Déjà présent :** plan typé, outils de recherche, lecture de documents, livrables, statuts dérivés des preuves. Les étapes déclarées par l'utilisateur sont distinguées de celles réellement exécutées par Atlas.
- **Ce qui s'aligne déjà avec la vision :** le principe « ne jamais confondre réponse, tentative et résultat » est implémenté (statuts calculés à partir des preuves). C'est l'actif le plus précieux pour le wedge.
- **Absent aujourd'hui (README, « Non implémenté ») :** envoi d'e-mails, remplissage de formulaires, rappels et relances planifiés, connexion aux comptes, toute action engageante. L'exécution tourne dans le processus web et ne peut donc pas attendre des semaines.

Briques minimales à ajouter pour le wedge (INTERPRÉTATION, par ordre de priorité) :

1. **Entrée par e-mail** : une adresse de réception par utilisateur, avec les pièces jointes rattachées à une mission.
2. **Mandat** : objet de données (actions autorisées, plafonds, date, révocation) vérifié avant chaque action sortante.
3. **Actions sortantes écrites avec validation humaine** : envoi d'e-mail, soumission de formulaire (navigateur piloté), chaque fois avec une preuve conservée (copie envoyée, capture, accusé de réception).
4. **Planificateur de relances hors du processus web** : nouvelle étape « en attente jusqu'au JJ/MM », qui reprend automatiquement la mission.
5. **Statut « résultat obtenu »** exigeant une preuve externe (justificatif de paiement), distinct de « réclamation envoyée ».
6. **Compteurs** « € récupérés » et « temps pris en charge », calculés à partir des dossiers clos avec preuve.

---

## 10. Informations manquantes prioritaires

1. Volume France des vols éligibles EU261 par an et taux de réclamation français (DGAC, AirHelp France).
2. Temps réellement passé par un particulier sur chaque type de dossier. Aucune mesure publique trouvée : **à produire pendant le test**.
3. Coût d'exécution réel d'un dossier par Atlas (API, supervision, envois).
4. Le texte final de la réforme EU261 (formulaires, délais, éventuelles règles sur les intermédiaires), à lire en source primaire.
5. Taux de non-réclamation G30 SNCF et volume des litiges e-commerce hors SignalConso.
6. Source primaire des chiffres sur les « abonnements oubliés » (UFC-Que Choisir, janvier 2025 ?).
7. Verbatims de forums et de Reddit (inaccessibles ici) sur la charge mentale des démarches.
8. Statut exact de l'art. 50 AI Act après les éventuels reports de l'« omnibus numérique ».

---

## 11. Sources

Consultées via extraits de moteur de recherche ; les pages primaires n'ont pas toutes pu être ouvertes (voir [section 1](#1-méthode-conventions-et-limites)).

**Aérien**
- AirHelp, rejet de 58 % des demandes éligibles en 2025 (via ITIJ) : https://www.itij.com/latest/news/airlines-reject-58-valid-passenger-compensation-claims-airhelp-says
- AirHelp, EU261 expliqué : https://www.airhelp.com/en/ec-regulation-261-2004/
- Tarifs AirHelp / Flightright : https://www.airhelp.fr/blog/meilleur-site-indemnisation-vol-france/ · https://oiseaurose.com/vol-retarde-ou-annule-indemnisation-flightright/
- « 6 ans plus tard » : https://travelupdate.com/wow-6-years-later-airhelp-paid-me-eu261-compensation/
- Réforme EU261, accord de conciliation du 15 juin 2026 : https://www.dlapiper.com/en-us/insights/publications/2026/06/agreement-reached-on-ec261-reform-to-strengthen-passenger-rights
- Conseil de l'UE, adoption définitive (13/07/2026) : https://www.consilium.europa.eu/en/press/press-releases/2026/07/13/council-gives-final-clearance-for-stronger-air-passenger-rights/
- Euronews, ce que change la réforme : https://www.euronews.com/my-europe/2026/07/21/air-passenger-rights-reform-what-the-new-rules-mean-for-you
- Nouvelles règles EU261 (délais 30 jours / 9 mois) : https://airadvisor.com/en/blog/new-eu261-rules
- DGAC, droits des passagers : https://droits-passagers-aeriens.aviation-civile.gouv.fr/
- Ryanair et les « claims chasers » (SEC, 2017) : https://www.sec.gov/Archives/edgar/data/1038683/000165495417005186/a6851g.htm

**Consommation, abonnements, colis**
- DGCCRF, bilan 2024 / SignalConso : https://signal.conso.gouv.fr/fr/actualites/bilan-2024 · https://www.economie.gouv.fr/files/files/directions_services/dgccrf/media-document/Bilan-activite-2024-DGCCRF.pdf
- Résiliation en 3 clics (INC) : https://www.inc-conso.fr/content/la-resiliation-des-abonnements-et-contrats-renouvelables-en-trois-clics
- Bilan de la résiliation en 3 clics et amende Basic-Fit : https://www.lettre-resiliation.com/actualites/famille/resiliation-trois-clics-bilan.html
- Forum Que Choisir, refus de résiliation en salle de sport : https://forum.quechoisir.org/refus-de-resiliation-car-oublie-de-prelevements-t282003.html
- Abonnements oubliés (sources secondaires, fiabilité faible) : https://www.justgeek.fr/abonnements-numeriques-france-2025-138554/ · https://www.economiematin.fr/abonnements-oublies-comment-les-francais-perdent-des-millions-chaque-mois
- Colis Colissimo et Médiateur du groupe La Poste : https://www.universcolis.fr/questions/assurance/reclamation-colissimo · https://www.laposte.fr/envoyer/colis-perdu-colissimo

**Énergie, télécom, assurance**
- Médiateur national de l'énergie, rapport 2024 : https://www.energie-mediateur.fr/publication/rapport-annuel-2024/ · https://energies.newstank.fr/article/view/399021/mediateur-national-energie-29460-litiges-11678-saisines-16-6-enregistres.html
- Motifs des litiges d'énergie : https://www.moneyvox.fr/energie/actualites/103407/ces-4-litiges-qui-font-flamber-vos-factures-de-gaz-et-d-electricite
- Médiation des communications électroniques, rapport 2024 : https://www.inc-conso.fr/content/la-mediatrice-des-communications-electroniques-presente-son-rapport-annuel-2024
- Médiation de l'assurance, rapport 2024 : https://www.mediation-assurance.org/wp-content/uploads/2025/08/Rapport-annuel-2024-LMA_Communique-de-presse.pdf

**Logement, droits sociaux, banque**
- CLCV, dépôt de garantie (2010) : https://www.clcv.org/articles/restitution-du-depot-de-garantie-la-clcv-pointe-des-abus-caracterises-20012010
- Baromètre Lockli 2026 : https://lockli.fr/barometre
- DREES, non-recours au RSA : https://drees.solidarites-sante.gouv.fr/publications-communique-de-presse/les-dossiers-de-la-drees/mesurer-regulierement-le-non-recours-au · https://www.banquedesterritoires.fr/un-tiers-des-foyers-eligibles-ne-demandent-pas-le-rsa-et-perdent-en-moyenne-330-euros-par-mois
- Frais d'incidents bancaires (Observatoire de l'inclusion bancaire) : https://www.moneyvox.fr/banque/actualites/69467/frais-incidents-bancaires-ufc-que-choisir-denonce-un-pis-aller

**Solutions existantes et agents**
- Rocket Money, frais de négociation : https://help.rocketmoney.com/en/articles/9744474-bill-negotiation-charge-explained
- Trim, arrêt du service grand public : https://cancelsubscriptionsapp.com/alternatives/trim-alternatives
- FTC c. DoNotPay, ordonnance finale : https://www.ftc.gov/news-events/news/press-releases/2025/02/ftc-finalizes-order-donotpay-prohibits-deceptive-ai-lawyer-claims-imposes-monetary-relief-requires
- Pine AI : https://www.19pine.ai/pricing · https://siliconangle.com/2026/05/06/pine-ai-aims-consumer-ai-agent-complex-customer-service-interactions/
- Google Talk to a Live Representative (2024) : https://techcrunch.com/2024/02/16/google-tests-a-feature-that-calls-businesses-on-your-behalf-and-holds-until-an-agent-is-available/
- Google Ask for Me (2025) : https://techcrunch.com/2025/01/30/googles-ask-for-me-feature-calls-businesses-on-your-behalf-to-inquire-about-services-pricing/
- Gemini Call for Me (24/09/2026) : https://techcrunch.com/2026/09/24/google-tests-letting-gemini-make-phone-calls-initially-for-us-pixel-owners/
- Papernest, modèle économique : https://www.papernest.com/qui-sommes-nous-papernest-gratuit/
- Demander Justice, Cass. crim. 21 mars 2017 : https://www.dalloz-actualite.fr/flash/demanderjusticecom-pas-d-exercice-illegal-de-profession-d-avocat-selon-cour-de-cassation
- Temps d'attente (Nouvelle-Zélande / Australie) : https://s205.q4cdn.com/537566246/files/doc_news/New-Zealand-spent-24-million-hours-on-hold-in-2024-2025.pdf

**Juridique et technique**
- AI Act, article 50 : https://www.donneespersonnelles.fr/transparence-ia-article-50-ai-act
- Google, vérification des scopes restreints (CASA) : https://developers.google.com/identity/protocols/oauth2/production-readiness/restricted-scope-verification
