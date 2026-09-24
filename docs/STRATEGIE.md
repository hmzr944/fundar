# Stratégie d'Atlas — point d'entrée et modèle économique

État au 24 septembre 2026. Ce document remplace la version « appels d'offres ». **Faits** = sources publiques citées en fin de document. **Hypothèses** = non vérifiées, à remplacer par les chiffres réels dès les premiers clients.

## 1. La décision

**Vision (inchangée)** : Atlas est un agent d'exécution généraliste qui fait aboutir le travail. Il comprend l'objectif, agit avec les autorisations de l'utilisateur, vérifie le résultat et signale ce qui bloque.

**Point d'entrée commercial** : **Atlas fait rentrer l'argent qu'on vous doit.** Il prend en charge les factures impayées d'une TPE, d'une PME, d'un cabinet d'avocats ou d'un cabinet comptable. Il prépare et adapte chaque relance, lit les réponses des clients et agit en conséquence (facture perdue, contestation, promesse de paiement, échéancier). Il s'arrête quand l'argent est encaissé, ou il vous dit exactement ce qui bloque.

Ce n'est pas un outil d'administration de plus : c'est la première mission complète confiée à l'agent, avec un résultat que personne ne peut contester, **l'argent reçu**.

## 2. Pourquoi ce point d'entrée (faits)

| Constat | Source |
| --- | --- |
| Retard de paiement moyen en France : 14,1 jours en 2025 ; moins d'une entreprise sur deux (45 %) paie ses fournisseurs à l'heure | Altares, 2025 |
| Les délais clients dégradent en moyenne de 17 jours la trésorerie des PME ; montée des retards de plus de 30 jours | Banque de France, Observatoire des délais de paiement ; synthèses sectorielles |
| 30 % des TPE-PME jugent leur trésorerie difficile ; la faiblesse de la demande est la première difficulté citée (61 %) | Bpifrance Le Lab, baromètre TPE-PME |
| La complexité administrative est un frein pour 62 % des dirigeants ; 28 % y passent au moins 2 jours par semaine | Synthèses publiées par Qonto et independant.io (sources secondaires) |
| Les outils de relance existants coûtent de 69 €/mois (LeanPay, 2 utilisateurs) à 300–1 500 €/mois (Upflow) ; les logiciels de facturation proposent des relances automatiques simples | Pages et comparatifs éditeurs |

**Pourquoi c'est le bon premier terrain pour un agent (déduction)** :

- **Tout le monde est concerné** : artisans, PME, cabinets d'avocats (honoraires), cabinets comptables (honoraires et clients). Aucune spécialisation métier n'est nécessaire pour démarrer.
- **La valeur se mesure en euros encaissés**, pas en « temps gagné » théorique.
- **Le cycle d'exécution complet est présent** : comprendre la situation de chaque facture, agir (relancer), lire la réponse, adapter, **vérifier** (paiement reçu = preuve externe), gérer les blocages (litige, facture égarée, client injoignable). C'est exactement la vision.
- **L'écart avec l'existant est précis** (hypothèse à vérifier chez les clients) : les outils actuels envoient des **séquences de modèles**. Ils ne lisent pas la réponse du client et n'agissent pas selon son contenu. C'est là que l'agent apporte quelque chose.

**Ce qui n'est pas prouvé** : que les entreprises choisiront Atlas plutôt que la relance intégrée gratuite de leur outil de facturation ; la part de factures réellement encaissées grâce à Atlas. Le premier mois de clients le mesurera.

## 3. Le produit, par paliers (chaque palier est vendable)

