# Plan commercial — les 90 premiers jours

Suite opérationnelle de `docs/POSITIONNEMENT.md`. Ce document ne parle pas
de vision : il dit quoi faire lundi matin, dans quel ordre, et à quoi on
renonce.

**Objectif unique du trimestre : encaisser vingt commissions et remplir
`reponses_compagnie`.** Pas de croissance, pas de notoriété. Vingt dossiers
menés jusqu'au virement valent plus que dix mille visiteurs, parce qu'ils
transforment nos affirmations en chiffres.

---

## 1. Le principe d'allocation

À zéro client, l'erreur classique est d'ouvrir cinq canaux à la fois et de
n'en faire aucun sérieusement. On classe donc par **délai jusqu'à la
première commission**, pas par taille d'audience.

| Rang | Canal | Coût | Délai | Effet cumulatif |
|---|---|---|---|---|
| 1 | Entourage direct | 0 € | jours | Aucun — mais c'est le seul test réel du produit |
| 2 | **Grèves** (tête de pont) | 0 € | jours | Fort : chaque grève laisse une page indexée |
| 3 | SEO programmatique déjà en ligne | 0 € | 3 à 6 mois | Fort |
| 4 | Communautés de voyageurs | 0 € | jours | Faible, et fragile |
| 5 | Publicité payante | élevé | immédiat | Nul |

### Pourquoi la publicité payante est exclue

Une commission moyenne se situe autour de 22 % de 400 €, soit **88 € bruts
par dossier gagné**. En tenant compte des dossiers perdus, des refus et du
délai d'encaissement, le coût d'acquisition supportable est de l'ordre de
**15 à 20 € par dossier signé**. Sur des requêtes où AirHelp et Flightright
enchérissent depuis dix ans avec un budget marketing à huit chiffres, ce
prix n'existe pas.

Ce n'est pas une question de prudence, c'est de l'arithmétique. On n'achète
pas ce trafic — on le mérite ou on le prend là où ils ne regardent pas.

---

## 2. Le runbook grève

C'est l'actif opérationnel du plan. Une grève est un événement daté et
public qui crée, en quelques heures, une population de milliers de
personnes qui cherchent toutes la même réponse — et qui croient presque
toutes, à tort, ne pas y avoir droit.

**La fenêtre de recherche se referme en une semaine.** Tout le runbook est
conçu pour tenir dans les 24 premières heures.

### J+0, dans l'heure : qualifier l'origine

Une seule question, et elle décide de tout :

- **Personnel de la compagnie** (pilotes, PNC, personnel au sol de la
  compagnie) → l'indemnisation est **due**. C'est de la gestion normale de
  l'entreprise, y compris quand la grève est annoncée et syndiquée.
- **Contrôle aérien, personnel d'aéroport tiers, autre** → **à vérifier**.
  Généralement retenu comme circonstance extraordinaire, mais pas pour tous
  les vols de la période.

Cette qualification est encodée dans `perspectiveIndemnisation()`
(`config/greves.ts`). Elle ne dit jamais « non » : un refus affiché sur une
page publique dissuaderait des passagers dont le dossier mérite l'examen.

### J+0, dans les trois heures : publier la page

Ajouter une entrée dans `config/greves.ts` :

```ts
{
  slug: "greve-pnc-air-france-mars-2026",
  titre: "Grève des personnels navigants Air France",
  dateDebut: "2026-03-10",
  dateFin: "2026-03-12",
  origine: "PERSONNEL_COMPAGNIE",
  compagnies: ["AF"],
  aeroports: ["CDG", "ORY"],
  source: "https://…", // article de presse — obligatoire
}
```

Déployer. La page `/greve/<slug>` est en ligne, référencée au sitemap en
priorité 0.9 et rafraîchissement quotidien. Elle disparaîtra d'elle-même
du sitemap au bout d'un an (délai de prescription le plus court d'Europe).

**La source est obligatoire.** Sans elle, on publierait une page qui
affirme à des milliers de gens qu'ils ont droit à quelque chose, sans
qu'aucun ne l'ait. Le test `config/greves.test.ts` le vérifie.

### J+0 à J+2 : le message

Un seul, et il ne se vante pas — **il corrige une erreur** :

> « La compagnie vous a peut-être dit que non. Elle a tort. Une grève de son
> propre personnel n'est pas une circonstance extraordinaire. »

