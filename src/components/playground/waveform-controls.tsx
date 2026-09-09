import { usePlayground } from "./playground-context";
import { EnvelopeChart } from "../visualizations/envelope-chart";
import { Button } from "@/components/ui/button";
import { ValueSlider } from "@/components/value-slider";
import { Field } from "@base-ui/react/field";
import { useAtomValue, useSetAtom } from "jotai";
import { settingsAtom, updateSettingAtom } from "../../state/settings.ts";
import { envelopeAtom, updateEnvelopeAtom, type EnvelopeKey } from "../../state/envelope.ts";
import { waveformDefaults, type WaveformId } from "../../state/waveforms.ts";
import { formatEnvelopeValue } from "../../audio/envelope.ts";

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

export function WaveformControls() {
  const { setCanvas } = usePlayground();
  const { waveform } = useAtomValue(settingsAtom);
  const envelope = useAtomValue(envelopeAtom);
  const updateSetting = useSetAtom(updateSettingAtom);
  const updateEnvelope = useSetAtom(updateEnvelopeAtom);

  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="waveform-section col-start-2 row-start-1 min-w-0">
        <EnvelopeChart envelope={envelope} />
        {/* The audio adapter alone draws this canvas; React never owns its pixels. */}
        <canvas
          ref={setCanvas}
          id="waveform-canvas"
          className="mb-2 h-12 w-full rounded-lg border bg-neutral-100"
          role="img"
          aria-label={
            waveform === "string"
              ? "String: illustrative decaying plucked tone (not a live audio trace)"
              : `${waveform} oscillator waveform`
          }
        />
        <div className="grid grid-cols-2" role="group" aria-label="Waveform">
          {(Object.keys(waveformDefaults) as WaveformId[]).map((id) => (
            <Button
              key={id}
              type="button"
              data-waveform={id}
              aria-pressed={id === waveform}
              variant="outline"
              size="sm"
              className="aria-pressed:bg-sky-700 aria-pressed:text-white"
              onClick={() => updateSetting({ key: "waveform", value: id })}
            >
              {id}
            </Button>
          ))}
        </div>
      </div>
      <div id="envelope-controls" className="col-start-1 row-start-1 min-w-0">
        {controls.map((control) => (
          <Field.Root key={control.key}>
            <Field.Label className="block m-0 text-[12px] font-bold">
              {control.label}
              <output
                id={`waveform-adshr-${control.name}-display`}
                className="float-right font-normal tabular-nums"
              >
                {formatEnvelopeValue(control.key, envelope[control.key])}
              </output>
            </Field.Label>
            <ValueSlider
              id={`envelope-${control.name}`}
              label={control.accessibleName}
              valueText={formatEnvelopeValue(control.key, envelope[control.key])}
              min={control.min}
              max={control.max}
              step={control.step}
              value={envelope[control.key]}
              onChange={(value) => updateEnvelope({ key: control.key, value })}
            />
          </Field.Root>
        ))}
      </div>
    </div>
  );
}
