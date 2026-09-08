import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import type { PointerEvent } from "react";
import type { Props, PlayerId } from "../../controllers/playground-types";
import { createTrajectories } from "../../visualizations/create-trajectories.ts";
import { cn } from "../../utilities/cn";

const markers = [
  ["highlight", "fill-purple-600"],
  ["justSwapped", "fill-green-500"],
  ["swap", "fill-yellow-300"],
  ["compare", "fill-amber-400"],
  ["mark", "fill-neutral-50"],
] as const;

export function PlayerChart({ runtime, id }: Props & { id: PlayerId }) {
  const { frames, position, renderer } = useSyncExternalStore(
    runtime.subscribe,
    () => runtime.getSnapshot()[id],
  );
  const suspended = useSyncExternalStore(runtime.subscribe, () => runtime.getSnapshot().suspended);
  const [hover, setHover] = useState(-1);
  const drag = useRef<{ pointer: number; index: number; value: number } | null>(null);
  useEffect(() => {
    if (suspended) {
      drag.current = null;
      setHover(-1);
    }
  }, [suspended]);
  const editable = id === "base" && !suspended;
  const flat = renderer === "flat";
  const items = frames[position]?.arr ?? [];
  const size = items.length;
  const paths = useMemo(() => (flat ? createTrajectories(frames) : []), [flat, frames]);
  const point = (event: PointerEvent<SVGSVGElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const clamp = (value: number) =>
      Math.max(0, Math.min(size - 1, Number.isFinite(value) ? value : 0));
    return {
      index: clamp(Math.floor(((event.clientX - bounds.left) / bounds.width) * size)),
      value: size - 1 - clamp(Math.floor(((event.clientY - bounds.top) / bounds.height) * size)),
    };
  };
  const end = (event: PointerEvent<SVGSVGElement>) => {
    if (drag.current?.pointer !== event.pointerId) return;
    drag.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId))
      event.currentTarget.releasePointerCapture(event.pointerId);
  };
  return (
    <svg
      id={`${id}-svg`}
      aria-label={id === "base" ? "Input data visualization" : "Sorting visualization"}
      className={cn(
        "h-full w-full rounded-lg border border-neutral-300 bg-neutral-100 bg-[url('/img/gradient_squares.png')] bg-center bg-repeat",
        id === "base" && "cursor-pointer touch-none",
      )}
      viewBox={flat ? `0 0 ${Math.max(1, frames.length - 1)} ${Math.max(1, size)}` : undefined}
      preserveAspectRatio={flat ? "none" : undefined}
      onPointerDown={(event) => {
        if (!editable || !size || flat || event.button !== 0 || drag.current) return;
        event.preventDefault();
        event.currentTarget.setPointerCapture(event.pointerId);
        const value = point(event);
        drag.current = { pointer: event.pointerId, ...value };
        setHover(value.index);
        runtime.edit(value.index, value.value);
      }}
      onPointerMove={(event) => {
        if (!editable || !size || flat) return;
        if (drag.current && drag.current.pointer !== event.pointerId) return;
        const value = point(event);
        setHover(value.index);
        if (
          drag.current &&
          (drag.current.index !== value.index || drag.current.value !== value.value)
        ) {
          drag.current = { pointer: event.pointerId, ...value };
          runtime.edit(value.index, value.value);
        }
      }}
      onPointerLeave={() => setHover(-1)}
      onPointerUp={end}
      onPointerCancel={end}
      onLostPointerCapture={end}
    >
      {flat ? (
        paths.map((path) => (
          <path
            key={path.id}
            data-id={path.id}
            className="line fill-none"
            strokeWidth={0.5}
            stroke={path.playIndexes.has(position) ? path.playColor : path.dataColor}
            d={path.d}
          />
        ))
      ) : (
        <>
          {items.map((item, index) => (
            <rect
              key={index}
              width={`${100 / size}%`}
              height={`${(100 / size) * (item.value + 1)}%`}
              x={`${(index / size) * 100}%`}
              y={`${100 - (100 / size) * (item.value + 1)}%`}
              opacity={hover === index ? 0.5 : 1}
              className={cn("stroke-white", item.play ? "fill-red-700" : "fill-sky-700")}
            />
          ))}
          {id === "sort" &&
            markers.map(([marker, color], level) =>
              items.map((item, index) => (
                <circle
                  key={`${marker}-${index}`}
                  className={cn(marker, color, "stroke-neutral-700")}
                  cx={`${(index / size) * 100 + 100 / (size * 2)}%`}
                  cy={`${90 - level * 10}%`}
                  r={`${100 / (Math.max(size, 20) * 4)}%`}
                  display={item[marker] ? undefined : "none"}
                />
              )),
            )}
        </>
      )}
    </svg>
  );
}
