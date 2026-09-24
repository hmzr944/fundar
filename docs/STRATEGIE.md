# Stratégie de lancement d'Atlas — version 1

État au 24 septembre 2026. Tous les chiffres de marché viennent de sources publiques citées en fin de document. Les chiffres marqués **(hypothèse)** ne sont pas vérifiés et doivent être remplacés par les résultats réels dès les premières semaines.

## 1. Décision

**Atlas V1 = un service marchés publics complet pour TPE et PME, par abonnement mensuel sans engagement.** Le client n'achète pas « une analyse de dossier » : il achète un service appels d'offres externalisé, sans embauche.

- **Trouver** : veille hebdomadaire des appels d'offres correspondant au métier et à la zone du client, avec un avis « on y va / on passe » argumenté.
- **Répondre** : analyse du dossier de consultation, pièces administratives, mémoire technique, relecture de conformité. Le tout est produit avec Atlas et relu par un humain.
- **Tenir à jour** : dossier administratif du client (attestations, assurances) suivi et renouvelé avant expiration ; calendrier des échéances.
- **Apprendre** : après chaque résultat, demande des motifs de rejet à l'acheteur (droit du candidat évincé) et corrections pour le dossier suivant ; bibliothèque de réponses enrichie à chaque dossier.
- Le client valide, signe et dépose.

Atlas (le logiciel) est l'outil de production interne. Ce qui se vend, c'est le service et son résultat.

## 2. Pourquoi ce marché, d'après les données publiques

| Critère | Ce que disent les sources | Conséquence |
| --- | --- | --- |
| Volume | 223 383 marchés publics recensés en 2024, pour 233,3 Md€ ; les PME remportent 60 % des contrats (25 % des montants) | Des dizaines de milliers de TPE/PME répondent chaque année : le besoin est récurrent par nature |
| Dépense déjà prouvée | Des consultants vendent l'accompagnement à la réponse (à partir d'environ 1 600 € HT pour un dossier standard, abonnements de 200 à 1 000 € HT/mois selon les résultats de recherche) | Les entreprises paient déjà pour ce travail : pas besoin de créer la demande |
| Concurrence logicielle | Des outils IA spécialisés coûtent 39 à 199 €/mois, certains avec analyse de DCE gratuite | On ne se bat pas sur le logiciel en libre-service : on vend du « fait pour vous », moins cher et plus rapide qu'un consultant |
| Données manipulées | Le DCE est un document public ; les informations d'entreprise (références, moyens) sont peu sensibles | Le principal frein identifié dans nos analyses (confier des données personnelles) disparaît en grande partie |
| Adéquation avec Atlas | Lecture de longs documents texte, listes de contrôle, rédaction de livrables : ce qu'Atlas fait déjà | Lancement sans nouveau développement lourd |
| Prospection | Les données essentielles de la commande publique (DECP, titulaires avec SIRET) et les avis du BOAMP sont en open data, réutilisables gratuitement | On peut cibler précisément les entreprises qui répondent déjà à des marchés, et les appels d'offres en cours |

**Ce qui n'est pas prouvé** : que ces entreprises achèteront à Atlas plutôt qu'à un consultant ou à un logiciel, ni à quel rythme. La première vente est le test.

## 3. Offre et prix

| Offre | Contenu | Prix |
| --- | --- | --- |
| Essentiel | Veille hebdomadaire + 1 dossier complet par mois + dossier administratif tenu à jour + calendrier | 490 € HT/mois, sans engagement |
| Croissance | Essentiel + 3 dossiers complets par mois + questions à l'acheteur + analyse des motifs de rejet + bibliothèque de réponses | 990 € HT/mois, sans engagement |
| Dossier à l'unité | Analyse, pièces, mémoire technique, relecture de conformité | 890 € HT |

- **Porte d'entrée** : premier échange et première analyse de marché offerts.
- **Engagement fort** : délai garanti (dossier livré au plus tard 48 h avant la date limite) ou dossier remboursé, si le dossier de consultation est reçu au moins 7 jours avant la date limite. **C'est une promesse à tenir** : refuser un dossier plutôt que risquer le retard.
- **Positionnement** : une embauche de chargé d'appels d'offres coûte bien plus qu'un abonnement ; les consultants facturent au dossier (environ 1 600 € HT selon les résultats de recherche) ; les logiciels à 39–199 €/mois laissent tout le travail au client. Atlas vend le travail fait, au prix d'un abonnement.
- **Ce qui n'est pas vendu** : le dépôt de l'offre, la signature, une garantie de gain, un conseil juridique, la fixation des prix du client.