| Palier | Ce qu'Atlas fait | État |
| --- | --- | --- |
| 1. Préparer | L'utilisateur importe ses factures impayées (PDF ou export CSV de son logiciel). Atlas établit pour chaque client la situation, le bon ton et la séquence de relances (amiable, ferme, mise en demeure), rédige chaque message avec les références exactes de la facture, et prépare les réponses aux objections. L'utilisateur envoie, puis déclare le paiement reçu. | **Disponible** avec le moteur actuel (documents, livrables, étapes « à faire par vous », preuves) |
| 2. Agir avec permission | Connexion à la boîte e-mail de l'utilisateur : Atlas envoie **depuis son adresse et en son nom**, après accord, lit les réponses et propose l'action suivante | À construire **dès que 10 clients paient** le palier 1 |
| 3. Vérifier seul | Connexion au logiciel de facturation ou au relevé bancaire : Atlas constate le paiement et clôt la facture lui-même | Après le palier 2 |
| 4. Élargir | Même boucle pour les devis sans réponse (réponse directe au problème n° 1, la demande), puis d'autres suivis « qui traînent » | Selon les demandes observées |

Chaque palier réutilise le même cœur (mission, plan, preuves, statut honnête), qui est le socle de l'agent généraliste.

## 4. Le modèle économique : entrer bas, prouver, puis ajuster

| Formule | Prix | Pour qui |
| --- | --- | --- |
| Découverte | **Gratuit** : 5 factures prises en charge, sans carte bancaire | Voir Atlas travailler sur ses vraies factures |
| Solo | **19 € HT/mois**, sans engagement, jusqu'à 30 factures suivies par mois | Indépendants, TPE, petits cabinets |
| Équipe | **49 € HT/mois**, sans engagement, jusqu'à 150 factures, 3 utilisateurs | PME, cabinets d'avocats et d'expertise comptable |

- **Garantie de résultat** : si, après 60 jours, les factures suivies par Atlas n'ont pas rapporté au moins le montant de l'abonnement payé, il est remboursé. Le risque est pour Atlas, pas pour le client.
- **Pourquoi c'est sain** :
  - le coût d'IA par facture suivie est de l'ordre de quelques centimes par mois (hypothèse, à mesurer : environ 0,20 $ par mission en validation) ;
  - l'hébergement est de quelques dizaines d'euros par mois ;
  - la marge brute est donc très élevée dès les premiers clients, sans service humain à assurer.
- **Positionnement prix** : sous LeanPay (69 €), très loin d'Upflow, au niveau d'un assistant IA grand public. **Le prix n'est pas l'argument** : l'argument, c'est l'argent encaissé, visible dans le tableau de bord.
- **Pas de commission sur les sommes récupérées** : l'argent va directement du client débiteur à l'utilisateur, et Atlas reste un logiciel (voir risques).
- **Revoir les prix après 3 mois**, sur la base mesurée : montant moyen encaissé par client et par mois. Une hausse ne se justifie que si ce montant la rend évidente.

Objectif de revenu (hypothèse) : 300 clients Solo et Équipe, soit environ 7 000 à 9 000 € HT de revenu mensuel récurrent. C'est plus long à atteindre qu'un service, mais c'est sain, sans heures humaines vendues, et chaque client améliore le produit.

## 5. Acquisition

1. **Les cabinets comptables comme prescripteurs** : ils voient chaque jour les impayés de leurs clients et en ont eux-mêmes. Leur proposer l'offre Équipe gratuite pendant 3 mois contre la recommandation à leurs clients.
2. **Contenu utile et vérifiable** : modèles de relance conformes (indemnité forfaitaire de 40 €, pénalités de retard pour les professionnels ; règles différentes pour les particuliers), publiés gratuitement, avec « faites-le faire par Atlas » en bas de page.
3. **L'offre Découverte** comme seul appel à l'action : 5 factures, sans carte bancaire.
4. **Mesure hebdomadaire** : inscriptions, factures importées, relances envoyées, montants déclarés encaissés, passage au payant, résiliations.

## 6. Critères de décision (sur des comportements réels)

| Au bout de | Continuer si | Sinon |
| --- | --- | --- |
| 30 jours | Au moins 30 comptes Découverte ayant importé des factures | Revoir le message et le canal |
| 60 jours | Au moins 10 clients payants, et des montants encaissés déclarés sur au moins la moitié d'entre eux | Revoir le produit (qualité des relances, simplicité de l'import) |
| 90 jours | Résiliation mensuelle < 10 % et garantie de remboursement déclenchée chez moins de 1 client sur 5 | Si personne ne paie après 90 jours : conserver le moteur, changer de point d'entrée (devis sans réponse, demandes entrantes) |

