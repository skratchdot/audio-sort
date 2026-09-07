import { useSyncExternalStore } from "react";
import { useAtomValue } from "jotai";
import { playbackPreferencesAtom } from "../state/playback-preferences.ts";
import type { Props, PlayerId } from "./workspace-types.ts";

export function Counters({ runtime }: Props) {
  const state = useSyncExternalStore(runtime.subscribe, () => runtime.getSnapshot().sort);
  return (
    <>
      {[
        ["Position", "position", state.length ? state.position + 1 : 0, state.length],
        ["Compares", "compare", state.compare, state.compareMax],
        ["Swaps", "swap", state.swap, state.swapMax],
      ].map(([label, id, current, total]) => (
        <div key={id}>
          <strong>{label}:</strong>
          <br />
          <span className={`${id}-current`}>{current}</span>
          <br />
          <span className={`${id}-max max-divider`}>{total}</span>
        </div>
      ))}
    </>
  );
}
export function Transport({ runtime, id }: Props & { id: PlayerId }) {
  const state = useSyncExternalStore(runtime.subscribe, () => runtime.getSnapshot()[id]);
  const preferences = useAtomValue(playbackPreferencesAtom, { store: runtime.store });
  return (
    <div id={`${id}-player`} className="player-buttons">
      {id === "sort" && (
        <span className="transport-counters">
          c: <span className="compare-current">{state.compare}</span> / s:{" "}
          <span className="swap-current">{state.swap}</span>
        </span>
      )}
      <div className="transport-actions">
        {[
          ["goToFirst", "⏮", "First"],
          ["reverse", "◀ Reverse", "Reverse"],
          ["stop", "■ Stop", "Stop"],
          ["play", "Play ▶", "Play"],
          ["goToLast", "⏭", "Last"],
        ].map(([action, text, label]) => (
          <button
            key={action}
            type="button"
            className="button button-success"
            data-action={action}
            aria-label={`${id} ${label}`}
            onClick={() => void runtime.action(id, action)}
          >
            {text}
          </button>
        ))}
        <button
          type="button"
          className="button"
          data-action="loop"
          aria-pressed={preferences.loop[id]}
          onClick={() => void runtime.action(id, "loop")}
        >
          ↻ Loop?
        </button>
      </div>
      <span className="transport-position">
        <span className="position-current">{state.length ? state.position + 1 : 0}</span> /{" "}
        <span className="position-max">{state.length}</span>
      </span>
    </div>
  );
}

export function Scrubber({ runtime, id }: Props & { id: PlayerId }) {
  const state = useSyncExternalStore(runtime.subscribe, () => runtime.getSnapshot()[id]);
  return (
    <div className="position-container">
      <input
        type="range"
        aria-label={`${id} position`}
        min={0}
        max={Math.max(0, state.length - 1)}
        step={1}
        value={state.position}
        onChange={(e) => runtime.seek(id, Number(e.currentTarget.value))}
      />
    </div>
  );
}
