import { Fragment, useLayoutEffect, useRef } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import type { createStore } from "jotai/vanilla";
import { settingsAtom, updateSettingAtom } from "../state/settings.ts";
import { envelopeAtom, updateEnvelopeAtom, type EnvelopeKey } from "../state/envelope.ts";
import { waveformDefaults, type WaveformId } from "../state/waveforms.ts";
import { drawEnvelopeDiagram, formatEnvelopeValue } from "./envelope-diagram.ts";

type Store = ReturnType<typeof createStore>;
const controls: ReadonlyArray<{
  key: EnvelopeKey;
  name: string;
  label: string;
  accessibleName: string;
  min: number;
  max: number;
  step: number;
}> = [
  {
    key: "a",
    name: "attack",
    label: "Attack",
    accessibleName: "Attack",
    min: 10,
    max: 500,
    step: 5,
  },
  { key: "d", name: "decay", label: "Decay", accessibleName: "Decay", min: 10, max: 2000, step: 5 },
  {
    key: "s",
    name: "sustain",
    label: "Sustain",
    accessibleName: "Sustain level",
    min: 0,
    max: 1,
    step: 0.01,
  },
  {
    key: "h",
    name: "hold",
    label: "Hold",
    accessibleName: "Sustain hold",
    min: 10,
    max: 3000,
    step: 5,
  },
  {
    key: "r",
    name: "release",
    label: "Release",
    accessibleName: "Release",
    min: 10,
    max: 3000,
    step: 5,
  },
];

export function WaveformControls({ store }: { store: Store }) {
  const { waveform } = useAtomValue(settingsAtom, { store });
  const envelope = useAtomValue(envelopeAtom, { store });
  const updateSetting = useSetAtom(updateSettingAtom, { store });
  const updateEnvelope = useSetAtom(updateEnvelopeAtom, { store });
  const diagram = useRef<SVGSVGElement>(null);
  useLayoutEffect(() => {
    if (diagram.current) drawEnvelopeDiagram(diagram.current, envelope);
  }, [envelope]);

  return (
    <div className="tw:grid tw:grid-cols-2 tw:gap-3">
      <div className="waveform-section tw:col-start-2 tw:row-start-1 tw:min-w-0">
        <svg
          ref={diagram}
          id="envelope-diagram"
          role="img"
          viewBox="35 25 350 135"
          aria-label="Amplitude envelope"
          preserveAspectRatio="none"
        />
        {/* The audio adapter alone draws this canvas; React never owns its pixels. */}
        <canvas
          id="waveform-canvas"
          role="img"
          aria-label={
            waveform === "string"
              ? "String: illustrative decaying plucked tone (not a live audio trace)"
              : `${waveform} oscillator waveform`
          }
        />
        <div className="tw:grid tw:grid-cols-2" role="group" aria-label="Waveform">
          {(Object.keys(waveformDefaults) as WaveformId[]).map((id) => (
            <button
              key={id}
              type="button"
              data-waveform={id}
              aria-pressed={id === waveform}
              className="tw:border tw:border-solid tw:border-[#ccc] tw:bg-[#f5f5f5] tw:px-1 tw:py-0 tw:text-[11px] tw:leading-5 tw:text-[#333] tw:aria-pressed:bg-[#ddd]"
              onClick={() => updateSetting({ key: "waveform", value: id })}
            >
              {id}
            </button>
          ))}
        </div>
      </div>
      <div id="envelope-controls" className="tw:col-start-1 tw:row-start-1 tw:min-w-0">
        {controls.map((control) => (
          <Fragment key={control.key}>
            <label
              htmlFor={`envelope-${control.name}`}
              className="tw:block tw:m-0 tw:text-[12px] tw:font-bold"
            >
              {control.label}
              <output
                id={`waveform-adshr-${control.name}-display`}
                htmlFor={`envelope-${control.name}`}
                className="tw:float-right tw:font-normal tw:tabular-nums"
              >
                {formatEnvelopeValue(control.key, envelope[control.key])}
              </output>
            </label>
            <input
              type="range"
              id={`envelope-${control.name}`}
              data-envelope={control.key}
              aria-label={control.accessibleName}
              aria-valuetext={formatEnvelopeValue(control.key, envelope[control.key])}
              min={control.min}
              max={control.max}
              step={control.step}
              value={envelope[control.key]}
              className="tw:block tw:h-[18px] tw:w-full tw:mt-0 tw:mb-1 tw:accent-[#087ca7]"
              onChange={(event) =>
                updateEnvelope({ key: control.key, value: Number(event.currentTarget.value) })
              }
            />
          </Fragment>
        ))}
      </div>
    </div>
  );
}
