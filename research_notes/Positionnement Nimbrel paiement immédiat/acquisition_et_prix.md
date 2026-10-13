# Acquisition channels and pricing benchmarks for a solo French founder (AI agent for written admin procedures: relances, mises en demeure, LRAR, suivi de dossiers)

Research done 2026-10-13. About 16 searches. Several fetches failed (DNS errors on journaldunet.com and litige.fr), so some figures rely on search-result snippets and could not be read on the full page. These are marked "(snippet)". Estimates and unverified figures are labelled as such.

## 1. Experts-comptables as a channel: size, tool adoption, marketplaces, reseller commissions

### Takeaway
The channel is large but concentrated in small firms: about 20,000 cabinets and about 22,000 experts-comptables, with at least 80% of cabinets having fewer than 10 employees. The software routes into cabinets are now Pennylane's partner and marketplace programme (500+ apps claimed), Cegid's Loop/Cloud "univers d'applications" and Tiime. None of them publishes a self-serve listing process or commission rates. Access goes through a partnerships team.

### Cited Findings
- The Ordre counted slightly more than 20,000 cabinets in 2024, up 34% between 2015 and 2024. An Ordre official is quoted: "au moins 80 % des cabinets d'expertise comptable comptent moins de dix collaborateurs" — [Option Finance](https://www.optionfinance.fr/entreprise-finance/experts-comptables-un-marche-en-mutation.html) (snippet)
- About 20,000 cabinets in 2025, +30% in ten years. About 19,000 cabinets in 2023 according to the Observatoire de la profession comptable — [tool-advisor.fr (secondary blog)](https://tool-advisor.fr/blog/chiffres-expertise-comptable/) (snippet; less authoritative)
- 21,611 experts-comptables in 2023, against 19,284 in 2015 — [propulsebyca.fr](https://propulsebyca.fr/idees-business/expert-comptable/etude-marche) / [modelesdebusinessplan.com](https://modelesdebusinessplan.com/blogs/infos/marche-expertise-comptable-chiffres) (snippet, secondary). About 22,000 are cited in [La Gazette France](https://www.lagazettefrance.fr/article/lyon-devient-la-capitale-de-l-expertise-comptable-durant-trois-jours).
- The sector employs nearly 190,000 people, citing the Ordre's "Les chiffres de la profession 2025" — [CCI Paris IDF](https://entreprises.cci-paris-idf.fr/fiches-pratiques/le-metier-dexpert-comptable) (snippet)
- Île-de-France regional order: 7,220 experts-comptables registered in 2025, against 6,956 in 2024 — [OEC Paris rapport moral 2025 (PDF)](https://www.oec-paris.fr/wp-content/uploads/2026/07/rapport-moral-2025.pdf) (snippet)
- Pennylane runs several partner tracks: software publishers wanting an API connector contact the "partenariats connectivité" team; there is also an affiliate programme, a referral track for accounting and advisory professionals, and a commercial reseller track. The page notes that e-invoicing becomes mandatory on 1 September 2026 — [Pennylane partenaires](https://www.pennylane.com/fr/partenaires) / [Pennylane demande de partenariat](https://www.pennylane.com/fr/contact-demande-de-partenariat) (snippet)
- Pennylane's developer docs describe a marketplace of integration partners aimed at companies seeking "new lead opportunities". A 2026 Pennylane post claims 500+ apps — [Pennylane API docs](https://pennylane.readme.io/) (snippet; I did not verify the 500+ figure on a primary page)
- Pennylane launched an "intégrateurs" programme in January 2025 for firms handling migrations, covering prospecting through rollout — [Pennylane blog](https://www.pennylane.com/fr/blog/pennylane-news/lancement-programme-integrateurs)
- Cegid presents Loop and Cegid Cloud Experts-Comptables as a cloud "univers d'applications, de données et de services" that lets cabinets add complementary apps. A Cegid x My Silae partnership adds automated connection with Loop/Quadra from Q4 2025 — [Cegid Loop factsheet](https://www.cegid.com/fr/wp-content/uploads/sites/7/2023/01/Cegid_Cegid-Loop-FV.pdf); [Cegid x My Silae press release](https://www.cegid.com/fr/wp-content/uploads/sites/7/2025/09/CP_Cegid_Partenariat_Cegid_x_My-Silae.pdf)
- Tiime is built for cabinets: Tiime Account for the client side and Tiime ACD for the cabinet back-office — [promptfacile.fr](https://promptfacile.fr/outils/tiime) (secondary)

### Inferences
- About 20k cabinets, mostly with fewer than 10 staff, means many small decision-makers. Direct sales to cabinets is slow for a solo founder. The realistic entry is being listed in the tools they already use (Pennylane especially) and letting the cabinet recommend the tool to its TPE clients.
- The September 2026 e-invoicing obligation is taking up cabinet attention and partner bandwidth in 2026. An e-invoicing-adjacent pitch ("we act on unpaid e-invoices") may get more traction than a standalone tool.
- Indicative only: in SaaS generally, reseller commissions are often 10-30% recurring. I found no French accounting-specific source for this, so treat it as a negotiation assumption.

### Gaps
- No public commission rates for Pennylane, Tiime or Cegid partner and reseller programmes. No public listing criteria or fees.
- The Conseil national de l'Ordre's own "chiffres de la profession 2025" page was not retrieved directly. The firm count therefore rests on secondary quotes.
- No documented case of a SaaS that grew mainly through experts-comptables with numbers. Pennylane itself is the obvious example, but no sourced figures were collected here.
- The number of TPE clients per cabinet was not found.

## 2. Integration marketplaces (Pennylane, Qonto, Shine, Shopify, PMS for conciergeries)

### Takeaway
Shopify is the only marketplace with clear, public, founder-friendly economics: 0% revenue share up to $1M per year, then 15%. Qonto and Pennylane are curated: you contact a partnerships team, they review and then list you. The short-term rental PMS ecosystem (Smoobu, Lodgify, Beds24) runs on APIs, but I found no public app marketplace with traction data.

### Cited Findings
- Shopify App Store: developers pay 0% revenue share on their first $1M of annual revenue, then 15% above it. The threshold resets each year. The change took effect on 1 August 2021, replacing a 20% cut — [CNBC](https://www.cnbc.com/2021/06/29/shopify-cuts-app-store-fees-for-developers-on-first-1-million-in-revenue.html)
- Qonto lists integrations in the "Intégrations et partenariats" section of the web app and runs "security and quality checks for all integrations". Developers who built an integration should write to connect@qonto.com for review and listing; users can request partners at partners@qonto.com — [Qonto support FR](https://support-fr.qonto.com/hc/en-us/articles/23947671003921); [Qonto blog](https://qonto.com/en/blog/qonto/integrations/integrations-and-partnerships-linking-your-finances-and-your-business)
- Qonto has a public API that developers can use to build their own automations — [Qonto blog](https://qonto.com/en/blog/product/connect-linking-your-finances-and-your-business)
- Qonto is connected to Zapier, which offers a low-code route for triggers such as "invoice overdue" — [Zapier Qonto](https://zapier.com/apps/qonto/integrations)
- Beds24 has a partner and reseller page for PMS vendors, with a 2-way API and monthly fees based on usage or a flat rate — [Beds24 partner](https://admin.beds24.com/reseller.html)
- Smoobu is described as an Airbnb Preferred Software Partner and integrates with cleaning tools such as Properly, TurnoverBnB and VRScheduler. Lodgify points users to Zapier for third-party automations — [strhub.com](https://strhub.com/product/smoobu/) (third-party)

### Inferences
- For e-merchants, a Shopify app (for example disputes, chargebacks, or B2B wholesale unpaid invoices) has the best published economics. But Shopify merchants are B2C sellers, so the "unpaid invoice" use case fits less well than it does for freelances and TPE.
- For Qonto and Pennylane, the first step is a working API integration, then an email to the partnerships team. Expect weeks to months before any listing, so this is not an "immediate revenue" channel.
- For conciergeries, Zapier/iCal-level integration with Smoobu or Lodgify is enough for an MVP. An official marketplace listing is not needed to start.

### Gaps
- Shine partner and marketplace conditions: not researched (no results retrieved).
- Shopify's current partner registration fee and any 2025-2026 changes to its revenue-share terms were not verified. Sources date from 2021.
- No traction data, such as installs or leads per month from a Qonto or Pennylane listing, for any small vendor.
- The Airbnb software partner programme is closed or selective, and its current conditions were not verified.

## 3. SEO on high-intent French queries

### Takeaway
I found no published search-volume figures for "relance facture impayée", "mise en demeure modèle", "dépôt de garantie non rendu" or "injonction de payer en ligne". The SERPs are occupied by banks, neobanks and accounting SaaS (Caisse d'Épargne, Finom, Pennylane, Tiime, Fiducial, HighRadius) and by legal-template sites. Competition is high for generic terms.

### Cited Findings
- Pages ranking for "relance facture impayée" include Caisse d'Épargne, Finom, Pennylane, Tiime, Fiducial, BRED and HighRadius — see [Caisse d'Épargne](https://www.caisse-epargne.fr/professionnels/encaisser-client/relance-facture-impayee/), [Finom](https://finom.co/fr-fr/blog/lettre-relance-facture-impayee/), [Pennylane](https://www.pennylane.com/fr/fiches-pratiques/facturation/relances-factures-quelle-est-la-procedure-a-suivre), [Tiime](https://blog.tiime.fr/recouvrement-des-factures-impayees)
- Legal-template sites monetise "mise en demeure": dossierjuridique.fr sells a template at 9.99 € and a mise en demeure at 14.99 €, and also runs a free generator plus a procedure-cost simulator — [dossierjuridique.fr modèle](https://dossierjuridique.fr/marketplace/modele/mise-en-demeure); [générateur](https://dossierjuridique.fr/outils/generateur-mise-en-demeure-gratuit)
- Keyword Planner only shows ranges (for example 100-1K, 10K-100K). Volumes are annual averages and count queries, not people — [Ahrefs FR](https://ahrefs.com/blog/fr/volume-recherche-mot-cle/)

### Inferences
- Banks and neobanks with high domain authority sit on generic terms. A new site should target long-tail and situation-specific queries (for example "relance facture impayée freelance Malt", "dépôt de garantie non rendu après 2 mois lettre", "mise en demeure conciergerie Airbnb dégâts") and free tools or generators. dossierjuridique.fr shows this generator model works.
- SEO is a 6-12 month channel. It does not meet the goal of revenue now, but it is worth starting on day 1.

### Gaps
- No exact monthly volumes found. The founder should pull them from Google Keyword Planner (FR) or the free SE Ranking or Ahrefs keyword tools.

## 4. Cold outreach, LinkedIn, communities and partnerships (CNIL B2B rules, CCI/CMA, BNI)

### Takeaway
B2B email prospecting in France is opt-out, not opt-in, provided the message relates to the recipient's professional role. The recipient must be informed, the sender identified, and a free, simple way to object included in every email. Sole traders (micro-entrepreneurs) sit in a grey area: rules for people (personnes physiques) can apply, so be careful with freelances.

### Cited Findings
- B2C needs prior consent ("sans « oui », c'est « non »"), with an exception for existing customers — [CNIL/Bpifrance fiche (PDF)](https://WWW.CNIL.FR/sites/cnil/files/atoms/files/bpi-cnil-rgpd_fiche_2_ameliorez-maitrisez-votre-relation-client_0.pdf)
- B2B: generic addresses of legal entities (contact@, info@) are not subject to prior consent. People must be informed at collection and be able to object freely, and every message must identify the advertiser and offer an opt-out — [CCI Paris IDF](https://www.entreprises.cci-paris-idf.fr/fiches-pratiques/prospection-commerciale-par-voie-electronique)
- Nominative professional addresses: opt-out is allowed if the message relates to the recipient's function. The reference is the CNIL recommendation on email prospecting — [Clubic](https://www.clubic.com/actualite-50693-.html); [OpenClassrooms](https://openclassrooms.com/fr/courses/6391586-utilisez-un-crm-dans-votre-activite-de-commercial/6689276-respectez-le-cadre-juridique-de-la-prospection-et-de-la-fidelisation)
- Some commercial sites mention new telephone prospecting rules from 11 August 2026 (default prior consent). **Unverified**, so check on cnil.fr or Légifrance — [Legiscope](https://www.legiscope.com/blog/rgpd-marketing-direct-prospection.html)

### Inferences
- A cold email to a property manager's or conciergerie's generic address, or to an accountant about their role, is lawful with an opt-out link. Cold calls may become harder if the 2026 phone rule is confirmed.
- I found no sourced data on Facebook landlord groups, the Malt community, CCI/CMA partnerships or BNI chapters. They remain plausible low-cost channels, but this research does not support them.

### Gaps
- Primary cnil.fr pages were not fetched. Neither were the LinkedIn automation rules (LinkedIn's ToS forbids automation tools).
- I found no sizes or rules for French landlord or freelance Facebook groups, and no CCI/CMA partnership programmes for SaaS vendors.
- BNI France chapter numbers and membership cost were not found.

## 5. Pricing benchmarks (subscription, per-case, LRAR, churn)

### Takeaway
French SMB pricing is low. Landlord tools cost 0-10 € per property per month. TPE relance and receivables tools range from 0-80 €/month, with mid-market tools (Upflow etc.) at 100-300+ €/month. Per-case legal acts sell for about 10-15 € online (template or mise en demeure) and 7.50-10.50 € when an agency adds an LRAR fee. Paper LRAR postage is 7.56 € in 2026. Below $25 ARPA, expect about 6-7% monthly customer churn.

### Cited Findings
**Relance and receivables tools**
- Benchmark: freemium tools for TPE cost 0-80 €/month; AI platforms for ETI start around 500 €/month. Another guide gives 400-10,000 €/year — [swim.legal](https://www.swim.legal/blog/meilleur-logiciel-de-recouvrement-creances-2026-comparatif); [thecfoclub.com](https://thecfoclub.com/fr/tools/meilleur-logiciel-recouvrement-creances-automatise/) (snippet, third-party)
- Upflow: about 100-300 €/month for an SMB, by one guide's estimate. Another listing shows "55 USD", unclear whether that is an entry price — [softwareadvice.fr](https://softwareadvice.fr/software/215749/upflow); [getapp.fr](https://www.getapp.fr/compare/2046662/2051100/upflow-1/vs/leanpay) (estimates)
- Libeo (payables-focused): free plan of 5 transactions/month; a dated test cites 29 € HT/month; 200-400 €/month above 500 supplier invoices per month — [leblogdudirigeant.com](https://www.leblogdudirigeant.com/test-logiciel-libeo/); [lafabriquedunet.fr](https://www.lafabriquedunet.fr/logiciel/libeo)
- Dunforce: quote on request only — [appvizer.fr](https://www.appvizer.fr/finance-comptabilite/comptes-debiteurs/dunforce/alternatives)

**Landlord and property-management SaaS**
- BailFacile 9.99 €/month (annual billing, priced per property); Rentila free for 1 property, Silver 4.90 €/month; Smartloc Zen 6.50 €/month per property — [investissement-locatif-avis.fr](https://investissement-locatif-avis.fr/bailfacile-avis/) (comparison site, 2026)
- A delegated-management site gives 20-40 €/month for a self-management SaaS — [nousgerons.com](https://www.nousgerons.com/gestion-location-gratuite.html) (interested party)

**Per-case legal and postal**
- Paper LRAR 2026: recommandé 4.66 € + AR 1.45 € = **7.56 €** (≤20 g, metropolitan France) — [quelles-aides.fr](https://quelles-aides.fr/documents-attestations/modeles/lettre-recommandee/) (secondary; check against La Poste's grid)
- Electronic LRE (eIDAS) has the same legal value as paper LRAR only for "qualified" LRE. AR24 (owned by Docaposte) charges a single flat price, amount not found — [lafabriquedunet.fr](https://www.lafabriquedunet.fr/logiciels/gestion/envoi-recommande-en-ligne); [solutions-numeriques.com](https://www.solutions-numeriques.com/docaposte-rachete-ar24-un-pionnier-du-recommande-electronique/)
- Online mise en demeure: 14.99 €, with the claim that it "resolves ~80% of disputes without court" (**marketing claim, unverified**); template 9.99 € — [dossierjuridique.fr](https://dossierjuridique.fr/marketplace/modele/facture-impayee-mise-en-demeure)
- Fees charged by others for a mise en demeure by LRAR: Habitat et Humanisme 2026 fee annex 10.50 €; a business fee schedule 7.50 € — [Habitat Humanisme (PDF)](https://www.habitat-humanisme.org/wp-content/uploads/2026/03/annexe-honoraires-2026.pdf); [Bocchio & associés (PDF)](https://www.bocchio-associes.com/wp-content/uploads/2025/08/Couts-pratiques-hors-tarification-reglementee-aout-2025.pdf)
- Commissaire de justice regulated tariff for a commandement de payer: 20.42 € (period 1 March 2024 to 28 February 2026; the 2026 grid exists on the same site) — [Weblex](https://www.weblex.fr/chiffres-cles/tarifs-des-commissaires-de-justice-mise-en-demeure-et-commandement-de-payer-2026)
- dossierjuridique.fr claims a 50 € timbre fiscal at the tribunal judiciaire since 1 March 2026. **Unverified**, check on Légifrance or service-public — [dossierjuridique.fr simulateur](https://dossierjuridique.fr/outils/simulateur-cout-procedure)
- Practical deadline in a mise en demeure: 8-15 days is common (the Code civil sets no minimum) — [quelles-aides.fr](https://quelles-aides.fr/documents-attestations/modeles/lettre-recommandee/)

**Churn benchmarks (ChartMogul)**
- Median monthly customer churn is 6.1% for ARPA under $25/month and 2.2% above $500. A revised version gives 6.8% for ARPA of $0-10. Best-in-class retention for ARPA under $25 is 73% — [ChartMogul blog](https://chartmogul.com/blog/good-customer-churn-rate/)
- ARPA under $10 can expect 6-7% monthly churn — [ChartMogul help](https://help.chartmogul.com/hc/en-us/articles/203359321); for ARPA under $100, aim below 3.5% per month — [ChartMogul churn LP](https://chartmogul.com/lp/saas-churn)

### Inferences
- Price anchors for the founder: per-case "mise en demeure + LRAR sent" at about 15-30 € TTC sits between DIY (7.56 € postage + free template) and a commissaire de justice. Adding tracking and escalation could justify about 30-50 €, but **this upper range is an inference, not a benchmark**.
- A subscription at 19-49 €/month for TPE and freelances fits the "0-80 €/month TPE" band. For landlords, the per-property price must stay under about 10 €/month to compete with BailFacile and Rentila, unless sold per case.
- At ARPA below 25 €, churn of about 6%/month means half of customers are lost within about a year. Per-case or prepaid credit packs avoid subscription churn and suit episodic needs (unpaid invoices, deposits).

### Gaps
- Exact unit prices for AR24, Merci Facteur, LetReco, Lettre24, Postmee and the official La Poste e-LRAR were not found.
- demanderjustice.com and litige.fr prices were not retrieved (litige.fr fetch failed).
- No OpenView or Paddle/ProfitWell European SMB conversion benchmarks (trial-to-paid) were collected.
- Pricing for conciergerie software was not collected.

## 6. Case studies of solo and indie French SaaS founders

### Takeaway
Sourced data on French solo founders shows modest revenue: in a 29-founder Stripe-verified sample, median MRR was about 500 € and the first euro typically came within 30-60 days. I found no documented solo case in the relance or mise en demeure niche, or one sold via accountants.

### Cited Findings
- Founder Trace sample of 29 French-speaking bootstrapped founders with Stripe or Shopify-verified revenue: median monthly revenue about 500 €; 16 of 29 earn 0-1,000 €/month; only 2 exceed 20,000 €/month. Among 15 documented cases, 7 took 30-60 days to their first euro and 5 took under 30 days — [Journal du Net](https://www.journaldunet.com/start-up/1553695-combien-gagnent-vraiment-les-fondateurs-bootstrappes-francophones/) (snippet; full page fetch failed; small, non-representative sample)
- Founder Trace publishes interviews with verified MRR — [lespepitestech.com](https://lespepitestech.com/node/33293)
- Crisp (Nantes) is a classic French bootstrapping story — [SaaS podcast](https://saas.transistor.fm/episodes/bootstrapping-in-france-baptiste-jamin-from-crisp) (not in this niche)

### Inferences
- A realistic early target is a few hundred to a few thousand euros of MRR in months 1-6. Per-case revenue with an existing audience (landlord or freelance communities) is the fastest route to a first euro.

### Gaps
- No named French indie SaaS in recouvrement, LRAR, landlord disputes or conciergerie admin with public MRR and timeline was found. Indie Hackers, X and Maddyness were not searched in depth because of the tool-call budget.
