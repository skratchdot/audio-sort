import type { createStore } from "jotai/vanilla";
import { settingsAtom } from "../../../state/settings.ts";
import { algorithmCatalogAtom } from "../../../state/algorithm-overrides.ts";

type Catalog = ReturnType<typeof algorithmCatalogAtom.read>;
type Effects = {
  catalog: (catalog: Catalog) => void;
  selection: (id: string) => void;
  size: (size: number, changed: boolean) => void;
  sort: (algorithmChanged: boolean) => void;
};

export function connectSortSettings(store: ReturnType<typeof createStore>, effects: Effects) {
  let previousSettings: ReturnType<typeof settingsAtom.read> | undefined;
  let previousCatalog: Catalog | undefined;
  const sync = () => {
    const settings = store.get(settingsAtom);
    const catalog = store.get(algorithmCatalogAtom);
    const previous = previousSettings;
    const catalogChanged = previousCatalog !== catalog;
    const selectionChanged = !previous || settings.sort !== previous.sort;
    const algorithmChanged =
      !!previous &&
      (selectionChanged || previousCatalog?.[settings.sort] !== catalog[settings.sort]);
    const sizeChanged = !!previous && previous.dataSize !== settings.dataSize;
    previousSettings = settings;
    previousCatalog = catalog;
    if (catalogChanged) effects.catalog(catalog);
    if (catalogChanged || selectionChanged) effects.selection(settings.sort);
    if (!previous || sizeChanged) effects.size(settings.dataSize, sizeChanged);
    if ((!previous || algorithmChanged || sizeChanged) && Object.hasOwn(catalog, settings.sort)) {
      effects.sort(algorithmChanged);
    }
  };
  const stopSettings = store.sub(settingsAtom, sync);
  const stopCatalog = store.sub(algorithmCatalogAtom, sync);
  const disconnect = () => {
    stopSettings();
    stopCatalog();
  };
  try {
    sync();
  } catch (error) {
    disconnect();
    throw error;
  }
  return disconnect;
}
