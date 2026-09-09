import { createContext, useContext, useState, type ReactNode } from "react";
import { useStore } from "jotai";
import { saveAs } from "file-saver";
import { usePlayers } from "../../hooks/use-players";
import { useSort } from "../../hooks/use-sort";
import { settingsAtom } from "../../state/settings";
import { suspendedAtom, type PlayerId } from "../../state/players";

function useActions() {
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);
  const session = usePlayers(canvas);
  const sorting = useSort(session);
  const store = useStore();
  return {
    ...sorting,
    setCanvas,
    async action(id: PlayerId, name: string) {
      if (!session || store.get(suspendedAtom)) return;
      if (["play", "reverse", "stop"].includes(name))
        session.players[id === "base" ? "sort" : "base"].suspend();
      await session.players[id].action(name);
    },
    seek(id: PlayerId, value: number) {
      if (session && !store.get(suspendedAtom)) session.players[id].seek(value);
    },
    exportMidi(id: PlayerId, filename: string, channel: number, instrument: number) {
      if (!session || store.get(suspendedAtom)) return;
      const bytes = session.players[id].getMidiBytes(
        store.get(settingsAtom).tempo,
        channel,
        instrument,
      );
      saveAs(
        new Blob([Uint8Array.from(bytes as string, (char) => char.charCodeAt(0))], {
          type: "audio/midi",
        }),
        `${filename}.mid`,
      );
    },
  };
}
const PlaygroundContext = createContext<ReturnType<typeof useActions> | null>(null);
export function PlaygroundProvider({ children }: { children: ReactNode }) {
  const actions = useActions();
  return <PlaygroundContext value={actions}>{children}</PlaygroundContext>;
}
export function usePlayground() {
  const value = useContext(PlaygroundContext);
  if (!value) throw new Error("PlaygroundProvider is required");
  return value;
}
