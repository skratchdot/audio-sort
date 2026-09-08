import { Range } from "./setting-range.tsx";
import { FilteredOptions } from "./filtered-options.tsx";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import { settingsAtom, updateSettingAtom, defaults } from "../../state/settings.ts";
import { scales } from "../../midi/scales.ts";
import { instruments } from "../../midi/instruments.ts";
import { WaveformControls } from "./waveform-controls.tsx";
import type { Props } from "../../controllers/playground-types.ts";
const scaleOptions = Object.entries(scales)
  .sort(
    ([, a], [, b]) =>
      a.pitchesPerOctave - b.pitchesPerOctave ||
      a.degrees.length - b.degrees.length ||
      a.name.localeCompare(b.name),
  )
  .map(([id, value]) => ({
    id,
    name: value.name,
    group: `Octave: ${value.pitchesPerOctave} / Notes: ${value.degrees.length}`,
  }));
const instrumentOptions = instruments.map((item) => ({
  id: String(item.val),
  name: `${item.val}: ${item.name}`,
  group: item.group,
}));

export function Settings({ runtime }: Props) {
  const store = runtime.store;
  const selected = useAtomValue(settingsAtom, { store });
  const update = useSetAtom(updateSettingAtom, { store });
  const [tab, setTab] = useState("audio");
  const activeTab = ["waveform", "soundfont"].includes(tab) ? selected.audioType : tab;
  const note = selected.centerNote;
  const names = ["c", "c#", "d", "d#", "e", "f", "f#", "g", "g#", "a", "a#", "b"];
  const pitch = names[note % 12]!;
  return (
    <Tabs className="min-w-0" value={activeTab} onValueChange={(value) => setTab(String(value))}>
      <TabsList id="settings" className="w-full" aria-label="Audio settings" activateOnFocus>
        {["audio", selected.audioType, "scale"].map((id) => (
          <TabsTrigger key={id} id={`tab-${id}`} value={id}>
            {id === "soundfont" ? "SoundFont" : id[0]!.toUpperCase() + id.slice(1)}
          </TabsTrigger>
        ))}
      </TabsList>
      <div id="settings-content" className="min-h-72 rounded-lg border bg-card p-4">
        <TabsContent value="audio" id="audio" keepMounted>
          {(
            [
              ["volume", "Volume", selected.volume.toFixed(2)],
              ["tempo", "Tempo", selected.tempo],
              [
                "centerNote",
                "Center Note",
                `(${pitch[0]}${Math.floor(note / 12) - 1}${pitch.slice(1)}) ${note}`,
              ],
              ["dataSize", "Data Size", selected.dataSize],
            ] as const
          ).map(([key, label, display]) => (
            <Range
              key={key}
              id={key === "centerNote" ? "center-note" : key === "dataSize" ? "data-size" : key}
              label={label}
              display={display}
              {...defaults[key]}
              value={selected[key]}
              onChange={(value) => update({ key, value })}
            />
          ))}
          <div className="flex justify-between">
            <strong>Audio Type:</strong>
            <em id="audio-type-display">
              {selected.audioType === "waveform"
                ? `waveform: ${selected.waveform}`
                : instrumentOptions[selected.soundfont]?.name}
            </em>
          </div>
          <div id="audio-type-container" className="text-center">
            {(["waveform", "soundfont"] as const).map((id) => (
              <Button
                key={id}
                type="button"
                variant="outline"
                className="aria-pressed:bg-muted aria-pressed:shadow-inner"
                data-audio-type={id}
                aria-pressed={selected.audioType === id}
                onClick={() => update({ key: "audioType", value: id })}
              >
                {id === "waveform" ? "Waveform" : "SoundFont"}
              </Button>
            ))}
          </div>
          <Button
            id="audio-type-tab-link"
            type="button"
            variant="link"
            className="float-right"
            onClick={() => setTab(selected.audioType)}
          >
            {selected.audioType} settings
          </Button>
        </TabsContent>
        <TabsContent value="waveform" id="waveform" keepMounted>
          <WaveformControls store={store} />
        </TabsContent>
        <TabsContent value="scale" id="scale" keepMounted>
          <FilteredOptions
            id="scale"
            label="Scale"
            selected={selected.scale}
            options={scaleOptions}
            onSelect={(value) => update({ key: "scale", value })}
          />
        </TabsContent>
        <TabsContent value="soundfont" id="soundfont" keepMounted>
          <FilteredOptions
            id="soundfont"
            label="Soundfont"
            selected={String(selected.soundfont)}
            options={instrumentOptions}
            onSelect={(value) => update({ key: "soundfont", value: Number(value) })}
          />
        </TabsContent>
      </div>
    </Tabs>
  );
}
