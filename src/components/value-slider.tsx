import { Slider } from "@/components/ui/slider";

export function ValueSlider({
  id,
  label,
  valueText,
  value,
  min,
  max,
  step = 1,
  onChange,
}: {
  id?: string;
  label: string;
  valueText?: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
}) {
  return (
    <Slider
      className="px-1.5 py-2"
      thumbAlignment="center"
      value={[value]}
      min={min}
      max={Math.max(min + step, max)}
      step={step}
      disabled={max <= min}
      thumbProps={{ id, getAriaLabel: () => label, "aria-valuetext": valueText }}
      onValueChange={(values) => onChange(Array.isArray(values) ? values[0]! : values)}
    />
  );
}
