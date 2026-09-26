import { expect, test, type Page } from "@playwright/test";

const password = "motdepasse-e2e-solide";
let counter = 0;
const email = () => `e2e-${Date.now()}-${counter++}@test.local`;

async function signup(page: Page, mail = email()) {
  await page.goto("/signup");
  await page.getByLabel("Adresse e-mail").fill(mail);
  await page.getByLabel("Mot de passe").fill(password);
  await page.getByRole("button", { name: "Créer mon compte" }).click();
  await expect(page).toHaveURL(/\/app$/);
  return mail;
}

async function createMission(page: Page, request: string) {
  await page.getByLabel("Quel problème voulez-vous régler ?").fill(request);
  await page.getByRole("button", { name: "Analyser gratuitement" }).click();
  await expect(page).toHaveURL(/\/app\/missions\/[0-9a-f-]{36}$/);
  return page.url().split("/").pop()!;
}

const status = (page: Page) => page.getByTestId("mission-status").first();

test.describe("route protection", () => {
  test("private pages redirect to login and APIs refuse anonymous calls", async ({ page, request }) => {
    await page.goto("/app/settings");
    await expect(page).toHaveURL(/\/login\?next=%2Fapp%2Fsettings/);
    const res = await request.get("/api/missions");
    expect(res.status()).toBe(401);
    // A forged cookie is not enough: the layout validates it server-side.
    await page.context().addCookies([{ name: "atlas_session", value: "forged", url: "http://localhost:3100" }]);
    await page.goto("/app");
    await expect(page).toHaveURL(/\/login/);
  });

  test("login errors are displayed", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Adresse e-mail").fill("inconnu@test.local");
    await page.getByLabel("Mot de passe").fill("mauvais-mot-de-passe");
    await page.getByRole("button", { name: "Se connecter" }).click();
    await expect(page.getByText("E-mail ou mot de passe incorrect.")).toBeVisible();
    await expect(page).toHaveURL(/\/login$/);
  });
});

