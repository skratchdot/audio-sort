import { readdirSync } from "node:fs";
import { createContext, runInContext } from "node:vm";
import { algorithms } from "../../src/js/sort/registry.mjs";
import { createSortEngine } from "../../src/js/AS.mjs";

const root = new URL("../../", import.meta.url);

export const algorithmFiles = readdirSync(new URL("src/js/sort/", root))
  .filter((file) => /^sort\..+\.mjs$/.test(file))
  .sort();

export const algorithmNames = algorithmFiles.map((file) => file.slice(5, -4));

export function runAlgorithm(name, values) {
  // Imported implementations and engine; the VM only enforces a time limit
  // so a future algorithm regression cannot hang the entire test process.
  const context = createContext({
    AS: createSortEngine(),
    sort: algorithms,
    input: values,
    algorithmName: name,
  });
  return runInContext("AS.init(input, 'test'); sort[algorithmName](AS); AS.end('test');", context, {
    timeout: 1000,
  });
}

export function seededValues(size, seed) {
  let state = seed;
  return Array.from({ length: size }, () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return (state % 17) - 8;
  });
}
