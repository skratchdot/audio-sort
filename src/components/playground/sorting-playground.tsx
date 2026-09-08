import { PlayerChart } from "../visualizations/player-chart";
import { PlayerSection } from "./player-section";
import { SortSidebar } from "./sort-sidebar";
import { Button } from "@/components/ui/button";
import { useEffect, useLayoutEffect, useState, useSyncExternalStore } from "react";
import { Settings } from "./settings-controls.tsx";
import { Transport, Scrubber } from "./playback-controls.tsx";
import { AlgorithmDialog } from "../dialogs/algorithm-dialog.tsx";
import { MidiDialog } from "../dialogs/midi-dialog.tsx";
import type { Props, PlayerId } from "../../controllers/playground-types.ts";
type Modal = "sort" | "add-algorithm" | "midi-export" | null;
export function SortingPlayground({ runtime }: Props) {
  const error = useSyncExternalStore(runtime.subscribe, () => runtime.getSnapshot().error);
  const suspended = useSyncExternalStore(runtime.subscribe, () => runtime.getSnapshot().suspended);
  const [modal, setModal] = useState<Modal>(null);
  const [exportId, setExportId] = useState<PlayerId>("base");
  useEffect(
    () =>
      runtime.subscribe(() => {
        if (runtime.getSnapshot().suspended) setModal(null);
      }),
    [runtime],
  );
  useLayoutEffect(() => {
    runtime.mount({
      canvas: document.getElementById("waveform-canvas"),
    });
    return () => runtime.destroy();
  }, [runtime]);
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
          <Settings runtime={runtime} />
          <div className="min-w-0">
            <Transport runtime={runtime} id="base" />
            <div id="base-chart" className="my-3 h-[clamp(12rem,24vh,17rem)]">
              <PlayerChart runtime={runtime} id="base" />
            </div>
            <Scrubber runtime={runtime} id="base" />
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
                  onClick={() => runtime.generate(id)}
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
          <SortSidebar runtime={runtime} onDialog={setModal} />
          <div className="min-w-0">
            <Transport runtime={runtime} id="sort" />
            <div id="sort-chart" className="my-3 h-[clamp(12rem,24vh,17rem)]">
              <PlayerChart runtime={runtime} id="sort" />
            </div>
            <Scrubber runtime={runtime} id="sort" />
          </div>
        </div>
      </PlayerSection>
      {!suspended && modal === "sort" && (
        <AlgorithmDialog runtime={runtime} adding={false} onClose={close} />
      )}
      {!suspended && modal === "add-algorithm" && (
        <AlgorithmDialog runtime={runtime} adding onClose={close} />
      )}
      {!suspended && modal === "midi-export" && (
        <MidiDialog runtime={runtime} id={exportId} onClose={close} />
      )}
    </>
  );
}