test("landing page presents Atlas without fake figures", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Règle ça pour moi");
  await expect(page.getByRole("heading", { name: "Ce qu'on confie à Atlas" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Commencer" }).first()).toBeVisible();
  // Billing is off in this environment: no price is shown.
  await expect(page.getByText("€ TTC")).toHaveCount(0);
  // Legal pages are public, and say plainly what is not configured yet.
  await page.getByRole("link", { name: "Mentions légales" }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Mentions légales");
  await expect(page.getByText("[SIRET non renseigné]")).toBeVisible();
});

test("main journey: create, clarify, plan, execute, results, resume, complete", async ({ page }) => {
  await signup(page);
  await expect(page.getByText("Mode test")).toBeVisible();
  const id = await createMission(
    page,
    "Je déménage le mois prochain. Aide-moi à organiser mon déménagement, comparer les solutions de transport et préparer les démarches.",
  );

  // Clarification: blocking questions are shown, execution is not possible yet.
  await expect(status(page)).toHaveAttribute("data-status", "NEEDS_INPUT");
  await expect(page.getByText("Atlas a besoin de ces informations pour avancer")).toBeVisible();
  await expect(page.getByText("Quelle est la ville de départ ?").first()).toBeVisible();
  await expect(page.getByTestId("run-button")).toBeDisabled();
  // Web search is not configured in this environment: the limit is stated.
  await expect(page.getByText("Hors de portée d'Atlas")).toBeVisible();

  // Answer → re-analysis → plan.
  await page.getByLabel("Répondre ou ajouter une information").fill("Départ de Lyon, arrivée à Nantes, le 15 octobre.");
  await page.getByRole("button", { name: "Envoyer" }).click();
  await expect(status(page)).toHaveAttribute("data-status", "PLANNED");
  await expect(page.getByTestId("step")).toHaveCount(3);
  await expect(page.getByTestId("plan")).toContainText("Rédiger la checklist");

  // Execute.
  await page.getByTestId("run-button").click();
  await expect(status(page)).toHaveAttribute("data-status", "WAITING_FOR_USER", { timeout: 30_000 });
  await expect(page.getByText("À vous de jouer")).toBeVisible();
  await expect(page.locator('[data-step-status="DONE"]')).toHaveCount(2);
  await expect(page.getByText("Exécutée par Atlas").first()).toBeVisible();

  // Results: report, deliverable, real downloads.
  await page.getByRole("tab", { name: /Résultats/ }).click();
  await expect(page.getByText("Dernier compte rendu d'Atlas")).toBeVisible();
  await page.getByTestId("artifact").getByRole("button").first().click();
  await expect(page.getByTestId("artifact")).toContainText("Première action");
  // The deliverable was proofread automatically right after it was written: its
  // prices (10 €, 12 €) appear in no document of the file, so it is not ready to send.
  await expect(page.getByTestId("review-details")).toContainText("Relu : à vérifier");
  await expect(page.getByTestId("review-details")).toContainText("ne figure dans aucune pièce");
  await expect(page.getByTestId("readiness")).toHaveAttribute("data-ready", "false");
  const [download] = await Promise.all([page.waitForEvent("download"), page.getByRole("link", { name: "Télécharger .docx" }).click()]);
  expect(download.suggestedFilename()).toMatch(/\.docx$/);
  const csv = await page.request.get(await page.getByRole("link", { name: ".csv" }).getAttribute("href").then((h) => h!));
  expect(csv.status()).toBe(200);
  expect(await csv.text()).toContain("Option,Prix");

  // Edit the deliverable.
  await page.getByRole("button", { name: "Modifier" }).click();
  await page.getByLabel("Contenu du livrable (Markdown)").fill("- [x] Première action faite");
  await page.getByRole("button", { name: "Enregistrer" }).click();
  await expect(page.getByText("modifié par vous")).toBeVisible();
  // The review applied to the old text: it is flagged as outdated, then re-run on demand.
  await expect(page.getByTestId("review-details")).toContainText("Relecture à refaire");
  await page.getByRole("button", { name: "Relire à nouveau" }).click();
  await expect(page.getByTestId("review-details")).toContainText("Relu : rien à signaler");
  await expect(page.getByTestId("readiness")).toHaveText("Prêt à envoyer");

  // Resume later from the history.
  await page.goto("/app/history");
  await page.getByRole("link", { name: /Organiser le déménagement/ }).click();
  await expect(page).toHaveURL(new RegExp(`/app/missions/${id}$`));

  // The user declares the remaining action.
  await page.getByRole("tab", { name: /Plan/ }).click();
  await page.getByRole("button", { name: "J'ai fait cette étape" }).click();
  await page.getByLabel(/Précision facultative/).fill("Camion réservé.");
  await page.getByRole("button", { name: "Confirmer" }).click();
  await expect(status(page)).toHaveAttribute("data-status", "COMPLETED");
  await expect(page.getByText("Déclarée par vous")).toBeVisible();

  // Journal shows real counters (no invented cost for the test double).
  await page.getByRole("tab", { name: "Journal" }).click();
  await expect(page.getByText("non disponible")).toBeVisible();

  // The user closes the dossier as solved; the dashboard shows what Atlas obtained.
  await page.getByTestId("outcome-resolved").click();
  await page.getByTestId("outcome-amount").fill("180");
  await page.getByTestId("outcome-confirm").click();
  await expect(page.getByTestId("outcome")).toContainText("Récupéré avec Atlas : 180,00 €");
  await expect(page.getByTestId("outcome-panel")).toHaveCount(0);
  await page.goto("/app");
  await expect(page.getByTestId("results-counter")).toContainText("Récupéré avec Atlas : 180,00 €");
  // The owner's economics page is not for customers.
  await expect(page.getByRole("link", { name: "Économie" })).toHaveCount(0);
  await page.goto("/app/admin");
  await expect(page.getByRole("heading", { name: "Page introuvable" })).toBeVisible();
  await expect(page.getByText("Économie d'Atlas")).toHaveCount(0);
});

test("the owner sees what Atlas earns and the lessons from other companies", async ({ page }) => {
  await signup(page, "owner-e2e@test.local");
  await page.getByRole("link", { name: "Économie" }).click();
  await expect(page.getByRole("heading", { name: "Économie d'Atlas" })).toBeVisible();
  // Too few closed dossiers yet: the Homejoy lesson says no paid ads.
  await expect(page.getByTestId("economics-alerts")).toContainText("Pas de publicité payante");
  await expect(page.getByTestId("economics-margin").first()).toBeVisible();
});

test("documents: unsupported formats are refused, readable files are listed", async ({ page }) => {
  await signup(page);
  await createMission(page, "Analyse mon contrat de location et liste les points importants");
  await expect(status(page)).toHaveAttribute("data-status", "PLANNED");
  await page.getByRole("tab", { name: /Documents/ }).click();
  await page.locator("#doc-upload").setInputFiles({ name: "photo.png", mimeType: "image/png", buffer: Buffer.from("fake") });
  await expect(page.getByText(/« photo\.png » : Format « \.png » non pris en charge/)).toBeVisible();
  await page.locator("#doc-upload").setInputFiles({ name: "bail.txt", mimeType: "text/plain", buffer: Buffer.from("Loyer : 850 € par mois. Préavis : 3 mois.") });
  await expect(page.getByText("« bail.txt » importé et lu.")).toBeVisible();
  await expect(page.getByTestId("documents")).toContainText("caractères lisibles");
  await expect(page.getByTestId("conversation")).toContainText("Document importé");
});

test("isolation: another user cannot see or change a mission", async ({ page, browser }) => {
  await signup(page);
  const id = await createMission(page, "Préparer ma déclaration d'impôts");
  const other = await browser.newContext();
  const p2 = await other.newPage();
  await signup(p2);
  for (const res of [
    await p2.request.get(`/api/missions/${id}`),
    await p2.request.delete(`/api/missions/${id}`, { headers: { origin: "http://localhost:3100" } }),
    await p2.request.post(`/api/missions/${id}/run`, { headers: { origin: "http://localhost:3100" } }),
  ]) {
    expect(res.status()).toBe(404);
  }
  await p2.goto(`/app/missions/${id}`);
  await expect(p2.getByRole("heading", { name: "Mission introuvable" })).toBeVisible();
  await other.close();
  // Still intact for its owner.
  await page.reload();
  await expect(page.getByTestId("mission-title")).toBeVisible();
});

test("mutations without a same-origin header are refused (CSRF)", async ({ page }) => {
  await signup(page);
  const res = await page.request.post("/api/missions", { data: { request: "Test CSRF mission" }, headers: { origin: "https://evil.example" } });
  expect(res.status()).toBe(403);
});

test("deleting a mission and logging out", async ({ page }) => {
  await signup(page);
  await createMission(page, "Mission à supprimer rapidement");
  await expect(status(page)).not.toHaveAttribute("data-status", "IN_PROGRESS");
  page.once("dialog", (d) => d.accept());
  await page.getByRole("button", { name: "Supprimer", exact: true }).click();
  await expect(page).toHaveURL(/\/app\/history/);
  await expect(page.getByText("Aucune mission dans cette catégorie.")).toBeVisible();
  await page.getByRole("button", { name: "Déconnexion" }).click();
  await expect(page).toHaveURL(/\/login/);
  await page.goto("/app");
  await expect(page).toHaveURL(/\/login/);
});

test("@mobile dashboard and mission workspace are usable on a phone", async ({ page }) => {
  await signup(page);
  const id = await createMission(page, "Organise ma semaine : dossier CAF, courses et sport");
  await expect(status(page)).toHaveAttribute("data-status", "PLANNED");
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(1);
  await expect(page.getByRole("tab", { name: /Plan/ })).toBeVisible();
  await page.goto("/app");
  await expect(page.getByRole("region", { name: "Missions récentes" }).getByRole("link", { name: /Organise ma semaine/ })).toBeVisible();
  expect(id).toBeTruthy();
});
