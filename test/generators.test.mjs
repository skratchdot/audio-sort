import { describe, expect, test } from "vitest";
import { loadGenerators, loadLegacy } from "./helpers/legacy.mjs";

const names = ["sorted", "reverse", "randomUnique", "randomDupes", "almostSorted", "fewUnique"];

describe.each(names)("%s generator", (name) => {
	test.each([0, 1, 5, 10, 48])("produces %i valid values", (size) => {
		const values = Array.from(loadGenerators().datagen[name](size));
		expect(values).toHaveLength(size);
		for (const value of values) {
			expect(Number.isInteger(value)).toBe(true);
			expect(value).toBeGreaterThanOrEqual(0);
			expect(value).toBeLessThan(size);
		}
	});
});

test.each([0, 1, 5, 10, 48])(
	"ordered generators produce the expected sequence at size %i",
	(size) => {
		const { datagen } = loadGenerators();
		const ordered = Array.from({ length: size }, (_, i) => i);
		expect(Array.from(datagen.sorted(size))).toEqual(ordered);
		expect(Array.from(datagen.reverse(size))).toEqual([...ordered].reverse());
	},
);

describe.each(["randomUnique", "almostSorted"])("%s permutation", (name) => {
	test.each([0, 1, 5, 10, 48])("preserves every value at size %i", (size) => {
		const values = Array.from(loadGenerators().datagen[name](size));
		expect(values.sort((a, b) => a - b)).toEqual(Array.from({ length: size }, (_, i) => i));
	});
});

test.each([0, 1, 5, 10, 48])("fewUnique emits at most four distinct values at size %i", (size) => {
	expect(new Set(loadGenerators().datagen.fewUnique(size)).size).toBeLessThanOrEqual(4);
});

test("includes all 128 General MIDI instruments", () => {
	const { A } = loadLegacy(["js/_A.js", "js/A.instruments.js"]);
	expect(A.instruments).toHaveLength(128);
});
