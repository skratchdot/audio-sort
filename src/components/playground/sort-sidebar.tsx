import { useState } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import { settingsAtom } from "@/state/settings";
import { algorithmCatalogAtom } from "@/state/algorithm-overrides";
import { playbackPreferencesAtom, toggleAutoPlayAtom } from "@/state/playback-preferences";
import { Button } from "@/components/ui/button";
import { OptionButton } from "@/components/option-button";
import { ControlIcon } from "@/components/control-icon";
import { Info, CirclePlus, ChartNoAxesColumnIncreasing, List } from "lucide-react";
import { Counters } from "./playback-controls";
import type { Props } from "../../controllers/playground-types";
export function SortSidebar({
  runtime,
  onDialog: setModal,
}: Props & { onDialog: (modal: "sort" | "add-algorithm") => void }) {
  const store = runtime.store;
  const selected = useAtomValue(settingsAtom, { store });
  const catalog = useAtomValue(algorithmCatalogAtom, { store });
  const preferences = useAtomValue(playbackPreferencesAtom, { store });
  const toggleAutoPlay = useSetAtom(toggleAutoPlayAtom, { store });
  const [visualization, setVisualization] = useState("bar");
  return (
    <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_5rem] gap-4">
      <div className="min-w-0">
        <div id="sort-options-header" className="mb-3 flex items-center justify-between gap-2">
          <strong>Sort:</strong>
          <Button
            type="button"
            id="modal-sort-open"
            variant="default"
            onClick={() => setModal("sort")}
          >
            <em id="sort-display">{catalog[selected.sort]?.display}</em> <ControlIcon icon={Info} />
          </Button>
        </div>
        <ul
          id="sort-options"
          className="h-[clamp(12rem,24vh,17rem)] overflow-auto rounded-lg border bg-muted p-1"
        >
          {Object.entries(catalog).map(([id, algorithm]) => (
            <li key={id} className={id === selected.sort ? "active" : ""}>
              <OptionButton
                type="button"
                data-sort={id}
                aria-pressed={id === selected.sort}
                onClick={() => runtime.select(id)}
              >
                {algorithm.display}
              </OptionButton>
            </li>
          ))}
        </ul>
        <div className="flex justify-between mt-1">
          <Button
            type="button"
            id="sort-autoplay"
            variant="outline"
            className="aria-pressed:bg-muted aria-pressed:shadow-inner"
            aria-pressed={preferences.autoPlay}
            onClick={() => toggleAutoPlay()}
          >
            AutoPlay?
          </Button>
          <Button
            type="button"
            id="add-algorithm-btn"
            variant="default"
            onClick={() => setModal("add-algorithm")}
          >
            <span>Add Algorithm</span> <ControlIcon icon={CirclePlus} />
          </Button>
        </div>
      </div>
      <div className="space-y-3 text-center text-xs">
        <div className="flex justify-center mb-2">
          {(["bar", "flat"] as const).map((id) => (
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              className="aria-pressed:bg-muted"
              key={id}
              data-visualization={id}
              aria-label={`${id === "bar" ? "Bar" : "Flat"} visualization`}
              aria-pressed={id === visualization}
              onClick={() => {
                setVisualization(id!);
                runtime.visualization(id);
              }}
            >
              <ControlIcon icon={id === "bar" ? ChartNoAxesColumnIncreasing : List} />
            </Button>
          ))}
        </div>
        <Counters runtime={runtime} />
      </div>
    </div>
  );
}
