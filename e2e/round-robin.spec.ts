import { expect, test, type Locator, type Page } from "@playwright/test";

async function addPlayers(page: Page, names: string[]) {
  const input = page.getByTestId("player-name-input");
  const addBtn = page.getByTestId("add-player-btn");
  for (const name of names) {
    await input.fill(name);
    await addBtn.click();
  }
}

async function startTournament(page: Page) {
  await page.getByTestId("start-btn").click();
  await expect(page).toHaveURL(/\/jatek$/);
}

async function chooseWinnerByName(page: Page, name: string) {
  const winnerBtn = page
    .locator('[data-testid^="winner-btn-"]')
    .filter({ hasText: name })
    .first();
  await winnerBtn.click();
}

async function clickPrimaryNext(page: Page) {
  await page.getByTestId("next-match-btn").click();
}

function standingsRowByName(page: Page, playerName: string): Locator {
  return page.locator(`aside li[data-player-name="${playerName}"]`);
}

async function excludePlayerFromStandings(page: Page, playerName: string) {
  const row = standingsRowByName(page, playerName);
  await expect(row).toHaveCount(1);
  await row.getByRole("button", { name: /Kiz.r.s/ }).click();
  await expect(page.getByText(/J.t.kos kiz.r.sa/)).toBeVisible();
  await page.getByTestId("exclude-confirm-btn").click();
}

test.describe("Round-robin E2E", () => {
  test("2 players full flow", async ({ page }) => {
    await page.goto("/");
    await addPlayers(page, ["Anna", "Bela"]);
    await startTournament(page);

    await expect(page.getByText("Meccs 1 / 1")).toBeVisible();
    await chooseWinnerByName(page, "Anna");
    await clickPrimaryNext(page);

    await expect(page).toHaveURL(/\/eredmeny$/);
    await expect(page.getByTestId("podium-slot-1")).toContainText("Anna");
    await expect(page.getByTestId("podium-slot-1")).toContainText("1");
  });

  test("50 players has correct match count", async ({ page }) => {
    await page.goto("/");
    const players = Array.from({ length: 50 }, (_, i) => `J${String(i + 1).padStart(2, "0")}`);
    await addPlayers(page, players);
    await startTournament(page);

    // 50 * 49 / 2 = 1225
    await expect(page.getByText("Meccs 1 / 1225")).toBeVisible();
  });

  test("exclusion is disabled for 2 active players", async ({ page }) => {
    await page.goto("/");
    await addPlayers(page, ["A", "B"]);
    await startTournament(page);

    const rowA = standingsRowByName(page, "A");
    const rowB = standingsRowByName(page, "B");
    await expect(rowA.getByRole("button", { name: /Kiz.r.s/ })).toBeDisabled();
    await expect(rowB.getByRole("button", { name: /Kiz.r.s/ })).toBeDisabled();
  });

  test("wins are recalculated correctly after exclusions", async ({ page }) => {
    await page.goto("/");
    await addPlayers(page, ["A", "B", "C", "D"]);
    await startTournament(page);

    await chooseWinnerByName(page, "D");
    await clickPrimaryNext(page);

    await chooseWinnerByName(page, "B");
    await clickPrimaryNext(page);

    await excludePlayerFromStandings(page, "D");
    await expect(standingsRowByName(page, "D")).toHaveCount(0);

    await excludePlayerFromStandings(page, "B");
    await expect(standingsRowByName(page, "B")).toHaveCount(0);

    await expect(page.getByText("Meccs 1 / 1")).toBeVisible();
    await chooseWinnerByName(page, "C");
    await clickPrimaryNext(page);

    await expect(page).toHaveURL(/\/eredmeny$/);
    await expect(page.getByTestId("podium-slot-1")).toContainText("C");
    await expect(page.getByTestId("podium-slot-1")).toContainText("1");
    await expect(page.getByTestId("podium-slot-2")).toContainText("A");
  });
});
