# Atlas — agent personnel généraliste (MVP)

> « Dis-moi ce que tu veux accomplir. Atlas t'aide à le faire avancer, étape par étape, et te montre clairement ce qui a été réalisé. »

Atlas transforme une demande libre en **mission structurée** : il reformule l'objectif, pose seulement les questions utiles, établit un plan d'étapes, exécute ce qu'il peut avec de vrais outils (recherche web, lecture de documents, rédaction de livrables), puis restitue les résultats avec leurs sources. Le statut de chaque mission est **calculé à partir de preuves**, jamais à partir des affirmations du modèle.

---

## Sommaire

1. [Démarrage rapide](#démarrage-rapide)
2. [Configuration des services externes](#configuration-des-services-externes)
3. [Architecture](#architecture)
4. [Modèle de données](#modèle-de-données)
5. [Statuts et vérification](#statuts-et-vérification)
6. [Sécurité et confidentialité](#sécurité-et-confidentialité)
7. [Coûts et limites](#coûts-et-limites)
8. [Tests](#tests)
9. [État des fonctionnalités](#état-des-fonctionnalités)
10. [Limites connues](#limites-connues)
11. [Prochaines étapes recommandées](#prochaines-étapes-recommandées)

---

## Démarrage rapide

Prérequis : Node.js ≥ 20, pnpm, PostgreSQL 16 (ou Docker).

```bash
pnpm install
cp .env.example .env                      # puis renseigner ANTHROPIC_API_KEY (et une clé de recherche si souhaité)

docker compose up -d db                   # ou utiliser un PostgreSQL existant (voir DATABASE_URL)
pnpm db:migrate                           # applique les migrations SQL de ./drizzle

pnpm dev                                  # http://localhost:3000
```

Production :

```bash
pnpm build && pnpm start
```

Scripts utiles :

| Commande | Rôle |
|---|---|
| `pnpm db:generate` | Génère une migration après modification de `src/db/schema.ts` |
| `pnpm db:migrate` | Applique les migrations |
| `pnpm purge` | Maintenance quotidienne (politique de conservation, voir « Conservation et purge ») ; `--dry-run` pour simuler |
| `pnpm storage:check` | Compare les fichiers stockés et les documents en base (orphelins, fichiers manquants) ; `--delete-orphans` supprime les orphelins de plus de 24 h |
| `pnpm test` | Tests unitaires et d'intégration (PostgreSQL requis) |
| `pnpm test:e2e` | Tests de bout en bout dans Chromium |
| `pnpm test:live` | Tests contre la vraie API Claude (nécessite `ANTHROPIC_API_KEY`, payant) |
| `pnpm check:integrations` | Un appel réel minimal à chaque service configuré (Claude, recherche, lecture de page) |
| `pnpm lint` / `pnpm typecheck` | Qualité |

---

## Configuration des services externes

Toutes les variables sont documentées dans [`.env.example`](.env.example). Aucun secret n'est committé.

### Modèle de langage — obligatoire pour l'analyse et l'exécution

- Fournisseur : **Claude (Anthropic)** via le SDK officiel `@anthropic-ai/sdk`, API Messages avec outils côté client.
- Variables : `ANTHROPIC_API_KEY` (clé à créer sur la console Anthropic), `ATLAS_MODEL` (défaut : `claude-opus-5`).
- Pour Opus 5 / Fable 5, Atlas active le repli serveur en cas de refus (`fallbacks: "default"`). Désactivable avec `ATLAS_LLM_FALLBACKS=off`.
- **Sans clé** : l'application fonctionne en mode dégradé et le signale partout. Vous pouvez créer des missions, importer et lire des documents, suivre les étapes à la main et modifier les livrables. En revanche, aucune analyse ni exécution n'a lieu, et aucune réponse n'est simulée.

### Recherche web — facultative

- Deux fournisseurs réels sont implémentés :
  - **Tavily** : `TAVILY_API_KEY` ;
  - **Brave Search** : `BRAVE_SEARCH_API_KEY`.
- `ATLAS_SEARCH_PROVIDER=tavily|brave|none` force un choix ; sinon, le premier fournisseur dont la clé est présente est utilisé.
- **Sans clé** : l'outil `web_search` n'est pas proposé au modèle. Le prompt indique que la recherche est indisponible, l'analyse signale la limite (« Hors de portée d'Atlas ») et aucune étape de recherche n'est créée.
- Pour brancher un autre fournisseur, implémenter l'interface `SearchProvider` dans `src/server/search/providers.ts`.

### Stockage des fichiers

- Disque local (`ATLAS_STORAGE_DIR`, défaut `./storage` en développement), avec des fichiers en mode `0600`.
- **En production**, `ATLAS_STORAGE_DIR` doit être un **chemin absolu sur un volume persistant** (un disque éphémère perd les fichiers à chaque redéploiement). Au démarrage, le serveur vérifie ce chemin et la possibilité d'y écrire ; sinon il s'arrête avec un code d'erreur et un message explicite.
- **Identité du volume** : au premier démarrage, l'application écrit un identifiant aléatoire dans `.atlas-volume` (à la racine du stockage) et en base. Ensuite, le serveur refuse de démarrer si le fichier est absent (volume non monté), différent (volume d'une autre installation) ou inconnu de la base (base neuve branchée sur un ancien volume). Les scripts qui suppriment des fichiers font la même vérification et ne suppriment rien en cas de doute.
- **Migrations avant démarrage** : lancer `pnpm db:migrate` avant `pnpm start` (le démarrage lit l'identité du volume en base).
- **Santé** : `GET /api/health` vérifie l'application et la base ; `GET /api/health/storage` vérifie le volume (identité, écriture, lecture et suppression d'un fichier de test dans `.healthcheck/`, jamais un fichier utilisateur ; résultat mis en cache 30 s). Répond 503 en cas de problème.
- Une panne du stockage pendant un import ou un téléchargement renvoie une erreur explicite (503 « stockage indisponible ») ; rien n'est enregistré pour un import échoué.
- Les scripts de maintenance (`pnpm purge`, `pnpm storage:check`) exigent **toujours** `ATLAS_STORAGE_DIR` en chemin absolu, identique à celui de l'application, quel que soit `NODE_ENV`. La suppression des orphelins est bloquée si plus de 10 % des documents sont introuvables sur le disque, ou si la base est vide alors que le disque contient des fichiers.
- Si le fichier d'origine d'un document a disparu du stockage, son téléchargement renvoie une erreur explicite (410) ; le texte déjà extrait reste utilisé par Atlas. `pnpm storage:check` liste ces fichiers manquants et les fichiers orphelins.
- Les sauvegardes du volume (instantanés) conservent les fichiers supprimés pendant leur propre durée de conservation : à préciser dans la politique de confidentialité.
- Pour un stockage objet (S3, R2…), implémenter l'interface `FileStorage` de `src/server/documents/storage.ts`.

---

## Architecture

**Stack** : Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS 4, PostgreSQL 16 via Drizzle ORM, Claude via `@anthropic-ai/sdk`.

**Pourquoi ces choix :**

- **Un seul projet TypeScript full-stack.** Pas de service séparé à déployer pour un MVP.
- **Drizzle.** Schéma typé, migrations SQL lisibles, aucun binaire natif.
- **Authentification maison.** Sessions en base, mots de passe bcrypt. C'est simple et entièrement testable, sans dépendance à un fournisseur d'identité.
- **Un orchestrateur unique** plutôt que plusieurs agents : une seule boucle modèle ↔ outils, bornée et journalisée.

```
src/
├── app/                      # Pages (landing, auth, /app/*) et routes d'API (/api/*)
├── components/               # UI : primitives, espace de mission, formulaires
├── db/schema.ts              # Modèle relationnel (Drizzle) → migrations dans ./drizzle
├── lib/                      # Config (limites ajustables), helpers HTTP, client API
├── proxy.ts                  # Redirection optimiste des pages privées (la vraie vérification est côté serveur)
└── server/
    ├── auth.ts               # Comptes, sessions (jeton haché), changement de mot de passe
    ├── account.ts            # Suppression des données / du compte, purge de conservation
    ├── missions/             # Service des missions (contrôle d'accès), fusion de plan, statuts dérivés
    ├── documents/            # Validation, extraction de texte (PDF, DOCX, TXT/MD/CSV), stockage
    ├── artifacts/            # Livrables : édition, export .md / .txt / .docx / .csv
    ├── search/               # Fournisseurs de recherche + lecture de pages protégée contre le SSRF
    ├── llm/                  # Interface LlmProvider, implémentation Anthropic, double de test scripté
    └── agent/
        ├── analyze.ts        # Compréhension → clarification → plan (sortie JSON structurée)
        ├── orchestrator.ts   # Boucle d'exécution bornée, validation, vérification, finalisation
        ├── tools.ts          # Outils séparés, entrées validées (zod), sorties structurées
        ├── runner.ts         # Exécutions en arrière-plan, annulation, reprise, quotas
        └── prompts.ts        # Consignes (capacités réelles, règles de preuve, contenu non fiable)
```

### Déroulement d'une mission

1. **Création** (`POST /api/missions`). La demande est enregistrée, puis une *analyse* démarre en arrière-plan.
2. **Analyse** (`analyze.ts`). Le modèle renvoie un JSON validé : titre, objectif, reformulation, contraintes, informations manquantes (bloquantes ou non), demandes hors capacités, étapes typées et message à l'utilisateur. Une information bloquante place la mission en `NEEDS_INPUT`, sinon en `PLANNED`.
3. **Clarification / reprise**. Chaque message de l'utilisateur relance l'analyse. Le plan est **fusionné** (`plan.ts`) : les étapes terminées et leurs preuves sont conservées, les étapes ouvertes sont mises à jour.
4. **Exécution** (`orchestrator.ts`, lancée par l'utilisateur). La boucle modèle ↔ outils tourne sous limites strictes. Chaque appel d'outil est validé, exécuté, persisté et journalisé.
5. **Restitution**. Le compte rendu du modèle est complété par un **bilan factuel calculé par le système** (étapes closes, livrables, sources). Le statut final est dérivé des preuves.

L'interface interroge `GET /api/missions/:id` toutes les 2 s pendant qu'Atlas travaille. On peut quitter la page : le travail continue côté serveur.

### Outils de l'agent

| Outil | Rôle | Garde-fous |
|---|---|---|
| `web_search` | Recherche réelle (Tavily/Brave) ; chaque résultat devient une `Source` | Proposé seulement si un fournisseur est configuré |
| `fetch_page` | Lit le texte d'une page | URL limitées à celles trouvées par la recherche ou écrites par l'utilisateur (anti-exfiltration) ; blocage SSRF à la résolution DNS ; http(s) et ports standard uniquement ; 2 Mo, 15 s, 4 redirections revalidées |
| `read_document` | Lit le texte extrait d'un document importé, par tranches | Limité aux documents de la mission et de son propriétaire |
| `create_deliverable` | Crée un livrable Markdown (courrier, e-mail, checklist, tableau…) | Taille bornée |
| `update_step` | Change le statut d'une étape | `done` exige une preuve selon le type (voir ci-dessous) |
| `list_history` | Consulte les autres missions de l'utilisateur | Métadonnées uniquement, jamais celles d'autres utilisateurs |
| `finish_mission` | Clôt l'exécution avec un compte rendu honnête | Ne fixe pas le statut |

Chaque outil renvoie `{ ok, content, error? }`. Une erreur n'arrête pas la mission : le modèle la voit et adapte sa suite, et elle est journalisée.

---

## Modèle de données

Défini dans [`src/db/schema.ts`](src/db/schema.ts). Migration initiale : [`drizzle/0000_init.sql`](drizzle/0000_init.sql).

| Table | Contenu |
|---|---|
| `users` | E-mail (unique), nom, hachage bcrypt |
| `sessions` | **SHA-256** du jeton de session (le jeton brut n'existe que dans le cookie `httpOnly`), expiration |
| `missions` | Demande d'origine, titre, objectif, reformulation, contraintes / infos manquantes / hors capacités (JSONB), statut, résumé de contexte, compte rendu, actions restantes, limites, dernière erreur |
| `mission_steps` | Clé stable, titre, description, **type** (`research`, `document_analysis`, `deliverable`, `planning`, `user_action`), ordre, dépendances, statut, résultat, erreur, **auteur** (`atlas` / `user`), **preuves** (sources, documents, livrables) |
| `messages` | Conversation (`user`, `assistant`, `event`) et métadonnées |
| `documents` | Fichiers importés : nom assaini, type, taille, clé de stockage opaque, statut d'extraction, texte extrait, erreur |
| `artifacts` | Livrables Markdown, type, étape liée, modifié ou non par l'utilisateur |
| `sources` | URL, titre, extrait, origine (`search_result` / `page`), date de publication si connue, date de récupération |
| `mission_runs` | Chaque analyse ou exécution : statut, raison d'arrêt, compteurs, tokens, coût estimé, *heartbeat*, demande d'annulation |
| `execution_logs` | Appels au modèle et aux outils : statut, durée, tokens, coût estimé, tentative, détails **techniques uniquement** |

Contraintes notables :

- clés étrangères en `ON DELETE CASCADE` (la suppression d'une mission emporte tout) ;
- index par utilisateur et par date ;
- **index unique partiel** garantissant au plus une exécution active par mission ;
- unicité `(mission, clé d'étape)` et `(mission, url, origine)`.

La séparation des données entre utilisateurs est appliquée **côté serveur, dans chaque requête**. Toute lecture passe par l'identifiant de l'utilisateur, et une ressource étrangère renvoie 404, comme une ressource inexistante.

---

## Statuts et vérification

Le statut d'une mission est calculé par `deriveMissionStatus()` (`src/server/missions/status.ts`) à partir de l'état réel des étapes :

- `DRAFT` → `NEEDS_INPUT` (question bloquante) → `PLANNED` → `IN_PROGRESS` (exécution active)
- `WAITING_FOR_USER` : il ne reste que des actions de l'utilisateur
- `BLOCKED` / `FAILED` : blocage ou échec sans aucun progrès
- `PARTIALLY_COMPLETED` : des étapes closes et d'autres encore ouvertes
- `COMPLETED` : **toutes** les étapes sont closes **et** chaque étape terminée porte sa preuve

Preuves exigées pour qu'Atlas termine une étape (`update_step` refuse sinon) :

| Type d'étape | Preuve |
|---|---|
| `research` | `source_ids` de sources réellement enregistrées pour la mission |
| `document_analysis` | `document_ids` lus avec `read_document` **pendant cette exécution** |
| `deliverable` | `artifact_ids` de livrables existants de la mission |
| `planning` | un résultat explicite |
| `user_action` | **jamais par Atlas** : seulement une déclaration de l'utilisateur |

Une étape marquée faite par l'utilisateur est enregistrée avec `completedBy = "user"` et affichée « Déclarée par vous », distincte de « Exécutée par Atlas ». À la fin d'une exécution, une étape restée « en cours » est rouverte plutôt que présentée comme faite.

---

## Sécurité et confidentialité

- **Authentification** : bcrypt (coût 12) ; cookie `httpOnly`, `SameSite=Lax` et `Secure` en production ; jetons stockés hachés. Un changement de mot de passe révoque toutes les sessions. Les connexions et inscriptions sont limitées en débit, et le temps de réponse est constant pour un e-mail inconnu.
- **Autorisation** : vérifiée côté serveur dans chaque route et chaque service. `proxy.ts` ne sert qu'à rediriger plus vite.
- **CSRF** : les requêtes de modification exigent un en-tête `Origin` identique à l'hôte, en complément de `SameSite`.
- **Validation** : tous les corps de requête passent par zod, et les identifiants sont vérifiés au format UUID.
- **Uploads** :
  - liste blanche d'extensions **et** vérification du contenu (signatures PDF/DOCX, pas d'octets nuls pour le texte) ;
  - 10 Mo et 20 fichiers par mission ;
  - nom assaini, clé de stockage aléatoire ;
  - téléchargement toujours en pièce jointe avec `nosniff`.
- **Injection de prompt** : le contenu des pages et documents est encadré par `<untrusted_content>`, et les consignes demandent de le traiter comme une donnée. Surtout, **les outils eux-mêmes** empêchent les effets dangereux : `fetch_page` ne peut pas visiter une URL qui n'a pas été trouvée par la recherche ou fournie par l'utilisateur, aucun outil ne modifie les permissions, et aucun outil n'effectue d'action engageante (paiement, envoi, signature).
- **SSRF** : les adresses privées, locales et de métadonnées cloud sont refusées au moment de la résolution DNS, puis à chaque redirection.
- **Rendu** : le Markdown est rendu sans HTML brut ; les liens non http(s) sont neutralisés ; l'export CSV neutralise les formules.
- **Journaux** : aucune donnée de contenu (texte de documents, messages) ; seulement des métadonnées techniques (outil, durée, tokens, hôte consulté, codes d'erreur).
- **Conservation et suppression** : on peut supprimer une mission (fichiers compris), toutes ses données ou son compte (après confirmation du mot de passe). Les données sont rendues inaccessibles dès la demande ; les fichiers sont supprimés lors du traitement de la file de suppression (`file_deletions`), les échecs y restent et sont retentés. Les durées d'effacement des sauvegardes dépendent de l'hébergeur et doivent être précisées séparément.
- **Registre d'usage** (`usage_records`) : une ligne par analyse ou exécution (dates, compteurs, coûts, aucun contenu), indépendante des missions pour les quotas et le suivi des coûts ; anonymisée à la suppression du compte.

### Conservation et purge

`pnpm purge` est à planifier **une fois par jour** (par exemple à 3 h) chez l'hébergeur, avec **le même environnement que l'application** (dont `ATLAS_STORAGE_DIR` absolu). **La première exécution en production doit se faire avec `--dry-run`.**

| Étape | Règle (réglage) |
|---|---|
| Missions | sans activité depuis 180 jours (`ATLAS_RETENTION_DAYS`) ; l'ouverture d'une mission compte comme activité ; une mission en cours de traitement est ignorée |
| Comptes | sans activité authentifiée depuis 365 jours (`ATLAS_ACCOUNT_INACTIVE_DAYS`) : **non supprimés** tant que `ATLAS_ACCOUNT_PURGE=off` (défaut), seulement comptés ; si activé, suppression complète avec anonymisation du registre |
| Sessions | expirées |
| Registre d'usage | lignes de plus de 24 mois (`ATLAS_USAGE_RETENTION_MONTHS`) |
| File de suppression | nouvelles tentatives ; entrées en échec après 7 tentatives signalées |
| Fichiers orphelins | plus de 24 h (`ATLAS_ORPHAN_MIN_AGE_HOURS`), avec les garde-fous du rapprochement |

Un verrou empêche deux purges simultanées. Chaque étape est indépendante. Les étapes qui effacent des fichiers ne s'exécutent que si l'identité du volume est vérifiée ; sinon les fichiers restent en file d'attente. Code de sortie : 0 terminé, 1 point à vérifier, 2 exécution impossible.
- **Confidentialité** : le contenu nécessaire à l'analyse est transmis au fournisseur du modèle, et les requêtes de recherche au fournisseur de recherche. La page Paramètres le précise.

---

## Coûts et limites

Chaque appel au modèle enregistre les tokens (entrée, sortie, cache) et un **coût estimé**. Celui-ci est calculé à partir des tarifs publics (`src/server/llm/types.ts`) et affiché comme une estimation. Pour un modèle inconnu, le coût est `null` : aucun chiffre n'est inventé. Les appels d'outils, les durées, les erreurs et les tentatives sont aussi journalisés, et visibles dans l'onglet **Journal** de chaque mission et dans **Paramètres**.

Limites ajustables par variables d'environnement (`src/lib/config.ts`) :

| Variable | Défaut | Effet |
|---|---|---|
| `ATLAS_MAX_ITERATIONS` | 24 | Échanges avec le modèle par exécution |
| `ATLAS_MAX_TOOL_CALLS` | 40 | Appels d'outils par exécution |
| `ATLAS_MAX_RUN_SECONDS` | 600 | Durée maximale d'une exécution |
| `ATLAS_MAX_RUN_TOKENS` | 1 500 000 | Budget de tokens par exécution |
| `ATLAS_MAX_IDENTICAL_CALLS` | 2 | Appels identiques tolérés (détection de boucle) |
| `ATLAS_MAX_CONSECUTIVE_ERRORS` | 5 | Échecs d'outils consécutifs avant arrêt |
| `ATLAS_RUNS_PER_DAY` / `ATLAS_ANALYSES_PER_DAY` | 40 / 150 | Quotas par utilisateur sur 24 h glissantes |
| `ATLAS_STALE_RUN_SECONDS` | 180 | Délai sans *heartbeat* avant de considérer une exécution comme interrompue |

Quand une limite est atteinte, l'exécution s'arrête proprement : le travail fait est conservé, la raison est affichée et la mission peut être reprise.

---

## Tests

```bash
pnpm test        # 72 tests unitaires + intégration (base atlas_test)
pnpm test:e2e    # 9 tests Playwright (base atlas_e2e, serveur Next lancé automatiquement)
pnpm test:live   # 5 tests contre la vraie API Claude — ignorés sans ANTHROPIC_API_KEY
```

Bases de test : `TEST_DATABASE_URL` (défaut `postgres://atlas:atlas@localhost:5432/atlas_test`) et `E2E_DATABASE_URL` (défaut `…/atlas_e2e`). Avec Docker, `docker compose up -d db` les crée.

**Ce qui est couvert**

| Domaine | Tests |
|---|---|
| Compréhension et planification | demande simple, complexe (re-planification), ambiguë (questions non bloquantes), nécessitant des informations (bloquantes → `NEEDS_INPUT` → réponse → `PLANNED`), impossible (hors capacités enregistrées), sortie invalide du modèle, absence de modèle |
| Orchestration | sélection des outils selon la configuration, refus des fausses réussites (preuves manquantes ou invalides, `user_action`), erreurs d'outil et de fournisseur, **reprise** après échec sans perte, détection de boucle, limite d'itérations, relance quand le modèle cesse d'utiliser les outils, annulation, une seule exécution à la fois, récupération après redémarrage, injection de prompt et URL d'exfiltration, journalisation des tokens, quotas |
| Données et sécurité | isolation complète entre utilisateurs (missions, étapes, documents, livrables, outils de l'agent), sessions (hachage, expiration, révocation), validation des entrées, uploads (format, contenu usurpé, taille, nombre), suppression (mission, données, compte, conservation), protection SSRF |
| Documents et livrables | extraction réelle PDF / DOCX / texte, export DOCX réel (vérifié en ouvrant le zip), CSV |
| Scénarios complets | déménagement ; comparaison d'offres avec lecture des pages ; analyse d'un PDF ; courrier à partir de deux documents (DOCX + TXT) ; organisation d'une semaine sans recherche web |
| Interface (Chromium) | protection des routes, erreurs de connexion, parcours complet (création → questions → réponse → plan → exécution → résultats → téléchargements → édition → reprise depuis l'historique → étape déclarée → terminée), erreurs d'upload, isolation par l'API et par l'interface, CSRF, suppression et déconnexion, affichage mobile sans débordement |

**Ce qui n'est PAS couvert par les tests automatiques** (à lire honnêtement) :

- Dans `pnpm test` et `pnpm test:e2e`, le modèle de langage est remplacé par un **double de test scripté** (`src/server/llm/scripted.ts`), et la recherche par un faux fournisseur. Ces tests vérifient ce que *le système* fait des réponses du modèle, **pas la qualité de compréhension d'un vrai modèle**. Le double de test est refusé si `NODE_ENV=production`, et l'interface affiche un bandeau « Mode test » quand il est actif.
- Les intégrations **Anthropic, Tavily et Brave** n'ont pas été exécutées dans l'environnement de développement de ce MVP, faute de clés. Le code suit la documentation officielle et compile, mais `pnpm test:live` doit être lancé avec une vraie clé pour valider la qualité des analyses. Les tests de recherche réelle restent à écrire.
- La lecture de pages a été testée contre un serveur HTTP local ; un seul essai réel a été fait (`pnpm check:integrations` sur service-public.fr, redirection comprise).

La procédure de validation avec les vraies clés (connexions, `test:live`, 12 missions réelles, grille d'évaluation, critères de décision) est décrite dans [`docs/VALIDATION.md`](docs/VALIDATION.md).

---

## État des fonctionnalités

### Opérationnel et vérifié par les tests

- Inscription, connexion, déconnexion, sessions, protection des routes, changement de mot de passe
- Création de mission en langage libre ; historique avec recherche et filtres ; reprise d'une mission
- Pipeline d'analyse → questions de clarification → plan typé, avec fusion du plan à chaque nouvelle information
- Orchestrateur avec outils, limites, annulation, reprise après erreur ou redémarrage, journalisation et coûts estimés
- Statuts dérivés des preuves ; étapes déclarées par l'utilisateur distinguées de celles exécutées par Atlas
- Import de documents (PDF texte, DOCX, TXT, MD, CSV) avec extraction réelle et erreurs affichées
- Livrables consultables, copiables, modifiables et **réellement téléchargeables** (.docx, .md, .csv si tableau)
- Sources affichées, en distinguant les pages lues des simples résultats de recherche
- Isolation des données entre utilisateurs ; suppression (mission, document, données, compte) ; purge de conservation
- Interface responsive sombre : landing, authentification, tableau de bord, espace de mission, historique, paramètres

### Implémenté mais non vérifié contre le service réel

- Appels à Claude (`AnthropicProvider`) : sortie structurée pour l'analyse, outils pour l'exécution, repli en cas de refus
- Recherche **Tavily** et **Brave**
- Lecture de pages web publiques réelles

### Non implémenté (hors périmètre du MVP)

- Rappels et notifications. La structure le permet (statuts, actions restantes), mais **aucun rappel n'est promis ni affiché**.
- OCR (PDF scannés, images), analyse d'images
- Appels, paiements, envoi d'e-mails, connexion aux comptes, remplissage de formulaires, toute action engageante
- Réinitialisation du mot de passe par e-mail (aucun service d'envoi configuré)
- Streaming des réponses du modèle (l'interface interroge le serveur toutes les 2 s)
- Stockage objet (S3) : seule l'interface existe

---

## Limites connues

- **Exécution en arrière-plan dans le processus web.** Les analyses et exécutions tournent dans le processus Node de `next start`. Il faut donc un serveur Node qui reste actif : cela ne convient pas à des fonctions *serverless* à durée courte. En cas de redémarrage, l'exécution est marquée « interrompue » (après `ATLAS_STALE_RUN_SECONDS`) et peut être reprise. L'annulation d'un appel en cours ne fonctionne que sur l'instance qui l'exécute. Sur les autres, le drapeau d'annulation est lu entre deux étapes.
- **Instance unique recommandée.** La limitation de débit des connexions et les contrôleurs d'annulation sont en mémoire.
- **Lecture de pages** : pas de rendu JavaScript. Les sites entièrement dynamiques renvoient « pas de texte lisible ».
- **Documents** : les 400 000 premiers caractères extraits sont conservés. Pas d'OCR.
- **Contexte d'une exécution** : l'historique complet des tours est conservé en mémoire pendant l'exécution. Pour de très longues missions, la compaction n'est pas encore activée.
- **Coûts** : ce sont des estimations fondées sur les tarifs publics, qui ne tiennent pas compte des remises ni des coûts des fournisseurs de recherche.
- **Pas de vérification d'e-mail** à l'inscription.

---

## Prochaines étapes recommandées

1. **Valider le vrai modèle** en suivant [`docs/VALIDATION.md`](docs/VALIDATION.md) : lancer `pnpm check:integrations` et `pnpm test:live` avec une clé, puis écrire un petit jeu d'évaluation (20 à 30 demandes réelles) pour régler les prompts : pertinence des questions, qualité des plans, respect des règles de preuve.
2. **Valider la recherche réelle.** Tester Tavily ou Brave sur les scénarios « comparer des offres » et « déménagement », et ajouter des tests `live` pour la recherche.
3. **File de tâches persistante** (pg-boss, qui réutilise PostgreSQL) pour sortir les exécutions du processus web et permettre plusieurs instances.
4. **Streaming et progression** : afficher en direct les étapes et les outils utilisés (SSE).
5. **Rappels** : table `reminders` + tâche planifiée + envoi d'e-mails (et vérification d'e-mail / réinitialisation du mot de passe).
6. **OCR et images** via l'entrée PDF/vision du modèle, pour les documents scannés.
7. **Stockage objet** chiffré et antivirus sur les uploads avant une ouverture publique.
