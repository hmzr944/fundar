# Les vols perturbés méritent-ils d'être le premier wedge d'Atlas ?

> Suite de [`RECHERCHE-WEDGE.md`](RECHERCHE-WEDGE.md). Date : 25 septembre 2026.
> Mêmes conventions : **FAIT** · **SOURCE** (acteur intéressé ou source secondaire) · **INTERPRÉTATION** · **HYPOTHÈSE** · **MANQUANT**.
> Même limite de collecte : la plupart des pages ont été lues via des extraits de moteur de recherche. Les chiffres doivent être revérifiés avant toute décision.

> **Suite :** l'offre horizontale est retenue comme hypothèse principale. Les vols et les colis deviennent des catégories de comparaison. Protocole détaillé : [`PROTOCOLE-TEST-HORIZONTAL.md`](PROTOCOLE-TEST-HORIZONTAL.md).

---

## Sommaire

0. [Réponse courte](#0-réponse-courte)
1. [Le cadre : de la vision au premier wedge](#1-le-cadre--de-la-vision-au-premier-wedge)
2. [Ce qu'un premier wedge doit apporter à la vision](#2-ce-quun-premier-wedge-doit-apporter-à-la-vision)
3. [Q2 — Ce qu'AirHelp et Flightright prennent réellement en charge](#3-q2--ce-quairhelp-et-flightright-prennent-réellement-en-charge)
4. [Q3 et Q4 — Ce qui resterait différenciant, et la valeur de « tout l'incident »](#4-q3-et-q4--ce-qui-resterait-différenciant-et-la-valeur-de--tout-lincident-)
5. [Q1 — Les vols : bon ou mauvais premier wedge ?](#5-q1--les-vols--bon-ou-mauvais-premier-wedge-)
6. [Q5 — Les autres wedges B2C qui suivent le même schéma](#6-q5--les-autres-wedges-b2c-qui-suivent-le-même-schéma)
7. [Q6 — Test minimal pour comparer les hypothèses sans développer](#7-q6--test-minimal-pour-comparer-les-hypothèses-sans-développer)
8. [Ce qui est corrigé dans le rapport précédent](#8-ce-qui-est-corrigé-dans-le-rapport-précédent)
9. [Sources](#9-sources)

---

## 0. Réponse courte

**Réponse à la question « les vols méritent-ils d'être le premier wedge ? » : non, pas seuls, en l'état des preuves.**

Les vols sont un **bon banc d'essai** pour la boucle d'exécution d'Atlas. Mais c'est un **point d'entrée faible pour la vision**, pour quatre raisons :

1. **La différenciation « tout l'incident » est plus étroite que prévu.**
   - Flightright traite déjà l'indemnité, le remboursement du billet et le réacheminement (FAIT, site Flightright).
   - AirHelp couvre, via son abonnement AirHelp+, les bagages et les frais annexes (SOURCE). Son application détecte aussi les vols via Gmail, le calendrier ou la carte d'embarquement (SOURCE, site AirHelp).
   - Le premier rapport affirmait qu'elles « ne traitent qu'une ligne de l'incident ». **C'était inexact.**
2. **Hors indemnité, la valeur supplémentaire est faible en euros dans le cas courant.** Repas, hôtel et transport local pèsent peu face aux 250 à 600 € d'indemnité. La vraie valeur ajoutée potentielle se concentre sur des **cas particuliers** : billet acheté via une agence en ligne (OTA), avoir imposé à la place du remboursement, cumul avec d'autres problèmes du voyage (INTERPRÉTATION).
3. **L'événement est rare pour une personne.** Il ne crée pas la relation récurrente dont a besoin un agent généraliste : l'utilisateur ne revient pas, donc ne délègue pas autre chose.
4. **La preuve de consentement à payer vaut pour la délégation d'une indemnité, pas pour Atlas.** Qu'AirHelp facture ses clients ne dit ni qu'Atlas ferait mieux, ni que l'utilisateur lui confierait autre chose ensuite.

**Ce qui serait plus utile à la vision (HYPOTHÈSE à tester) :** comparer, avec un même test sans développement, trois façons d'entrer :

| Hypothèse | Entrée | Ce qu'elle teste pour la vision |
|---|---|---|
| **A. Vertical « vols »** | Un incident rare, de forte valeur, où des concurrents existent | La boucle d'exécution, et la préférence face à AirHelp |
| **B. Vertical fréquent** (colis et commandes en ligne) | Un incident fréquent, de faible valeur, sans concurrent qui exécute | La répétition et la relation dans le temps |
| **C. Horizontal « Règle ça pour moi »** | N'importe quel litige **écrit** avec une entreprise, avec de l'argent en jeu | **La vision elle-même** : les gens délèguent-ils des problèmes hétérogènes, et Atlas peut-il les traiter ? |

La [section 7](#7-q6--test-minimal-pour-comparer-les-hypothèses-sans-développer) décrit le test : pages d'offre comparables, dépôts de **vrais dossiers**, traitement concierge, mêmes métriques. Il ne demande aucun développement.

**Ma recommandation (INTERPRÉTATION) :** faire de **C** l'hypothèse principale, avec **A** et **B** comme témoins.
- Si C obtient autant de dossiers réels que A ou B, et que ces dossiers sont traitables, c'est la vision qui est validée, pas seulement un marché.
- Si C échoue (dossiers trop hétérogènes, ou personne ne sait quoi confier à un agent « généraliste »), alors on choisit un vertical, en connaissance de cause.

---

## 1. Le cadre : de la vision au premier wedge

```
VISION
  Atlas, agent d'exécution personnel généraliste : « Règle ça pour moi. »
  Comprendre → obtenir l'information → planifier → agir avec permission →
  attendre → relancer → escalader → vérifier → rendre compte honnêtement.
        │
        ▼
PROBLÈME GÉNÉRAL
  « Je rencontre une friction dans ma vie et je veux qu'un agent s'en occupe
    jusqu'à ce que le problème soit réellement résolu. »
        │
        ▼
SOUS-ENSEMBLE ACCESSIBLE AUJOURD'HUI (INTERPRÉTATION)
  Frictions où : un droit ou une règle écrite existe · le canal est écrit ·
  le résultat est vérifiable de l'extérieur · pas besoin des identifiants
  de l'utilisateur.
        │
        ▼
WEDGES CANDIDATS
  Vols · colis et commandes en ligne · abonnements et prélèvements ·
  factures d'énergie · cautions · frais bancaires · démarches liées à
  un déménagement · « tout litige écrit » (horizontal)
        │
        ▼
PREMIER WEDGE À TESTER  ← objet de ce document
```

Le wedge est un **moyen** : il sert à apprendre à exécuter, à gagner la confiance des utilisateurs et à financer la suite. **Il ne définit pas le produit.**

---

## 2. Ce qu'un premier wedge doit apporter à la vision

Le premier rapport évaluait les wedges comme des marchés (valeur, fréquence, concurrence). Pour la vision, il faut aussi se demander **ce que le wedge apprend et construit**. Critères proposés (INTERPRÉTATION) :

| # | Critère | Question |
|---|---|---|
| V1 | **Boucle complète** | Le cas exerce-t-il toute la chaîne : attendre, relancer, escalader, vérifier ? |
| V2 | **Relation récurrente** | L'utilisateur reviendra-t-il assez souvent pour confier *autre chose* ? |
| V3 | **Généralisation** | Les briques construites servent-elles pour d'autres frictions, ou sont-elles spécifiques au cas ? |
| V4 | **Confiance** | Le cas permet-il de gagner la confiance nécessaire à des mandats plus larges (e-mail, banque) ? |
| V5 | **Différence défendable** | Atlas y apporte-t-il quelque chose que l'existant n'apporte pas ? |
| V6 | **Économie de l'apprentissage** | La valeur par cas finance-t-elle un dossier supervisé par un humain ? |
| V7 | **Risque** | Le cas expose-t-il à un risque juridique ou de réputation disproportionné ? |

**Un point de tension clé :**
- **V6** (valeur par cas) favorise les incidents rares et chers : vols, énergie, caution.
- **V2** (relation récurrente) favorise les incidents fréquents et peu chers : colis, abonnements.

Aucun vertical ne satisfait les deux. C'est l'argument principal pour tester aussi l'hypothèse **horizontale**, qui peut combiner les deux chez un même utilisateur.

---

## 3. Q2 — Ce qu'AirHelp et Flightright prennent réellement en charge

### Tableau de couverture

| Poste de l'incident | Flightright (offre standard) | AirHelp (offre standard) | AirHelp+ (abonnement) |
|---|---|---|---|
| Indemnité forfaitaire (250 à 600 €) | **Oui** (FAIT) | **Oui** (FAIT) | **Oui**, sans commission (SOURCE) |
| Remboursement du billet (annulation, retard > 5 h) | **Oui**, service dédié (FAIT, page « ticket refund ») | Partiel : déclassement de classe (SOURCE) | MANQUANT |
| Remboursement d'un réacheminement payé par le passager | **Oui** (SOURCE, page Flightright) | MANQUANT | MANQUANT |
| Repas, hôtel, transport local (droit à l'assistance) | **Non** (SOURCE, page Flightright) | Non, sauf incident couvert (SOURCE) | **Oui**, assistance au remboursement (SOURCE) |
| Bagage perdu, retardé, endommagé | **Non** (SOURCE, page Flightright) | Non | **Oui** (SOURCE) |
| Détection automatique des vols | MANQUANT | **Oui** : Gmail, calendrier, carte d'embarquement (SOURCE, page de l'application) | Oui |
| Contentieux | Oui, supplément de 14 % (FAIT, grille tarifaire) | Oui, frais de procédure (FAIT) | Sans frais (SOURCE) |
| Vérification que l'argent est arrivé | Oui pour les sommes qui transitent par eux (ils encaissent puis reversent) — INTERPRÉTATION | Idem | Idem |

Prix d'AirHelp+ (SOURCE, extraits de recherche) : de 29,99 à 99,99 €/an selon le niveau en Europe, et de 179,99 à 249,99 $/an aux États-Unis. Certains niveaux incluent des **versements forfaitaires rapides** (par exemple 100 à 200 € en cas de retard de plus de 3 h) qui s'apparentent à de l'**assurance**.

### Ce que cela change (INTERPRÉTATION)

- Les sociétés de réclamation **ne sont plus mono-tâches**. Elles s'étendent vers l'incident complet et vers la détection automatique. **C'est la trajectoire qu'Atlas imaginait, sur ce vertical précis.**
- Leur modèle a un avantage structurel : elles **encaissent l'argent** puis le reversent. La vérification du paiement est donc intégrée à leur modèle, et elles prélèvent leur commission à la source.
- Ce qu'elles ne font pas, d'après les sources consultées :
  - les problèmes **hors vol** du même voyage : hôtel réservé à destination, location de voiture, train ou événement manqué ;
  - le remboursement **via une agence en ligne** quand la compagnie a remboursé l'agence mais que l'agence ne reverse pas (MANQUANT : vérifier si Flightright le traite) ;
  - la conversion d'un **avoir imposé** en remboursement (MANQUANT) ;
  - tout ce qui n'est **pas un voyage en avion**.

### Traces de friction qui persistent malgré ces services

- FAIT (Médiation Tourisme et Voyage, rapport 2024) : **24 597 saisines (+33,6 %)**, dont **65,5 % pour des billets d'avion seuls**, soit environ 16 100 dossiers aériens. Ce sont des personnes qui sont allées **jusqu'au médiateur**, souvent sans passer par une société de réclamation (INTERPRÉTATION).
- FAIT (Cour des comptes européenne, rapport spécial 15/2021) : pendant la pandémie, des compagnies ont imposé des avoirs et remboursé bien au-delà des 7 jours légaux. Seize compagnies ont ensuite pris des engagements.
- FAIT (Commission européenne, 2023) : eDreams ODIGEO, Etraveli et Kiwi.com s'engagent à reverser les remboursements sous 7 jours après réception, soit 14 jours au total. Avant cela, **aucun délai légal ne s'appliquait aux intermédiaires**.

Ces traces montrent que **le remboursement via intermédiaire et les avoirs imposés** sont des points de friction documentés. Ils ne sont pas clairement couverts par les sociétés de réclamation.

---

## 4. Q3 et Q4 — Ce qui resterait différenciant, et la valeur de « tout l'incident »

### Décomposition de la valeur d'un incident type (ordres de grandeur, HYPOTHÈSES)

| Poste | Montant typique | Fréquence dans un incident | Qui le traite déjà |
|---|---|---|---|
| Indemnité forfaitaire | 250 à 600 €/passager | Si éligible (retard ≥ 3 h, hors circonstances extraordinaires) | AirHelp, Flightright… |
| Remboursement du billet | Prix du billet, parfois plusieurs centaines d'euros | Seulement si le passager renonce au voyage | Compagnie (7 jours) ; Flightright ; **difficile via une agence en ligne** |
| Repas, rafraîchissements | 10 à 50 € | Fréquent en cas de retard | AirHelp+ seulement |
| Hôtel, transport vers l'hôtel | 80 à 200 € | Si nuit forcée | AirHelp+ seulement |
| Bagage | Jusqu'à environ 1 700 $ (plafond de la Convention de Montréal) | Occasionnel | AirHelp+ |
| Frais indirects (hôtel à destination perdu, location, événement) | Variable, parfois élevé | Occasionnel | **Personne, et souvent non récupérable juridiquement** (HYPOTHÈSE à vérifier) |

MANQUANT : aucune donnée publique sur la répartition réelle de ces postes. C'est **une mesure centrale du test**.

### Réponse à Q4 : le modèle « Atlas règle tout l'incident » apporte-t-il une valeur réellement différente ?

**En euros : probablement peu, dans le cas courant (INTERPRÉTATION).**
- L'indemnité représente l'essentiel de la valeur récupérable. Elle est déjà bien servie.
- Les frais annexes sont faibles, et AirHelp+ commence à les couvrir.
- Le gain existe dans des cas **identifiables à l'avance** : billet via agence en ligne, avoir imposé, famille avec frais importants, bagages. Ce sont des niches, pas le cas moyen.

**Hors euros : peut-être, mais non démontré (HYPOTHÈSE).**
- **Un interlocuteur unique** pour tout le voyage (vol, hôtel, location, assurance voyage, carte bancaire), plutôt qu'un spécialiste par poste.
- **La vérification honnête** : « voici ce qui a été obtenu, ce qui a échoué, et pourquoi ».
- **La continuité** : le même agent s'occupera du prochain problème, qui ne sera pas un vol.

Ce troisième point est la **vraie** différence d'Atlas. Mais il **ne se manifeste pas dans un vertical « vols »** : il ne peut apparaître que si l'utilisateur confie ensuite *autre chose*. D'où l'intérêt de l'hypothèse horizontale.

### Réponse à Q3 : ce qui resterait différenciant pour Atlas

| Élément | Différenciant face aux sociétés de réclamation ? | Commentaire |
|---|---|---|
| Réclamer l'indemnité | **Non** | Marché servi, concurrents expérimentés et outillés pour le contentieux |
| Détection automatique | **Non** | AirHelp le fait déjà |
| Frais annexes et bagage | **Faiblement** | AirHelp+ le propose sur abonnement |
| Agence en ligne et avoirs imposés | **Oui, plausiblement** | Friction documentée, couverture non identifiée chez les concurrents (à vérifier) |
| Problèmes hors avion du même voyage | **Oui** | Hors du périmètre des concurrents. Mais la valeur récupérable est souvent faible juridiquement |
| Même agent pour des problèmes non liés au voyage | **Oui, fortement** | C'est la vision. Ce n'est pas un attribut du wedge « vols » |
| Transparence sur l'échec et l'état du dossier | **Possiblement** | À comparer à l'expérience réelle des clients d'AirHelp (MANQUANT : avis structurés) |

**Conclusion (INTERPRÉTATION) :** sur le vertical « vols », Atlas n'aurait qu'une différence **étroite** (agences en ligne, avoirs) ou **extérieure au vertical** (généralisme). Il entrerait en concurrence avec des acteurs qui encaissent l'argent eux-mêmes, font du contentieux à grande échelle et évoluent déjà vers l'incident complet.

---

## 5. Q1 — Les vols : bon ou mauvais premier wedge ?

Critères de la [section 2](#2-ce-quun-premier-wedge-doit-apporter-à-la-vision), appréciation qualitative, sans score.

| Critère | Vols | Justification |
|---|---|---|
| V1 Boucle complète | **Favorable** | Attente, relance, médiateur, juge, paiement : tout y est |
| V2 Relation récurrente | **Défavorable** | Événement rare par personne. Aucune donnée ne montre que l'utilisateur revient |
| V3 Généralisation | **Favorable pour les briques** (mandat, envois écrits, relances, escalade, vérification) ; **défavorable pour les règles** (règlement aérien spécifique) | |
| V4 Confiance | **Moyen** | Une réussite de 400 € crée de la confiance, mais les concurrents l'obtiennent aussi |
| V5 Différence défendable | **Défavorable** | Voir section 4 |
| V6 Économie de l'apprentissage | **Favorable** | Valeur élevée par cas, consentement à payer observé (FAIT) |
| V7 Risque | **Moyen** | Droit en transition (réforme adoptée, pas encore applicable) ; compagnies hostiles aux intermédiaires |

**Bilan :**
- **Bon** pour prouver qu'Atlas **sait exécuter** une boucle complète avec un résultat vérifiable (V1, V6).
- **Mauvais** pour prouver qu'Atlas **doit exister** comme agent généraliste (V2, V5).
- Et un wedge choisi uniquement pour le premier point risque de produire exactement ce qu'il faut éviter : « Atlas pour les vols », en concurrence frontale avec AirHelp.

**Rôle recommandé pour les vols :** un **cas témoin** dans un test comparatif, et éventuellement un **canal d'acquisition ponctuel** lors des pics (grèves, été). Pas l'identité de départ.

---

## 6. Q5 — Les autres wedges B2C qui suivent le même schéma

Schéma commun : **droit ou règle écrite · canal écrit · attente · relance · escalade · résultat vérifiable**. Les faits sont repris de [`RECHERCHE-WEDGE.md`](RECHERCHE-WEDGE.md), sauf mention contraire.

| Wedge | Traces réelles (FAIT sauf mention) | Valeur / fréquence | Existant qui *exécute* | Apport pour la vision |
|---|---|---|---|---|
| **Colis et commandes en ligne** (non livré, remboursement refusé, rétractation) | 144 620 signalements « vente en ligne » sur SignalConso en 2024, 1re catégorie ; 5 668 saisines « colis » au médiateur de La Poste | Faible valeur, **haute fréquence** | Aucun identifié | Fort sur V2 (retours fréquents), faible sur V6 |
| **Abonnements et prélèvements** | Résiliation en 3 clics depuis 2023 ; amende Basic-Fit de 68 500 € ; chiffres grand public peu fiables | Faible valeur, **récurrent** | Lettres payantes, applications bancaires | Fort sur V2 et V4 (surveillance continue). Mais demande souvent les identifiants de l'utilisateur |
| **Factures d'énergie contestées** | 29 460 litiges au Médiateur national de l'énergie ; montant moyen supérieur à 2 000 € sur les rattrapages longs | **Forte valeur**, rare | Aucun rémunéré au résultat identifié | Fort sur V5 et V6, faible sur V2 |
| **Dépôt de garantie** | 34 % des litiges locatifs (SOURCE Lockli 2026) ; étude CLCV de 2010 | Forte valeur, à chaque déménagement | Demander Justice (lettres, saisine) | Moyen |
| **Frais bancaires** | Contestation possible pendant 2 ans ; commissions d'intervention plafonnées à 8 € par opération et 80 €/mois (SOURCE secondaire) ; frais d'incidents moyens de 106 € par an en 2025 (Observatoire de l'inclusion bancaire, via extrait) | Faible à moyenne, fréquente pour les publics fragiles | Lettres types | Moyen. Public sensible |
| **Déménagement** (événement de vie à frictions multiples : caution, contrats, adresse, assurances) | Papernest prouve la délégation, mais il est payé par les fournisseurs | Moyenne, **multi-acteurs** | Papernest (contrats) | **Fort sur V3** : un seul événement, plusieurs types de démarches. Proche de « tout l'incident » |
| **Horizontal : tout litige écrit avec une entreprise, avec de l'argent en jeu** | Somme des volumes ci-dessus : 310 000+ signalements SignalConso, 36 537 saisines assurance, 24 597 tourisme-voyage, 11 678 énergie, 7 417 télécom (2024) | Variable | **Aucun** (associations et médiateurs gratuits, qui n'exécutent pas pour l'utilisateur) | **Teste directement la vision** |

**Deux remarques (INTERPRÉTATION) :**

- Le **déménagement** est le meilleur exemple d'« incident complet » **hors voyage**. C'est un événement unique qui déclenche des frictions hétérogènes chez plusieurs acteurs. Il teste la différence « un agent pour tout l'événement » mieux que les vols, où les concurrents couvrent déjà la majeure partie de la valeur.
- L'**horizontal** est risqué : proposition floue, acquisition difficile, dossiers hétérogènes donc difficiles à automatiser. **Mais c'est la seule hypothèse qui teste la vision directement.** Un test concierge coûte peu pour le mesurer.

---

## 7. Q6 — Test minimal pour comparer les hypothèses sans développer

### Principe

Deux temps, sans code produit :

1. **Test de demande comparatif.** Des offres équivalentes, présentées au même public, qui demandent le **dépôt d'un vrai dossier**, pas une simple inscription.
2. **Traitement concierge** des dossiers reçus. Un humain exécute, avec Atlas actuel comme assistant (analyse de documents, rédaction). Toutes les actions sont journalisées.

On mesure des **comportements**, pas des intentions.

### Temps 1 — Test de demande (2 à 3 semaines)

**Les offres testées** (une page simple chacune, même design, même canal) :

| Variante | Promesse affichée |
|---|---|
| **A. Vols** | « Vol annulé ou retardé ? Transférez-nous l'e-mail. On s'occupe de tout, jusqu'au remboursement. » |
| **B. Achats en ligne** | « Colis jamais arrivé, remboursement qui n'arrive pas ? Transférez-nous la commande. On s'en occupe jusqu'au bout. » |
| **C. Horizontal** | « Une entreprise vous doit quelque chose et vous n'avez pas envie de vous battre ? Décrivez-nous le problème. On s'en occupe jusqu'à ce que ce soit réglé. » |
| **D. Déménagement** (optionnelle) | « Vous déménagez ? Caution, contrats, résiliations, changements d'adresse : on s'occupe de tout, jusqu'à ce que ce soit fait. » |

**Règles pour que la comparaison soit juste :**
- même budget d'acquisition par variante (MANQUANT : budget à fixer ; il suffit que chaque variante reçoive un volume de visiteurs comparable) ;
- même canal (par exemple une campagne ciblée ou un même groupe communautaire), **sans** recruter parmi les proches ;
- l'action demandée est **déposer un dossier réel** (description et pièces jointes), pas laisser un e-mail ;
- **honnêteté** : la page dit que le service est en test, traité par une équipe assistée par une IA. Cela respecte l'obligation de transparence de l'AI Act et évite de tromper des personnes qui confient un vrai problème ;
- chaque dossier reçu est **réellement traité**. C'est un concierge, pas une « fausse porte » : on ne laisse pas un utilisateur sans réponse.

**Mesures du temps 1 :**

| Mesure | Ce qu'elle révèle |
|---|---|
| Coût (ou nombre de visiteurs) par dossier réel déposé | La facilité d'acquisition de chaque entrée |
| % de dossiers **traitables** : droit identifiable, canal écrit, résultat vérifiable, sans identifiants | Si l'entrée amène des cas qu'Atlas peut vraiment régler |
| Pour C : répartition des types de problèmes déposés | **Ce que les gens veulent spontanément déléguer.** C'est la donnée la plus précieuse pour la vision |
| Pour A : part des dossiers où l'utilisateur connaissait AirHelp ou Flightright, et raison de ne pas les avoir utilisés | La préférence face à l'existant, observée au lieu d'être supposée |

### Temps 2 — Traitement concierge (6 à 10 semaines, puis suivi des dossiers ouverts)

Chaque dossier traitable passe par la boucle : analyse, éligibilité, préparation, envoi, suivi, relances, escalade, vérification du résultat. Les métriques A à D définies dans [`RECHERCHE-WEDGE.md` §8](RECHERCHE-WEDGE.md#8-protocole-de-test-concierge) s'appliquent à **chaque variante** : faisabilité, résultat, exécution, économie. On y ajoute :

| Mesure spécifique à la vision | Définition |
|---|---|
| **Taux de second problème** | % d'utilisateurs qui confient un **autre** problème, sans relance, dans les semaines qui suivent. **C'est l'indicateur principal de V2** |
| Diversité des seconds problèmes | Si elle est forte, cela confirme l'horizontal |
| Part de la valeur hors poste principal | Pour A : ce qui vient d'autre chose que l'indemnité (billet via agence, frais, avoirs). Si c'est proche de zéro, la différence « tout l'incident » ne tient pas sur les vols |
| Temps humain par dossier, **selon le type** | Montre si la variante horizontale est économiquement tenable ou si l'hétérogénéité coûte trop cher |
| Paiement effectif demandé après le résultat | Commission ou forfait, par variante |

### Règles de décision (à fixer avant le test, proposées)

| Observation | Décision |
|---|---|
| C obtient un volume de dossiers **traitables** comparable à A ou B, un taux de second problème nettement supérieur, et un coût par dossier soutenable | **Entrer par l'horizontal** : Atlas « Règle ça pour moi », limité aux litiges écrits avec une entreprise |
| C obtient des dossiers trop hétérogènes ou non traitables, mais A ou B fonctionnent | Entrer par le vertical le plus favorable **à la vision** (V2 et V3), pas forcément le plus rentable. Puis élargir par adjacence |
| A est le seul à fonctionner, et la différence face à AirHelp est nulle | **Ne pas** entrer par les vols. Garder les vols comme canal d'acquisition ponctuel. Revoir l'hypothèse de wedge |
| Aucune variante n'obtient de dossiers réels à coût raisonnable | Le problème est l'acquisition ou la promesse, pas le choix du vertical. Revoir la proposition de valeur avant toute construction |

### Ce que ce test ne fait pas

- Il ne développe rien dans le produit, et **aucune modification du code n'est nécessaire**. Des pages statiques ou un simple formulaire, et un journal partagé, suffisent.
- Il ne mesure pas l'automatisation. Il mesure si la boucle **fonctionne** et **ce qu'elle coûte avec un humain**. L'automatisation se décide après.
- Avec quelques dizaines de dossiers par variante, il donne des **ordres de grandeur**. Si deux variantes sont proches, le test ne les départage pas.

---

## 8. Ce qui est corrigé dans le rapport précédent

| Affirmation de `RECHERCHE-WEDGE.md` | Correction |
|---|---|
| Les sociétés de réclamation « ne traitent qu'une ligne de l'incident » | **Inexact.** Flightright traite aussi le remboursement du billet et le réacheminement. AirHelp+ couvre les frais annexes et les bagages. AirHelp détecte automatiquement les vols (Gmail, calendrier) |
| La différenciation d'Atlas sur les vols est « l'incident complet » | Différence **étroite** : agences en ligne, avoirs, problèmes hors avion. La différence **forte** (le même agent pour tout) ne se manifeste pas dans un vertical |
| Les vols sont le « premier cas à tester » | Ils deviennent **un cas témoin** dans un test comparatif. Hypothèse principale : l'horizontal |

`RECHERCHE-WEDGE.md` renvoie désormais à ce document.

---

## 9. Sources

- Flightright, couverture (billet, réacheminement ; pas d'hébergement, de repas ni de bagages) : https://www.flightright.com/your-rights/ticket-refund-travel-reimbursement · https://www.flightright.com/ticket-refund
- Flightright, tarifs : https://www.flightright.com/costs · https://www.flightright.fr/liste-de-prix
- AirHelp, bagages et AirHelp+ : https://www.airhelp.com/en/lost-or-delayed-luggage/ · https://www.airhelp.com/en/airhelp-plus/ · https://www.airhelp.com/en-int/airhelp-plus-terms/
- AirHelp, grille tarifaire : https://www.airhelp.com/en-int/price-list/
- AirHelp, application (Gmail, calendrier, carte d'embarquement) : https://www.airhelp.com/en-int/app/
- Revue AirHelp (couverture des frais) : https://capturetheatlas.com/airhelp-review/
- Médiation Tourisme et Voyage, rapport 2024 : https://www.inc-conso.fr/content/le-mediateur-du-tourisme-et-du-voyage-presente-son-rapport-2024 · https://clubdesmediateurs.fr/wp-content/uploads/2025/09/MTV_Rapport-annuel.pdf
- Cour des comptes européenne, rapport spécial 15/2021 : https://www.eca.europa.eu/Lists/ECADocuments/SR21_15/SR_passenger-rights_covid_EN.pdf
- Commission européenne, engagements des agences en ligne (2023) : https://france.representation.ec.europa.eu/informations/protection-des-consommateurs-les-principales-agences-de-voyage-en-ligne-sengagent-rembourser-les-2023-06-27_fr
- Droit à l'assistance (repas, hôtel) : https://www.eu261.org/
- Frais bancaires, contestation et plafonds : https://www.lesclesdelabanque.com/particulier/contester-frais-bancaires/ · https://justecourrier.fr/guides/contester-frais-bancaires-abusifs
- Méthodes concierge et Wizard of Oz : https://learningloop.io/blog/concierge-vs-wizard-of-oz
- Autres chiffres : voir les sources de [`RECHERCHE-WEDGE.md`](RECHERCHE-WEDGE.md#11-sources)
