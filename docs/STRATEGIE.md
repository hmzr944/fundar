# Stratégie de lancement d'Atlas — version 1

État au 24 septembre 2026. Tous les chiffres de marché viennent de sources publiques citées en fin de document. Les chiffres marqués **(hypothèse)** ne sont pas vérifiés et doivent être remplacés par les résultats réels dès les premières semaines.

## 1. Décision

**Atlas V1 = un service de réponse aux appels d'offres publics pour TPE et PME, produit avec l'IA, relu par un humain, vendu au dossier.**

- Le client envoie le dossier de consultation (DCE) d'un marché public.
- Atlas analyse le DCE, liste les pièces à fournir, repère les pièges et prépare le dossier et le mémoire technique.
- Le fondateur relit, complète avec les informations de l'entreprise et livre.
- Le client signe et dépose lui-même sa réponse sur la plateforme de l'acheteur.

Atlas (le logiciel) est l'outil de production interne. L'espace client reste disponible, mais **ce qui se vend, c'est le résultat livré**, pas un abonnement logiciel.

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

| Offre | Contenu | Délai | Prix |
| --- | --- | --- | --- |
| Analyse de DCE | Synthèse du marché, critères et pondération, dates limites, liste des pièces à fournir, points de vigilance, questions à poser à l'acheteur, avis « y aller / ne pas y aller » argumenté | 1 jour ouvré | 149 € HT |
| Dossier complet | Analyse + liste des pièces administratives avec aide au remplissage + mémoire technique rédigé à partir des informations de l'entreprise + relecture de conformité finale | 3 jours ouvrés | 790 € HT |
| Pack 3 dossiers | 3 dossiers complets, à utiliser sous 6 mois | 3 jours ouvrés par dossier | 1 990 € HT |

- **Offre de lancement** : la première analyse de DCE est offerte (les concurrents logiciels offrent aussi une première analyse ; c'est la porte d'entrée).
- **Positionnement prix** : environ deux fois moins cher qu'un accompagnement de consultant, plus cher qu'un logiciel mais sans travail de rédaction pour le client.
- **Condition** : DCE reçu au moins 7 jours avant la date limite de remise des offres.
- **Ce qui n'est pas vendu** : le dépôt de l'offre, la signature, une garantie de gain, un conseil juridique.

### Objectif de revenu (hypothèse de travail)

- 8 dossiers complets par mois × 790 € = **6 320 € HT/mois**.
- Coût d'IA : quelques euros par dossier (mesuré lors de la validation : environ 0,20 $ par mission ; un DCE complet en demandera plusieurs, **à mesurer**).
- Contrainte réelle : **le temps de relecture et de rédaction du fondateur** (hypothèse : 3 à 5 h par dossier complet avec Atlas). À mesurer dès le premier dossier ; si ce temps dépasse 8 h, revoir le prix à la hausse.

## 4. Acquisition — les 30 premiers jours

Aucun entretien préalable : **la prospection est le test**.

1. **Semaine 1 — préparation**
   - Créer la structure juridique (micro-entreprise suffit pour démarrer), un compte bancaire, un outil de facturation.
   - Déployer Atlas (voir « Mise en production » du README) et renseigner `ATLAS_CONTACT_EMAIL`.
   - Choisir **deux secteurs** où les TPE répondent souvent : par exemple nettoyage, espaces verts, second œuvre du BTP, prestations informatiques, formation.
   - Extraire des DECP la liste des entreprises de ces secteurs **ayant déjà remporté un marché** (elles savent ce qu'est un appel d'offres et en ont le besoin).
2. **Semaines 2 à 4 — prospection**
   - Chaque jour ouvré : repérer dans le BOAMP 3 à 5 appels d'offres ouverts dans ces secteurs ; écrire à 20 entreprises du secteur, avec un message personnalisé citant un marché en cours et proposant l'**analyse offerte** de ce DCE.
   - Relancer une fois après 4 jours ouvrés.
   - Chaque analyse offerte livrée se termine par une proposition de dossier complet.
3. **Calcul d'entonnoir (hypothèse, à remplacer par vos chiffres)**
   - Taux de réponse d'un e-mail B2B personnalisé : environ 3 à 8 % selon les baromètres publics.
   - Pour 400 e-mails : environ 12 à 30 réponses, dont une partie demande l'analyse offerte ; objectif : **3 à 5 dossiers payants** sur le premier mois.

Règles : e-mails B2B uniquement à des adresses professionnelles, en lien avec l'activité de l'entreprise, avec un moyen simple de se désinscrire ; aucune liste achetée sans vérification de son origine.

## 5. Critères de décision (sur des ventes, pas des opinions)

| Au bout de | Continuer si | Sinon |
| --- | --- | --- |
| 30 jours | Au moins 2 dossiers payants | Changer de secteurs cibles et de message pendant 30 jours de plus |
| 60 jours | Au moins 6 dossiers payants cumulés, et un temps moyen par dossier ≤ 5 h | Revoir le prix (hausse) ou l'offre (analyse seule, abonnement) |
| 90 jours | Au moins un client qui revient pour un deuxième dossier | Si aucune vente après 90 jours de prospection régulière : arrêter ce marché et réutiliser le moteur sur un autre type de dossier |

## 6. Risques principaux et parades

| Risque | Parade |
| --- | --- |
| Erreur dans une pièce ou un délai qui fait écarter la candidature | Relecture humaine systématique ; liste de contrôle finale ; le client valide et dépose ; conditions de vente limitant la responsabilité au prix du dossier |
| Délais très courts | Condition des 7 jours ; refuser plutôt que livrer en retard |
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
