import { useState, type ReactNode } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import { settingsAtom, updateSettingAtom, defaults } from "../state/settings.ts";
import { scales } from "../midi/scales.ts";
import { instruments } from "../midi/instruments.ts";
import { WaveformControls } from "./waveform-controls.tsx";
import type { Props } from "./workspace-types.ts";
function Range({
  id,
  label,
  display,
  value,
  min,
  max,
  step,
  onChange,
}: {
  id: string;
  label: string;
  display: ReactNode;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
}) {
  return (
    <div id={`${id}-container`} className="setting-range">
      <label htmlFor={`${id}-range`}>
        <strong>{label}:</strong>
        <output id={`${id}-display`}>{display}</output>
      </label>
      <input
        id={`${id}-range`}
        type="range"
        aria-label={label}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.currentTarget.value))}
      />
    </div>
  );
}

function FilteredOptions({
  id,
  label,
  selected,
  options,
  onSelect,
}: {
  id: string;
  label: string;
  selected: string;
  options: { id: string; name: string; group: string }[];
  onSelect: (id: string) => void;
}) {
  const [filter, setFilter] = useState("");
  const visible = options.filter((item) =>
    item.name.toLowerCase().includes(filter.trim().toLowerCase()),
  );
  return (
    <>
      <div className="tw:flex tw:justify-between tw:gap-2">
        <strong>{label}:</strong>
        <em id={`${id}-display`}>{options.find((item) => item.id === selected)?.name}</em>
      </div>
      <input
        id={`${id}-filter`}
        type="search"
        aria-label={`Filter ${label} Names`}
        placeholder={`Filter ${label} Names`}
        value={filter}
        onChange={(e) => setFilter(e.currentTarget.value)}
      />
      <ul id={`${id}-options`} className="option-box">
        {visible.map((item, index) => (
          <li
            key={item.id}
            data-scale={id === "scale" ? item.id : undefined}
            data-soundfont={id === "soundfont" ? item.id : undefined}
            className={selected === item.id ? "active" : ""}
          >
            {visible[index - 1]?.group !== item.group && (
              <div className="option-heading">{item.group}</div>
            )}
            <button
              type="button"
              aria-pressed={selected === item.id}
              onClick={() => onSelect(item.id)}
            >
              {item.name}
            </button>
          </li>
        ))}
      </ul>
    </>
  );
}

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
    <div className="settings-column">
      <div id="settings" className="tabs" role="tablist" aria-label="Audio settings">
        {["audio", selected.audioType, "scale"].map((id) => (
          <button
            key={id}
            id={`tab-${id}`}
            type="button"
            role="tab"
            aria-selected={activeTab === id}
            aria-controls={id}
            tabIndex={activeTab === id ? 0 : -1}
            onClick={() => setTab(id)}
            onKeyDown={(event) => {
              const tabs = ["audio", selected.audioType, "scale"];
              const index = tabs.indexOf(id);
              const next =
                event.key === "ArrowRight"
                  ? (index + 1) % 3
                  : event.key === "ArrowLeft"
                    ? (index + 2) % 3
                    : event.key === "Home"
                      ? 0
                      : event.key === "End"
                        ? 2
                        : -1;
              if (next >= 0) {
                event.preventDefault();
                setTab(tabs[next]!);
                document.getElementById(`tab-${tabs[next]}`)?.focus();
              }
            }}
          >
            {id === "soundfont" ? "SoundFont" : id[0]!.toUpperCase() + id.slice(1)}
          </button>
        ))}
      </div>
      <div id="settings-content">
        <div id="audio" role="tabpanel" aria-labelledby="tab-audio" hidden={activeTab !== "audio"}>
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
          <div className="tw:flex tw:justify-between">
            <strong>Audio Type:</strong>
            <em id="audio-type-display">
              {selected.audioType === "waveform"
                ? `waveform: ${selected.waveform}`
                : instrumentOptions[selected.soundfont]?.name}
            </em>
          </div>
          <div id="audio-type-container" className="tw:text-center">
            {(["waveform", "soundfont"] as const).map((id) => (
              <button
                key={id}
                type="button"
                className="button"
                data-audio-type={id}
                aria-pressed={selected.audioType === id}
                onClick={() => update({ key: "audioType", value: id })}
              >
                {id === "waveform" ? "Waveform" : "SoundFont"}
              </button>
            ))}
          </div>
          <button
            id="audio-type-tab-link"
            type="button"
            className="text-link tw:float-right"
            onClick={() => setTab(selected.audioType)}
          >
            {selected.audioType} settings
          </button>
        </div>
        <div
          id="waveform"
          role="tabpanel"
          aria-labelledby="tab-waveform"
          hidden={activeTab !== "waveform"}
        >
          <WaveformControls store={store} />
        </div>
        <div id="scale" role="tabpanel" aria-labelledby="tab-scale" hidden={activeTab !== "scale"}>
          <FilteredOptions
            id="scale"
            label="Scale"
            selected={selected.scale}
            options={scaleOptions}
            onSelect={(value) => update({ key: "scale", value })}
          />
        </div>
        <div
          id="soundfont"
          role="tabpanel"
          aria-labelledby="tab-soundfont"
          hidden={activeTab !== "soundfont"}
        >
          <FilteredOptions
            id="soundfont"
            label="Soundfont"
            selected={String(selected.soundfont)}
            options={instrumentOptions}
            onSelect={(value) => update({ key: "soundfont", value: Number(value) })}
          />
        </div>
      </div>
    </div>
  );
}
