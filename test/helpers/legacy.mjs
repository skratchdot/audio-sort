import { readFileSync, readdirSync } from "node:fs";
import { createContext, runInContext } from "node:vm";

const root = new URL("../../", import.meta.url);

export function source(path) {
  return readFileSync(new URL(path, root), "utf8");
}

export const algorithmFiles = readdirSync(new URL("js/sort/", root))
  .filter((file) => /^sort\..+\.js$/.test(file))
  .sort();

export const algorithmNames = algorithmFiles.map((file) => file.slice(5, -3));

// A fresh realm supplies the globals expected by the legacy IIFEs, without
// leaking state between tests or requiring checked-in/generated bundles.
export function loadLegacy(paths, globals = {}) {
  const context = createContext(globals);
  for (const path of paths) {
    runInContext(source(path), context, { filename: path, timeout: 1000 });
  }
  return context;
}

export function loadAlgorithms() {
  return loadLegacy([
    "js/AS.js",
    "js/sort/_sort.js",
    ...algorithmFiles.map((file) => `js/sort/${file}`),
  ]);
}

export function runAlgorithm(name, values) {
  const context = loadAlgorithms();
  context.input = values;
  context.algorithmName = name;
  return runInContext("AS.init(input, 'test'); sort[algorithmName](); AS.end('test');", context, {
    timeout: 1000,
  });
}

export function loadGenerators() {
  const files = readdirSync(new URL("js/fn/", root)).filter((file) => file.endsWith(".js"));
  return loadLegacy([
    "js/fn/_fn.js",
    ...files
      .filter((file) => file !== "_fn.js")
      .sort()
      .map((file) => `js/fn/${file}`),
  ]).fn;
}

export function seededValues(size, seed) {
  let state = seed;
  return Array.from({ length: size }, () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return (state % 17) - 8;
  });
}
