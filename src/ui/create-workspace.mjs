import { createStore } from "jotai/vanilla";
import { min, max } from "d3-array";
import { scaleLinear } from "d3-scale";
import { saveAs } from "file-saver";
import { timbre } from "../vendor.mjs";
import { createTimbreSoundfont } from "../audio/create-timbre-soundfont.mjs";
import { createHelpers } from "./create-helpers.mjs";
import { createWorkspacePlayer } from "./create-workspace-player.mjs";
import { connectAudioSettings } from "./connect-audio-settings.ts";
import { connectPlaybackSettings } from "./connect-playback-settings.ts";
import { connectSortSettings } from "./connect-sort-settings.ts";
import { generators } from "../generators/generator-registry.ts";
import { defaults, settingsAtom, updateSettingAtom } from "../state/settings.ts";
import { selectedWaveformAtom } from "../state/waveforms.ts";
import { algorithmCatalogAtom } from "../state/algorithm-overrides.ts";
import { playbackPreferencesAtom, toggleLoopAtom } from "../state/playback-preferences.ts";
import { createSortRequest, runSortRequest } from "../sorting/sort-requests.ts";

const emptyPlayer = {
  position: 0,
  length: 0,
  compare: 0,
  compareMax: 0,
  swap: 0,
  swapMax: 0,
  playing: false,
};

