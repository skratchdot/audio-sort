import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

async function checkAccessibility(page) {
  const { violations } = await new AxeBuilder({ page }).analyze();
  expect(
    violations.map(({ id, nodes }) => ({
      id,
      nodes: nodes.map(({ target, failureSummary }) => ({ target, failureSummary })),
    })),
  ).toEqual([]);
}

for (const route of ["./", "about", "api"]) {
  test(`accessibility: ${route}`, async ({ page }) => {
    await page.goto(route);
    if (route === "./") await expect(page.locator("#base-svg rect")).toHaveCount(12);
    await checkAccessibility(page);
  });
}

test("accessibility: settings and dialogs", async ({ page }) => {
  await page.goto("./");
  await expect(page.locator("#base-svg rect")).toHaveCount(12);
  for (const tab of await page.getByRole("tab").all()) {
    await tab.click();
    await checkAccessibility(page);
  }
  await page.getByRole("tab", { name: "Audio", exact: true }).click();
  await page.locator('[data-audio-type="soundfont"]').click();
  await page.getByRole("tab", { name: "SoundFont", exact: true }).click();
  await checkAccessibility(page);
  await page.locator("#modal-sort-open").click();
  await checkAccessibility(page);
  await page.getByRole("tab", { name: "Algorithm", exact: true }).click();
  await expect(page.getByRole("button", { name: "Save changes" })).toBeEnabled();
  await checkAccessibility(page);
  await page.keyboard.press("Escape");
  await page.locator("#add-algorithm-btn").click();
  await expect(page.locator(".ace_editor")).toBeVisible();
  await checkAccessibility(page);
  await page.keyboard.press("Escape");
  for (const id of ["base", "sort"]) {
    await page.locator(`[data-midi-export="${id}"]`).click();
    await checkAccessibility(page);
    await page.keyboard.press("Escape");
  }
});
