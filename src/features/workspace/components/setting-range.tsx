import type { ReactNode } from "react";
import { ValueSlider } from "@/components/value-slider";
import { Label } from "@/components/ui/label";
import { Field } from "@base-ui/react/field";
export function Range({
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
    <Field.Root
      id={`${id}-container`}
      className="mb-2 [&_label]:flex [&_label]:justify-between [&_output]:tabular-nums"
    >
      <Field.Label render={<Label />}>
        <strong>{label}:</strong>
        <output id={`${id}-display`}>{display}</output>
      </Field.Label>
      <ValueSlider
        id={`${id}-range`}
        label={label}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={onChange}
      />
    </Field.Root>
  );
}
