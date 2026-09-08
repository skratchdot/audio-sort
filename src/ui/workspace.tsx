import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import { settingsAtom } from "../state/settings.ts";
import { algorithmCatalogAtom } from "../state/algorithm-overrides.ts";
import { playbackPreferencesAtom, toggleAutoPlayAtom } from "../state/playback-preferences.ts";
import { Settings } from "./settings-controls.tsx";
import { Transport, Scrubber, Counters } from "./playback-controls.tsx";
import { AlgorithmDialog, MidiDialog } from "./workspace-dialogs.tsx";
import type { Props, PlayerId } from "./workspace-types.ts";
import { Download, Info, CirclePlus, ChartNoAxesColumnIncreasing, List } from "lucide-react";
import { ControlIcon } from "./control-icon.tsx";
type Modal = "sort" | "add-algorithm" | "midi-export" | null;
export function Workspace({ runtime }: Props) {
  const store = runtime.store;
  const selected = useAtomValue(settingsAtom, { store });
  const catalog = useAtomValue(algorithmCatalogAtom, { store });
  const preferences = useAtomValue(playbackPreferencesAtom, { store });
  const toggleAutoPlay = useSetAtom(toggleAutoPlayAtom, { store });
  const error = useSyncExternalStore(runtime.subscribe, () => runtime.getSnapshot().error);
  const suspended = useSyncExternalStore(runtime.subscribe, () => runtime.getSnapshot().suspended);
  const base = useRef<SVGSVGElement>(null);
  const sort = useRef<SVGSVGElement>(null);
  const [modal, setModal] = useState<Modal>(null);
  const [exportId, setExportId] = useState<PlayerId>("base");
  const [visualization, setVisualization] = useState("bar");
  useEffect(
    () =>
      runtime.subscribe(() => {
        if (runtime.getSnapshot().suspended) setModal(null);
      }),
    [runtime],
  );
  useLayoutEffect(() => {
    runtime.mount({
      base: base.current,
      sort: sort.current,
      canvas: document.getElementById("waveform-canvas"),
    });
    return () => runtime.destroy();
  }, [runtime]);
  const close = () => setModal(null);
  const exportButton = (id: PlayerId) => (
    <button
      type="button"
      className="button button-info"
      data-midi-export={id}
      onClick={() => {
        setExportId(id);
        setModal("midi-export");
      }}
    >
      <span>Export As Midi</span> <ControlIcon icon={Download} />
    </button>
  );
  return (
    <>
      <section className="container" id="base-section">
        <div className="section-heading">
          <h2>
            Audio Data{" "}
            <small>
              modify the data set you will be sorting. preview how the data sounds and set playback
              options.
            </small>
          </h2>
          {exportButton("base")}
        </div>
        <div className="workspace-row">
          <Settings runtime={runtime} />
          <div className="chart-column">
            <Transport runtime={runtime} id="base" />
            <div id="base-chart">
              <svg ref={base} id="base-svg" aria-label="Input data visualization" />
            </div>
            <Scrubber runtime={runtime} id="base" />
            <div id="base-buttons">
              {[
                ["sorted", "Sorted"],
                ["reverse", "Reverse"],
                ["randomUnique", "Random (Unique)"],
                ["randomDupes", "Random (Dupes)"],
                ["almostSorted", "Almost Sorted"],
                ["fewUnique", "Few Unique"],
              ].map(([id, label]) => (
                <button
                  type="button"
                  className="button button-primary"
                  key={id}
                  data-action={id}
                  onClick={() => runtime.generate(id)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>
      <section className="container" id="sort-section">
        <div className="section-heading">
          <h2>
            Sorting{" "}
            <small>
              choose a sorting algorithm to visualize and audibilize how the algorithm works.
            </small>
          </h2>
          {exportButton("sort")}
        </div>
        {error && <p role="alert">{error}</p>}
        <div className="workspace-row">
          <div className="sort-sidebar">
            <div className="algorithm-column">
              <div id="sort-options-header">
                <strong>Sort:</strong>
                <button
                  type="button"
                  id="modal-sort-open"
                  className="button button-info"
                  onClick={() => setModal("sort")}
                >
                  <em id="sort-display">{catalog[selected.sort]?.display}</em>{" "}
                  <ControlIcon icon={Info} />
                </button>
              </div>
              <ul id="sort-options">
                {Object.entries(catalog).map(([id, algorithm]) => (
                  <li key={id} className={id === selected.sort ? "active" : ""}>
                    <button
                      type="button"
                      data-sort={id}
                      aria-pressed={id === selected.sort}
                      onClick={() => runtime.select(id)}
                    >
                      {algorithm.display}
                    </button>
                  </li>
                ))}
              </ul>
              <div className="tw:flex tw:justify-between tw:mt-1">
                <button
                  type="button"
                  id="sort-autoplay"
                  className="button"
                  aria-pressed={preferences.autoPlay}
                  onClick={() => toggleAutoPlay()}
                >
                  AutoPlay?
                </button>
                <button
                  type="button"
                  id="add-algorithm-btn"
                  className="button button-info"
                  onClick={() => setModal("add-algorithm")}
                >
                  <span>Add Algorithm</span> <ControlIcon icon={CirclePlus} />
                </button>
              </div>
            </div>
            <div className="sort-counters">
              <div className="tw:flex tw:justify-center tw:mb-2">
                {(["bar", "flat"] as const).map((id) => (
                  <button
                    type="button"
                    className="button sort-visualization"
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
                  </button>
                ))}
              </div>
              <Counters runtime={runtime} />
            </div>
          </div>
          <div className="chart-column">
            <Transport runtime={runtime} id="sort" />
            <div id="sort-chart">
              <svg ref={sort} id="sort-svg" aria-label="Sorting visualization" />
            </div>
            <Scrubber runtime={runtime} id="sort" />
          </div>
        </div>
      </section>
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
