# Positionnement Volia

Document de travail. Il ne décrit pas ce que nous aimerions être, il décrit
ce que les données disponibles rendent défendable **aujourd'hui, à zéro
client**. Il devra être réécrit au vingtième dossier, quand nos propres
chiffres remplaceront les hypothèses.

---

## 1. Le constat qui fonde tout

Tout le secteur se bat sur le pourcentage de commission. 35 % chez AirHelp,
~36 % chez Flightright, 30 % chez Skycop et AirAdvisor, 25 % chez les moins
chers. Chacun se présente comme le moins cher ou le plus efficace.

**Or ce n'est pas de ça que les clients se plaignent.**

En lisant les avis publics sur AirHelp, Flightright et FlightHelp, la
plainte dominante n'est ni le prix ni l'échec : c'est **le silence**. Des
mois sans nouvelle. Un « nous sommes en négociation avec la compagnie »
suivi de rien. Des clients qui écrivent qu'ils se sentent « fantômisés »,
que leur dossier a été « oublié ». Un dossier abandonné pour preuve
insuffisante — annoncé au bout de trois mois. Des factures de commission
envoyées tardivement, sur un ton comminatoire.

Autrement dit : **un client qui a payé 35 % et reçu son argent est content.
Un client qui n'a rien payé et n'a rien su pendant quatre mois vous déteste.**

C'est la blessure ouverte du secteur, et personne ne la soigne parce que
tout le monde regarde le prix.

> **Le prix n'est pas notre promesse. C'est notre preuve de bonne foi.
> Notre promesse, c'est que vous ne vous demanderez jamais où en est votre
> argent.**

---

## 2. Ce que les gagnants ont fait — à leurs débuts uniquement

Ce qu'AirHelp fait avec 16 millions de clients ne nous apprend rien. Ce
qu'ils ont fait à zéro client, si.

### AirHelp, 2013 — il a commencé à la main

Henrik Zillmer a vécu le problème lui-même, puis a traité les dossiers
**de ses collègues, de ses amis et de sa famille, un par un**, avant de
comprendre que c'était un modèle. Bootstrap, informel, depuis Bali.

**Ce qu'on en retient :** les vingt premiers dossiers se font à la main,
pour des gens qu'on peut nommer. Pas de plateforme d'abord, des clients
d'abord.

**Ce qu'on en retient aussi, en négatif :** dès la première année ils ont
lancé huit pays et cinq langues. Cette course à l'échelle est
vraisemblablement la cause directe du reproche qu'on leur fait aujourd'hui —
l'impersonnalité. Nous n'irons pas vite en largeur.

### Wise, 2011 — ils ont testé la phrase, pas le slogan

Wise n'a pas inventé son message : il l'a **trouvé en écoutant les mots que
les clients employaient pour recommander le service à leurs amis**. Le
message gagnant n'était pas « nous sommes moins chers ». C'était celui qui
parlait de **l'agacement envers les banques et leurs frais cachés**. Il
convertissait nettement mieux que tous les autres.

Ils ont aussi affiché un tarif ridiculement simple — 1 £ fixe — et publié
le taux réel. En 2012, ils traitaient 10 M£. C'est petit. Ils grandissaient
par le bouche-à-oreille, pas par la publicité.

**Ce qu'on en retient, en trois points :**

1. **Désignez un adversaire que les gens détestent déjà.** Pas le
   concurrent — l'incumbent. Pour Wise c'était les banques. Pour nous ce
   n'est **pas AirHelp** (personne ne le déteste, la plupart ne le
   connaissent pas) : **c'est la compagnie aérienne qui répond
   « circonstance extraordinaire » en espérant que vous laissiez tomber.**
2. **Le tarif doit être compréhensible en une seconde.** 22 %, jamais plus,
   y compris en contentieux. Pas de majoration, pas d'astérisque.
3. **N'écrivez pas votre accroche. Récoltez-la.** Au vingtième client,
   demandez-leur littéralement comment ils nous ont décrits à quelqu'un
   d'autre. Cette phrase devient le titre du site.

### Alan, 2016 — ils ont commencé étroit

Alan est parti d'un constat simple : les gens voient l'assurance santé
comme un mal nécessaire, géré par des institutions en qui ils n'ont pas
confiance. Ils ont attaqué **les startups et les PME d'abord**, pas le
marché entier, et ont fait de la transparence radicale leur bannière.
Croissance par bouche-à-oreille.

**Ce qu'on en retient :** une tête de pont étroite bat un marché large. Et
dans une catégorie où la défiance est l'émotion par défaut, la transparence
n'est pas un argument parmi d'autres — c'est le produit.

---

## 3. Les quatre erreurs du secteur, et notre contre-mesure

Chaque contre-mesure existe déjà dans le code. C'est la condition pour
avoir le droit de les revendiquer.

| L'erreur | Ce que ça produit | Notre contre-mesure |
|---|---|---|
| **Le silence.** « En négociation », puis rien pendant des mois. | Le client se sent oublié. Il ne recommandera jamais. | Le tableau de bord distingue « Dossier reçu » de « Réclamation transmise », et une file de notifications part à **chaque** changement de statut. La route d'envoi **refuse** de passer un dossier en cours si l'email à la compagnie n'est pas parti. |
| **Le refus annoncé trop tard.** Trois mois pour dire « preuves insuffisantes ». | Le client a perdu du temps *et* le droit d'agir seul entre-temps. | Le moteur peut répondre `REVIEW_MANUEL` ou `INELIGIBLE` immédiatement, gratuitement, sans compte. On dit non tout de suite. |
| **La majoration cachée en contentieux.** 35 % qui deviennent 50 %. | Le client découvre le vrai prix au pire moment. | 22 %, taux stocké **par dossier** dans la base : celui qui figure sur le mandat signé est celui qui s'applique, définitivement. |
| **Le verdict derrière un formulaire.** Il faut donner son email pour savoir. | Le service ressemble à une collecte d'adresses. | `/check` répond avec un numéro de vol et une date. Le compte n'apparaît qu'à la signature du mandat. |

