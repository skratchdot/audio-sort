import { usePlayground } from "./playground-context";
import { playerAtoms } from "../../state/players";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import { ValueSlider } from "@/components/value-slider";
import { useAtomValue, useSetAtom } from "jotai";
import { playbackPreferencesAtom, toggleLoopAtom } from "../../state/playback-preferences.ts";
import type { PlayerId } from "../../state/players";
import { FastForward, Rewind, SkipBack, SkipForward, Square, RotateCcw } from "lucide-react";
import { ControlIcon } from "../control-icon.tsx";

export function Counters() {
  const state = useAtomValue(playerAtoms.sort);
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
          <span className={`${id}-max border-t border-foreground`}>{total}</span>
        </div>
      ))}
    </>
  );
}
export function Transport({ id }: { id: PlayerId }) {
  const actions = usePlayground();
  const state = useAtomValue(playerAtoms[id]);
  const toggleLoop = useSetAtom(toggleLoopAtom);
  const preferences = useAtomValue(playbackPreferencesAtom);
  return (
    <div id={`${id}-player`} className="flex min-h-8 flex-wrap items-center justify-between gap-2">
      {id === "sort" && (
        <span className="text-xs tabular-nums">
          c: <span className="compare-current">{state.compare}</span> / s:{" "}
          <span className="swap-current">{state.swap}</span>
        </span>
      )}
      <div className="mx-auto flex flex-wrap justify-center gap-1">
        {[
          ["goToFirst", "", "First"],
          ["reverse", "Reverse", "Reverse"],
          ["stop", "Stop", "Stop"],
          ["play", "Play", "Play"],
          ["goToLast", "", "Last"],
        ].map(([action, text, label]) => (
          <Button
            key={action}
            type="button"
            className="bg-green-700 text-white hover:bg-green-800"
            data-action={action}
            aria-label={`${id} ${label}`}
            title={label}
            onClick={() => void actions.action(id, action!)}
          >
            {action !== "play" && (
              <ControlIcon
                icon={
                  action === "goToFirst"
                    ? Rewind
                    : action === "reverse"
                      ? SkipBack
                      : action === "stop"
                        ? Square
                        : FastForward
                }
                solid
              />
            )}
            {text && <span>{text}</span>}
            {action === "play" && <ControlIcon icon={SkipForward} solid />}
          </Button>
        ))}
        <Toggle
          type="button"
          variant="outline"
          className="aria-pressed:bg-muted aria-pressed:shadow-inner"
          data-action="loop"
          pressed={preferences.loop[id]}
          onPressedChange={() => toggleLoop(id)}
        >
          <ControlIcon icon={RotateCcw} /> <span>Loop?</span>
        </Toggle>
      </div>
      <span className="text-xs tabular-nums">
        <span className="position-current">{state.length ? state.position + 1 : 0}</span> /{" "}
        <span className="position-max">{state.length}</span>
      </span>
    </div>
  );
}

export function Scrubber({ id }: { id: PlayerId }) {
  const actions = usePlayground();
  const state = useAtomValue(playerAtoms[id]);
  return (
    <div className="mx-2 my-2">
      <ValueSlider
        label={`${id} position`}
        min={0}
        max={Math.max(0, state.length - 1)}
        step={1}
        value={state.position}
        onChange={(value) => actions.seek(id, value)}
      />
    </div>
  );
}