Où le porter : commentaires sous les articles de presse locale, groupes de
voyageurs, réponses aux passagers qui se plaignent publiquement à la
compagnie. Une réponse utile, une seule mention du lien, jamais deux fois
au même endroit.

### J+30 : mesurer, puis archiver

Si la page n'a produit aucun dossier, ne pas la retoucher : la garder
indexée coûte zéro et le trafic de longue traîne arrive plus tard.

---

## 3. Les vingt premiers dossiers

Comme Zillmer en 2013 : **à la main, pour des gens qu'on peut nommer.**

**Semaines 1–2 — cinq dossiers dans l'entourage.** Le but n'est pas le
chiffre d'affaires, c'est de faire passer le pipeline complet en conditions
réelles : verdict, mandat signé, envoi à la compagnie, réponse, virement,
facture. Chaque blocage rencontré ici est un blocage qu'on n'aura pas
devant un inconnu.

**Semaines 3–12 — quinze dossiers par les grèves.** Uniquement des
compagnies en tier `ACCEPT` (`config/airline-policy.ts`) : elles paient
vite, et la trésorerie ne permet pas de financer six mois de relances avant
la première commission.

**Règle absolue : répondre en moins de 24 h, toujours**, y compris pour
dire « rien de neuf, la compagnie n'a pas encore répondu ». C'est le
produit, pas le service après-vente. Le silence est la faute que nous
reprochons à tout le secteur.

---

## 4. Les trois messages

Ne jamais confondre celui qui fait venir et celui qui fait signer.

**Acquisition** — on corrige une croyance fausse.
> « Grève du personnel Air France les 10–12 mars ? Ce n'est pas une
> circonstance extraordinaire. 250 à 600 € vous sont dus. Vérifiez en une
> minute, sans compte. »

**Conversion** — on répond à « pourquoi vous plutôt que moi ». Le bloc
`RepartitionMontant` le fait déjà en euros, pas en pourcentage : *vous
gardez 312 €, contre 260 € chez AirHelp.* S'y ajoutera automatiquement,
dès dix dossiers par compagnie, le taux de refus réel et le délai médian.

**Rétention** — on tient la promesse et on la rend visible. C'est là que se
gagne le bouche-à-oreille, seul canal gratuit qui tienne à l'échelle.

---

## 5. Le tableau de bord hebdomadaire

Tout est déjà sur `/admin`. Une revue par semaine, quatre chiffres :

1. **Dossiers transmis** — le seul volume qui compte. Un dossier signé mais
   non transmis ne vaut rien.
2. **Sans réponse à ce jour** — c'est la file de relance. Si elle grossit
   deux semaines de suite, on a dépassé notre capacité : arrêter l'entrée.
3. **Délai médian de paiement** — deviendra l'argument commercial n°1.
4. **Commission encaissée** — la seule preuve que le modèle fonctionne.

---

## 6. Le plafond de capacité

Le positionnement promet un **comportement**, pas une fonctionnalité. Un
comportement coûte du temps chaque semaine.

Budget à vérifier dès les premiers dossiers, puis à corriger avec les
chiffres réels : un dossier en cours demande de l'ordre de **15 minutes par
mois** de suivi effectif (relance, lecture de la réponse, information du
client). À deux, avec quatre heures hebdomadaires consacrées à
l'exploitation, cela plafonne autour de **quarante dossiers actifs** pour
le premier trimestre.

**Au-delà : fermer l'entrée, pas baisser la qualité.** Cinquante dossiers
mal suivis produisent exactement le silence que nous reprochons aux autres,
avec la circonstance aggravante de l'avoir dénoncé par écrit. Le tier
`WAITLIST` existe pour la trésorerie ; il sert aussi de robinet.

---

## 7. Ce qu'on ne fait pas ce trimestre

- Pas de publicité payante (§1).
- Pas de nouvelle fonctionnalité produit tant que les vingt dossiers ne
  sont pas encaissés. Le code est prêt ; ce qui manque, ce sont des clients.
- Pas d'ouverture à d'autres pays. Une tête de pont étroite bat un marché
  large — c'est ce qui a fait Alan.
- Pas de taux de succès publié sous dix dossiers par compagnie. Le seuil
  est codé en dur, pas laissé à l'appréciation du moment.
- Pas de dossier sur une compagnie en tier `REJECT`, même gagnable. La
  trésorerie prime tant qu'il n'y a pas de trésorerie.