## 7. Risques

| Risque | Parade |
| --- | --- |
| Réglementation du recouvrement pour le compte d'autrui (assurance, convention, compte dédié, contrôle du procureur : articles R124-1 à R124-7 du code des procédures civiles d'exécution) | Atlas reste un **logiciel** : messages envoyés au nom et depuis l'adresse de l'utilisateur, fonds versés directement à l'utilisateur, aucune commission sur les sommes récupérées. **À faire confirmer par un juriste avant le lancement.** |
| Règles différentes selon que le débiteur est un professionnel ou un particulier | L'agent demande ou déduit la qualité du débiteur et n'applique l'indemnité forfaitaire et les pénalités professionnelles qu'aux professionnels ; aucune menace hors du cadre légal |
| Concurrence des relances intégrées aux logiciels de facturation | Se différencier par la lecture des réponses et l'adaptation ; le mesurer (factures débloquées après une réponse du client) |
| Erreur dans un montant ou une référence | Montants et numéros repris uniquement des documents importés, avec citation ; aucun envoi sans validation de l'utilisateur au palier 1 |
| Données personnelles des débiteurs | Minimisation, purge automatique (180 jours), suppression à la demande (déjà en place) |

## 8. À faire par le fondateur

- [ ] Révoquer toute clé exposée ; configurer la nouvelle clé dans l'hébergeur avec un plafond de dépense.
- [ ] Faire valider le cadre juridique (section 7) et rédiger conditions générales et politique de confidentialité.
- [ ] Déployer (README, « Mise en production ») et renseigner `ATLAS_CONTACT_EMAIL`.
- [ ] Tester une mission de relance réelle sur des factures fictives avant d'ouvrir les inscriptions.
- [ ] Mettre en place le paiement des abonnements (outil de paiement en ligne) quand les premiers comptes Découverte arrivent.

## Sources

- Retards de paiement 2025 : [Altares](https://www.altares.com/2025/09/17/retards-de-paiement-des-entreprises-en-france-une-degradation-record-en-2025/) ; [Banque de France, rapport de l'Observatoire des délais de paiement](https://www.banque-france.fr/fr/communiques-de-presse/le-rapport-annuel-de-lobservatoire-des-delais-de-paiement-appelle-maintenir-la-vigilance-quant-aux) ; [synthèse Affacturage.fr](https://www.affacturage.fr/guide/barometre-delais-paiement-france/)
- Difficultés des TPE-PME : [Bpifrance Le Lab, baromètre TPE-PME](https://lelab.bpifrance.fr/barometre-tpe-pme-apres-une-annee-2025-difficile-lhorizon-seclaircit-timidement-pour-2026-2/) ; [Qonto](https://qonto.com/fr/blog/tpe-pme/croissance/statistiques-pme) ; [independant.io](https://independant.io/chiffres-statistiques-tpe-pme/)
- Outils de relance et prix : [LeanPay](https://www.leanpay.io/entreprises/pme) ; [comparatif Plateya](https://www.plateya.fr/blog/detail/comparatif-logiciels-de-recouvrement-2026-le-guide-ultime) ; [comparatif Swim](https://www.swim.legal/blog/meilleur-logiciel-de-recouvrement-creances-2026-comparatif) ; [Libeo](https://libeo.io/fonctionnalites/factures-clients)
- Prix des assistants e-mail IA (12 à 40 $/utilisateur/mois) : [Slashy](https://www.slashy.com/blog/compare/ai-email-clients-compared-2026-slashy-superhuman-shortwave-fyxer-gmail) ; [Dupple](https://dupple.com/learn/best-ai-email-writers)
- Recouvrement amiable pour le compte d'autrui : [Légifrance, articles R124-1 à R124-7 du code des procédures civiles d'exécution](https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000025024948/LEGISCTA000025938360/)
