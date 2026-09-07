import { expect, test } from "vitest";
import { handleSortRequest } from "../src/js/sorting/sort-requests.ts";

test("worker responses contain frames on success", () => {
  const response = handleSortRequest({ key: 7, type: "builtin", id: "bubble", arr: [2, 1] });
  expect(response.key).toBe(7);
  expect(response.frames.at(-1).arr.map((item) => item.value)).toEqual([1, 2]);
  expect(response).not.toHaveProperty("error");
});

test.each([
  [null, undefined, "Expected a sort array"],
  [{ key: 3, type: "builtin", id: "missing", arr: [] }, 3, "Unknown algorithm ID"],
  [{ key: "edit", type: "custom", source: 'throw new Error("oops")', arr: [] }, "edit", "oops"],
  [{ type: "custom", source: 'throw "oops"', arr: [] }, undefined, "oops"],
])("worker errors retain the request key and are cloneable: %j", (request, key, error) => {
  const response = handleSortRequest(request);
  expect(response).toEqual({ key, error });
  expect(structuredClone(response)).toEqual(response);
});