---

## 4. Le positionnement

> Pour le passager d'un vol perturbé en Europe qui pense, à tort ou à
> raison, qu'il n'y a rien à faire,
> **Volia** obtient l'indemnisation que la loi prévoit, **sans qu'il ait à
> relancer qui que ce soit et sans qu'il ait à se demander où en est son
> dossier**.
> Là où les services existants prennent 35 % et laissent quatre mois sans
> nouvelles, Volia prend 22 % quoi qu'il arrive, montre l'état réel du
> dossier à chaque étape, et publie ses propres statistiques par compagnie —
> y compris les mauvaises.

### La hiérarchie des messages

Ne pas confondre le message qui **fait venir** et le message qui **fait
signer**. C'est l'erreur la plus courante et elle coûte cher.

| Moment | Question du client | Message |
|---|---|---|
| **Acquisition** (SEO, réseaux, terrain) | « Est-ce que j'ai de l'argent à récupérer ? » | On corrige une croyance fausse : *« Grève du personnel Air France ? Ce n'est pas une circonstance extraordinaire. Vous avez droit à 250 à 600 €. »* |
| **Conversion** (page de verdict) | « Pourquoi vous, plutôt que moi tout seul ? » | Les chiffres réels : délai médian, taux de refus d'entrée de la compagnie concernée. Puis 22 %, et « vous ne relancerez personne ». |
| **Rétention / recommandation** | « Est-ce que je le dirais à un ami ? » | Le fait qu'on ne les ait pas laissés sans nouvelle. C'est là que se gagne le bouche-à-oreille, seul canal gratuit qui tienne. |

---

## 5. La tête de pont : les grèves

Plutôt que « tous les vols perturbés en Europe », attaquer un segment
étroit où trois avantages se cumulent :

1. **Une grève est un événement daté, massif et public.** Des milliers de
   passagers identifiables, perturbés le même jour, cherchant la même
   information dans les mêmes heures.
2. **La quasi-totalité d'entre eux croit à tort ne pas avoir droit.** Une
   grève **du personnel de la compagnie** n'est pas une circonstance
   extraordinaire : le dossier est dû. Une grève des contrôleurs aériens,
   externe, l'est généralement. Cette distinction est déjà encodée
   (`estCirconstanceExtraordinaireDeclaree`) et déjà expliquée sur les pages
   `/[aéroport]/greve-indemnisation`.
3. **C'est le message d'acquisition idéal** : il ne se vante pas, il corrige
   une erreur. Exactement la mécanique Wise — l'adversaire est la compagnie
   qui laisse croire que non.

Le reste (retards simples, annulations) continue d'exister, mais ne
consomme aucun effort marketing tant que la tête de pont n'a pas produit
ses vingt dossiers.

---

## 6. Les mots

**À dire**

- « Vous ne relancerez personne. »
- « 22 %, même si ça se complique. »
- « Si nous échouons, vous ne devez rien — et vous saurez pourquoi. »
- « Une grève du personnel n'est pas une circonstance extraordinaire. »

**À bannir** (en plus des interdits déjà listés dans le README : « avocat »,
« robot lawyer », « IA juridique », « garantie de gain »)

- **« Jusqu'à 600 € »** en titre. C'est le cliché du secteur, et c'est une
  promesse que le barème dément dans la majorité des cas.
- **« Simple et rapide »**. Tout le monde l'écrit, donc personne ne le lit.
- **« Leader », « révolutionner », « nouvelle génération »**. À zéro client,
  c'est une invitation à vérifier.
- **Tout taux de succès** tant que l'effectif ne le permet pas. Le seuil est
  codé en dur : `EFFECTIF_MIN_POUR_PUBLIER = 10` par compagnie.

---

## 7. Les 90 premiers jours

1. **Les vingt premiers dossiers à la main**, comme Zillmer. Entourage,
   puis grèves. Objectif : encaisser une première commission et remplir
   `reponses_compagnie`.
2. **Répondre en moins de 24 h, toujours**, même pour dire « rien de neuf ».
   C'est le produit, pas le service client.
3. **Au vingtième client, poser une seule question** : « comment nous
   avez-vous décrits à la personne à qui vous en avez parlé ? » La réponse
   devient le titre de la page d'accueil. On ne l'invente pas.
4. **Publier les chiffres dès qu'ils sont publiables** — y compris un
   mauvais taux. C'est ce qui rend tout le reste croyable.

---

## 8. Ce qui ferait échouer ce positionnement

Ce positionnement est une promesse **de comportement**, pas de
fonctionnalité. Une fonctionnalité tient toute seule ; un comportement
coûte du temps tous les jours.

Le seul vrai risque : **accepter plus de dossiers qu'on ne peut en tenir au
courant.** Cinquante dossiers et deux personnes, c'est le silence garanti —
et le silence, quand on a promis le contraire, est bien plus destructeur que
de n'avoir rien promis du tout. Nous deviendrions exactement ce que nous
reprochons aux autres, avec la circonstance aggravante de l'avoir écrit.

**Donc : plafonner l'entrée avant de plafonner la qualité.** Le tier
`WAITLIST` de `config/airline-policy.ts` existe pour la trésorerie ; il
servira aussi à ça.
