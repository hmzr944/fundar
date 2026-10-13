# Impayés des artisans et sous-traitants du BTP : validation comme cible d'entrée d'un SaaS payant

> **Read this before using these notes (method and limits).** Researched on 2026-10-13. Every direct page fetch failed during this session: WebFetch returned "ENOTFOUND", and curl through the agent proxy got "CONNECT 403". This hit banque-france.fr, capeb.fr, ffbatiment.fr and insee.fr. **No source below was read in full.** Every finding comes from search-engine extracts or summaries of the cited URL. Numbers should be checked against the primary PDF before they go in any customer-facing material. Items marked "(background, not verified this session)" are well-known legal rules that I did not re-confirm against Légifrance in this session.

## 1. Taille de la cible : nombre d'entreprises, TPE, artisans, micro-entrepreneurs, sous-traitants, part B2B vs particuliers

### Takeaway
The artisanal building segment has about 500,000 companies with 0–10 employees. That is roughly 95–96% of building companies, and they make close to half of the sector's revenue. Including micro-entrepreneurs, the construction sector has more than 530,000 firms, and about 85,000–87,000 are created each year. Amélioration-entretien (renovation and maintenance), where private households weigh heavily, is about 54–57% of building activity. I found no reliable split of revenue between B2B clients (contractors, syndics, public buyers) and private customers.

