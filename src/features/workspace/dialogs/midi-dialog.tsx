import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { instruments } from "../../../midi/instruments.ts";
import { WorkspaceDialog as Dialog } from "./workspace-dialog.tsx";
import type { Props, PlayerId } from "../runtime/workspace-types.ts";
export function MidiDialog({
  runtime,
  id,
  onClose,
}: Props & { id: PlayerId; onClose: () => void }) {
  const [name, setName] = useState("");
  const [placeholder] = useState(() => `AudioSort_${Date.now()}`);
  const [channel, setChannel] = useState(0);
  const [instrument, setInstrument] = useState(0);
  return (
    <Dialog
      id="modal-midi-export"
      title="Midi Export"
      onClose={onClose}
      footer={
        <Button
          type="button"
          id="midi-export-btn"
          variant="default"
          onClick={() => runtime.exportMidi(id, name.trim() || placeholder, channel, instrument)}
        >
          Export As Midi
        </Button>
      }
    >
      <label className="mb-4 grid min-w-0 gap-2" htmlFor="midi-export-name">
        File Name:
        <span>
          <Input
            id="midi-export-name"
            placeholder={placeholder}
            value={name}
            onChange={(e) => setName(e.currentTarget.value)}
          />
          .mid
        </span>
      </label>
      <label className="mb-4 grid min-w-0 gap-2" htmlFor="midi-export-channel">
        Midi Channel:
        <NativeSelect
          className="w-full"
          id="midi-export-channel"
          value={channel}
          onChange={(e) => setChannel(Number(e.currentTarget.value))}
        >
          {Array.from({ length: 16 }, (_, i) => (
            <option key={i} value={i}>
              {i}
            </option>
          ))}
        </NativeSelect>
      </label>
      <label className="mb-4 grid min-w-0 gap-2" htmlFor="midi-export-instrument">
        Midi Instrument:
        <NativeSelect
          className="w-full"
          id="midi-export-instrument"
          value={instrument}
          onChange={(e) => setInstrument(Number(e.currentTarget.value))}
        >
          {[...new Set(instruments.map((item) => item.group))].map((group) => (
            <optgroup key={group} label={group}>
              {instruments
                .filter((item) => item.group === group)
                .map((item) => (
                  <option key={item.val} value={item.val}>
                    {item.val}: {item.name}
                  </option>
                ))}
            </optgroup>
          ))}
        </NativeSelect>
      </label>
    </Dialog>
  );
}
