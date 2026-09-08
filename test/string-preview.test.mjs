import { expect, test } from "vitest";
import { getStringPreviewSamples } from "../src/ui/string-preview.ts";

test("string illustration is deterministic, bounded, oscillating, and decaying", () => {
  const samples = getStringPreviewSamples();
  expect(samples).toEqual(getStringPreviewSamples());
  expect(samples).toHaveLength(301);
  expect(samples.every((value) => Number.isFinite(value) && Math.abs(value) <= 1)).toBe(true);
  expect(Math.min(...samples)).toBeLessThan(0);
  expect(Math.max(...samples)).toBeGreaterThan(0);
  const peak = (values) => Math.max(...values.map(Math.abs));
  expect(peak(samples.slice(200))).toBeLessThan(peak(samples.slice(0, 100)) / 2);
});
