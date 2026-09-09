import { useEffect, useMemo, useState } from "react";
import { useAtomValue, useStore } from "jotai";
import { createPlayer } from "../audio/create-player.mjs";
import { createTimbreSoundfont } from "../audio/create-timbre-soundfont.mjs";
import { timbre } from "../audio/timbre.mjs";
import { createAudioSettings } from "../audio/audio-settings";
import { createHelpers } from "../midi/create-helpers.mjs";
import { settingsAtom } from "../state/settings";
import { selectedWaveformAtom } from "../state/waveforms";
import { playbackPreferencesAtom } from "../state/playback-preferences";
import {
  emptyPlayer,
  playerAtoms,
  suspendedAtom,
  pageLifecycleAtom,
  visualizationAtom,
  type PlayerId,
} from "../state/players";

type Player = ReturnType<typeof createPlayer>;
export type AudioSession = {
  players: Record<PlayerId, Player>;
  soundfont: ReturnType<typeof createTimbreSoundfont>;
  getMidiNumber: (value: number) => number;
};

export function usePlayers(canvas: HTMLCanvasElement | null) {
  const store = useStore();
  const settings = useMemo(() => createAudioSettings(store), [store]);
  const selected = useAtomValue(settingsAtom);
  const waveform = useAtomValue(selectedWaveformAtom);
  const lifecycle = useAtomValue(pageLifecycleAtom);
  const suspended = useAtomValue(suspendedAtom);
  const visualization = useAtomValue(visualizationAtom);
  const [session, setSession] = useState<AudioSession | null>(null);

  useEffect(() => {
    const soundfont = createTimbreSoundfont(timbre);
    const { getMidiNumber } = createHelpers(settings);
    const players = {} as Record<PlayerId, Player>;
    let disposed = false;
    const dispose = () => {
      disposed = true;
      for (const player of Object.values(players)) player.destroy();
      soundfont.dispose();
      store.set(playerAtoms.base, emptyPlayer);
      store.set(playerAtoms.sort, emptyPlayer);
    };
    const suspend = () => {
      for (const player of Object.values(players)) player.suspend();
      soundfont.pause();
    };
    try {
      for (const id of ["base", "sort"] as const) {
        store.set(playerAtoms[id], emptyPlayer);
        players[id] = createPlayer({
          settings,
          getMidiNumber,
          soundfont,
          isLooping: () => store.get(playbackPreferencesAtom).loop[id],
          onUpdate: (value: typeof emptyPlayer) => {
            if (!disposed) store.set(playerAtoms[id], value);
          },
        });
      }
    } catch (error) {
      dispose();
      throw error;
    }
    setSession({ players, soundfont, getMidiNumber });
    // Silence immediately, before React processes the page lifecycle state update.
    globalThis.addEventListener("pagehide", suspend);
    return () => {
      globalThis.removeEventListener("pagehide", suspend);
      dispose();
    };
  }, [settings, store]);

  useEffect(() => {
    if (!session || suspended) return;
    for (const player of Object.values(session.players)) player.refresh();
    session.players.base.plot(canvas);
  }, [session, suspended, lifecycle, waveform, selected.audioType, canvas]);

  useEffect(() => {
    if (!session || suspended) return;
    for (const player of Object.values(session.players))
      player.setVolume(selected.volume * waveform.mul);
  }, [session, suspended, lifecycle, selected.volume, waveform.mul]);

  useEffect(() => {
    if (!session || suspended) return;
    for (const player of Object.values(session.players))
      player.setTempo(`bpm${selected.tempo} l16`);
  }, [session, suspended, lifecycle, selected.tempo]);

  useEffect(() => {
    if (!session || suspended || selected.audioType !== "soundfont") return;
    session.soundfont.setInstrument(selected.soundfont);
  }, [session, suspended, lifecycle, selected.audioType, selected.soundfont]);

  useEffect(() => {
    if (session && !suspended) session.players.sort.setVisualization(visualization);
  }, [session, suspended, lifecycle, visualization]);

  return session;
}