### Cited Findings
- CAPEB: "500 000 entreprises, soit 96 % des entreprises du bâtiment", with 0 to 10 employees. They employ 570,000 salariés (45% of building salariés) and train 60,000 apprentis, and they make 47% of building revenue. CAPEB has 62,000 adhérents and calls itself "1re organisation professionnelle de France en nombre d'adhérents". A Sept. 2025 CAPEB document also gives 512,000 firms, which is unclear and needs checking. — [CAPEB, Les chiffres de l'artisanat](https://www.capeb.fr/les-chiffres-de-lartisanat); [CAPEB plaquette institutionnelle 2025 (PDF)](https://www.capeb.fr/www/capeb/media/national/capeb-plaquette-institutionnelle-2025-web.pdf)
- FFB "Le bâtiment en chiffres" 2025: 450,000 firms with positive revenue, **excluding "pure" micro-entreprises**, and 1,731,000 actifs. Revenue is €193bn HT, down about 6% in value and 5% at constant prices. "Près de 95 %" of firms are artisanal-sized and they make about half of activity. — [FFB, Le bâtiment en chiffres](https://ffbatiment.fr/le-batiment-en-chiffres)
- Amélioration-entretien was "près de 57 %" of building activity in 2024 according to FFB, but another FFB passage says 54%. The FFB forecasts a 2.9% fall in amélioration-entretien revenue in 2026. — [FFB, Le bâtiment en chiffres](https://ffbatiment.fr/le-batiment-en-chiffres); [Le Journal des Entreprises](https://www.lejournaldesentreprises.com/article/des-signes-timides-de-reprise-malgre-une-crise-persistante-pour-le-secteur-du-batiment-en-france-2122492)
- INSEE counted **530,300 construction enterprises in 2021, including 366,700 outside the micro-entrepreneur regime**, which implies about 163,600 micro-entrepreneurs. The publication is dated Dec. 2023, and this is an extract only. — [INSEE, Caractéristiques de la construction par taille](https://www.insee.fr/en/statistiques/6045858); [INSEE 7678578](https://www.insee.fr/fr/statistiques/7678578)
- Construction firm creations were 87,306 in 2024 and 84,321 in 2023. The source is a secondary site, not INSEE directly. — [independant.io, chiffres BTP](https://independant.io/chiffres-tendances-btp/)
- Business creations across all sectors in 2024 were 1,111,238 (+5.7%), including 716,194 micro-entrepreneurs. — [Journal du Net](https://www.journaldunet.com/economie/industrie/1538499-2024-a-connu-un-record-de-creations-d-entreprises/)
- Activity is shrinking. CAPEB reports 8 consecutive quarters of decline for artisanal building, including −4.5% in Q2 2025. — [CAPEB note de conjoncture](https://www.capeb.fr/www/capeb/media/cp-capeb-note-de-conjoncture-t1-2025.pdf)

### Inferences
- The serviceable core is roughly 500k artisanal firms plus about 160k micro-entrepreneurs in construction. Only a subset handles disputes of a size that justifies a paid tool, typically invoices above about €1–2k. That subset is likely firms with 1–10 employees, about 150–200k, though the number is not sourced.
- With amélioration-entretien above half of activity, many artisans' unpaid invoices are owed by private households (particuliers). The BTP-specific B2B procedures (loi 1975, retenue de garantie, art. 1799-1 guarantee) apply mainly to subcontractors and firms working for professional maîtres d'ouvrage. This splits the target into two distinct products and messages:
  - artisans with private clients: mise en demeure, injonction de payer, and MaPrimeRénov' delays;
  - subcontractors: action directe, paiement direct, retenue de garantie, caution.
- The sector is in downturn, which increases cash stress and unpaid invoices. It also squeezes software budgets.

### Gaps
- I found no reliable figure for the number of BTP firms working as subcontractors, or for the share of revenue made in subcontracting. FFB/CAPEB may publish one in the full "Bâtiment en chiffres" PDF, which I could not fetch.
- I found no split of revenue by client type (particuliers, entreprises générales, syndics/bailleurs, public buyers).
- I found no 2024–2025 INSEE stock of construction micro-entrepreneurs. Check INSEE Sirene / ESANE or the Bpifrance Création observatory.
- CMA and Observatoire des métiers du BTP figures were not retrieved.

## 2. Délais de paiement et impayés dans le BTP

### Takeaway
Officially measured late payment in construction is now slightly *below* the national average. Banque de France puts it at about 10.5 days of delay in Q4 2025, against 13.4 days for all sectors. However, construction has historically been one of the worst sectors. Defaults (défaillances) remain very high, at about one in four French defaults. Artisans report more and more late payments and avoid jobs out of fear of not being paid.

### Cited Findings
- The 2025 annual report of the Observatoire des délais de paiement was handed over on 23–24 Sept. 2026. It finds an average delay of 13.4 days at end-2025 for all firms, against 13.6 in Dec. 2024. It finds **construction at 10.5 days in Q4 2025, against 11.5 days a year earlier**. Private-sector DSO/DPO improved by 1.5 days in 2024 data, but the slowest firms got worse ("polarisation"). More than one large company in two still pays suppliers after the legal deadline. State payment times worsened to 15.9 days, against 14.1 in 2024. Local public bodies paid in 19.3 days. — [Banque de France communiqué](https://www.banque-france.fr/fr/communiques-de-presse/le-rapport-annuel-2025-de-lobservatoire-des-delais-de-paiement-des-resultats-contrastes-selon-les); [Rapport ODP 2025 (PDF)](https://www.banque-france.fr/system/files/2026-07/ODP2025_WEB.pdf); [CP 23/09/2026](https://www.banque-france.fr/system/files/2026-09/CP_RA-ODP_20260923.pdf). *Sector figure seen only in a search extract. The PDF was not read.*
- In the 2024 ODP report, late payment in construction stabilised at about 11.5 days, 2 days below the average. — [ODP 2024 (PDF)](https://www.banque-france.fr/system/files/2025-07/ODP-2024.pdf)
- Historically, the ODP 2017 report placed construction among the three sectors that suffer most from customer late payment. It also said waits of up to 10 months for full payment were "not rare", especially with particuliers. The FNTP cited delays of 3–6 months in public works. — [ODP 2017–2018 (PDF)](https://publications.banque-france.fr/sites/default/files/medias/documents/odp2018_book_web2603.pdf)
- A 2018 CAPEB article citing Altares (800,000 balance sheets) gave an average payment time of 60 days in construction, against 43 days for all sectors, and 71 days for TP. **40% of construction firms prefer to give up a job rather than risk an unpaid invoice, and 50% of very small firms do.** — [CAPEB, Impayés, retards de paiement : la CAPEB est à vos côtés](https://www.capeb.fr/actualites/impayes-retards-de-paiement-la-capeb-est-a-vos-cotes)
- In January 2025, CAPEB Loire-Atlantique ran a "Impayés : je me prépare, j'agis" presentation. It says late payments are increasing and cash is tightening, and that 34% of firms report falling cash (CAPEB survey of Oct. 2024). — [CAPEB 44 (PDF)](https://www.capeb.fr/www/capeb/media/pays-de-la-loire/document/44_Impayes-je-me-prepare-jagis_Janvier2025.pdf)
- MaPrimeRénov' payment delays are putting building firms in difficulty (CAPEB Tarn, May 2025). — [CAPEB Tarn](https://www.capeb.fr/actualites/retard-maprimerenov-la-capeb-du-tarn-se-mobilise)
- Batiactu, an older article: "Les retards de paiement coûtent 7,5 milliards d'euros au BTP". The date was not seen. — [Batiactu](https://www.batiactu.com/edito/retards-paiement-grandes-entreprises-ne-jouent-pas-52469.php)
- Le Moniteur, "Délais de paiement : pourquoi la situation se tend dans le BTP". Only the title was seen and the date is unknown. — [Le Moniteur](https://www.lemoniteur.fr/article/delais-de-paiement-pourquoi-la-situation-se-tend-dans-le-btp.2032790)
- Altares defaults in construction:
  - Q4 2025: 4,696 defaults in construction (−8.1% year on year) and −3.2% over the full year 2025. Gros œuvre fell by 9 to 11% while second œuvre stayed fragile.
  - Q1 2026: 18,986 defaults across all sectors (+6.4%). Construction is still about 1 default in 4.
  - Q2 2026: 4,148 construction defaults (−0.8%). Plâtrerie rose 13%, charpente 57%, and promotion immobilière 87.8% to 276 defaults.
  - In its 2025 review, Altares says average late payment hit its highest level since Covid, above 14 days.
  - [Altares T4/bilan 2025 (PDF)](https://www.altares.com/wp-content/uploads/CP-ALTARES-DEFAILLANCES-T4-BILAN-2025.pdf); [Altares T1 2026 (PDF)](https://www.altares.com/wp-content/uploads/CP260414_ALTARES_DEFAILLANCES-ENTREPRISES-T1-2026.pdf); [Altares T2 2026](https://www.altares.com/wp-content/uploads/CP260716_ALTARES_DEFAILLANCES-ENTREPRISES_T2-2026.docx)
- Médiation des entreprises received nearly 2,000 referrals in 2024. Late payment was again the first reason, and nearly three quarters of referrals came from firms with fewer than 25 employees. No BTP breakdown was found. — [La Gazette France](https://www.lagazettefrance.fr/article/mediation-des-entreprises-pres-de-2-000-saisines-en-2024)
- FFB Artisans holds local "Lutter contre les impayés" meetings. One is on 21 Apr. 2026, on structuring relances and using recourses. FFB Loire-Atlantique holds one on 4 Mar. 2026. — [FFB prévention impayés](https://www.ffbatiment.fr/gestion-entreprise/passer-executer-un-marche/facturation-paiement/dossier/prevention-protection-impayes); [FFB réunion impayés 44](https://www.ffbatiment.fr/actualites-batiment/Agenda/reunion-information-impayes-44)

### Inferences
- The macro "average delay" headline is *not* a strong hook. Construction now looks better than average in Banque de France data. The pain sits in the tail: defaults of principal contractors and promoteurs, long disputes with particuliers, and unreturned retenues de garantie. The founder's pitch should focus on specific stuck cases, not on average DSO.
- Rising defaults of principal contractors and promoteurs (+51% to +88% for promotion) are exactly the situations where subcontractors need action directe against the maître d'ouvrage. This is a strong trigger event for the subcontractor segment.
- The federations already run "impayés" workshops. That confirms the demand and offers a partnership channel.

### Gaps
- I did not read the ODP 2025 sector table, so DSO by BTP sub-sector and by firm size is missing. Fetch the PDF.
- I found no recent quantitative CAPEB or FFB survey of unpaid invoices: the share of artisans with at least one unpaid invoice, the average amount, or the write-off rate.
- I found no médiateur des entreprises figures specific to BTP.
- The Batiactu "€7.5bn" figure is undated and could not be verified.

## 3. Procédures BTP spécifiques, complexes et à délais (articles exacts)

### Takeaway
BTP has a dense set of deadline-driven, form-bound creditor procedures. Each one fits "procedure execution over weeks" well:
- action directe (loi 75-1334, art. 12): mise en demeure, then 1 month, then a copy to the maître d'ouvrage;
- paiement direct in public procurement (≥ €600 TTC, the titulaire has 15 days and silence means acceptance);
- release of the 5% retenue de garantie one year after réception (loi 71-584);
- the art. 1799-1 C. civ. guarantee for private works above €12,000 HT;
- the 30-day délai global de paiement in public procurement, with moratorium interest at the ECB rate plus 8 points and a €40 indemnity.

Each has a pitfall that loses the right if missed. Generic ChatGPT can explain these rules but will not run the steps, track the deadlines or send the LRAR.

### Cited Findings
**Sous-traitance, loi n° 75-1334 du 31 décembre 1975**
- Art. 12, action directe: the subcontractor has a direct action against the maître d'ouvrage if the principal contractor has not paid **one month after a mise en demeure**. **A copy of the mise en demeure must be sent to the maître d'ouvrage.** — [doctrine.fr, TJ Paris 2024](https://www.doctrine.fr/d/TJ/Paris/2024/TJP5B164C0B166D601E583F); [marche-public.fr, loi 75-1334](https://www.marche-public.fr/Marches-publics/Textes/Lois/loi-75-1334-sous-traitance.htm)
- The mise en demeure is mandatory even if the principal contractor is in a collective procedure, and it is then sent to the liquidator. Declaring the claim is not required to keep the action directe. LRAR is recommended. Subcontractors of different ranks can each act against the maître d'ouvrage. — [consultation.avocat.fr](https://consultation.avocat.fr/blog/christophe-buffet/article-14177-l-action-directe-du-sous-traitant-et-la-mise-en-demeure.html); [FFB, garanties et recours](https://www.ffbatiment.fr/gestion-entreprise/passer-executer-un-marche/sous-traitance/dossier-ba/quels-sont-les-garanties-et-recours-possibles)
- Any waiver of the action directe is deemed unwritten, and the action survives the principal contractor's liquidation or redressement. — [marche-public.fr, Action directe](https://marche-public.fr/Marches-publics/Definitions/Entrees/Action-directe-sous-traitant.htm)
- The maître d'ouvrage's liability is capped at what it still owes the principal contractor **on the date it receives the copy of the mise en demeure**. If funds are short, subcontractors share them pro rata. Speed therefore matters. — [gambin.co](https://gambin.co/blog/assurances-piur-sous-contractant/)
- Art. 3 requires the subcontractor to be accepted and its payment terms approved (agrément) by the maître d'ouvrage. Payment guarantees, either a caution or a délégation de paiement, are mandatory, and a guide says their absence makes the sub-contract void. — [actav.fr](https://www.actav.fr/contrat-de-sous-traitance/); [why.eu](https://www.why.eu/sous-traitance-btp/). *Commercial guides; verify art. 14 on Légifrance.*
- A source says a second-rank subcontractor is not covered and has no access to the action directe. — [kalceo.fr](https://kalceo.fr/guides/sous-traitance-btp-contrat-paiement). **This contradicts the FFB**, which says subcontractors of different ranks can act ([FFB](https://www.ffbatiment.fr/gestion-entreprise/passer-executer-un-marche/sous-traitance/dossier-ba/quels-sont-les-garanties-et-recours-possibles)). The FFB position is more authoritative. Kalceo probably means a sub-subcontractor whose own contractor was not accepted.
- **Possible 2026 legislative changes, unverified:**
  - A Paris law firm mentions a law of 26 May 2026 that narrowed the scope of paiement direct from 28 May 2026. — [Kohen Avocats](https://kohenavocats.fr/2026/09/21/sous-traitant-btp-impaye-paiement-direct-maitre-ouvrage-2026/)
  - A commercial guide mentions a law of 25 June 2026 that reinforces the donneur d'ordre's vigilance duties. — [why.eu](https://www.why.eu/sous-traitance-btp/)
  - Neither was confirmed in an official source. **They must be checked on Légifrance before any product logic is built.**

**Paiement direct du sous-traitant en marché public (Code de la commande publique)**
- The threshold is **€600 TTC** (art. R2193-10). For defence contracts with installation work or services, it is 10% of the contract amount. — [code-commande-publique.com, R2193-10](https://www.code-commande-publique.com/article-r2193-10)
- Paiement direct is open only to a subcontractor that has been accepted and whose payment terms have been approved. It covers only work done after that decision. Waiving it is prohibited (L2193-11). — [marche-public.fr, paiement direct](https://www.marche-public.fr/Marches-publics/Definitions/Entrees/Paiement-direct-sous-traitant.htm); [code-commande-publique.com](https://www.code-commande-publique.com/sous-traitance-paiement-du-sous-traitant-paiement-direct/)
- The subcontractor sends its payment request to the titulaire, who has **15 days** to accept or refuse (R2193-12). **Silence means tacit acceptance** (R2193-13). The request must also be sent to the buyer. One case (CAA Versailles, 2011) shows a subcontractor losing paiement direct because it did not send its request to the buyer. — [marche-public.fr, circuit](https://www.marche-public.fr/Marches-publics/Definitions/Entrees/Paiement-direct-sous-traitant-circuit.htm); [Kohen Avocats](https://kohenavocats.fr/?p=2119576)

**Délai global de paiement, intérêts moratoires, indemnité 40 € (marchés publics)**
- The maximum payment time is 30 days for the State, local authorities and most public administrative bodies, 50 days for public health bodies, and 60 days for public enterprises. — [legifiscal.fr](https://www.legifiscal.fr/vie-affaires/retard-de-paiement-penalites-de-retard-et-indemnite.html); [FFB, délais de paiement travaux](https://www.ffbatiment.fr/gestion-entreprise/passer-executer-un-marche/facturation-paiement/dossier/marches-prives-marches-publics-delais-paiement-travaux)
- Moratorium interest is the ECB refinancing rate on the first day of the semester plus 8 points. It is owed automatically from the day after the due date, with no formality. The €40 forfeit indemnity is set by **D2192-35**. Interest and indemnity must be paid within **45 days** of payment of the principal (R2192-36). — [code-commande-publique.com, intérêts moratoires](https://www.code-commande-publique.com/interets-moratoires-indemnites-forfaitaire-et-complementaire-pour-frais-de-recouvrement); [marche-public.fr L2192-13](https://www.marche-public.fr/ccp/L2192-13-retard-paiement-interets-moratoires.htm)
- Sources disagree on the 2026 rate: 10.40% for H2 2026 in one, and an ECB rate of 2.15%, giving 10.15%, for H1 2026 in another. — [lefreelance.fr](https://lefreelance.fr/articles/penalites-retard-freelance/); [coopererpourformer.fr](https://www.coopererpourformer.fr/calcul-des-interets-moratoires/)
- Public buyers pay late in practice: State 15.9 days and local bodies 19.3 days on average in 2025, per the ODP (see section 2).

**Retenue de garantie, loi n° 71-584 du 16 juillet 1971**
- The retenue is capped at **5%** of the works amount. The rule is d'ordre public. The amounts are released **no later than 1 year after réception**, unless the maître d'ouvrage files a motivated opposition. The firm can replace the retenue with a bank caution. — [SeLoger](https://edito.seloger.com/node/22686); [swim.legal](https://www.swim.legal/blog/retenue-de-garantie-caution-garantie-premiere-demande); [Assemblée nationale question](https://www.assemblee-nationale.fr/dyn/9/questions/QANR5L9QE50353.pdf)
- When funds are consigned at the Caisse des Dépôts, the contractor can withdraw them after 1 year from réception without mainlevée, provided no motivated opposition was notified by LRAR. The file needs a reference to the 1971 law, a RIB, a Kbis under 3 months old and an ID document. — [Caisse des Dépôts, fiche retenue de garantie marché privé (PDF)](https://consignations.caissedesdepots.fr/sites/default/files/2025-12/Marche_travaux_%20prives_retenue_garantie.pdf)
- Prescription: a court held that the 2-year limitation period (biennale) starts only when the one-year period ends, because the sum is not due before then. See also Cass. 3e civ., 11 Jan. 2023, n° 21-11.053. — [doctrine.fr TJ Lyon 2025](https://www.doctrine.fr/d/TJ/Lyon/2025/TJP7FFD4A88E7B081E271F3); [Dalloz actualité](https://www.dalloz-actualite.fr/document/civ-3e-11-janv-2023-fs-b-n-21-11053)
- Sources disagree on timing: one says 12 months for public and 13 months for private contracts, another says 12 months max for private contracts under the 1971 law. In public procurement the retenue is said to be capped at 3% in some cases. — [Obat blog](https://www.obat.fr/blog/retenue-de-garantie-travaux/); [habitatpresto](https://www.habitatpresto.com/pro/conseils/administratif-fiscalite/retenue-de-garantie)

**Garantie de paiement, art. 1799-1 Code civil (marchés privés)**
- The guarantee applies above **€12,000 HT** (décret n° 99-658 du 30 juillet 1999). The FNTP says "dépasse 12 000 € HT" while the FFB says "≥ 12 000 € HT". The threshold is the agreed price minus arrhes and acomptes paid at signature. The rule is d'ordre public (Cass. 3e civ., 11 May 2010, n° 09-14.558). The contractor can demand the guarantee until the balance is paid in full. It takes the form of direct payment by a credit institution or a solidary caution. — [FNTP](https://www.fntp.fr/garantie-de-paiement-dans-les-marches-prives/); [FFB, garantie de paiement](https://www.ffbatiment.fr/gestion-entreprise/passer-executer-un-marche/facturation-paiement/dossier/garantie-de-paiement-marches-prives); [Squire Patton Boggs revue](https://larevue.squirepattonboggs.com/le-caractere-obligatoire-de-la-garantie-de-paiement-due-par-le-maitre-de-l-ouvrage_a1286.html); [FFB Bâtiment Actualité, "La garantie de paiement, un dispositif vital"](https://www.ffbatiment.fr/revues-guides/ba/19-novembre-2023/garantie-paiement-dispositif-vital)

**Facturation électronique (context)**
- Since 1 Sept. 2026, every VAT-registered company must be able to receive e-invoices. Micro-entrepreneurs must issue them from 1 Sept. 2027. — [Tiime blog](https://blog.tiime.fr/top-10-meilleurs-logiciels-de-devis-et-facturation-artisans); [propulsebyca.fr](https://propulsebyca.fr/comptabilite/facture/electronique/btp)

### Inferences
- Several procedures are a sequence of dated steps. That makes them good candidates for a scheduled, verifiable workflow sold per case:
  - **Action directe:** demand for 1975 info and agrément check, then mise en demeure LRAR to the contractor or liquidator **with a copy to the maître d'ouvrage**, then a 1-month timer, then a demand to the MO, then référé-provision or injonction.
  - **Paiement direct:** request to the titulaire **and** the buyer, then a 15-day timer, then a tacit-acceptance notice, then follow-up of the DGP and claim of moratorium interest and the €40.
  - **Retenue de garantie:** diary at réception date + 1 year, then release request or CDC déconsignation file, then claim within the biennale.
  - **Art. 1799-1:** formal demand for the guarantee, then a 15-day suspension of work under art. 1799-1 al. 3 (background, not verified this session).
- The "money left on the table" angles are the most concrete pitch: forgotten retenues de garantie, unclaimed moratorium interest and €40 indemnities on public contracts, and 1799-1 guarantees never requested. A tool can find them from documents the artisan already has (PV de réception, factures, situations).
- Legal risk: the founder's tool must stay "creditor acting in its own name". All of these procedures are naturally done by the creditor itself, which is compatible with that constraint.

### Gaps
- I could not verify on Légifrance the exact current text of the loi 75-1334 articles: art. 3 (agrément), art. 6 (paiement direct), art. 12 (action directe), art. 13 (scope of the MO's obligation), art. 14 (caution / délégation), and art. 14-1 (MO's duty to require acceptance and the guarantee, which in background knowledge applies to private-works contracts except for consumers building their own home).
- The alleged laws of 26 May 2026 and 25 June 2026 are unverified.
- Private B2B rules under the Code de commerce are not covered here: L441-10 (60 days from invoice date or 45 days end of month), D441-5 (€40 indemnity), and the BTP-specific L441-11 to L441-13 rules, if any. These are background knowledge, not verified this session.
- Injonction de payer procedure details (competent court, dematerialised filing via the planned national injonction de payer jurisdiction, cost) were not researched.
- I found no data on how often retenues de garantie are forgotten or left unclaimed, or on the amounts left at the Caisse des Dépôts.

## 4. Concurrents et outils utilisés par les artisans BTP (facturation, relances, recouvrement)

### Takeaway
BTP invoicing tools are cheap, at about €19–79 HT per month, and crowded: Obat, Tolteck, Costructor (free tier), Batappli, EBP, Extrabat and Graneet (quote-based, for mid-size firms). Their dunning features are limited to automatic email reminders. I found **no evidence** that any of them executes BTP-specific procedures: action directe workflow, paiement direct request, retenue de garantie release, 1799-1 demand, LRAR, or injonction preparation. They publish guide content on these topics (SEO), which shows the queries exist.

### Cited Findings
- Tolteck charges €19 HT/month on an annual plan (€228/year) or €25 HT/month without commitment, with a 1-month free trial. — [tool-advisor.fr, Obat vs Tolteck 2026](https://tool-advisor.fr/logiciel-facturation/comparatif/logiciel-devis-facture-batiment/obat-vs-tolteck/); [facturespro.fr](https://facturespro.fr/obat-vs-tolteck)
- Obat prices differ by source: €32/month; €25 HT (micro-AE) to €79 HT/month; or "Pro dès 25 € HT/mois" for micro-entreprises on an annual plan and from €39 HT/month for artisans and TPE/PME. — [tool-advisor.fr](https://tool-advisor.fr/logiciel-facturation/comparatif/logiciel-devis-facture-batiment/obat-vs-tolteck/); [independant.io](https://independant.io/logiciel-devis-facture-batiment/)
- Costructor has a free plan with unlimited quotes and invoices. Its paid plans add e-signature, **relances** and situations, plus time tracking at Premium. — [Costructor, comparatif 2026](https://costructor.co/blog/comparatif-logiciel-devis-facture-btp/)
- Graneet prices are on quote only. No Extrabat price was found. — [independant.io, alternatives Extrabat](https://independant.io/alternative-extrabat/); [appvizer](https://www.appvizer.fr/magazine/construction/btp/logiciel-facturation-batiment)
- Mon Devis Facile: quotes are free and invoicing costs €5/month. Abby has a free plan with e-invoicing. — [GetApp](https://www.getapp.fr/software/2082500/mon-devis-facile); [Abby](https://abby.fr/guide/facturation/logiciel-devis-facture-gratuit-artisan)
- EBP Bâtiment offers SaaS or on-premise subscriptions, with no prices in the extracts. Batappli and Fiducial WinBat exist, with no prices seen. — [EBP (PDF)](https://ebp.com/wp-content/uploads/2024/09/ebp-logiciel-batiment-activ-2025-bd.pdf); [Batiproduits, Batappli](https://www.batiproduits.com/amp/fiche/produits/logiciel-de-devis-et-de-factures-pour-artisans-p69326648.html); [Fiducial](https://www.fiducial.fr/Batiment/WINBAT-Pro-et-Expert/L-importance-d-un-logiciel-de-devis-et-facture-pour-le-batiment)
- BTP software vendors publish content on these procedures: Kalitics on paiement direct, Graneet on paiement direct and e-invoicing, and Obat on retenue de garantie. Content was seen, but no workflow feature. — [Kalitics](https://www.kalitics-btp.com/paiement-direct-sous-traitant); [Graneet](https://www.graneet.com/fr/article/paiement-direct-sous-traitant); [Obat](https://www.obat.fr/blog/retenue-de-garantie-caution-bancaire/)
- Generic dunning tools (Upflow, Dunforce, Libeo) target mid-size firms' accounts receivable. Dunforce prices are on request. Upflow offers automatic reminders and dashboards, with no public prices found. — [appvizer, Dunforce](https://www.appvizer.fr/finance-comptabilite/comptes-debiteurs/dunforce); [SoftwareAdvice, Upflow](https://softwareadvice.fr/software/215749/upflow)
- The CMA Pays de la Loire network offers an "Relancer les factures impayées" service to artisans. — [artisanatpaysdelaloire.fr](https://www.artisanatpaysdelaloire.fr/detail-offre/relancer-les-factures-impayees/generate/)

### Inferences
- The price anchor for artisans is about €20–40/month for the *whole* invoicing tool. A standalone subscription above that will face resistance. A **per-case fee** (for example a one-off action directe or retenue de garantie case) or an integration partnership with an invoicing tool (Obat, Tolteck, Costructor) fits the market better.
- The procedure-execution niche (LRAR, timers, copies to the MO, CDC déconsignation, injonction file) appears unoccupied by BTP software. This is an inference from absence of evidence in snippets, and is not confirmed.

### Gaps
- No official pricing page was read. Prices for Extrabat, Graneet, Batappli, Axonaut, Kalitics and Upflow were not obtained.
- I did not check whether Obat, Tolteck or Costructor offer LRAR sending, mise en demeure templates or injonction de payer support.
- Legal-tech competitors offering mise en demeure, injonction or LRAR to SMEs were not researched in this session.

## 5. Consentement à payer et maturité numérique des artisans

### Takeaway
I found no recent CAPEB or other survey that quantifies artisans' software budget or digital adoption. The indirect signals are mixed: the e-invoicing mandate (receiving since Sept. 2026, issuing for micro-entrepreneurs in 2027) forces digitisation, but the sector is in recession and artisans report administrative overload.

### Cited Findings
- The CAPEB & Batiactu barometers for 2021 and 2022 cover digital transition and BIM. Artisans were mostly "confident or indifferent", and Covid "profoundly changed" their digital practices. No usage rates appear in the extracts. — [Baromètre 2021](https://www.capeb.fr/actualites/barometre-2021-capeb-batiactu); [Baromètre 2022](https://www.capeb.fr/actualites/barometre-2022-capeb-batiactu); [enquête 2021 (PDF)](https://www.capeb.fr/www/capeb/media/enquete-barometre-capeb-batiactu-nov-2021.pdf)
- The ARTIsanté 2025 barometer (CAPEB with IRIS-ST, published 26 May 2026, 2,491 respondents) focuses on health and **administrative overload** of company heads. — [CAPEB Baromètre ARTIsanté 2025](https://www.capeb.fr/actualites/barometre-artisante-2025-la-capeb-alerte)
- The e-invoicing obligations apply from 2026 and 2027 (see section 3). — [Tiime](https://blog.tiime.fr/top-10-meilleurs-logiciels-de-devis-et-facturation-artisans)
- 40–50% of small firms prefer to give up a job rather than risk an unpaid invoice, which shows how much they value protection against unpaid invoices. — [CAPEB 2018](https://www.capeb.fr/actualites/impayes-retards-de-paiement-la-capeb-est-a-vos-cotes)

### Inferences
- The "administrative overload" pain supports a "we do the procedure for you, in your name" positioning over a "here is another tool to learn" positioning.
- Willingness to pay is likely strongest per case, tied to a concrete sum at stake (for example €300 for a €15k retenue de garantie or action directe). It is likely weakest for a recurring subscription among micro-entrepreneurs.

### Gaps
- I found no hard data on software spending per artisan or on adoption rates of invoicing and dunning software. Candidate sources: the France Num barometer (DGE), CAPEB/Batiactu barometers 2023–2025, and Observatoire des métiers du BTP.

## 6. Canaux d'acquisition

### Takeaway
The channels are concentrated and reachable:
- CAPEB, with 62,000 members and departmental unions, and FFB/FFB Artisans, which already run "impayés" workshops;
- CMA, which offers dunning help to artisans;
- trade fairs: Batimat ran 28 Sept.–1 Oct. 2026, and Artibat runs 20–22 Oct. 2027 in Rennes;
- SEO, where BTP software vendors are actively producing content on paiement direct, retenue de garantie and sous-traitance.

I could not confirm Facebook groups or BTP-specialised accounting firms through search.

### Cited Findings
- CAPEB has 62,000 member firms and a network of departmental CAPEBs. — [CAPEB](https://www.capeb.fr/les-chiffres-de-lartisanat)
- FFB Artisans and departmental federations hold impayés meetings: 21 Apr. 2026 "Lutter contre les impayés", and FFB 44 on 4 Mar. 2026. FFB Gironde has a podcast episode on impayés (BATICAST). — [FFB](https://www.ffbatiment.fr/actualites-batiment/Agenda/reunion-information-impayes-44); [BATICAST](https://podcast.ausha.co/baticast/evitez-les-impayes-9); [FFB Artisans](https://www.ffbatiment.fr/organisation-ffb/federations-departementales-chambres-syndicales/ffb-artisans)
- CAPEB 44 offers an "Impayés" member service (Jan. 2025 guide). — [CAPEB 44](https://www.capeb.fr/www/capeb/media/pays-de-la-loire/document/44_Impayes-je-me-prepare-jagis_Janvier2025.pdf)
- CMA Pays de la Loire offers a "Relancer les factures impayées" service. — [artisanatpaysdelaloire.fr](https://www.artisanatpaysdelaloire.fr/detail-offre/relancer-les-factures-impayees/generate/)
- Batimat ran 28 Sept.–1 Oct. 2026 at Paris Expo Porte de Versailles. Visitor figures differ: 300,000 professionals and 1,300 exhibitors in one source, more than 170,000 visitors and about 1,400 exhibitors in another. — [abcsalles](https://www.abcsalles.com/agenda/batimat); [alobees](https://www.alobees.com/en/conseils/batimat-2026)
- Artibat runs every two years in Rennes. The 2025 edition was 22–24 Oct. 2025, and the next is 20–22 Oct. 2027, with about 1,100 exhibitors and 45,000 visitors expected. — [Batiweb](https://www.batiweb.com/actualites/publi-redactionnels/artibat-2027-confiance-professionnels-49288); [Obat blog Artibat](https://www.obat.fr/blog/artibat-salon-artisans/)
- SEO competition is heavy. Lawyers and vendors (Kohen Avocats, Kalitics, Graneet, Obat, Kwixeo, Kalceo, why.eu) publish 2026 guides on "sous-traitant impayé", "paiement direct" and "retenue de garantie". — [Kohen Avocats](https://kohenavocats.fr/2026/05/24/sous-traitant-impaye-paiement-direct-action-directe-maitre-ouvrage-2026/); [Kwixeo](https://www.kwixeo.fr/blog/sous-traitance-batiment-facturer-donneur-ordre/); [Kalitics](https://www.kalitics-btp.com/paiement-direct-sous-traitant)

### Inferences
- The best wedge channel is probably federations and CMA, offering their members a done-for-you procedure kit with a federation discount. A second channel is an integration with an invoicing tool (Costructor's free tier needs monetisable add-ons, and Obat or Tolteck could resell). SEO on long-tail queries such as "action directe sous-traitant modèle", "récupérer retenue de garantie" and "intérêts moratoires marché public calcul" is contested but supported by intent.
- The bar associations (CNB) may be sensitive to a tool that drafts mises en demeure. That is out of scope here but worth flagging.

### Gaps
- I found no data on Facebook groups of artisans (names, membership). Search engines do not index them.
- I found no list of BTP-specialised accounting firms or networks, or their size. Candidates: the CERFRANCE BTP offer and the networks of BTP centres de gestion agréés.
- I found no search-volume data (Google Keyword Planner, Semrush) for the target queries.
- Partnership programmes of BTP software marketplaces were not researched.
