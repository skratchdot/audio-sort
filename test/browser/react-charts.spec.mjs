import { expect, test } from "@playwright/test";

test("React bar editing keeps hover feedback and stops on pointer cancellation", async ({
  page,
}) => {
  await page.goto("./");
  const svg = page.locator("#base-svg");
  const bars = svg.locator("rect");
  await expect(bars).toHaveCount(12);
  const box = await svg.boundingBox();
  await page.mouse.move(box.x + box.width / 24, box.y + box.height / 2);
  await expect(bars.first()).toHaveAttribute("opacity", "0.5");
  await expect(bars.first()).toHaveClass(/fill-red-700/);
  await expect(bars.nth(1)).toHaveClass(/fill-sky-700/);
  await page.mouse.down();
  await svg.dispatchEvent("pointercancel", { pointerId: 1 });
  const before = await bars.evaluateAll((nodes) =>
    nodes.map((node) => node.getAttribute("height")),
  );
  await page.mouse.move(box.x + box.width * 0.9, box.y + box.height * 0.1);
  await page.mouse.up();
  expect(
    await bars.evaluateAll((nodes) => nodes.map((node) => node.getAttribute("height"))),
  ).toEqual(before);
  await page.mouse.move(0, 0);
  await expect(bars.first()).toHaveAttribute("opacity", "1");
});
