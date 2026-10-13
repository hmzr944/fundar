# Relances d'impayés et recouvrement amiable pour TPE/PME, artisans et freelances (France, état oct. 2026)

> Méthode : la récupération directe des pages (WebFetch/curl) a été bloquée par la politique réseau de cette session. Tous les faits ci-dessous viennent donc de **résumés de moteur de recherche** pointant vers les URL citées. Les pages n'ont pas été ouvertes une à une : un prix ou un chiffre doit être revérifié sur la page source avant d'être cité tel quel dans un document public. Les points tirés de ma propre connaissance sont signalés « (connaissance, non revérifié) ».

## 1. Taille du problème en France (retards, impayés, nombre de cibles)

### Takeaway
Le problème est massif et documenté. Le retard moyen tourne autour de 12 à 15 jours selon la source, et les TPE sont plus touchées que la moyenne. La Banque de France estime que les TPE/PME disposeraient de 13 Md€ de trésorerie en plus si les paiements hors délai étaient ramenés à 60 jours. La tendance récente est toutefois à une légère amélioration (2026), et une part notable des entreprises se dit peu touchée (Intrum). La cible potentielle compte des millions d'entités, mais seule une fraction est active, facture en B2B et a des impayés récurrents.

### Cited Findings
**Observatoire des délais de paiement (Banque de France), rapport annuel 2025, remis le 23/09/2026**
- Les microentreprises et PME auraient disposé de **13 Md€** de trésorerie en plus si les paiements au-delà des délais légaux avaient été ramenés à 60 jours. Dans la même simulation, les grandes entreprises y perdraient 12 Md€ de trésorerie. — [Banque de France, communiqué](https://www.banque-france.fr/fr/communiques-de-presse/le-rapport-annuel-2025-de-lobservatoire-des-delais-de-paiement-des-resultats-contrastes-selon-les) ; [TPE Actu, 26/09/2026](https://tpeactu.fr/2026/09/26/retards-paiement-13-milliards-tpe-pme-grandes-entreprises/) ; [PDF du rapport](https://acpr.banque-france.fr/system/files/2026-09/Rapport%20de%20l'Observatoire%20des%20d%C3%A9lais%20de%20paiement%202025.pdf)
- Il s'agit d'une simulation, pas d'un montant d'impayés. L'estimation précédente (2024) était de 15 Md€, dont environ 5 Md€ imputables à l'État, aux collectivités et aux administrations ; la méthode n'est peut-être pas identique. — [TPE Actu](https://tpeactu.fr/2026/09/26/retards-paiement-13-milliards-tpe-pme-grandes-entreprises/) ; [presseagence.fr](https://presseagence.fr/paris-delais-de-paiement-les-pme-privees-de-13-milliards-de-de-tresorerie/)
- Le retard moyen s'améliore à partir du S2 2025 et atteint **13,4 jours fin 2025** (Europe : 13,3 jours). **Moins d'une grande entreprise sur deux** respecte les 60 jours. — [TPE Actu](https://tpeactu.fr/2026/09/26/retards-paiement-13-milliards-tpe-pme-grandes-entreprises/)
- Selon l'Observatoire (cité par La Gazette), un retard supérieur à 30 jours augmente de plus de 40 % la probabilité de défaillance. — [La Gazette France](https://www.lagazettefrance.fr/article/le-retard-de-paiement-facteur-de-defaillance)

**Altares**
- S1 2025 : retard moyen de **14,1 jours** (13,5 j fin 2024). Seulement **45,2 %** des entreprises paient à l'heure. Les plus petites structures dépassent 15 jours en moyenne (TPE : 15,53 j), et les organisations de plus de 1 000 salariés dépassent 20 jours. — [Altares, communiqué du 18/09/2025 (PDF)](https://www.altares.com/wp-content/uploads/ALTARES_Etude-Delais-de-Paiement-France-Europe_1er-semestre-2025-CP250918.pdf) ; [Le Journal des Entreprises](https://www.lejournaldesentreprises.com/article/les-retards-de-paiement-atteignent-plus-de-14-jours-en-france-selon-le-cabinet-altares-2126566)
- S1 2026 (publication plus récente, non ouverte) : 12,3 jours en moyenne (Europe : 13,1 j). Les PME de moins de 50 salariés sont à 11,1 jours, contre 13 jours au S1 2025. **La tendance 2026 est donc à l'amélioration.** — [résumé de recherche ; voir Option Finance](https://www.optionfinance.fr/actualites/retards-de-paiement-la-france-revient-a-une-discipline-plus-vertueuse.html)
- Environ **70 000** entreprises en procédure collective en 2025 (+3,1 %). — [Option Finance](https://www.optionfinance.fr/actualites/delais-de-paiement-et-defaillances-dentreprises-a-nouveau-en-hausse.html)
- Ellisphere, avec une autre méthode, mesure 18,08 jours de retard moyen fin septembre 2025. Pour les TPE : 71 % des factures réglées à l'échéance et 15,17 j de retard moyen. — [La Gazette France](https://www.lagazettefrance.fr/article/degradation-inquietante-des-delais-de-paiement) ; [Ellisphere fiche (PDF)](https://www.ellisphere.com/uploads/landing_pages/TutosEllipro/fiches/Fiche%20pratique%20-%20Retard%20de%20paiement.pdf)

**Intrum, European Payment Report**
- EPR 2025 : 9 150 entreprises dans 29 pays, dont plus de 400 en France. 33 % des entreprises françaises observent une dégradation des délais, et le délai moyen de règlement est de 31,04 jours. — [Intrum.fr, focus France EPR 2025](https://www.intrum.fr/solutions-entreprises/a-propos-d-intrum/actualites/toute-l-actualit%C3%A9/intrum-devoile-l-european-payment-report-2025-trois-leviers-pour-restaurer-la-confiance-economique/) ; [Le Moci](https://www.lemoci.com/actualites/actualites/risque-client-les-entreprises-europeennes-et-francaises-moins-impactees-par-les-retards-de-paiement-intrum/)
- EPR 2024 : **66 % des entreprises françaises disent ne plus être impactées** par les retards (34 % le sont encore, contre 58 % en 2020). — [Esteval](https://www.esteval.fr/article.36955.etude-intrum-66-pourcents-des-entreprises-francaises-affirment-ne-plus-etre-impactees-par-les-retards-de)
- EPR 2026 (enquête déc. 2025 à fév. 2026, chiffres relayés par un agrégateur) : 14,16 % du CA est payé en retard, et 57 % des entreprises paient en retard parce qu'elles sont elles-mêmes payées en retard. — [Rappli (agrégateur)](https://www.rappli.fr/blog/chiffres-delais-paiement-entreprises.html)
- Coface (ancien, autre méthode) : 86 % des entreprises se disent victimes de retards. — [Compta-Online](https://www.compta-online.com/retards-de-paiement-ao8160)

**Défaillances liées aux impayés**
- Environ **25 %** des défaillances seraient liées aux retards et impayés (estimation Allianz Trade). Une ancienne question parlementaire évoquait 15 000 défaillances sur 62 000. Ce sont des estimations, pas des statistiques officielles. — [La Gazette France](https://www.lagazettefrance.fr/article/le-retard-de-paiement-facteur-de-defaillance) ; [Assemblée nationale](https://www.assemblee-nationale.fr/dyn/14/questions/QANR5L14QE95833.pdf)

**Nombre de cibles**
- Fin décembre 2025 : **3,031 millions** de comptes auto-entrepreneurs (+130 000 sur un an), dont **1,66 million (55 %) économiquement actifs** (CA positif au T4 2025). Croissance : +4,5 % en 2025, après +8,0 % en 2024. — [Bpifrance Création, Observatoire AE fin déc. 2025](https://bpifrance-creation.fr/observatoire/bibliographie/auto-entrepreneurs-fin-decembre-2025) ; [TPE Actu](https://tpeactu.fr/2026/01/29/auto-entrepreneurs-chiffre-affaires-urssaf-2025/) ; [URSSAF Stat'Ur 409 (PDF)](https://www.urssaf.org/files/Statistiques/Nos%20%C3%A9tudes%20et%20analyses/Travailleurs%20ind%C3%A9pendants/Nationale/2025/Stat_Ur_409.pdf)
- Près de 975 000 AE n'ont déclaré aucun CA positif sur l'année 2025. — [TPE Actu, 27/09/2026](https://tpeactu.fr/2026/09/27/auto-entrepreneurs-sans-chiffre-affaires-declare-2025-urssaf/)
- Créations en 2025 : **1 165 800** entreprises, dont **758 600** immatriculations de micro-entrepreneurs (+6 %), record historique. — [INSEE Première n°2092](https://www.insee.fr/fr/statistiques/8721354)

### Inferences
- Les macro-chiffres (13 Md€, 13-14 jours de retard) justifient le problème dans un argumentaire, mais ils ne mesurent **pas** le volume d'impayés définitifs que le produit traiterait. Le retard moyen est en amélioration en 2026, ce qui affaiblit un peu un discours d'urgence.
- Le cœur de cible solvable est plutôt : TPE/PME de services B2B, artisans du BTP qui facturent des entreprises ou des syndics, freelances B2B. C'est probablement quelques centaines de milliers d'entités, pas 3 millions. Les clients particuliers des artisans relèvent d'un autre régime : pas d'indemnité de 40 €, et le droit de la consommation s'applique.
- La mauvaise ponctualité des grandes entreprises et du secteur public (plus de 20 jours de retard) signifie qu'une part importante des retards subis par les TPE vient de clients puissants. Une TPE ne les met pas en demeure facilement : c'est une limite à l'escalade automatique.

### Gaps
- Je n'ai pas pu ouvrir le PDF de l'Observatoire 2025 : pas de chiffres par taille (TPE vs PME), ni de part des factures payées en retard par segment.
- Pas de stock officiel d'entreprises artisanales (CMA France) ni de nombre de TPE (INSEE, catégorie « microentreprise » au sens LME ≈ 4 M+). Non trouvés dans les résultats.
- Aucune donnée de l'Ordre des experts-comptables trouvée.
- Les chiffres « 1 impayé sur 4 jamais récupéré » (attribué à Altares 2023), « la moitié des freelances ont abandonné une créance » (attribué à Malt/Ifop 2024) et « 30 % des TPE ont des processus préventifs » (attribué à la CGPME 2025) circulent sur des blogs **sans source vérifiable**. Ne pas les utiliser.

## 2. Concurrents et prix publics

### Takeaway
Le marché est **très encombré** et les prix sont bas. Une vague de micro-SaaS de relance pour TPE est vendue entre 15 et 59 €/mois. Les ERP et logiciels de facturation intègrent la relance par email. Surtout, **Société.com Recouvrement** propose déjà ce que vise le fondateur : abonnement sans commission (environ 10 à 199 €/mois), séquence automatique jusqu'à la LRAR de mise en demeure, et préparation de l'injonction de payer incluse dans ses offres supérieures. Des acteurs « agent IA » existent aussi (Billabex, Aston AI). Le modèle commission (Rubypayeur, Litige.fr, cabinets) coexiste avec des abonnements.

### Cited Findings
**A. Micro-SaaS de relance pour TPE et freelances (abonnement)**
- **Payée (payee.fr)** : Solo 19 € HT/mois (30 factures suivies, 1 utilisateur) ; Pro 39 € HT/mois (factures illimitées, connecteurs, 3 utilisateurs). Essai 15 jours. — [payee.fr](https://payee.fr/)
- **Relanzy** : Starter 29 € HT/mois, Pro 59 €, Business 99 €, sans engagement. Cible : TPE et freelances. — [relanzy.com](https://www.relanzy.com/) ; [comparatif Relanzy](https://www.relanzy.com/logiciel-relance-pme)
- **ImpayéFlow** : Starter 15 €/mois, Pro 30 €/mois. — [impayeflow.com](https://impayeflow.com/)
- **relanceo** : gratuit en phase de lancement, avec un abonnement prévu. — [relanceo.cloud](https://relanceo.cloud/)
- Autres entrants repérés, prix non relevés : Payzo, Duomind, Benit (artisans). — [getpayzo.com](https://getpayzo.com/) ; [duomind.fr](https://duomind.fr/blog/articles/relances-impayes-automatiques-tpe.html) ; [benit.fr](https://www.benit.fr/blog/relance-impayes-automatisation-relation-client-artisan)

**B. Abonnement « recouvrement sans commission » (concurrent le plus direct)**
- **Société.com Recouvrement (rec-societe.com)** :
  - « 0 % de commission ». Offres Access TPE (12 €/mois dans les données structurées, ou 120 € HT/an plus environ 70 € de frais postaux selon un exemple pour 20 000 € de créances), Business PE à 49 € et Entreprise PME à 199 €. Fourchette affichée : 0 à 199 € HT/mois.
  - Séquence automatisée avec **LRAR de mise en demeure à J+14**.
  - **Préparation de la requête en injonction de payer incluse** dans Business PE et Entreprise PME, hors frais de greffe et de signification.
  - Le prix d'Access TPE est incohérent d'une page à l'autre : à vérifier.
  - — [rec-societe.com](https://rec-societe.com/) ; [comparatif vs Rubypayeur](https://rec-societe.com/comparatifs/societecom-recouvrement-vs-rubypayeur) ; [comparatif vs LeanPay](https://rec-societe.com/comparatifs/societecom-recouvrement-vs-leanpay)

**C. Plateformes de recouvrement en ligne (commission ou mixte)**
- **Rubypayeur** :
  - Abonnement **49 € HT/mois** sans engagement.
  - Commission amiable de **10 %** (non abonné) ou **8 %** (abonné) sur la somme recouvrée, sans frais fixe. Aucune commission en cas d'échec.
  - Relances par LRAR, SMS et email, avec publication du mauvais payeur sur un annuaire public. Injonction de payer en option. Visite domiciliaire par huissier : 119 € HT, ou 99 € HT pour les abonnés.
  - — [Rubypayeur FAQ](https://rubypayeur.com/foire-aux-questions) ; [Tarification Rubypayeur](https://rubypayeur.com/blog/tarification-rubypayeur/) ; [visite domiciliaire](https://rubypayeur.com/guide/recouvrement/visite-domiciliaire) ; [Freebe](https://www.freebe.me/blog/rubypayeur-retards-paiement)
- **Litige.fr (offre entreprises)** — page possiblement ancienne :
  - Amiable avec huissier : 149 € HT (LRAR et lettre d'huissier) plus 10 % au succès. Amiable et judiciaire : 269 € HT.
  - **Abonnement illimité 199 € HT/mois** (mises en demeure, lettres d'huissier, injonctions de payer illimitées) plus 6 % au succès.
  - Frais en sus : 9 € HT par LRAR, 19 € HT par injonction, greffe 27,89 € HT.
  - — [litige.fr, injonction de payer](https://www.litige.fr/entreprises/services/recouvrement/injonction-de-payer)
- Réseaux d'huissiers et commissaires de justice : mandats de 129 € l'unité à 49 € l'unité par lot de 25, sans honoraire supplémentaire en judiciaire (Sud Créances, « kit Sérénité »). Mise en demeure par commissaire de justice dès 40 € (autre cabinet). La fourchette générale des commissions des cabinets va de 5 à 25 % des sommes recouvrées. — [sud-creances.com](https://www.sud-creances.com/tarif-degressif-des-mandats-de-recouvrements-du-kit-serenite.html) ; [Companeo](https://www.companeo.com/recouvrement-amiable-et-judiciaire/guide/combien-frais-de-recouvrement) ; [gcollect.fr](https://www.gcollect.fr/blog/factures-impayees-comment-estimer-les-frais-de-recouvrement/)

**D. Lettres juridiques à l'unité**
- LegalPlace : mise en demeure de payer **dès 6,90 €**. — [LegalPlace tarifs](https://www.legalplace.fr/tarifs/documents-juridiques)
- Captain Contrat : mise en demeure de recouvrement dès **29,90 €**, modèle en autonomie gratuit. — [Captain Contrat](https://www.captaincontrat.com/gestion-des-litiges/faire-une-mise-demeure-en-ligne)

**E. Credit management pour PME et ETI (abonnement, plus cher)**
- **Upflow** : pas de grille claire. Plan gratuit « Discover » ; plans payants d'environ 390 à 440 $/mois (Grow) et environ 880 $/mois (Scale), tarifés selon le volume facturé annuel, sans frais par siège. Cible : PME et ETI. — [upflow.io/pricing](https://upflow.io/pricing) ; [TrustRadius](https://www.trustradius.com/products/upflow/pricing)
- **LeanPay** : dès 135 €/mois selon certaines sources, 225 €/mois selon d'autres (divergence). — [Appvizer](https://www.appvizer.fr/finance-comptabilite/recouvrement/leanpay) ; [comparatif-logiciels.fr](https://www.comparatif-logiciels.fr/avis-leanpay/)
- **Aston AI** : formule PME à 345 €/mois, avec des formules à 95 € et 135 € selon GetApp 2026. Cible : PME, ETI, banques. Intégré à Pennylane. — [GetApp](https://www.getapp.com/finance-accounting-software/a/aston-itf/) ; [Appvizer](https://www.appvizer.fr/finance-comptabilite/recouvrement/aston-itclients)
- **Billabex** : « collaborateur IA » qui relance par email, SMS, courrier et téléphone. Sur devis selon son site ; d'autres sources citent 0,90 € par email ou SMS, ou un prépaiement dès 10 € HT. Relanzy (concurrent) avance un coût réel d'environ 170 €/mois. Intégré à Pennylane. — [creati.ai](https://creati.ai/fr/ai-tools/billabex/) ; [societe.tech](https://www.societe.tech/billabex-revolutionner-la-gestion-des-factures-pour-les-entreprises-modernes/) ; [Relanzy vs Billabex](https://www.relanzy.com/vs/billabex)
- **Dunforce** : le site actuel le positionne sur les impayés et le contentieux locatif du **logement social**, donc hors cible TPE. En 2020, l'abonnement Corporate coûtait 99 € plus des frais par facture (ancien). — [dunforce.com](https://www.dunforce.com/) ; [IDC France 2020 (PDF)](https://idcfrance.fr/wp-content/uploads/2020/03/DUNFORCE-PME-2020-FRA.pdf)
- Agicap : sur devis, outil de trésorerie global. — [lecomptable.fr](https://www.lecomptable.fr/quel-logiciel-permet-de-suivre-et-automatiser-le-recouvrement-des-creances-clients/)

**F. Outils de facturation et de comptabilité avec relance intégrée**
- **Pennylane** :
  - Séquences de relance email réservées aux offres Essentiel et Premium. Un client ne peut suivre qu'une séquence à la fois.
  - Les relances s'arrêtent au rapprochement bancaire (risque de relance à tort). Brouillons, devis et abonnements GoCardless ne sont pas relancés.
  - **La mise en demeure par LRAR et le judiciaire se font hors de Pennylane.**
  - — [Aide Pennylane](https://help.pennylane.com/fr/articles/18691-relancer-des-clients-automatiquement) ; [rec-societe, Pennylane et recouvrement](https://rec-societe.com/blog/pennylane-recouvrement)
- **Shine** : rappels automatiques dans son outil de facturation, désactivés par défaut. — [Shine](https://www.shine.fr/blog/relance-client-automatique/)
- **Qonto** : aucune relance automatique native trouvée dans les résultats ; passe par Pennylane ou des intégrations (à confirmer).
- **Axonaut** : dès 38,80 € HT/mois avec un engagement de 3 ans. Relance automatique, et **recouvrement par commissaire de justice** intégré. — [lecomptable.fr](https://www.lecomptable.fr/quel-logiciel-permet-de-suivre-et-automatiser-le-recouvrement-des-creances-clients/)
- **Sellsy** : dès 29 € HT/mois par utilisateur. Libeo : dès 59 € HT/mois, mais orienté paiement fournisseurs et non recouvrement clients. — [lecomptable.fr](https://www.lecomptable.fr/quel-logiciel-permet-de-suivre-et-automatiser-le-recouvrement-des-creances-clients/)

### Inferences
- Le **plafond de prix pour une TPE ou un freelance est bas** : de 15 à 50 €/mois pour la relance, environ 49 €/mois pour une plateforme avec LRAR, et la lettre à l'unité coûte entre 7 et 30 €. Un per-case fee crédible pour un dossier « mise en demeure LRAR + suivi + préparation d'injonction » se situe sans doute entre 30 et 150 €. Les points d'ancrage : Litige.fr à 149 ou 269 € HT (avec huissier), un mandat d'huissier entre 49 et 129 €.
- Le positionnement « agent qui suit et exécute la procédure écrite dans le temps, payé à l'abonnement » est **déjà occupé** par Société.com Recouvrement (marque forte et trafic SEO de Societe.com), par Litige.fr (abonnement 199 €) et par les acteurs IA (Billabex, Aston AI) présents sur la marketplace Pennylane. Il faudrait se différencier par un sous-segment : un métier, le BTP (sous-traitance, retenues de garantie, situations de travaux), les litiges contestés, ou les créances sur collectivités publiques.
- Les commissaires de justice et les plateformes de commission ont l'avantage de l'effet « tiers » sur le débiteur, qu'un outil au nom du créancier n'a pas.

### Gaps
- Je n'ai pas obtenu de prix publics pour Recouvrup, Ellipse, MonRecouvrement, Recouvrement.fr, Impayés.com, l'offre pro de Demander Justice, ou Intrum et Atradius pour les TPE. Les recherches n'ont rien remonté de fiable.
- Le prix exact d'Access TPE (Société.com) est contradictoire : 12 €/mois ou 120 €/an.
- Les prix de LeanPay et Billabex sont divergents.
- Je n'ai trouvé aucune donnée de traction (nombre de clients, chiffre d'affaires) pour ces acteurs.

## 3. Ce que la relance intégrée des outils de facturation ne fait pas (le manque restant)

### Takeaway
Les outils de facturation (Pennylane, Shine) s'arrêtent à la relance **par email**. La mise en demeure LRAR, le calcul et la réclamation des pénalités et de l'indemnité de 40 €, la gestion des contestations, la préparation de l'injonction de payer et le passage à l'huissier restent manuels, ou passent par un outil tiers ou un prestataire. Ce manque est réel, mais il est déjà couvert en partie par Société.com Recouvrement, Litige.fr, Rubypayeur et Axonaut (commissaire de justice).

### Cited Findings
- Les relances Pennylane couvrent la phase amiable par email. « La mise en demeure par lettre recommandée et la procédure judiciaire se font hors de Pennylane. » — [rec-societe, Pennylane et recouvrement](https://rec-societe.com/blog/pennylane-recouvrement)
- Limites de Pennylane : relance arrêtée au rapprochement et non au paiement réel, brouillons et devis exclus, une seule séquence par client, offres Essentiel et Premium uniquement. — [Aide Pennylane](https://help.pennylane.com/fr/articles/18691-relancer-des-clients-automatiquement)
- La mise en demeure n'est pas une condition de recevabilité de l'injonction de payer, mais elle est recommandée : elle établit le retard et justifie les intérêts. — [Kohen Avocats, 12/10/2026](https://kohenavocats.fr/2026/10/12/facture-impayee-professionnel-mise-en-demeure-penalites-injonction-payer-prescription-2026/)
- L'indemnité de 40 € et les pénalités ne sont réclamables qu'à condition d'avoir été mentionnées sur les factures et les conditions générales (selon un guide). — [mission-freelances.fr](https://www.mission-freelances.fr/blog/administratif-juridique/impayes-freelance-comment-ne-plus-les-subir-en-2026/)
  - *Remarque (connaissance, non revérifié) : en droit, l'indemnité de 40 € est due de plein droit même sans mention. L'absence de mention est sanctionnée par une amende administrative, mais ne prive pas de l'indemnité. Plusieurs sources affirment qu'elle est due dès le premier jour sans mise en demeure.* [rec-societe](https://rec-societe.com/)
- Après un titre exécutoire, seul un commissaire de justice peut exécuter (saisies). La réforme 2026 impose un délai de 2 mois après signification avant exécution. — [Kohen Avocats, décret 16/02/2026](https://kohenavocats.fr/2026/05/04/injonction-payer-2026-decret-16-fevrier-changements/)

### Inferences
- Un agent qui **lit les pièces** (devis signé, bons de livraison, PV de réception, échanges email), **qualifie la créance** (certaine, liquide, exigible ; contestée ou non), **calcule** les pénalités (BCE + 10 points), l'indemnité de 40 € par facture et la prescription, **rédige** une mise en demeure adaptée, l'**envoie en LRAR**, **suit** la réponse et **monte le dossier d'injonction** (requête et pièces) répond au manque le moins bien servi par les micro-SaaS de relance email. C'est aussi ce que font déjà, en partie, Société.com Recouvrement et Litige.fr.
- La **gestion des contestations** (réponse argumentée à un client qui conteste la qualité d'une prestation) est probablement le maillon le moins automatisé chez les concurrents. C'est là qu'un agent de type LLM a un avantage réel sur des séquences à modèles fixes. Cette inférence ne s'appuie sur aucune enquête.

### Gaps
- Aucune enquête quantifiant où les TPE « bloquent » dans le processus : relance, mise en demeure, judiciaire, ou abandon.

## 4. Willingness to pay (TPE et freelances)

### Takeaway
Pas d'enquête fiable trouvée sur la disposition à payer. Les prix observés donnent les seuls repères : 15 à 59 €/mois pour un outil de relance TPE ; environ 49 €/mois ou 8 à 10 % au succès (Rubypayeur) ; une lettre de mise en demeure entre 7 et 30 € ; un dossier huissier ou injonction entre 49 et 269 € HT. Les cabinets prennent 5 à 25 % de commission.

### Cited Findings
- Prix observés : voir section 2 (Payée, Relanzy, ImpayéFlow, Rubypayeur, Société.com Recouvrement, Litige.fr, LegalPlace, Captain Contrat, Sud Créances).
- Un blog belge estime à 100-300 €/mois HT un outil dédié pour une PME de 15 à 30 personnes ; pour une TPE de 1 à 4 personnes, un assemblage d'outils génériques « suffit ». Il s'agit d'une opinion, pas d'une donnée. — [ATTA](https://www.atta-ai.com/blog/automatiser-relance-impayes-pme-belge)
- Les frais de recouvrement amiable ne peuvent pas être mis à la charge d'un débiteur particulier. — [Selectra](https://selectra.info/finance/actualites/marche/societe-recouvrement-frais-non-dus) ; [assistant-juridique.fr](https://www.assistant-juridique.fr/frais_recouvrement.jsp)

### Inferences
- L'indemnité de 40 € par facture, plus les pénalités, peut servir d'argument : « le service se rembourse sur le débiteur ». Mais elle est rarement recouvrée en pratique (inférence), et elle n'existe pas face à un client particulier.
- Pour un freelance avec un ou deux impayés par an, un abonnement mensuel paraît peu attractif. Un **paiement au dossier** (one-shot) semble plus adapté. Pour une PME avec un flux régulier, l'abonnement se justifie. Inférence, non sourcée.

### Gaps
- Je n'ai trouvé aucune enquête CPME, OpinionWay, Malt ou Ifop vérifiable sur le temps passé en relances, la part de créances abandonnées ou le budget accepté.

## 5. Cadre juridique

### Takeaway
L'activité de **recouvrement amiable pour le compte d'autrui** est réglementée (CPCE R124-1 à R124-7) : assurance RC pro, compte dédié aux fonds reçus, déclaration au procureur, convention écrite, mentions obligatoires dans la lettre. Un **logiciel utilisé par le créancier lui-même**, avec des lettres envoyées en son nom et des paiements faits directement au créancier, n'entre a priori pas dans ce régime. L'injonction de payer peut être déposée sans avocat, en ligne via Infogreffe pour le tribunal de commerce, pour un coût de greffe d'environ 30 à 40 €. Elle a été réformée par le décret 2026-96 (applicable aux ordonnances rendues à partir du 1er septembre 2026).

### Cited Findings
**CPCE R124-1 à R124-7 (recouvrement amiable pour autrui)** — [Légifrance, chapitre IV](https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000025024948/LEGISCTA000025938360/) ; [décret 2012-783](https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000025934747)
- R124-1 : s'applique aux personnes physiques ou morales qui, « d'une manière habituelle ou occasionnelle, même à titre accessoire, procèdent au recouvrement amiable des créances pour le compte d'autrui ». Les professions réglementées en sont exclues. — [Doctrine](https://www.doctrine.fr/l/texts/codes/LEGITEXT000025024948/articles/LEGIARTI000025938362)
- Les personnes concernées doivent justifier :
  - d'une **assurance RC professionnelle** ;
  - d'un **compte bancaire réservé** à la réception des fonds encaissés pour les créanciers ;
  - de ces conditions par **déclaration écrite au procureur de la République** avant de commencer l'activité (probablement R124-2).
  - — [Légifrance, chapitre IV](https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000025024948/LEGISCTA000025938360/)
- R124-3 : **convention écrite** avec le créancier, donnant pouvoir de recevoir pour son compte. Selon une analyse de la Gazette du Palais (2026, n°11), un acte écrit unique n'est pas exigé. — [Gazette du Palais / Lextenso](https://www.labase-lextenso.fr/gazette-du-palais/2026-n11/un-peu-de-souplesse-pour-le-formalisme-en-matiere-de-recouvrement-amiable-GPL488v4)
- R124-4 : la lettre au débiteur doit mentionner l'identité du recouvreur, celle du créancier, le fondement et le montant de la créance (principal, intérêts, autres sommes, hors frais), ainsi que l'indication d'avoir à payer. L'omission est sanctionnée (contravention prévue par le chapitre). — [Kohen Avocats sur R124-4](https://kohenavocats.fr/2024/12/22/article-r124-4-du-code-des-procedures-civiles-dexecution/) ; [décret 2012-783](https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000025934747)
- Frais de recouvrement amiable : L111-8 CPCE (connaissance, non revérifié) les laisse à la charge du créancier, sauf s'ils concernent un acte dont l'accomplissement est prescrit par la loi. Ils ne peuvent pas être facturés à un débiteur particulier. — [Selectra](https://selectra.info/finance/actualites/marche/societe-recouvrement-frais-non-dus)

**Code de commerce L441-10 (B2B)**
- Indemnité forfaitaire pour frais de recouvrement de **40 €** (fixée par décret, D441-5), **par facture**, due de plein droit en cas de retard. Elle n'est pas soumise à TVA. Une indemnité complémentaire est possible sur justification si les frais réels sont supérieurs. Exemple : le TC de Pontoise a accordé 320 € pour 8 factures. — [Doctrine, TC Pontoise 2025](https://www.doctrine.fr/d/TCOM/Pontoise/2025/TCOMPA8A59E911A92F02ECCF7) ; [Companeo](https://www.companeo.com/recouvrement-amiable-et-judiciaire/guide/combien-frais-de-recouvrement)
- Pénalités de retard : à défaut de stipulation, taux BCE (refinancement) **majoré de 10 points**. Le taux contractuel ne peut être inférieur à 3 fois le taux d'intérêt légal (connaissance ; Agicap ne cite que le plancher). Taux refi BCE à 2,15 % depuis le 11/06/2025, soit environ 12,15 %. — [Assemblée nationale](https://www2.assemblee-nationale.fr/questions/detail/15/qe/10748/(vue)/pdf) ; [Agicap](https://agicap.com/fr/article/penalite-de-retard/) ; [assurup](https://www.assurup.com/blog/articles/retard-paiement)
- Délais maximaux (L441-10 I) : 60 jours à compter de la facture, ou 45 jours fin de mois si convenu. Par défaut, 30 jours après réception ou exécution. — [swim.legal](https://www.swim.legal/blog/delai-paiement-facture-entreprises-regles-lme-sanctions)

**Injonction de payer**
- Elle peut être déposée par le créancier lui-même, sans avocat (connaissance ; voir [service-public, notice Cerfa](https://www.formulaires.service-public.gouv.fr/gf/getNotice.do?cerfaNotice=51156&amp=&cerfaFormulaire=16040)).
- Devant le tribunal de commerce (ou TAE), le dépôt **en ligne via Infogreffe** est possible. Devant les autres juridictions, le dépôt reste sur papier, selon une source. Une autre source évoque un dépôt via justice.fr avec un timbre de 50 € (contradictoire, non vérifié). — [lemag-juridique](https://www.lemag-juridique.com/articles/mesures-dexecution-reforme-linjonction-payer-modernisation-saisies-vers-procedure-plus-rapide-dematerialisee-11216.htm) ; [Infogreffe](https://www.infogreffe.fr/dossiers-thematiques/vie-de-l-entreprise/prevenir-et-traiter-les-difficultes/l-injonction-de-payer--une-procedure-de-recouvrement-de-creances) ; [greffe TAE Paris](https://www.greffe-tae-paris.fr/procedure/injonction_payer)
- Coût : gratuit devant les juridictions civiles. Frais de greffe au tribunal de commerce entre 33,47 € et 39 € TTC selon la source. Il faut ajouter la signification par commissaire de justice. — [Kohen Avocats](https://kohenavocats.fr/2026/10/12/facture-impayee-professionnel-mise-en-demeure-penalites-injonction-payer-prescription-2026/) ; [captaincontrat](https://www.captaincontrat.com/litiges/recouvrement-de-creances/requete-injonction-payer-etapes) ; [getdefacto](https://www.getdefacto.com/fr/article/recouvrement-de-creances-entreprise)
- Délai typique sans opposition : un titre en 35 à 60 jours ouvrés. — [Kohen Avocats](https://kohenavocats.fr/2026/10/12/facture-impayee-professionnel-mise-en-demeure-penalites-injonction-payer-prescription-2026/)
- **Réforme : décret n° 2026-96 du 16/02/2026** (JO du 17/02). Entrée en vigueur partielle au 1er avril 2026, applicable aux ordonnances rendues à partir du 1er septembre 2026.
  - Délai de signification de l'ordonnance réduit à **3 mois** (contre 6).
  - **Délai de 2 mois** après signification avant toute exécution.
  - Le greffe avise le créancier d'une opposition, sauf au tribunal de commerce.
  - Consentement électronique à la signification via **Sécurigreffe** pour les sociétés au RCS (1er septembre 2026).
  - — [Kohen Avocats](https://kohenavocats.fr/2026/05/04/injonction-payer-2026-decret-16-fevrier-changements/) ; [Lexbase](https://www.lexbase.fr/article-juridique/132791010-textes-le-decret-n-202696-du-16-fevrier-2026-portant-reforme-de-linjonction-de-payer-et-diverses-dis) ; [Accens Avocats](https://accens-avocats.com/blog/2026/08/25/recouvrement-un-decret-a-modifie-la-procedure-relative-a-linjonction-de-payer-et-les-actes-mis-en-oeuvre-par-le-commissaire-de-justice/)

### Inferences
- **Outil au service du créancier vs agent de recouvrement.** Si le fondateur vend un logiciel où la lettre part **au nom et pour le compte du créancier** (signée par lui, expéditeur LRAR = l'entreprise cliente), sans que Nimbrel encaisse quoi que ce soit, on reste a priori hors de R124 : pas d'assurance spécifique, pas de compte dédié, pas de déclaration. On reste aussi hors de la qualification « société de recouvrement », qui dissuade davantage le débiteur mais impose ces obligations.
  - Dès que Nimbrel écrit **en son propre nom** (« le cabinet X, mandaté par... ») ou **reçoit des fonds**, R124 s'applique : déclaration au procureur, RC pro, compte dédié, convention écrite. Le régime reste léger, mais il faut une assurance (coût non trouvé).
  - Une validation par un avocat est recommandée.
- **Risque d'exercice illégal du droit.** La rédaction automatisée d'actes juridiques pour autrui touche le monopole de consultation juridique et de rédaction d'actes (loi n° 71-1130, art. 54 et suivants). La jurisprudence Demander Justice (connaissance, non revérifié : relaxe confirmée par la Cour de cassation, chambre criminelle, 2017) admet une plateforme qui fournit un outil de génération de documents sans conseil personnalisé. Il faut cadrer le produit comme « outil » et non comme « conseil ».
- Le dépôt en ligne de l'injonction au tribunal de commerce (Infogreffe) rend techniquement possible une préparation de requête avec dépôt assisté. Le créancier doit toutefois rester déposant, et la signification passe forcément par un commissaire de justice.

### Gaps
- Texte intégral et à jour de R124-2 à R124-7 non lu, car Légifrance était inaccessible. La numérotation précise de chaque obligation reste à vérifier.
- Pas de source officielle sur les frais de greffe 2026 ni sur le seuil et les modalités du dépôt dématérialisé hors tribunal de commerce.
- Je n'ai trouvé aucune décision sur un SaaS de relance requalifié en agent de recouvrement.

## 6. Canaux d'acquisition réalistes pour un fondateur solo

### Takeaway
Le canal le plus concret est la **marketplace d'intégrations de Pennylane**, qui a une catégorie « Recouvrement » où figurent déjà Aston AI, Billabex, Impayés.com et Litige.fr, et une API publique pour partenaires. Viennent ensuite les experts-comptables (qui prescrivent Pennylane) et le SEO, très concurrentiel : Société.com, Rubypayeur, Litige.fr, LegalPlace et des dizaines de micro-SaaS publient des guides et des comparatifs.

### Cited Findings
- Pennylane a une catégorie d'intégrations « Recouvrement » avec Aston AI et Billabex (« agents IA pour impayés »). Impayés.com et Litige.fr figurent aussi parmi les intégrations. Pennylane invite les éditeurs à devenir partenaires via son **API publique**. — [Pennylane intégrations, Recouvrement](https://www.pennylane.com/fr/integrations/categorie/recouvrement) ; [Pennylane intégrations](https://www.pennylane.com/fr/integrations)
- Pennylane passe par des cabinets d'expertise comptable partenaires (depuis 2021, plus de tenue en interne). Ce sont donc des prescripteurs centraux des outils de gestion des TPE. — [Pennylane, expert-comptable](https://www.pennylane.com/fr/expert-comptable/fonctionnalites-clients) ; [cecca.fr](https://cecca.fr/outils/pennylane/)
- Des cabinets comptables organisent des webinaires sur la relance client dans Pennylane : un point d'entrée pour du co-marketing. — [BLC Conseil](https://blc-conseil.com/blog/replay-webinar-maitriser-la-relance-client-dans-pennylane-gagnez-du-temps-et-ameliorez-votre-tresorerie/) ; [IGCA France](https://www.igcafrance.com/details-relances+clients+automatisees+avec+pennylane-685)
- Le SEO est saturé : Rubypayeur publie des pages « recouvrement + ville » (Rennes, Reims, Dijon, Grenoble…), Société.com Recouvrement et Relanzy publient des pages comparatives contre chaque concurrent, et le site de l'État (francenum.gouv.fr) publie un guide sur la relance numérique. — [rubypayeur.com/guide/recouvrement/villes/rennes](https://rubypayeur.com/guide/recouvrement/villes/rennes) ; [rec-societe comparatifs](https://rec-societe.com/comparatifs/societecom-recouvrement-vs-rubypayeur) ; [Relanzy vs Billabex](https://www.relanzy.com/vs/billabex) ; [francenum.gouv.fr](https://www.francenum.gouv.fr/guides-et-conseils/pilotage-de-lentreprise/numerisation-des-processus/factures-impayees-comment)
- Les partenariats de distribution existent : Rubypayeur est distribué via Rocket Lawyer et Freebe (outil de facturation pour freelances). — [Rocket Lawyer x Rubypayeur](https://www.rocketlawyer.com/fr/fr/offres/rubypayeur) ; [Freebe](https://www.freebe.me/blog/rubypayeur-retards-paiement)

### Inferences
- **La réforme de la facturation électronique (réception obligatoire depuis le 1er septembre 2026) concentre les flux de factures dans des plateformes agréées (PA/PDP)**, dont Pennylane, Qonto et d'autres (connaissance, non revérifié ; cf. [Qonto, comparatif plateformes agréées](https://qonto.com/fr/blog/gestion-entreprise/facturation/comparatif-plateforme-agreee)). Cela crée un canal d'intégration (statuts de paiement, factures échues) et rend probable que ces plateformes ajoutent elles-mêmes des relances plus avancées. C'est un risque de commoditisation.
- Pour un solo, les canaux les plus réalistes sont :
  1. une intégration Pennylane, et éventuellement des outils de facturation pour freelances comme Freebe, Abby ou Tiime, sur le modèle Rubypayeur et Freebe ;
  2. un partenariat avec quelques cabinets d'expertise comptable, avec une marque blanche ou une commission d'apport ;
  3. un SEO de longue traîne très ciblé par métier (« impayé sous-traitant BTP », « retenue de garantie », « facture impayée syndic ») plutôt que générique ;
  4. des communautés : groupes de freelances (Malt, Crème de la Crème), fédérations du BTP (CAPEB, FFB), CMA.

### Gaps
- Je n'ai trouvé aucun coût d'acquisition (CAC) ni aucun taux de conversion publié dans cette niche.
- Les conditions du programme partenaire de Pennylane (frais, revenue share, processus de listing) n'ont pas été trouvées.
- Aucune donnée sur les marketplaces de Qonto ou de Shine pour le recouvrement.
