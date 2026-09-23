# Atlas — rapport de validation réelle

> État rapporté par l'équipe après exécution de `docs/VALIDATION.md`. Les résultats ci-dessous consignent cette campagne de tests manuels ; ils ne sont pas déduits des seuls tests automatisés.

## Résultat

**Décision : utilisable selon les critères de la section 6 de `VALIDATION.md`.**

- Les intégrations Claude, Tavily et la lecture de pages ont été testées avec de vraies clés, sur deux machines.
- Les 12 missions A1–F2 définies dans la checklist ont été déroulées en conditions réelles, avec comptes de test et documents fictifs/anonymisés pour les cas documentaires.
- Les vérifications E (reprise, interruption, redémarrage serveur) et F (injection par document et par le web, isolation entre comptes) sont rapportées comme réussies.
- Aucun fait inventé ni statut « Terminée » injustifié n'a été constaté durant cette campagne.
- Coût total rapporté : environ 4,50 € pour un budget fixé à 10 €.

## Défauts découverts et corrigés pendant la campagne de validation

1. Dates erronées dans certains plannings.
2. Question bloquante injustifiée concernant un IBAN.
3. Fuite de balisage technique dans un livrable.
4. Message d'erreur Tavily trompeur.

Corrections poussées sur la branche de la PR #2 dans les commits `c62e04a` et `b076409`.

## Revue de code finale avant fusion

Une revue à 8 angles (auth/isolation, orchestration/reprise, preuves/statuts, outils web/SSRF, upload/documents, livrables/XSS, CSRF/permissions/erreurs, DB/migrations/secrets/code mort) a été menée sur l'ensemble de la branche, avant la décision de fusion. Verdict global : base de code inhabituellement bien durcie pour un MVP — la plupart des classes de bugs classiques (IDOR, XSS, CSRF, SSRF, injection) étaient déjà couvertes.

### Défauts trouvés et corrigés

| # | Défaut | Gravité | Commit |
|---|---|---|---|
| — | Un utilisateur pouvait déclarer « faite » n'importe quelle étape (pas seulement `user_action`) sans preuve, faisant passer la mission à « Terminée » à tort. | Critique | `6d75f37` |
| #1+#6 | Une exécution marquée « interrompue » par erreur (retard de battement de cœur, processus encore vivant) continuait de tourner ; sa finalisation pouvait réinitialiser les étapes d'une deuxième exécution légitime sur la même mission. Livrables non idempotents à la reprise. | Élevée | `84e5c89` |
| #5 | Erreurs d'extraction de documents inattendues jamais loguées côté serveur, masquant un vrai bug ou une tentative d'exploitation. | Faible | `a7dfbf0` |
| #2 | Limite de taille d'upload contournable en l'absence d'un en-tête `Content-Length` valide (encodage chunked). | Moyenne | `d76f5a4` |

### Limites connues, documentées mais non corrigées

Décision explicite : ne pas corriger maintenant, pour ne pas modifier du code sans problème concret et actuel à résoudre. À revoir si le contexte change (déploiement public, infrastructure précisée).

- **#3 — Limiteur de tentatives de connexion contournable.** `clientKey()` (`src/lib/http.ts`) dérive la clé de limitation de débit de l'en-tête `X-Forwarded-For`, modifiable par le client. Si l'application n'est pas déployée derrière un proxy de confiance qui réécrit cet en-tête, un attaquant peut faire varier sa valeur pour contourner la limite de 10 tentatives/15 min sur `/api/auth/login` et `/api/auth/signup`. Effet secondaire : la table de tentatives en mémoire grossit alors sans limite. **Action avant toute exposition publique sans proxy de confiance en amont** : soit garantir qu'un tel proxy est en place et réécrit `X-Forwarded-For`, soit corriger `clientKey()` pour ignorer cet en-tête en son absence de configuration explicite.
- **#4 — DOCX/PDF sans limite de décompression/pages avant troncature.** `mammoth` (DOCX) et `unpdf` (PDF) peuvent décompresser ou parcourir un document entier en mémoire avant que la troncature à `MAX_EXTRACTED_CHARS` (`src/server/documents/extract.ts`) ne s'applique — une forme de « zip bomb » ou de PDF à très grand nombre de pages, sous la limite de taille d'upload, peut provoquer un pic mémoire/CPU. Durcissement recommandé avant une exposition à un public large : limiter la taille décompressée (DOCX) et le nombre de pages traitées (PDF) avant extraction complète.
- **#7 — Nettoyage cosmétique.**
  - `setStorageForTests` (`src/server/documents/storage.ts`) est exporté mais n'a aucun appelant dans le dépôt — à supprimer ou à câbler dans un test.
  - Le champ `evidence` d'une étape n'est pas réinitialisé quand une révision de plan la rouvre à `PENDING` (`src/server/missions/plan.ts`) ni côté déclaration utilisateur (`src/server/missions/service.ts`) : un ancien décompte de preuves peut rester affiché brièvement dans l'interface pour une étape rouverte, non re-vérifiée. Sans conséquence sur le calcul du statut (`stepHasEvidence` exige `status === "DONE"` avant de regarder `evidence`), uniquement un affichage à corriger.
  - La preuve `document_analysis` (`read_document` appelé) atteste que le document a été lu, pas que le résultat rapporté en est réellement issu — garantie plus faible que ce que l'interface laisse penser (« N document(s) lu(s) »).

## Vérifications automatisées, état final (après la revue de code finale)

- `pnpm test` : **93 tests** unitaires et d'intégration réussis (dont 11 ajoutés pendant la revue finale : reprise/concurrence, idempotence des livrables, logs d'extraction, validation d'upload).
- `pnpm test:e2e` : **9/9** réussis (Chromium + mobile), relancés après les derniers correctifs.
- `pnpm typecheck` : propre.
- `pnpm lint` : propre.

Les suites automatisées complètent, mais ne remplacent pas, les résultats des 12 missions réelles.

## Limites restantes

- La validation ne vaut pas audit de sécurité exhaustif ni revue ligne par ligne — la revue de code finale était large (8 angles) mais reste elle-même non exhaustive.
- Les limites produit et d'hébergement énumérées dans le README restent applicables, y compris les trois points #3/#4/#7 ci-dessus.
- La validation concerne la branche de la PR #2 ; elle ne signifie pas que celle-ci est fusionnée.

## Décision de campagne

Sur la base des observations consignées ci-dessus et des critères de `docs/VALIDATION.md`, la campagne conclut **utilisable**, avec les limites restantes documentées. Aucun défaut critique ou élevé restant ouvert : les deux (contournement de preuve, course entre exécutions) ont été corrigés et testés. Les points restants (#3/#4/#7) sont des durcissements à faire avant une exposition publique sans infrastructure de protection en amont, pas des bloqueurs pour un pilote fermé.