### Objectif de revenu (hypothèse de travail)

- 6 abonnements Croissance = **5 940 € HT/mois récurrents** (18 dossiers par mois), ou un mélange Essentiel/Croissance équivalent.
- Contrainte réelle : **le temps du fondateur** (hypothèse : 3 à 5 h par dossier avec Atlas, plus environ 1 h de veille par client et par semaine). 18 dossiers × 4 h + veille ≈ 100 h/mois : c'est le plafond d'une personne seule. Au-delà, industrialiser (modèles, veille automatisée par l'API BOAMP, relecteur à temps partiel).
- Coût d'IA : quelques euros par dossier (**à mesurer** sur les premiers dossiers).

## 4. Acquisition — les 30 premiers jours

Aucun entretien préalable : **la prospection est le test**.

1. **Semaine 1 — préparation**
   - Créer la structure juridique (micro-entreprise suffit pour démarrer), un compte bancaire, un outil de facturation.
   - Déployer Atlas (voir « Mise en production » du README) et renseigner `ATLAS_CONTACT_EMAIL`.
   - Préparer le questionnaire entreprise, un modèle de mémoire technique et un tableau de suivi des attestations clients.
   - Choisir **deux secteurs** où les TPE répondent souvent : par exemple nettoyage, espaces verts, second œuvre du BTP, prestations informatiques, formation.
   - Extraire des DECP la liste des entreprises de ces secteurs **ayant déjà remporté un marché** (elles savent ce qu'est un appel d'offres et en ont le besoin).
2. **Semaines 2 à 4 — prospection**
   - Chaque jour ouvré : repérer dans le BOAMP 3 à 5 appels d'offres ouverts dans ces secteurs ; écrire à 20 entreprises du secteur, avec un message personnalisé citant un marché en cours et proposant l'**analyse offerte** de ce marché.
   - Relancer une fois après 4 jours ouvrés.
   - Chaque analyse offerte se termine par un échange de 20 minutes pour proposer l'abonnement (Croissance en premier, Essentiel en repli, dossier à l'unité en dernier recours).
3. **Calcul d'entonnoir (hypothèse, à remplacer par vos chiffres)**
   - Taux de réponse d'un e-mail B2B personnalisé : environ 3 à 8 % selon les baromètres publics.
   - Pour 400 e-mails : environ 12 à 30 réponses, dont une partie demande l'analyse offerte ; objectif : **2 abonnements ou 3 dossiers à l'unité** sur le premier mois.

Règles : e-mails B2B uniquement à des adresses professionnelles, en lien avec l'activité de l'entreprise, avec un moyen simple de se désinscrire ; aucune liste achetée sans vérification de son origine.

## 5. Critères de décision (sur des ventes, pas des opinions)

| Au bout de | Continuer si | Sinon |
| --- | --- | --- |
| 30 jours | Au moins 2 clients payants (abonnement ou dossier) | Changer de secteurs cibles et de message pendant 30 jours de plus |
| 60 jours | Au moins 3 abonnements actifs, et un temps moyen par dossier ≤ 5 h | Revoir le contenu des offres ou les prix |
| 90 jours | Au moins 3 abonnés encore actifs après leur 2e mois | Si aucune vente après 90 jours de prospection régulière : arrêter ce marché et réutiliser le moteur sur un autre type de dossier |

## 6. Risques principaux et parades

