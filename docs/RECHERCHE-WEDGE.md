# Atlas — « Règle ça pour moi » : quel premier problème prendre entièrement en charge ?

> Recherche de *wedge* menée à partir de la vision originelle d'Atlas (agent d'exécution autonome pour particuliers).
> Date : 25 septembre 2026 (révisé le même jour : score composite retiré, droit applicable séparé de la réforme 2026, chiffres AirHelp déclassés, protocole de test détaillé). Périmètre principal : France / Union européenne, avec des repères américains quand ils éclairent le marché.

> **Mise à jour :** l'évaluation détaillée du cas des vols, et sa comparaison avec d'autres points d'entrée, est dans [`EVALUATION-WEDGE-VOLS.md`](EVALUATION-WEDGE-VOLS.md). Conclusion : les vols deviennent **un cas témoin**, pas le premier wedge. Elle corrige aussi la description des concurrents (voir ci-dessous).

---

## Sommaire

0. [Réponse courte](#0-réponse-courte)
1. [Méthode, conventions et limites de cette recherche](#1-méthode-conventions-et-limites)
2. [Vision et wedge : les critères de choix](#2-vision-et-wedge--les-critères-de-choix)
3. [Fiches problèmes documentées](#3-fiches-problèmes-documentées)
4. [Ce que font réellement les solutions existantes](#4-ce-que-font-réellement-les-solutions-existantes)
5. [Contraintes juridiques et de sécurité communes](#5-contraintes-juridiques-et-de-sécurité-communes)
6. [Comparaison des problèmes](#6-comparaison-des-problèmes)
7. [Recommandation : ce qu'il faut tester](#7-recommandation--ce-quil-faut-tester)
8. [Protocole de test concierge](#8-protocole-de-test-concierge)
9. [Écart avec le code actuel d'Atlas](#9-écart-avec-le-code-actuel-datlas)
10. [Informations manquantes prioritaires](#10-informations-manquantes-prioritaires)
11. [Sources](#11-sources)

---

## 0. Réponse courte

**Question posée :** existe-t-il un problème que les gens seraient heureux de ne plus résoudre eux-mêmes, et qu'Atlas peut raisonnablement prendre **entièrement** en charge ?

**Ce que la recherche établit :** elle **ne valide pas Atlas**. Elle identifie un **type de problème** qui correspond à la vision, et un **premier cas à tester**. Elle ne démontre pas que ce cas est le bon.

### Le type de problème

> **« J'ai potentiellement droit à quelque chose, mais l'obtenir demande une succession de démarches que je n'ai pas envie de faire. »**

C'est un problème **d'exécution**, pas d'information. L'utilisateur dit « Règle ça pour moi », et Atlas doit enchaîner :

> déterminer l'éligibilité → préparer → envoyer → attendre → relancer → escalader → vérifier le paiement.

On retrouve cette même suite dans les vols, les colis, les factures d'énergie et les cautions de location ([section 6](#6-comparaison-des-problèmes)). Le droit y est écrit, le canal de réclamation aussi (formulaire web, e-mail, médiateur en ligne), et le résultat se vérifie de l'extérieur : l'argent arrive, ou pas.

### Le premier cas à tester (HYPOTHÈSE, pas conclusion)

**La perturbation aérienne (vol annulé ou retardé).** Les faits qui en font un bon candidat, sans score composite :

| Fait | Statut |
|---|---|
| Indemnité forfaitaire de 250 / 400 / 600 € selon la distance, dès 3 h de retard à l'arrivée | **FAIT, droit applicable aujourd'hui** (règlement 261/2004 et jurisprudence CJUE). Les montants sont maintenus par la réforme adoptée en juillet 2026, qui n'est **pas encore applicable** ([section 3, P1](#p1-vol-annulé-ou-retardé--indemnisation-remboursement-frais)) |
| Un marché de délégation « sans succès, pas de frais » existe déjà | **FAIT** (tarifs publics) : AirHelp prend 35 % de l'indemnité ; Flightright 20 à 30 % + TVA (27 % en standard), avec un supplément possible en cas de procédure. AirHelp revendique plus de 3,3 millions de passagers aidés (SOURCE : AirHelp) |
| Le processus est structuré et passe par écrit | **FAIT** : formulaire de la compagnie, médiateur, juge. Aucun appel n'est indispensable |
| Le résultat final est vérifiable | **FAIT** : un virement arrive, ou n'arrive pas |

Le deuxième fait est la preuve la plus solide : des consommateurs **paient déjà** une part importante de leur indemnité pour ne pas s'en occuper. C'est un comportement observé, pas une intention déclarée.

**Ce que la recherche ne démontre pas :**

- **Que les vols soient meilleurs que les colis, l'énergie ou les cautions comme premier cas.** La grille de la section 6 est descriptive, pas un classement.
- **L'ampleur du non-recours.** Le chiffre « seuls 55 % des passagers éligibles réclament » vient d'AirHelp, sans méthodologie trouvée. **Il ne doit pas servir de preuve de marché** tant que la source primaire n'est pas retrouvée.
- **Qu'un client préfère Atlas à AirHelp ou Flightright.** C'est la question centrale du test ([section 8](#8-protocole-de-test-concierge)).

### La différenciation à tester

> AirHelp résout votre problème d'**indemnisation**. Atlas prend en charge **l'incident**.

Pour un vol annulé, Atlas vérifierait à la fois le remboursement du billet et l'indemnité, retrouverait les frais engagés (hôtel, repas, transport), préparerait et enverrait chaque demande, relancerait, et vérifierait chaque paiement. Il conclurait : « C'est réglé. Vous avez récupéré 684 €. » Cette différence est une HYPOTHÈSE, **plus étroite que prévu** : les concurrents couvrent déjà une grande partie de l'incident. Voir [`EVALUATION-WEDGE-VOLS.md`](EVALUATION-WEDGE-VOLS.md).

### Le téléphone n'est pas nécessaire pour ce premier cas

INTERPRÉTATION : pour la plupart des problèmes documentés, la loi impose un canal écrit. L'agent vocal et le *smart routing* restent des hypothèses d'architecture à tester **plus tard**.

### La suite proposée : tester avant de développer

> recherche publique → cas voyage → **20 à 30 dossiers concierge** → coût réel → taux de résolution → test de paiement → **décision**

Seulement si les chiffres sont bons : concierge → automatisation → intégrations → produit Atlas.

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
- **Reddit et les forums n'ont pas pu être lus directement.** Les « traces réelles » viennent donc surtout de sources institutionnelles : rapports des médiateurs, DGCCRF, DREES, enquêtes d'associations. Elles sont plus solides en volume, mais plus pauvres en verbatim. **Recueillir des verbatims fait partie du test MVP** ([section 8](#8-protocole-de-test-concierge)).
- Certains chiffres « grand public » (abonnements oubliés notamment) viennent de blogs qui citent des études sans lien. Ils sont marqués comme peu fiables.

---

## 2. Vision et wedge : les critères de choix

**Vision (inchangée) :** Atlas est un agent d'exécution personnel qui, progressivement, règle des problèmes réels à la place de l'utilisateur, dans le périmètre de son mandat.

**Wedge :** le premier problème qui permet de commencer à construire cette vision. On ne le choisit pas parce qu'il ressemble au produit final. Voici les critères retenus pour l'évaluer. La [section 6](#6-comparaison-des-problèmes) présente les faits derrière chacun, sans les additionner en un score.

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

**Cadre juridique : ce qui s'applique aujourd'hui et ce qui s'appliquera plus tard**

Atlas pourrait un jour prendre des décisions juridiques automatiquement. La distinction entre droit en vigueur et droit futur est donc indispensable.

| | **Droit applicable aujourd'hui** | **Réforme adoptée, pas encore applicable** |
|---|---|---|
| Texte | Règlement (CE) 261/2004 et jurisprudence de la CJUE | Révision du règlement : feu vert final du Conseil de l'UE le **13 juillet 2026** (FAIT, communiqué du Conseil) |
| Entrée en application | En vigueur | **12 mois et 20 jours après publication au Journal officiel** (FAIT, Conseil). Date de publication non trouvée (MANQUANT), donc application **au plus tôt vers l'été 2027** (INTERPRÉTATION) |
| Montants | 250 / 400 / 600 € | Inchangés (FAIT) |
| Seuil de retard | 3 h à l'arrivée (jurisprudence CJUE) | 3 h maintenues. Le Conseil voulait 4 à 6 h, ce qui a été rejeté (SOURCE secondaire : DLA Piper, Euronews) |
| Délai pour réclamer | Fixé par le droit national. En France, la prescription généralement retenue est de 5 ans (HYPOTHÈSE juridique **à confirmer**) | 9 mois selon des sources secondaires (**à vérifier dans le texte publié**) |
| Délai de réponse de la compagnie | Pas de délai uniforme dans le règlement actuel | 30 jours pour payer ou motiver un refus (SOURCE secondaire, à vérifier) |
| Définition de l'annulation, circonstances extraordinaires | Jurisprudence CJUE | Codifiées, avec une liste non exhaustive (SOURCE secondaire) |

**Règle pour Atlas :** tout calcul d'éligibilité doit indiquer le régime appliqué, selon la **date du vol**, et ne jamais appliquer la réforme avant sa date d'application.

**Tâche (Q1–Q5)**

- **Tâche exacte :** vérifier l'éligibilité (distance, retard à l'arrivée, cause), réclamer l'indemnité forfaitaire, le remboursement du billet ou le réacheminement, et le remboursement des frais engagés (repas, hôtel). Relancer, saisir le médiateur (Médiation Tourisme et Voyage en France), puis éventuellement le juge.
- **Fréquence :**
  - SOURCE (AirHelp, acteur intéressé, périmètre mondial, méthodologie non trouvée) : environ 13 millions de passagers par an laisseraient plus de 6 milliards de dollars d'indemnités non réclamées.
  - MANQUANT : le volume France des vols éligibles par an.
  - INTERPRÉTATION : pour un individu, c'est un événement **rare** (quelques fois par décennie pour un voyageur occasionnel). Les pics arrivent avec les grèves et l'été.
- **Étapes :** 6 à 12 selon l'escalade. Collecte des preuves (carte d'embarquement, e-mail d'annulation), calcul, formulaire compagnie, attente, relance, médiateur, procédure.
- **Temps :** MANQUANT (aucune mesure publique du temps passé par un particulier). HYPOTHÈSE : 1 à 3 h actives, étalées sur 1 à 12 mois. Le témoignage « AirHelp m'a payé 6 ans plus tard » (TravelUpdate) montre que la durée peut être extrême.
- **Acteurs :** compagnie ; agence ou OTA si le billet a été acheté par un intermédiaire ; médiateur ; DGAC (régulateur, qui ne résout pas les cas individuels, FAIT) ; tribunal.

**Enjeux (Q6–Q7)**

- **Si l'on ne fait rien :** perte de 250 à 600 € par passager éligible (FAIT), multipliée par le nombre de passagers du foyer, plus le billet et les frais non remboursés.
- **Valeur :** élevée par cas. Une famille de 4 sur un long-courrier peut récupérer 2 400 € d'indemnités.

**Existant (Q8–Q11)**

- **Comment les gens font aujourd'hui :** ils ne réclament pas, réclament seuls, ou passent par une société de réclamation.
  - SOURCE fragile (AirHelp, sondage sans méthodologie trouvée) : 55 % des passagers réclameraient. Raisons du non-recours : méconnaissance des droits (63 %), croyance de ne pas être éligible (47 %), ne pas savoir comment faire (42 %).
  - SOURCE (AirHelp, 2025) : les compagnies rejetteraient 58 % des demandes jugées éligibles par AirHelp, et 31 % resteraient sans réponse.
  - **Aucun de ces chiffres ne doit servir de preuve centrale** avant vérification de la source primaire.
- **Solutions et tarifs (FAIT, pages tarifaires publiques) :**
  - AirHelp : 35 % de l'indemnité, davantage en cas de procédure.
  - Flightright : 20 à 30 % + TVA (27 % en standard), plus 14 % en cas de procédure judiciaire, soit jusqu'à environ 50 % TVA comprise selon des sources secondaires.
  - Autres : ClaimCompass, Skycop…
  - Toutes fonctionnent en « sans succès, pas de frais ».
- **Ce qu'elles font réellement :** l'indemnité forfaitaire et le contentieux, via mandat ou cession de créance. **Corrigé :** Flightright traite aussi le remboursement du billet et le réacheminement ; AirHelp+ (abonnement) couvre les frais annexes et les bagages ; l'application AirHelp détecte les vols via Gmail et le calendrier. Détail : [`EVALUATION-WEDGE-VOLS.md` §3](EVALUATION-WEDGE-VOLS.md#3-q2--ce-quairhelp-et-flightright-prennent-réellement-en-charge).
- **Ce qui reste manuel (INTERPRÉTATION, à vérifier) :** le remboursement via une agence en ligne, la conversion d'un avoir imposé et les problèmes hors avion du même voyage. Les frais annexes et les bagages ne sont couverts que par l'abonnement AirHelp+.

**Faisabilité pour Atlas (Q12–Q15)**

- **Exécution réelle possible ?** Oui, pour tout ce qui est écrit : lecture de l'e-mail d'annulation, calcul d'éligibilité, remplissage du formulaire web de la compagnie, e-mail de relance, saisine du médiateur en ligne. Le contentieux nécessite un partenaire juridique.
- **Intégrations :** au départ, transfert de l'e-mail par l'utilisateur ; navigateur pour les formulaires ; données de statut de vol ; preuve de paiement fournie par l'utilisateur. L'agrégation bancaire DSP2 viendra plus tard.
- **Contraintes :** mandat écrit de l'utilisateur. Certaines compagnies résistent aux intermédiaires ; Ryanair a mené une bataille publique contre les « claim chasers » (SOURCE : dépôt SEC Ryanair 2017). Données personnelles (RGPD).
- **MVP minimal :** voir [section 8](#8-protocole-de-test-concierge).

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
| **AirHelp / Flightright** (UE) | Indemnité EU261, contentieux ; billet et réacheminement (Flightright) ; frais annexes et bagages (AirHelp+) ; détection des vols (application AirHelp) | Agences en ligne, avoirs imposés (à vérifier), problèmes hors avion | 20 à 30 % + TVA (Flightright) ; 35 % (AirHelp) ; supplément en cas de procédure | Les gens **paient cher** pour déléguer quand l'argent est au bout. Elles évoluent déjà vers l'incident complet |
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

> **Pourquoi il n'y a plus de score sur 40.** Une première version notait chaque problème de 1 à 5 sur 8 critères, puis additionnait les notes. Ces notes étaient des interprétations. Les additionner donnait une **fausse précision** : un point d'écart entre deux problèmes ne voulait rien dire. Le tableau ci-dessous montre à la place **les faits derrière chaque critère** et **leur solidité**.

Solidité de la preuve : **●** fait vérifiable · **◐** source intéressée ou secondaire · **○** interprétation ou manquant.

| Problème | Valeur par cas | Délégation déjà payée ? | Canal écrit | Résultat vérifiable | Principal obstacle |
|---|---|---|---|---|---|
| **P1 Vol perturbé** | 250 à 600 €/passager ● | Oui : commissions de 20 à 35 % ● | Oui ● | Paiement ● | Concurrence installée ; rareté par personne ○ |
| **P5 Colis / e-commerce** | 20 à 100 € environ ○ | Non identifiée ○ | Oui ● | Remboursement ● | Valeur faible pour financer un dossier supervisé ○ |
| **P3 Facture d'énergie** | > 2 000 € en moyenne sur les rattrapages longs ● | Non identifiée ○ | Oui, médiateur en ligne ● | Avoir ou facture corrigée ● | Rare ; analyse juridique fine ○ |
| **P6 Dépôt de garantie** | 1 à 2 mois de loyer ● | Partielle (Demander Justice) ◐ | Oui ● | Virement ● | Bailleur particulier ; données anciennes (2010) ◐ |
| **P2 Abonnements** | 5 à 50 €/mois ◐ | Faible (lettres payantes) ◐ | Souvent via le compte client ● | Arrêt du prélèvement ● | Identifiants de l'utilisateur ○ |
| **P4 Télécom** | Moyenne ○ | Gratuit via Papernest, médiateur ● | Oui ● | Facture ● | Peu de valeur à capter ○ |
| **P7 Assurance** | Très variable ● | Non ○ | Oui ● | Paiement ● | Activité réglementée, expertise ○ |
| **P8 Train** | Faible, en bons d'achat ● | Non ○ | Oui ● | Bon d'achat ● | Friction déjà faible ○ |
| **P10 Droits sociaux** | ~330 €/mois (RSA) ● | Non ○ | Compte FranceConnect ● | Versement ● | Identité, public vulnérable ○ |
| **P11 Appel générique** | Faible par appel ○ | En cours de banalisation (Google) ● | Non : téléphone ● | Difficile ○ | Commodité, peu défendable ○ |

**Ce qu'on peut en conclure (INTERPRÉTATION) :**

- P1, P5, P3 et P6 partagent la même suite d'actions : **incident → droit écrit → réclamation écrite → attente → relance → escalade → paiement vérifiable**. Le point commun n'est pas un secteur. C'est cette boucle d'exécution, réutilisable.
- **Un seul fait distingue nettement P1 : des consommateurs paient déjà 20 à 35 % de leur indemnité pour déléguer.** C'est la raison de le tester en premier. Ce n'est pas une démonstration qu'il est le meilleur point d'entrée.

---

## 7. Recommandation : ce qu'il faut tester

### L'hypothèse de wedge

**Type de problème :** « Récupérer ce à quoi on a droit après un incident. »

**Premier cas à tester :** la perturbation aérienne, traitée **comme un incident complet** : billet, indemnité, frais annexes, suivi jusqu'à chaque paiement.

**Pourquoi ce cas plutôt qu'un autre (faits, pas scores) :**

1. un consentement à payer **déjà observé** (commissions de 20 à 35 %) ;
2. une valeur par cas assez élevée pour financer un dossier supervisé par un humain pendant la phase concierge ;
3. un droit écrit et stable. Attention : le régime qui s'applique aujourd'hui n'est pas celui de la réforme de 2026 ([P1](#p1-vol-annulé-ou-retardé--indemnisation-remboursement-frais)) ;
4. un déclencheur net (l'e-mail d'annulation) et un résultat vérifiable (le virement).

**Ce qui peut invalider ce choix :**

- les clients ne voient pas de différence avec AirHelp ou Flightright ;
- il est trop difficile de trouver des dossiers ;
- le coût par dossier dépasse ce qu'on peut facturer.

Dans les deux derniers cas, la même boucle se teste sur P5, P3 ou P6.

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

- Se présenter comme « un AirHelp moins cher ». Si différence il y a, elle porte sur **l'incident complet**, pas sur le prix.
- Ajouter le téléphone avant d'avoir prouvé la boucle écrite.
- Se connecter aux comptes de l'utilisateur avec ses identifiants.
- Annoncer des taux de succès avant d'en avoir mesuré (leçon DoNotPay).
- Utiliser dans un pitch des chiffres non revérifiés (55 % de réclamants, 58 % de rejets…).

### Modèle économique : hypothèses à tester, pas à supposer

Aucun prix n'est validé. Le test compare au moins deux options :

- **Commission au résultat.** Repère marché : 20 à 35 % (FAIT).
- **Forfait par dossier remboursé en cas d'échec.** Repère : Pine AI, 2 à 10 $ par tâche (SOURCE).

La donnée qui décide est le **coût total (humain + IA) par dossier résolu**, comparé au revenu possible par dossier. Elle est **MANQUANTE**. C'est ce que le test doit produire en premier.

---

## 8. Protocole de test concierge

**C'est la prochaine étape centrale. On ne lance pas le développement du produit avant d'en avoir les résultats.**

> recherche publique → cas voyage → **20 à 30 dossiers concierge** → coût réel → taux de résolution → test de paiement → **décision**
>
> Seulement si les chiffres sont bons : concierge → automatisation → intégrations → produit Atlas.

### Ce qu'on ne construit pas pour ce test

Pas d'application mobile complète, pas d'Open Banking, pas d'agent vocal, pas d'intégrations multiples, pas de détection automatique des incidents. Pas d'accès à la boîte e-mail, à la banque ou aux comptes de l'utilisateur.

### L'offre testée

> « Atlas s'occupe de votre réclamation liée à un vol perturbé. »

Le client transfère l'e-mail d'annulation ou de retard, fournit ses justificatifs (carte d'embarquement, factures de frais) et signe un mandat simple.

### Ce qu'Atlas fait, un humain supervisant chaque dossier

1. analyse du dossier ;
2. détermination de l'éligibilité, avec le régime juridique appliqué selon la date du vol ;
3. préparation de chaque demande : billet, indemnité, frais ;
4. envoi ;
5. suivi ;
6. relances ;
7. escalade si nécessaire (médiateur ; juge via un partenaire) ;
8. vérification du résultat (preuve de paiement pour chaque somme).

**Journal obligatoire pour chaque dossier :** chaque action d'Atlas, chaque intervention humaine (qui, pourquoi, combien de minutes), chaque coût API, chaque réponse reçue. Sans ce journal, les métriques ci-dessous ne peuvent pas être calculées.

### Métriques

**A. Faisabilité**

| Métrique | Définition |
|---|---|
| % traités de bout en bout par Atlas | Dossiers clos sans intervention humaine sur le contenu, seulement la validation |
| % nécessitant une intervention humaine | Au moins une correction ou une action faite par l'humain |
| Nombre moyen d'interventions humaines | Par dossier, avec leur type (juridique, rédaction, blocage technique, contact client) |
| Temps humain par dossier | En minutes, validations comprises |

**B. Résultat**

| Métrique | Définition |
|---|---|
| % de réclamations acceptées | Acceptation écrite de la compagnie |
| % de dossiers réellement payés | **Avec preuve de paiement**. Un accord sans paiement n'est pas un succès |
| Montant récupéré | Par dossier, ventilé par poste : billet, indemnité, frais |
| Délai jusqu'au résultat | Du mandat jusqu'au paiement vérifié |

**C. Exécution**

| Métrique | Définition |
|---|---|
| Nombre d'actions effectuées par Atlas | Envois, formulaires, relances, saisines |
| Nombre de relances nécessaires | Par dossier |
| Nombre d'échecs | Actions tentées sans effet (formulaire rejeté, e-mail sans réponse, erreur d'éligibilité) |
| Nombre de dossiers bloqués | Avec la raison exacte et ce qu'il faudrait pour débloquer |

**D. Économie — la métrique la plus importante**

> **Coût total (humain + IA) pour résoudre un dossier**, comparé au **revenu potentiel d'Atlas sur ce dossier**.

- Coût humain = minutes × coût horaire retenu.
- Coût IA = tokens réels, à partir des journaux de l'orchestrateur, qui les enregistrent déjà.
- Autres coûts : envois recommandés, frais de procédure.
- Revenu potentiel = montant récupéré × taux testé, ou forfait testé.

C'est à ce moment que le modèle économique commence à exister réellement.

**E. Préférence face à l'existant — la question décisive**

**Le client préfère-t-il Atlas à AirHelp ou Flightright ?** Le marché de l'indemnisation existe déjà. Réclamer ne suffit donc pas. Pour chaque client :

- Avant le mandat : lui montrer les deux offres (Atlas : incident complet ; société de réclamation : indemnité) et noter son choix et sa raison.
- Après le résultat : « Qu'est-ce qu'Atlas a fait que vous n'auriez pas eu ailleurs ? » Réponse ouverte.
- Mesure objective : la part du montant récupéré qui vient d'autre chose que l'indemnité forfaitaire (billet, frais, bagage). Si elle est proche de zéro, la différenciation « incident complet » ne tient pas.
- Signal vers la vision : le nombre d'**autres problèmes** que le client demande spontanément à déléguer.

**F. Test de paiement**

Après le résultat, demander un paiement réel selon l'une des options (commission ou forfait), assignées alternativement. Noter le taux d'acceptation et les objections. Ce qui compte, c'est le paiement effectif, pas l'intention déclarée.

### Seuils de décision (à fixer **avant** le test)

Les seuils ci-dessous sont des propositions à discuter. Ils doivent être fixés avant le premier dossier, pour ne pas être ajustés après coup.

| Décision | Condition proposée |
|---|---|
| **Continuer vers l'automatisation** | Coût par dossier résolu nettement inférieur au revenu par dossier ; au moins 50 % des dossiers éligibles payés dans la durée du test ; au moins une partie des clients choisissent Atlas face à une société de réclamation pour une raison autre que le prix |
| **Changer de cas** (P5, P3, P6) | La boucle fonctionne, mais l'acquisition de dossiers de vols est trop rare ou trop chère |
| **Remettre en cause le wedge** | Les clients ne délèguent pas, ou ne voient aucune différence avec l'existant, ou le coût par dossier dépasse durablement le revenu |

### Limites du test

- 20 à 30 dossiers permettent de voir des ordres de grandeur, pas des taux précis.
- Les délais des compagnies et des médiateurs (plusieurs mois) peuvent dépasser la durée du test. Il faut donc suivre les dossiers ouverts au-delà.
- Des clients recrutés parmi des proches biaisent les réponses sur la préférence et le paiement.

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

1. Source primaire et méthodologie du chiffre « 55 % des passagers réclament » (AirHelp), et plus largement volume France des vols éligibles et taux de réclamation.
1. Date de publication au Journal officiel de la réforme EU261, donc sa date d'application exacte (12 mois et 20 jours après).
1. Délai de prescription applicable en France aux demandes d'indemnisation (droit actuel), à confirmer juridiquement.
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
- Flightright, liste de prix : https://www.flightright.fr/liste-de-prix · https://www.flightright.com/costs
- Euronews, application 12 mois après publication : https://www.euronews.com/my-europe/2026/07/22/air-passengers-rights-airlines-have-12-months-to-adopt-new-rules
- Tarifs AirHelp / Flightright (sources secondaires) : https://www.airhelp.fr/blog/meilleur-site-indemnisation-vol-france/ · https://oiseaurose.com/vol-retarde-ou-annule-indemnisation-flightright/
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