export function createWorkspace(store = createStore()) {
  let snapshot = { base: emptyPlayer, sort: emptyPlayer, error: "", suspended: false };
  const listeners = new Set();
  const publish = (update) => {
    snapshot = { ...snapshot, ...update };
    for (const listener of listeners) listener();
  };
  const selected = () => store.get(settingsAtom);
  const settings = {
    getSelected: (key, fallback) => (Object.hasOwn(selected(), key) ? selected()[key] : fallback),
    getSelectedWaveformInfo: () => store.get(selectedWaveformAtom),
    getTempoString: () => `bpm${selected().tempo} l16`,
  };
  const helper = createHelpers(settings);
  let soundfont;
  let players;
  let canvas;
  let baseData = [];
  let maxData = [];
  let worker;
  let workerKey = 0;
  let timer;
  let destroyed = false;
  let suspended = false;
  let disconnect = () => {};
  let triggerAutoPlay = false;
  const frames = () =>
    baseData.map((_, index) => ({
      arr: baseData.map((value, i) => ({
        value,
        play: i === index,
        mark: false,
        swap: false,
        justSwapped: false,
        compare: false,
        highlight: false,
      })),
      compareCount: 0,
      swapCount: 0,
    }));
  const preload = () => {
    if (selected().audioType === "soundfont")
      void soundfont.preload(
        [...new Set(baseData.map(helper.getMidiNumber))].filter((n) => n >= 0 && n < 128),
      );
  };
  const generate = (action) => {
    if (action) {
      baseData = generators[action](selected().dataSize);
      maxData = generators[action](defaults.dataSize.max);
      const slice = maxData.slice(0, baseData.length);
      const scale = scaleLinear()
        .domain([0, baseData.length - 1])
        .range([min(slice), max(slice)]);
      baseData.forEach((value, i) => {
        maxData[i] = Math.round(scale(value));
      });
    } else {
      const slice = maxData.slice(0, selected().dataSize);
      const scale = scaleLinear()
        .domain([min(slice), max(slice)])
        .range([0, slice.length - 1]);
      baseData = slice.map((value) => Math.round(scale(value)));
    }
    players.base.setData(frames());
    preload();
  };
  const cancelWorker = () => {
    workerKey++;
    worker?.terminate();
    worker = null;
  };
  const accept = (result) => {
    if (destroyed || suspended || result.key !== workerKey) return;
    if (result.error) {
      publish({ error: result.error });
      triggerAutoPlay = false;
      return;
    }
    const play = players.sort.isPlaying() || triggerAutoPlay;
    players.sort.setData(result.frames || []);
    players.sort.seek(0);
    if (play) void action("sort", "play");
    triggerAutoPlay = false;
  };
  const sort = () => {
    if (destroyed || suspended) return;
    cancelWorker();
    publish({ error: "" });
    const request = createSortRequest(
      workerKey,
      selected().sort,
      store.get(algorithmCatalogAtom)[selected().sort],
      baseData,
    );
    if (typeof Worker === "undefined") {
      try {
        accept(runSortRequest(request));
      } catch (error) {
        accept({ key: workerKey, error: String(error) });
      }
      return;
    }
    worker = new Worker(new URL("../worker.mjs", import.meta.url), { type: "module" });
    const key = workerKey;
    worker.addEventListener("message", (event) => accept(event.data));
    worker.addEventListener("error", (event) => accept({ key, error: event.message }));
    worker.postMessage(request);
  };
  async function action(id, name) {
    if (destroyed || suspended) return;
    if (name === "loop") {
      store.set(toggleLoopAtom, id);
      return;
    }
    // Stop the other transport before beginning this action. Delayed audio resumes
    // are cancelled by transport.suspend during page lifecycle transitions.
    if (["play", "reverse", "stop"].includes(name))
      players[id === "base" ? "sort" : "base"].suspend();
    await players[id].action(name);
  }
  const connect = () => {
    const disposers = [];
    try {
      disposers.push(
        connectPlaybackSettings(store, {
          volume(_value, gain) {
            players.base.setVolume(gain);
            players.sort.setVolume(gain);
          },
          tempo() {
            players.base.setTempo(settings.getTempoString());
            players.sort.setTempo(settings.getTempoString());
          },
          preferences() {},
        }),
      );
      disposers.push(
        connectAudioSettings(store, {
          render() {},
          refreshWaveform() {
            players.base.refresh();
            players.sort.refresh();
            players.base.plot(canvas);
          },
          setInstrument: (value) => soundfont.setInstrument(value),
          preload,
        }),
      );
      disposers.push(
        connectSortSettings(store, {
          catalog() {},
          selection() {},
          size(value, changed) {
            if (changed || baseData.length !== value) generate();
          },
          sort(changed) {
            triggerAutoPlay = changed && store.get(playbackPreferencesAtom).autoPlay;
            sort();
          },
        }),
      );
    } catch (error) {
      disposers.reverse().forEach((dispose) => dispose());
      throw error;
    }
    disconnect = () => disposers.reverse().forEach((dispose) => dispose());
  };
  return {
    store,
    settings,
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    getSnapshot: () => snapshot,
    mount(elements) {
      if (destroyed) throw new Error("Cannot mount a destroyed workspace");
      canvas = elements.canvas;
      soundfont = createTimbreSoundfont(timbre);
      players = {};
      try {
        for (const id of ["base", "sort"]) {
          players[id] = createWorkspacePlayer({
            svg: elements[id],
            settings,
            getMidiNumber: helper.getMidiNumber,
            soundfont,
            isLooping: () => store.get(playbackPreferencesAtom).loop[id],
            onUpdate: (value) => publish({ [id]: value }),
            onEdit:
              id === "base"
                ? (index, value) => {
                    baseData[index] = value;
                    maxData[index] = scaleLinear()
                      .domain([0, baseData.length - 1])
                      .range([0, maxData.length - 1])(value);
                    players.base.setData(frames());
                    clearTimeout(timer);
                    timer = setTimeout(sort, 250);
                  }
                : null,
          });
        }
        generate("randomUnique");
        connect();
      } catch (error) {
        this.destroy();
        throw error;
      }
    },
    action,
    seek(id, value) {
      if (!suspended && !destroyed) players[id].seek(value);
    },
    visualization(name) {
      players.sort.setVisualization(name);
    },
    generate(action) {
      if (!suspended && !destroyed && Object.hasOwn(generators, action)) {
        generate(action);
        sort();
      }
    },
    select(id) {
      if (id === selected().sort) {
        triggerAutoPlay = store.get(playbackPreferencesAtom).autoPlay;
        sort();
      } else store.set(updateSettingAtom, { key: "sort", value: id });
    },
    exportMidi(id, filename, channel, instrument) {
      const bytes = players[id].getMidiBytes(selected().tempo, channel, instrument);
      saveAs(
        new Blob([Uint8Array.from(bytes, (char) => char.charCodeAt(0))], { type: "audio/midi" }),
        `${filename}.mid`,
      );
    },
    suspend() {
      if (destroyed || suspended) return;
      suspended = true;
      disconnect();
      disconnect = () => {};
      clearTimeout(timer);
      cancelWorker();
      players?.base?.suspend();
      players?.sort?.suspend();
      soundfont?.pause();
      publish({ suspended: true });
    },
    resume() {
      if (destroyed || !suspended) return;
      suspended = false;
      connect();
      publish({ suspended: false });
    },
    destroy() {
      if (destroyed) return;
      this.suspend();
      destroyed = true;
      players?.base?.destroy();
      players?.sort?.destroy();
      soundfont?.dispose();
      listeners.clear();
    },
  };
}