| Risque | Parade |
| --- | --- |
| Erreur dans une pièce ou un délai qui fait écarter la candidature | Relecture humaine systématique ; liste de contrôle finale ; le client valide et dépose ; conditions de vente limitant la responsabilité au prix du dossier |
| Délais très courts, délai garanti | Condition des 7 jours ; refuser plutôt que livrer en retard ; plafonner le nombre de dossiers acceptés par semaine |
| Promesses de veille et de suivi administratif tenues à la main | Au début, veille manuelle avec le site du BOAMP et tableau de suivi des attestations ; automatiser par l'API BOAMP dès 5 abonnés |
| Qualité du mémoire technique | Questionnaire entreprise standard (références, moyens, méthodes) rempli une fois et réutilisé ; Atlas rédige, le fondateur adapte |
| DCE en ZIP, tableurs (BPU, DPGF) | Atlas lit PDF, DOCX, TXT, CSV : décompresser les ZIP et convertir les tableurs en CSV avant import (limite connue de la V1) |
| Documents scannés | Pas d'OCR en V1 : les signaler au client, les traiter manuellement |
| Dépendance au temps du fondateur | Mesurer le temps par dossier dès le début ; au-delà de 10 dossiers/mois, industrialiser (modèles, sous-traitance de relecture) |

## 7. Ce qui reste à faire par le fondateur (hors code)

- [ ] Révoquer la clé Claude collée dans la conversation et en créer une nouvelle dans les paramètres de l'hébergeur, avec un plafond de dépense.
- [ ] Créer la structure juridique et rédiger des conditions générales de vente (prix, délais, responsabilité, confidentialité).
- [ ] Déployer : serveur Node persistant, PostgreSQL, volume persistant, `pnpm db:migrate`, tâche planifiée `pnpm purge`.
- [ ] Renseigner `ATLAS_CONTACT_EMAIL` et vérifier la page d'accueil.
- [ ] Préparer le questionnaire entreprise et un modèle de mémoire technique.
- [ ] Lancer la prospection (section 4) et tenir un tableau : e-mails envoyés, réponses, analyses offertes, ventes, temps passé par dossier.

## Sources

- Recensement économique de la commande publique 2024 : [economie.gouv.fr](https://www.economie.gouv.fr/daj/commande-publique/observatoire-economique-de-la-commande-publique-oecp/le-recensement), [Weka](https://www.weka.fr/actualite/commande-publique/article/recensement-des-marches-publics-les-resultats-2024-sont-connus-212163/), [Le Moniteur](https://www.lemoniteur.fr/reglementation/commande-publique-bercy-publie-enfin-les-chiffres-pour-2024.M2H5HDSYPVHYTFZPNQU2P46XEA.html), [achat-logistique.info](https://achat-logistique.info/fonction-achat/commande-publique-2332-milliards-deuros-en-2024/)
- Part des PME (60 % des contrats, 25 % des montants) : [Nextend](https://nextend.ai/actualites/actu-2026-04-21-pme-marches-publics-2024-collectivites-locales)
- Prix des logiciels IA d'appels d'offres (39 à 199 €/mois, analyses gratuites) : [Olra](https://olra.fr/blog/meilleurs-logiciels-reponse-appel-offres-2026), [DossiersGagnants](https://dossiersgagnants.fr/blog/logiciel-appel-offres-comparatif-2026.html), [Maître AO](https://www.maitre-ao.fr/fr/meilleurs-logiciels-appel-offres), [Nextend](https://nextend.ai/blog/meilleurs-logiciels-reponse-appels-offres)
- Prix de l'accompagnement par des consultants (relevés dans des résultats de recherche, pages non consultées directement : à vérifier) : [Simply AO](https://www.simply-ao.fr/blog/combien-coute-la-reponse-un-appel-doffres), [Marchés publics optimisés](https://www.marchespublicsoptimises.fr/assistance-appels-d-offres/), [Bakoé](https://bakoe.fr/marches-public/aide-reponse-marche-public/)
- Données ouvertes : [DECP consolidées sur data.gouv.fr](https://www.data.gouv.fr/datasets/donnees-essentielles-de-la-commande-publique-consolidees-format-tabulaire), [API BOAMP](https://www.data.gouv.fr/dataservices/api-bulletin-officiel-des-annonces-des-marches-publics-boamp), [BOAMP — données ouvertes](https://www.boamp.fr/pages/donnees-ouvertes-et-api/)
- Taux de réponse de la prospection B2B par e-mail : [Oplia](https://oplia.fr/fr/blog/cold-email-benchmarks-2025), [DataProspects](https://www.dataprospects.fr/barometre-de-la-prospection-b2b-en-france-2026/)
