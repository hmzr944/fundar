# B2B2C distribution partners and French upfront-paid consumer legaltech (positioning for Atlas / Nimbrel)

Research method note: done on 2026-10-13 with web search only. Direct page fetches (WebFetch / curl) failed for nearly every domain in this environment (DNS error or proxy 403: demanderjustice.com, litige.fr, credoc.fr, insee.fr, cestregle.fr). Most figures below come from search-result extracts of the cited pages rather than full reads. Before any figure goes into a pitch or a financial model, open the cited URL and check it.

## 1. Protection juridique (PJ) insurance in France: market, amicable phase, outsourcing, constraints

### Takeaway
PJ is a market of about €1.8 to 2 billion in premiums. Insurers already run an in-house "phase amiable" (in-house jurists, mise en demeure letters), which is exactly the work Atlas automates. On 2018 figures, about 70% of PJ files end amicably. That makes PJ insurers and their outsourced claims managers the most natural white-label buyers: they pay per file or per licence to cut handling cost, and they do not pay success commission. No public evidence was found of a French PJ insurer licensing a consumer letter-drafting AI. Mediation legaltechs (Noo, NotreAccord, Justice.cool) are openly courting them.

### Cited Findings
- PJ premiums: €1.83bn in 2023, +5.9% year on year, and €1.48bn in 2019. This comes from a comparator citing France Assureurs, not the primary France Assureurs publication. — [Reassurez-moi, chiffres clés](https://reassurez-moi.fr/guide/assurance/chiffres-cles)
- Xerfi puts the French PJ market at about €2bn in annual premiums. The scope covers stand-alone contracts plus PJ cover embedded in motor, home (MRH) and professional multi-risk policies. The reference year is not stated, and the study (trends to 2028) is paid. — [Xerfi, Le marché de l'assurance protection juridique](https://www.xerfi.com/presentationetude/le-marche-de-l-assurance-protection-juridique_abf20)
- Number of contracts: the only figure found is old (around 2008). It gives 22 to 25 million PJ contracts, 26% of them stand-alone. — [Banque de France / CCSF fiche PJ](https://mediateur-credit.banque-france.fr/sites/default/files/media/2017/05/03/fiche_assurance_prot_jur0210.pdf); see also [CCSF avis protection juridique](https://www.banque-france.fr/system/files/import/ccsf/medias/documents/avis_protection_juridique.pdf)
- For context, the whole French insurance market had €283.3bn in premiums in 2024 (+12.1%) and 639 licensed organisations, per France Assureurs as relayed by secondary sites. — [Reassurez-moi](https://reassurez-moi.fr/guide/assurance/chiffres-cles)
- Volume and amicable rate: "70% of the 450,000 disputes handled each year by legal-protection insurers end in an amicable resolution" led by at least one party's insurer, with multidisciplinary legal teams trained in negotiation. Source: a 2018 parliamentary amendment (loi Justice), so the figure is dated. — [Assemblée nationale amendement 1396/AN/1501](https://www.assemblee-nationale.fr/dyn/15/amendements/1396/AN/1501.pdf)
- How the cover works in practice:
  - Step 1 is legal information by phone.
  - Step 2 is the amicable phase: negotiation or a formal demand letter from the insurer's jurist.
  - Step 3 is the judicial phase (lawyer, expert and court costs), triggered only if the amicable phase fails or the other side has a lawyer.
  - Some policies cap the amicable phase at 6 months from the insurer's first intervention, or 1 year if an expert assessment was needed.
  — [Simonnet Avocat, L'assurance de protection juridique](https://www.simonnetavocat.fr/lassurance-de-protection-juridique/); [Hiscox CG PJ](https://www.hiscox.fr/courtage/sites/courtage/files/documents/cg-pj-mrp-pj0918.pdf)
- Typical contract thresholds: disputes above €220, capped at €20,000 per dispute (one insurer's brochure). Another contract caps at €25,000. — [plaquette PJ (radiance)](https://recette.aws.radiance.fr/sites/default/files/2020-06/T%C3%A9l%C3%A9charger%20la%20plaquette%20d%27information_0.pdf)
- Groupama Protection Juridique (Société Française de Protection Juridique, SIREN 321776775) intervenes amicably with the opposing party before covering court costs. Its 2016 VIProtect product had limits of €50k per claim and €100k per year. — [Groupama CP VIProtect 2016](https://groupama.com/app/uploads/2016/10/CP_VIProtect_oct2016.pdf); [ACPR register](https://acpr.banque-france.fr/fr/print/pdf/node/1919343)
- Solucia Protection Juridique is listed by the ACPR as a PJ insurer created in 2015 and is described as specialised in legal protection and affinity insurance. Affinity insurance means PJ distributed through partners such as banks and retailers, which is a relevant B2B2C channel. — [2050analytics, Solucia](https://2050analytics.com/fr/org/30406.solucia-service-et-protection-juridiques)
- CFDP sells PJ through associations and unions, for example its group contract for a childminders' union. This shows PJ itself is already sold B2B2C to associations. — [CFDP livret, UNSA Pro Ass Mat](https://unsaproassmat.org/wp-content/uploads/2025/07/cfdp-livreblb127.pdf)
- Legal framework:
  - Articles L127-1 to L127-8 of the Code des assurances, reinforced by loi n° 2007-210 of 19 February 2007.
  - Free choice of lawyer applies (L127-3), and the insurer may not suggest a lawyer's name without a written request from the insured.
  - These rules bind the judicial and representation phase. They do not stop the insurer from handling the amicable phase itself or through a subcontractor.
  — [Sénat rapport l06-160 (loi 2007)](https://conferenceconsensuslogement.senat.fr/rap/l06-160/l06-1601.pdf); [Simonnet Avocat](https://www.simonnetavocat.fr/lassurance-de-protection-juridique/); [Selectra](https://selectra.info/assurance/actualites/marche/protection-juridique-incluse-contrat-avocat)
- Legaltech courting of insurers:
  - Noo (Toulouse, online mediation) is publicly seeking assurtechs, neobanks and PJ players. Formats on offer are integration, co-built offer, distribution, or a pilot of a few months. — [Les Pépites Tech, Noo](https://lespepitestech.com/node/34569)
  - NotreAccord presents itself as a privileged partner of insurers and PJ providers. — same search set
  - Justice.cool offers online mediation with AI statistical indicators, e-signature, document generation and online payment. Its insurer partners and prices were not found. — [Le Monde du Droit](https://www.lemondedudroit.fr/professions/337-legaltech/68217-justice-cool-veut-favoriser-developpement-mediation-ligne.html)
- The CNB conference "Nouvelle ère de l'amiable" had a session on the profitability of the amicable route. It shows the bar also sees amicable resolution as a business line. — [CNB slides](https://www.cnb.avocat.fr/sites/default/files/Nouvelle%20ere%20de%20l%27amiable-2%20octobre-11h30-Rentabilit%C3%A9-Carayol-Troin-Liaud.pdf)

### Inferences
- At around 450k files a year, each handled by salaried jurists, even a small cut in handling time per file is worth a lot to a PJ insurer or claims manager (Juridica, DAS, CFDP, Solucia, Groupama PJ, MACIF). A per-file SaaS fee of a few euros, or an annual licence, fits how they buy, and success commission does not.
- The likely buyer is the claims-management or innovation team. Atlas would be pitched as a jurist copilot: draft and check the letter, schedule follow-ups, send LRAR, escalate to the médiateur. It would not be pitched as a consumer-facing replacement, which avoids the free-choice-of-lawyer and unauthorised-practice issues.
- Affinity PJ insurers such as Solucia already distribute through banks and retailers. They could be a route into the bank channel without selling to banks one by one.

### Gaps
- No France Assureurs primary figure for 2024 or 2025 PJ premiums or contract counts was reachable. Check the France Assureurs "données clés" or the annual report directly.
- No recent volume of PJ files per insurer (Juridica, DAS, CFDP, MACIF) was found.
- No documented French case was found of a PJ insurer licensing a letter or dispute AI, and no price points for such deals.
- Juridica (Axa), DAS (MMA/Covéa) and MACIF did not surface in searches. Their outsourcing practices are not documented here.

## 2. Banks/neobanks, mutuelles, CSE and employee-benefit platforms, consumer associations

### Takeaway
Public evidence that these channels buy dispute or letter tools is thin. CSE platforms do resell legal help: Leeto has a "Legal Care" module for lawyer Q&A. Consumer associations are volunteer-run and losing members, and they handle about 90k disputes a year. They are a tooling target with little budget, not a revenue engine. No public per-member-per-month price was found for any of these channels.

### Cited Findings
- Leeto (CSE platform, bought by Groupe Up in summer 2021):
  - Its "Legal Care" module lets the CSE and employees ask a lawyer legal questions.
  - Public pricing is mostly "on request". One listing shows a "compte pro" offer at €29/month.
  — [Appvizer, Leeto](https://www.appvizer.fr/organisations/ce/leeto); [CSE Guide, Leeto](https://www.cse-guide.fr/reseau-partenaire/leeto/); [Passtech oct. 2021](https://passtech.substack.com/p/octobre-2021)
- Swile: no legal-assistance service or per-employee price was found. — [La Fabrique du Net, comparatif CSE](https://www.lafabriquedunet.fr/logiciels/gestion/cse)
- Neobanks: no French neobank subscription bundling legal assistance or a legaltech partnership was found. Revolut's paid tiers bundle rewards and purchase insurance. — [Meilleurtaux, quelle néobanque 2025](https://banque.meilleurtaux.com/banque-en-ligne/actualites/2025-janvier/quelle-neobanque-choisir2025.html)
- Société Générale (a traditional bank) promotes PJ insurance to retail customers. This means banks distribute PJ as an insurance product rather than buying tools. — [SG, s'assurer contre les litiges](https://particuliers.sg.fr/nos-conseils/assurer/comment-s-assurer-contre-les-litiges-juridiques)
- UFC-Que Choisir (renamed "Que Choisir Ensemble"):
  - About 127 to 130 local associations and more than 4,500 volunteers.
  - It claims "90k litiges individuels traités chaque année" and 120,000 members supported each year. Older pages said more than 80,000 disputes and more than 140,000 members.
  — [Que Choisir, qui sommes-nous](https://www.quechoisir.org/page-ufc-que-choisir-qui-sommes-nous-n14333/); [Action locale](https://www.quechoisir.org/action-locale-ufc-que-choisir-decouvrez-notre-reseau-n43224/)
- Membership is falling and is tied to dispute volume:
  - Mayenne: 865 to 791 contributions (-8.8%) between 2023 and 2024, linked to fewer disputes. The report cites a -6.6% decline nationally.
  - Seine-et-Marne Est: 379 to 334 members, with a stable number of disputes but more of them filed online.
  - Montpellier: 1,602 to 1,564 members between end-2024 and end-2025.
  — [UFC Mayenne rapport AG 2025](https://mayenne.ufcquechoisir.fr/wp-content/uploads/sites/38/2025/03/2025-AG-Rapport-dactivit%C3%A9-VF.pdf); [UFC Coulommiers bulletin avril 2025](https://coulommiers.ufcquechoisir.fr/wp-content/uploads/sites/51/2025/04/BUL-N-47-avril-2025-.pdf); [UFC Montpellier rapport 2025](https://montpellier.ufcquechoisir.fr/wp-content/uploads/sites/200/2026/01/rapport.activit%C3%A9.2025.docx)
- Associations recruit volunteer "conseillers litiges" through jeveuxaider.gouv.fr. Dispute handling is labour-constrained. — [JeVeuxAider, UFC Maine-et-Loire](https://www.jeveuxaider.gouv.fr/missions-benevolat/90791/benevolat-ufc-que-choisir-de-maine-et-loire-5)

### Inferences
- In associations, members pay dues (amounts not found) and volunteers do the drafting. A tool that speeds up volunteer drafting and follow-up might be bought at federation level, but budgets look small and members are shrinking. Expect pilot or grant-sized deals, not recurring revenue per member.
- CSE and benefits platforms already sell "access to a lawyer" as a perk. A self-serve "dispute assistant" perk is a plausible add-on sold per employee per year. This is unproven, and there is no public price benchmark.
- Banks and neobanks are more likely to reach consumers through affinity PJ insurers (see Q1) than to license a tool directly.

### Gaps
- No public per-member or per-employee prices for legal perks (Leeto Legal Care, Swile, mutuelles' "assistance juridique").
- CLCV figures and local association dues were not found.
- Mutuelles' legal-assistance providers were not researched in depth. They often bundle "assistance juridique" through insurers' assistance subsidiaries.

## 3. French consumer legaltech with upfront pricing: prices, traction, scrutiny

### Takeaway
Upfront per-case pricing is the established model in French consumer legaltech:
- Demander Justice and Litige.fr sell mise en demeure and court-filing packs from about €50 up to €240+. Litige.fr uses a free first letter as an acquisition hook.
- On the business side, LegalPlace (€11.8m revenue in 2023, a reported, unconfirmed €40m in 2025) raised €70m and bought Legalstart in May 2026. Paid legaltech is still consolidating and growing in the generative-AI era.
- The model attracts scrutiny: bar litigation against Demander Justice, and DGCCRF-type rules on hidden subscriptions and online cancellation.

### Cited Findings
- **Demander Justice** (official CGS price page):
  - Mise en demeure by bailiff from €99.90 incl. VAT (dispute under €1,000).
  - Amicable plus judicial pack from €119.90.
  - A competitor's comparison (prices observed June 2026, so treat with caution) gives a mise en demeure range of €49.90 to €159.90 depending on the claim amount.
  - Older press quoted €39.90 for step 1 and €69.90 for step 2.
  — [Demander Justice, prix des services](https://www.demanderjustice.com/cgs/prix-des-services); [Cestregle comparatif (concurrent)](https://cestregle.fr/comparatifs/litige-fr-vs-demander-justice); [Le Petit Juriste](https://www.lepetitjuriste.fr/demanderjustice-com-le-marche-du-droit-en-ligne-soutenu-par-la-justice-francaise/)
- Demander Justice vs the bar (CNB and Paris Ordre):
  - Courts held its activity lawful: it is not unauthorised practice of law to sell form letters and help people file without a lawyer.
  - The Paris court of appeal (2018) ordered it to remove unsubstantiated success-rate claims and to stop using the tricolour flag.
  - In 2021 the appeal court confirmed a €500,000 astreinte payable to the CNB.
  — [Le Monde du Droit](https://www.lemondedudroit.fr/avocat/60889-demanderjusticecom-rejet-des-griefs-du-cnb-et-de-lordre-des-avocats-2.html); [CNB, 9 avr. 2021](https://cnb.avocat.fr/fr/actualites/la-cour-dappel-de-paris-confirme-la-condamnation-de-demanderjusticecom-payer-500-000-eu-dastreinte); [Dalloz, TGI Paris 11 janv. 2017](https://www.dalloz-actualite.fr/document/tgi-paris-11-janv-2017-n-1504207)
- **Litige.fr**:
  - Free "mise en cause" letter for disputes under €500. It is limited to one per user per month and excludes rent, eviction and employment.
  - With no reply after 8 days: amicable procedure from €49.90, or an amicable plus judicial pack with bailiff mediation from €199.90.
  - Price list: mise en demeure plus conciliator plus tribunal filing pack at €239.90 for the first tier, and mise en demeure plus assignation at €1,299.
  — [Litige.fr, e-mise en demeure](https://www.litige.fr/e-mise-en-demeure-mise-en-cause); [Litige.fr, prix des services](https://www.litige.fr/cgs/prix-des-services)
- **LegalPlace / Legalstart** (B2B for founders, but the reference for paid French legaltech):
  - Raised €70m (XAnge, Eurazeo, Move Capital) and bought Legalstart for cash on 5 May 2026.
  - Revenue was €8.81m in 2022 and €11.8m in 2023 (published accounts). A reported €40m in 2025 is unconfirmed.
  - It claims 60% annual growth over 3 years, 50,000 subscribers, and a target of more than €100m revenue in 2026.
  — [Maddyness, 5 mai 2026](https://www.maddyness.com/2026/05/05/legalplace-leve-70-millions-deuros-et-sempare-de-legalstart/); [Usine Digitale](https://www.usine-digitale.fr/start-up/avec-une-levee-de-70-millions-deuros-et-le-rachat-de-legalstart-legalplace-veut-automatiser-la-vie-administrative-des-entrepreneurs-grace-a-lia.JS25FSOPB5AS5IETFZIEMEGS6A.html); [Décideurs Juridiques](https://www.decideurs-juridiques.com/legaltech-juridiques/64331-legalplace-leve-70-millions-d-euros-pour-acquerir-legalstart.html)
- **LRAR online**:
  - Merci Facteur: a 1-page LRAR in France at €7.16 all-in (2026, from a promo-code site, to verify). It has the same legal value as a counter LRAR because the letter is posted at La Poste.
  - La Poste counter LRAR is about €7.55 to €7.56 (R1 €6.11 plus AR €1.45); sources vary.
  - AR24 is a Docaposte (La Poste group) electronic registered letter (LRE); no 2026 price was found.
  - Envoi24 offers a subscription at €40/month.
  — [Vitepromo, Merci Facteur](https://www.vitepromo.com/shopping-ecommerce/code-promo-mercifacteur); [Quelles-aides, lettre recommandée](https://quelles-aides.fr/documents-attestations/modeles/lettre-recommandee/); [La Fabrique du Net, envoi recommandé en ligne](https://www.lafabriquedunet.fr/logiciels/gestion/envoi-recommande-en-ligne)
- **Cancellation sites and hidden subscriptions**:
  - The DGCCRF warns about hidden subscriptions: low-price offers that turn into recurring card debits, with cancellation often only through premium-rate numbers.
  - Since 1 June 2023 (loi du 16 août 2022, art. L215-1-1 C. conso, décret 2023-417), any online subscription must offer free online cancellation "in 3 clicks". Fines go up to €15,000 for an individual and €75,000 for a company.
  — [Moneyvox, abonnements cachés](https://www.moneyvox.fr/actu/80192/achat-en-ligne-mefiez-vous-des-abonnements-caches); [Resilier.fr, abonnements cachés](https://www.resilier.fr/abonnements-caches.php); [Donnéespersonnelles.fr, résiliation en trois clics](https://donneespersonnelles.fr/resiliation-en-trois-clics); [Sénat question 19/06/2025](https://www.senat.fr/questions/base/2025/qSEQ250605159.html)

### Inferences
- Market price anchors for a consumer dispute file are €50 to €100 for an amicable-only step, €120 to €240 for amicable plus judicial filing, and about €7 per LRAR at cost. An Atlas per-case fee of €29 to €79 including one LRAR sits under the incumbents while keeping a margin.
- Litige.fr's free first letter is the incumbent's answer to free AI. It gives away the letter and charges for the escalation steps (follow-up, médiateur or conciliator, court filing). This supports charging for the workflow rather than the text.
- A subscription for a consumer with an occasional dispute carries regulatory and reputational risk (hidden-subscription scrutiny, 3-click cancellation). One-off per-case pricing is safer in B2C. Subscriptions fit B2B partners better.
- Demander Justice's history shows avoiding success-rate claims and any look of officialdom (tricolour, state-like branding) matters. The CNB will litigate.

### Gaps
- Exact current Demander Justice and Litige.fr price grids could not be loaded directly. Saisir-prud'hommes, Captain Contrat, Justice.cool, Postclic, Ma Lettre Recommandée and Résiliation-facile prices were not retrieved.
- Revenue of Demander Justice / Litige.fr (same founder group) on Pappers or societe.com was not retrieved, because those sites were unreachable.
- No 2025 or 2026 DGCCRF sanction naming a cancellation or LRAR intermediary site was found.
- Lexbase and Doctrine (pro) were not researched.

## 4. Consumer use of generative AI (ChatGPT) for admin/legal letters vs paid services

### Takeaway
Generative AI is now mainstream in France: 48% have used it, up 15 points in a year, and about a third of users use it daily. No French survey was found that measures its use specifically for legal or admin letters. Growth of paid legaltech (LegalPlace) and the stated reasons people don't use AI (distrust of answers 30%, habits 28%, lack of skill 26%) suggest that paying for verified, end-to-end handling still has room.

### Cited Findings
- Baromètre du numérique, édition 2026 (Arcep / Crédoc, survey of 4,145 people, 5 to 21 June 2025, published 9 Feb 2026):
  - 48% of French people have used generative AI, +15 points in one year, and 20% two years earlier.
  - Use reaches 85% among young adults and 76% among cadres.
  - 27% of users use it daily, and about two-thirds weekly.
  - 34% of users use several AIs.
  - Perceived benefits: time saving (41%), ease of use (33%).
  - Reasons for non-use: distrust of data or answers (30%), habits (28%), lack of skill (26%).
  — [Arcep communiqué](https://www.arcep.fr/actualites/actualites-et-communiques/detail/n/equipements-et-usages-du-numerique-090226.html); [Arcep infographie 2026](https://www.arcep.fr/uploads/tx_gspublication/barometre-du-numerique-edition-2026_INFOGRAPHIE.pdf); [Crédoc rapport Sou2026-5064](https://www.credoc.fr/download/pdf/Sou/Sou2026-5064.pdf); [Journal de l'économie](https://www.journaldeleconomie.fr/?p=44365); [Banque des Territoires](https://www.banquedesterritoires.fr/barometre-du-numerique-comment-lia-dessine-de-nouvelles-fractures)
- Same barometer: about 4 in 10 French people act as "aidants numériques" for people around them. When stuck on online procedures, people prefer human contact (phone, front desk). — [Arcep infographie 2026](https://www.arcep.fr/uploads/tx_gspublication/barometre-du-numerique-edition-2026_INFOGRAPHIE.pdf)
- Talan/Ifop 2025 (1,100 people, 18 to 19 March 2025): 45% say they use generative AI daily, against 32% in 2024. Ifop March 2025: personal use rate 39%, and ChatGPT is used by 72% of users. — [ActuIA, Talan/Ifop](https://www.actuia.com/actualite/les-francais-et-les-ia-generatives-le-sondage-ifop-talan/); [The Media Leader](https://fr.themedialeader.com/ia-generative-45-des-sondes-declarent-ladopter-au-quotidien-selon-une-etude/)
- Ipsos/CESI Feb 2025 lists writing texts and documents (including letters and emails) among top uses, with ChatGPT dominant. — [Ipsos-CESI rapport](https://www.cesi.fr/wp-content/uploads/2025/02/ipsos-cesi-usage-intelligence-artificielle-rapport-complet-1.pdf)
- About 38% of French people use AI such as ChatGPT for health questions (2025). This is relayed by a comparator site and should be checked. — [Comparateurbanque](https://www.comparateurbanque.com/?p=166739)
- Paid legaltech still grows: LegalPlace claims +60% a year over 3 years and raised €70m in May 2026 (see Q3). — [Maddyness](https://www.maddyness.com/2026/05/05/legalplace-leve-70-millions-deuros-et-sempare-de-legalstart/)

### Inferences
- The founder's fear is well grounded for the letter itself. About half of adults, and most young and cadre adults, can produce a letter with free AI. The defensible paid value is what chat does not do:
  - LRAR sending with proof
  - deadlines and follow-ups
  - escalation to the médiateur or conciliator with the right file
  - checking legal grounds
  - a "done for me" service for the 52% who don't use AI, and for the 30% of non-users who distrust it
- The heaviest AI users (young people, cadres) are the least likely to pay B2C. They are reachable via employers (CSE perks) instead.

### Gaps
- No French survey (Ifop, CSA, Médiamétrie, Crédoc) was found measuring the share of people who use ChatGPT for legal or administrative letters or disputes.
- No data on whether paid consumer dispute services (Demander Justice, Litige.fr) grew or shrank after 2023.

## 5. Illectronisme / non-recours population and intermediaries

### Takeaway
A large population struggles with online procedures:
- 44% report difficulties with online procedures (2025 barometer).
- Défenseur des droits figures show users reporting difficulties rose from 39% (2016) to 61% (latest survey).
- France Stratégie estimated about 14 million adults are far from digital.

France Services (2,840 sites) only gives first-level help. Its agents "cannot handle the file or intervene on the substance". No evidence was found that France Services or associations buy third-party tools.

### Cited Findings
- 44% of French people have difficulties doing their procedures online (Baromètre du numérique 2025, cited in a ministerial answer). — [Assemblée nationale QE 16566 (17e lég.)](https://questions.assemblee-nationale.fr/dyn/17/questions/QANR5L17QE16566.pdf)
- Défenseure des droits annual report 2025 (published April 2026):
  - Share of users reporting difficulties in their procedures went from 39% in 2016 to 61% (as reported by Banque des Territoires).
  - 165,011 complaints, information requests and referrals, +17% in a year.
  — [Banque des Territoires](https://www.banquedesterritoires.fr/acces-aux-droits-une-erosion-tres-preoccupante-du-lien-entre-usagers-et-services-publics-alerte-la)
- 141,000 complaints to the Défenseur in 2024 concerned access to public services. There are 2,840 France Services sites, unevenly spread, and agents give only "aide de première intention". — [Maire-info, mai 2025](https://www.maire-info.com/services-publics-la-dematerialisation-exclut-toujours-une-partie-des-citoyens-selon-la-defenseure-des-droits-article2-29719)
- In 2021 there were 115,000 complaints, 91,000 of them about public services (35,000 in 2014). — [Maire-info](https://www.maire-info.com/droit/la-dematerialisation-continue-porter-atteinte-acces-aux-droits-usagers-selon-la-defenseure-droits-article-26121)
- Older estimates:
  - France Stratégie: 14 million people (28% of adults) far from digital.
  - Insee 2019: 17% of internet users lack digital skills (Insee Première n°1780, via a secondary source).
  - A parliamentary question cites 9 million people affected by illectronisme.
  — [Le Petit Juriste](https://www.lepetitjuriste.fr/la-lutte-contre-lillectronisme-et-la-fracture-numerique/); [AN QE 42606](https://www.assemblee-nationale.fr/dyn/15/questions/QANR5L15QE42606.pdf)
- Insee's household ICT survey was renamed "Enquête sur les Usages du numérique" in 2025. Its 2024 edition covered online administrative services. — [Insee, enquête usages du numérique](https://www.insee.fr/fr/information/5019305)

### Inferences
- The excluded population is large, but it does not pay and is hard to reach directly. Value would come through intermediaries: France Services agents, CCAS, association volunteers, conseillers numériques. They need an assisted "aidant mode" (agent drafts and sends for the user) and are funded by public budgets or grants. The research did not price this.
- Because France Services agents cannot handle disputes on the substance, there is a gap a tool for associations and aidants could fill. Selling into it would likely mean public procurement or grant-funded pilots (ANCT, departments), which is slow for a solo founder.

### Gaps
- No recent Insee illectronisme rate (2023 to 2025) was confirmed. The commonly quoted figure of about 15.4% (2021) was not verified, and insee.fr was unreachable.
- No data on France Services or associations buying software tools, or at what price. No figure on the number of France Services accompaniments in 2025.
- Défenseur des droits non-recours estimates specific to consumer disputes were not found.
