import { atom } from "jotai";
import { algorithms } from "../sorting/algorithm-registry.mjs";
import type { SortAlgorithm } from "../sorting/sort-types.ts";

// Types for the existing function properties, not a new algorithm format.
type AlgorithmMetadata = Readonly<{
  display: string;
  stable: boolean;
  best: string;
  average: string;
  worst: string;
  memory: string;
  method: string;
}>;
export type AlgorithmEntry = SortAlgorithm & AlgorithmMetadata;
type Catalog = Readonly<Record<string, AlgorithmEntry>>;

const overridesAtom = atom<Catalog>(Object.freeze({}));
// Built-ins remain imported functions: identity selects the worker's fast path.
export const algorithmCatalogAtom = atom<Catalog>((get) =>
  Object.freeze({ ...algorithms, ...get(overridesAtom) }),
);

export const editAlgorithmAtom = atom(
  null,
  (
    get,
    set,
    {
      id,
      source,
    }: {
      id: string;
      source: string;
    },
  ) => {
    const catalog = get(algorithmCatalogAtom);
    if (!Object.hasOwn(catalog, id)) throw new Error("Unknown algorithm ID");
    const edited = Object.freeze(
      Object.assign(new Function("AS", source) as SortAlgorithm, catalog[id]!),
    );
    // Compile before writing: invalid editor source must leave the catalog intact.
    set(overridesAtom, Object.freeze({ ...get(overridesAtom), [id]: edited }));
  },
);

export const addAlgorithmAtom = atom(
  null,
  (
    get,
    set,
    {
      id,
      name,
      source,
    }: {
      id: string;
      name: string;
      source: string;
    },
  ) => {
    if (Object.hasOwn(get(algorithmCatalogAtom), id))
      throw new Error("Algorithm ID already exists");
    const added: AlgorithmEntry = Object.freeze(
      Object.assign(new Function("AS", source) as SortAlgorithm, {
        display: name,
        stable: true,
        best: "",
        average: "",
        worst: "",
        memory: "",
        method: "",
      }),
    );
    set(overridesAtom, Object.freeze({ ...get(overridesAtom), [id]: added }));
  },
);
