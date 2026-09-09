import { atom } from "jotai";

import type { PlayerId } from "./players";
type PlaybackPreferences = Readonly<{
  autoPlay: boolean;
  loop: Readonly<Record<PlayerId, boolean>>;
}>;

const valuesAtom = atom<PlaybackPreferences>(
  Object.freeze({
    autoPlay: false,
    loop: Object.freeze({ base: true, sort: true }),
  }),
);
export const playbackPreferencesAtom = atom((get) => get(valuesAtom));

export const toggleAutoPlayAtom = atom(null, (get, set) => {
  const previous = get(valuesAtom);
  set(valuesAtom, Object.freeze({ ...previous, autoPlay: !previous.autoPlay }));
});

export const toggleLoopAtom = atom(null, (get, set, player: PlayerId) => {
  const previous = get(valuesAtom);
  set(
    valuesAtom,
    Object.freeze({
      ...previous,
      loop: Object.freeze({ ...previous.loop, [player]: !previous.loop[player] }),
    }),
  );
});
