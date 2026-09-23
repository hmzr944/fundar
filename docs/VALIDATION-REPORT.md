# Atlas — rapport de validation réelle

> État rapporté par l'équipe après exécution de `docs/VALIDATION.md`. Les résultats ci-dessous consignent cette campagne de tests manuels ; ils ne sont pas déduits des seuls tests automatisés.

## Résultat

**Décision : utilisable selon les critères de la section 6 de `VALIDATION.md`.**

- Les intégrations Claude, Tavily et la lecture de pages ont été testées avec de vraies clés, sur deux machines.
- Les 12 missions A1–F2 définies dans la checklist ont été déroulées en conditions réelles, avec comptes de test et documents fictifs/anonymisés pour les cas documentaires.
- Les vérifications E (reprise, interruption, redémarrage serveur) et F (injection par document et par le web, isolation entre comptes) sont rapportées comme réussies.
- Aucun fait inventé ni statut « Terminée » injustifié n'a été constaté durant cette campagne.
- Coût total rapporté : environ 4,50 € pour un budget fixé à 10 €.

## Défauts découverts et corrigés

1. Dates erronées dans certains plannings.
2. Question bloquante injustifiée concernant un IBAN.
3. Fuite de balisage technique dans un livrable.
4. Message d'erreur Tavily trompeur.

Les corrections ont été poussées sur la branche de la PR #2, notamment dans les commits `c62e04a` et `b076409`, puis testées selon le compte rendu de la campagne.

## Vérifications automatisées rapportées après corrections

- `pnpm test` : 80 tests unitaires et d'intégration réussis.
- `pnpm typecheck` : propre.
- `pnpm lint` : propre.

Les suites automatisées complètent, mais ne remplacent pas, les résultats des 12 missions réelles.

## Limites restantes

- La validation ne vaut pas audit de sécurité exhaustif ni revue ligne par ligne.
- Les limites produit et d'hébergement énumérées dans le README restent applicables.
- La validation concerne la branche de la PR #2 ; elle ne signifie pas que celle-ci est fusionnée.

## Décision de campagne

Sur la base des observations consignées ci-dessus et des critères de `docs/VALIDATION.md`, la campagne conclut **utilisable**, avec les limites restantes documentées.