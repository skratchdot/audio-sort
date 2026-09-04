import { runInContext } from "node:vm";
import { describe, expect, test } from "vitest";
import { algorithmNames, loadAlgorithms, loadLegacy, seededValues } from "./helpers/legacy.mjs";

function runWorker(fn, arr, key = "request-1") {
	const messages = [];
	const context = loadLegacy(["js/AS.js", "js/SortWorker.js"], {
		postMessage: (message) => messages.push(message),
		event: { data: { key, fn, arr } },
	});
	runInContext("onmessage(event)", context, { timeout: 1000 });
	expect(messages).toHaveLength(1);
	expect(messages[0].key).toBe(key);
	return messages[0];
}

test.each(["function () {\nAS.play(0);\n}", "function anonymous(\n) {\nAS.play(0);\n}"])(
	"accepts legacy and ES2019 function serialization: %s",
	(fn) => {
		const result = runWorker(fn, [1]);
		expect(result.fn).toContain("AS.play(0);");
		expect(result.frames.some((frame) => frame.arr[0].play)).toBe(true);
	},
);

describe.each(algorithmNames)("%s worker round trip", (name) => {
	test("executes the serialized built-in algorithm without main-thread globals", () => {
		const values = seededValues(16, 42);
		const input = values.map((value, i) => ({ id: `item-${i}`, value }));
		const original = structuredClone(input);
		const fn = loadAlgorithms().sort[name].toString();
		const result = runWorker(fn, input, `sort-${name}`);
		expect(Array.from(result.frames.at(-1).arr, (item) => item.value)).toEqual(
			[...values].sort((a, b) => a - b),
		);
		expect(input).toEqual(original);
	});
});

test("finishes an empty custom algorithm with an empty frame", () => {
	const result = runWorker("function () {}", []);
	expect(result.frames).toHaveLength(1);
	expect(result.frames[0].arr).toHaveLength(0);
});

test("surfaces malformed custom code as an error", () => {
	expect(() => runWorker("function () { invalid syntax !!! }", [1])).toThrow(
		/Unexpected identifier/,
	);
});
