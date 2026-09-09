import { useEffect, useMemo, useRef, useState } from "react";
import { useAtomValue, useSetAtom, useStore } from "jotai";
import { settingsAtom, updateSettingAtom } from "../state/settings";
import { algorithmCatalogAtom } from "../state/algorithm-overrides";
import { playbackPreferencesAtom } from "../state/playback-preferences";
import { suspendedAtom, sortErrorAtom, pageLifecycleAtom } from "../state/players";
import { generators, type GeneratorId } from "../generators/generator-registry";
import { generateInput, resizeInput, previewFrames } from "../sorting/input-data";
import { createSortRequest, handleSortRequest } from "../sorting/sort-requests";
import type { SortResponse } from "../sorting/sort-types";
import type { AudioSession } from "./use-players";

export function useSort(session: AudioSession | null) {
  const store = useStore();
  const selected = useAtomValue(settingsAtom);
  const catalog = useAtomValue(algorithmCatalogAtom);
  const lifecycle = useAtomValue(pageLifecycleAtom);
  const requestKey = useRef(0);
  const suspended = useAtomValue(suspendedAtom);
  const setError = useSetAtom(sortErrorAtom);
  const update = useSetAtom(updateSettingAtom);
  const [input, setInput] = useState(() => generateInput("randomUnique", selected.dataSize));
  const values = useMemo(
    () =>
      input.values.length === selected.dataSize
        ? input.values
        : resizeInput(input.full, selected.dataSize),
    [input, selected.dataSize],
  );
  const [repeat, setRepeat] = useState(0);
  const previous = useRef<{
    algorithm: (typeof catalog)[string];
    repeat: number;
    lifecycle: number;
    values: number[];
  } | null>(null);
  const algorithm = catalog[selected.sort];

  useEffect(() => {
    if (session && !suspended) session.players.base.setData(previewFrames(values));
  }, [session, suspended, lifecycle, values]);

  useEffect(() => {
    if (!session || suspended || selected.audioType !== "soundfont") return;
    void session.soundfont.preload(
      [...new Set(values.map(session.getMidiNumber))].filter((note) => note >= 0 && note < 128),
    );
  }, [
    session,
    suspended,
    lifecycle,
    values,
    selected.audioType,
    selected.soundfont,
    selected.scale,
    selected.centerNote,
  ]);

  useEffect(() => {
    if (!session || suspended || !algorithm) {
      previous.current = null;
      return;
    }
    const changed =
      previous.current !== null &&
      previous.current.lifecycle === lifecycle &&
      (previous.current.algorithm !== algorithm || previous.current.repeat !== repeat);
    const debounce =
      input.edited && previous.current !== null && previous.current.values !== values && !changed;
    previous.current = { algorithm, repeat, lifecycle, values };
    const key = ++requestKey.current;
    const autoPlay = changed && store.get(playbackPreferencesAtom).autoPlay;
    let cancelled = false;
    let worker: Worker | undefined;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const cancel = () => {
      cancelled = true;
      clearTimeout(timer);
      worker?.terminate();
    };
    const accept = (result: SortResponse) => {
      if (cancelled || store.get(suspendedAtom) || result.key !== key) return;
      if ("error" in result) {
        setError(result.error);
        return;
      }
      const play = session.players.sort.isPlaying() || autoPlay;
      session.players.sort.setData(result.frames);
      session.players.sort.seek(0);
      if (play) {
        session.players.base.suspend();
        void session.players.sort.action("play");
      }
    };
    const run = () => {
      setError("");
      const request = createSortRequest(key, selected.sort, algorithm, values);
      if (typeof Worker === "undefined") {
        accept(handleSortRequest(request));
        return;
      }
      worker = new Worker(new URL("../sorting/worker.ts", import.meta.url), { type: "module" });
      worker.addEventListener("message", (event: MessageEvent<SortResponse>) => accept(event.data));
      worker.addEventListener("error", (event) => accept({ key, error: event.message }));
      worker.postMessage(request);
    };
    globalThis.addEventListener("pagehide", cancel);
    if (debounce) timer = setTimeout(run, 250);
    else run();
    return () => {
      globalThis.removeEventListener("pagehide", cancel);
      cancel();
    };
  }, [
    session,
    suspended,
    lifecycle,
    algorithm,
    selected.sort,
    values,
    repeat,
    input.edited,
    setError,
    store,
  ]);

  return {
    generate(action: string) {
      if (!session || store.get(suspendedAtom) || !Object.hasOwn(generators, action)) return;
      setInput(generateInput(action as GeneratorId, selected.dataSize));
    },
    edit(index: number, value: number) {
      if (!session || store.get(suspendedAtom) || index < 0 || index >= values.length) return;
      setInput((current) => {
        const next =
          current.values.length === selected.dataSize
            ? [...current.values]
            : resizeInput(current.full, selected.dataSize);
        next[index] = value;
        const full = [...current.full];
        full[index] = (value / (next.length - 1)) * (full.length - 1);
        return { values: next, full, edited: true };
      });
    },
    select(id: string) {
      if (id === selected.sort) setRepeat((value) => value + 1);
      else update({ key: "sort", value: id });
    },
  };
}
