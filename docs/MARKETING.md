# Marketing — mécaniques et campagnes

Troisième couche, après `POSITIONNEMENT.md` (ce qu'on dit) et
`PLAN-COMMERCIAL.md` (où et dans quel ordre). Ici : **comment**, avec des
mécaniques prises sur des campagnes qui ont réellement fonctionné, et ce
qu'on en retient compte tenu d'un budget de zéro.

---

## 1. Ce que la campagne PPI nous apprend

Entre 2017 et 2019, la FCA britannique a mené la plus grande campagne de
réclamation de l'histoire européenne : faire savoir aux consommateurs
qu'ils pouvaient réclamer sur des assurances mal vendues, avant une date
butoir fixée au 29 août 2019. Budget : **42,2 M£**, une tête animatronique
d'Arnold Schwarzenegger, un seul message — *« DO IT NOW »*.

Les résultats disent quelque chose de très précis :

- **8,9 millions de réclamations** dans les 14 mois précédant l'échéance ;
- **1,4 million sur le seul dernier mois** ;
- jusqu'à 5,1 millions de réclamations attribuées à la campagne et à la date
  butoir.

**Ce qu'on en retire.** Dans le recouvrement, la date butoir n'est pas *un*
argument, c'est **le** moteur. Un sixième des réclamations de deux années
entières sont arrivées dans les trente derniers jours.

Or nous avons mieux qu'une date butoir collective : **une date butoir
personnelle**, calculée par dossier, propre à la juridiction du vol. « Il
vous reste 9 mois, au-delà du 14 mai 2027 ce droit s'éteint » est
infiniment plus fort que « dépêchez-vous ». Aucun concurrent ne l'affiche.

**L'avertissement, tout aussi important.** Pendant cette campagne, la part
des réclamations déposées directement par les consommateurs est passée de
**45 % à 55 %**. L'urgence pousse à faire soi-même. Une échéance ne doit
donc jamais être servie seule : toujours accolée à *« et vous ne
relancerez personne »*. Sinon on finance la concurrence — et le
bricolage.

---

## 2. Ce que Wise nous apprend, et ce qu'il faut ignorer

En juin 2014, plus de cent personnes ont défilé à 7 h 30 dans la City de
Londres, dévêtues, « Nothing To Hide » peint sur le corps, contre les frais
cachés des banques. Couverture presse massive.

**À ignorer.** Le coup a été monté par une agence, avec des figurants, trois
jours après une levée de 25 M$. Ce n'est pas une tactique de démarrage,
c'est une tactique d'après-levée. La copier maintenant coûterait cher pour
un seul jour de visibilité.

**À reprendre, et c'est la moitié gratuite** : le **Board of Shame** —
Wise publiait les publicités des banques et brokers dissimulant leurs
frais. Pas un argumentaire : les mots de l'adversaire, tels quels.

Nous pouvons faire exactement cela, avec une matière que **personne d'autre
ne possède**.

### Le mur des refus

Chaque réponse de compagnie enregistrée dans `/admin` comporte un champ
`motif_invoque` : le motif de refus **recopié tel quel**, sans
reformulation. C'était présenté comme une donnée d'exploitation. C'est
aussi le meilleur actif de contenu du projet.

Une page publique, alimentée par ces motifs :

> **« Circonstance extraordinaire : conditions météorologiques »**
> — Ryanair, vol FR8342, refusé le 12 mars.
> Or ce jour-là aucun autre vol au départ de Beauvais n'a été retardé.
>
> **« Grève de notre personnel navigant »**
> — invoqué 4 fois. Une grève du propre personnel de la compagnie n'est
> pas une circonstance extraordinaire : l'indemnisation reste due.

Pourquoi c'est fort :

- **Ce sont leurs mots, pas les nôtres.** On ne se vante pas, on cite.
- **C'est unique.** Aucun concurrent ne publie ses refus ; ils publient
  leurs succès.
- **C'est gratuit.** Sous-produit de l'exploitation quotidienne.
- **Ça se référence tout seul.** « Air France refus indemnisation météo »
  est exactement ce que tape quelqu'un qui vient d'être refusé — et cette
  personne est le client le plus qualifié qui existe.
- **C'est cohérent** avec le seul positionnement qu'on ait : ne pas mentir.

**Règle de publication, non négociable :** aucun motif n'est publié sous le
seuil de `EFFECTIF_MIN_POUR_PUBLIER` dossiers pour la compagnie concernée,
et aucun élément identifiant un passager n'apparaît jamais. Ni nom, ni
date de vol précise si le vol est peu fréquenté.

---

## 3. La boucle de partage — livrée

Le canal gratuit qui compte, et il est ici exceptionnellement bien ciblé :
**les autres passagers du même vol**. Un vol annulé, ce sont 180 personnes
qui croient toutes, à tort, n'avoir droit à rien — et qui sont éligibles au
même montant, avec la même échéance.

Ce qui est en place :

- un bloc de partage sur le verdict, formulé *« Prévenez les autres
  passagers »* — altruiste, pas parrainage ;
- un message pré-rempli contenant **le numéro de vol**, donc immédiatement
  reconnaissable par le destinataire ;
- partage natif mobile (là où sont les groupes de discussion), repli
  presse-papiers, et WhatsApp en direct ;
- une **vignette de lien générée par vol** : un lien nu se fait ignorer dans
  une conversation de groupe, un lien portant « Vol AF1380 perturbé ? » ne
  se fait pas ignorer.

**Aucune prime de parrainage, et c'est un choix.** Une récompense
transformerait un geste utile en démarchage, et abîmerait la seule chose
qui nous distingue. Wise et Alan ont grandi au bouche-à-oreille sans
acheter la recommandation.

---

## 4. La campagne « grève », étape par étape

C'est l'application de tout ce qui précède à un événement réel.

| Moment | Action | Actif |
|---|---|---|
| J+0, 1 h | Qualifier l'origine (personnel de la compagnie / externe) | `config/greves.ts` |
| J+0, 3 h | Publier la page de l'événement | `/greve/<slug>` |
| J+0 → J+2 | Porter le message correctif | commentaires presse, groupes de voyageurs |
| J+2 → J+7 | Chaque vérificateur devient un relais | bloc de partage |
| J+30 | Mesurer, ne pas retoucher | `/admin` |

**Le message, une seule phrase, jamais une promesse :**

> « La compagnie vous a peut-être dit que non. Elle a tort : une grève de
> son propre personnel n'est pas une circonstance extraordinaire. »

On ne dit pas « nous récupérons votre argent ». On corrige une erreur. La
différence est celle entre une publicité qu'on ignore et une information
qu'on relaie.

---

## 5. Le calendrier des actifs

Par ordre de rapport valeur/effort, sans budget.

| Actif | État | Effet |
|---|---|---|
| Échéance personnelle par dossier | **fait** | le moteur n°1 selon la campagne PPI |
| Comparatif en euros au verdict | **fait** | répond à « pourquoi vous » |
| Partage entre passagers + vignette | **fait** | seul canal gratuit qui compose |
| Pages d'événement (grèves) | **fait**, registre vide | acquisition ciblée |
| Statistiques publiques par compagnie | **fait**, s'allume à 10 dossiers | preuve que personne d'autre n'a |
| **Mur des refus** | à construire | l'actif de contenu le plus fort |
| Témoignages réels | vide par défaut | dès les premiers dossiers |

---

## 6. Ce qu'on mesure

Quatre chiffres, une revue par semaine. Sans eux, tout ce document n'est
qu'une opinion.

1. **Vérifications → dossiers signés.** Si ce taux s'effondre, le problème
   est au verdict, pas à l'acquisition.
2. **Part des dossiers venant d'un partage.** C'est la santé du seul canal
   qui compose.
3. **Dossiers par page de grève.** Décide si le runbook mérite d'être
   répété.
4. **Délai médian de paiement par compagnie.** Devient l'argument
   commercial n°1 dès dix dossiers.

---

## 7. Ce qu'on ne fait pas

- **Pas de coup d'éclat.** Le stunt Wise suivait une levée de 25 M$ et une
  agence événementielle. À notre échelle, un jour de visibilité sans
  conversion.
- **Pas de publicité payante.** ~88 € bruts par dossier gagné ne financent
  pas un clic dont le prix est fixé par des acteurs à budget marketing à
  huit chiffres.
- **Pas de prime de parrainage.** Voir §3.
- **Pas de chiffre publié sous dix dossiers par compagnie.** Le seuil est
  codé en dur, pas laissé à l'appréciation du moment.
