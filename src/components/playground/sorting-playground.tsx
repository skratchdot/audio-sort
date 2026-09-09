import { usePlayground } from "./playground-context";
import { useAtomValue } from "jotai";
import { sortErrorAtom, suspendedAtom } from "../../state/players";
import { PlayerChart } from "../visualizations/player-chart";
import { PlayerSection } from "./player-section";
import { SortSidebar } from "./sort-sidebar";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { Settings } from "./settings-controls.tsx";
import { Transport, Scrubber } from "./playback-controls.tsx";
import { AlgorithmDialog } from "../dialogs/algorithm-dialog.tsx";
import { MidiDialog } from "../dialogs/midi-dialog.tsx";
import type { PlayerId } from "../../state/players";
type Modal = "sort" | "add-algorithm" | "midi-export" | null;
export function SortingPlayground() {
  const actions = usePlayground();
  const error = useAtomValue(sortErrorAtom);
  const suspended = useAtomValue(suspendedAtom);
  const [modal, setModal] = useState<Modal>(null);
  const [exportId, setExportId] = useState<PlayerId>("base");
  useEffect(() => {
    const closeOnHide = () => setModal(null);
    globalThis.addEventListener("pagehide", closeOnHide);
    return () => globalThis.removeEventListener("pagehide", closeOnHide);
  }, []);
  const close = () => setModal(null);
  return (
    <>
      <PlayerSection
        id="base"
        title="Audio Data"
        description="modify the data set you will be sorting. preview how the data sounds and set playback options."
        onExport={() => {
          setExportId("base");
          setModal("midi-export");
        }}
      >
        <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
          <Settings />
          <div className="min-w-0">
            <Transport id="base" />
            <div id="base-chart" className="my-3 h-[clamp(12rem,24vh,17rem)]">
              <PlayerChart id="base" />
            </div>
            <Scrubber id="base" />
            <div id="base-buttons" className="mt-3 flex flex-wrap justify-center gap-1">
              {[
                ["sorted", "Sorted"],
                ["reverse", "Reverse"],
                ["randomUnique", "Random (Unique)"],
                ["randomDupes", "Random (Dupes)"],
                ["almostSorted", "Almost Sorted"],
                ["fewUnique", "Few Unique"],
              ].map(([id, label]) => (
                <Button
                  type="button"
                  variant="default"
                  key={id}
                  data-action={id}
                  onClick={() => actions.generate(id!)}
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </PlayerSection>
      <PlayerSection
        id="sort"
        title="Sorting"
        description="choose a sorting algorithm to visualize and audibilize how the algorithm works."
        onExport={() => {
          setExportId("sort");
          setModal("midi-export");
        }}
      >
        {error && <p role="alert">{error}</p>}
        <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
          <SortSidebar onDialog={setModal} />
          <div className="min-w-0">
            <Transport id="sort" />
            <div id="sort-chart" className="my-3 h-[clamp(12rem,24vh,17rem)]">
              <PlayerChart id="sort" />
            </div>
            <Scrubber id="sort" />
          </div>
        </div>
      </PlayerSection>
      {!suspended && modal === "sort" && <AlgorithmDialog adding={false} onClose={close} />}
      {!suspended && modal === "add-algorithm" && <AlgorithmDialog adding onClose={close} />}
      {!suspended && modal === "midi-export" && <MidiDialog id={exportId} onClose={close} />}
    </>
  );
}
