import { useState } from "react";
import { Input } from "@/components/ui/input";
import { OptionButton } from "@/components/option-button";
export function FilteredOptions({
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
      <div className="flex justify-between gap-2">
        <strong>{label}:</strong>
        <em id={`${id}-display`}>{options.find((item) => item.id === selected)?.name}</em>
      </div>
      <Input
        className="mt-2"
        id={`${id}-filter`}
        type="search"
        aria-label={`Filter ${label} Names`}
        placeholder={`Filter ${label} Names`}
        value={filter}
        onChange={(e) => setFilter(e.currentTarget.value)}
      />
      <ul id={`${id}-options`} className="mt-2 h-44 overflow-auto rounded-lg border bg-muted p-1">
        {visible.map((item, index) => (
          <li
            key={item.id}
            data-scale={id === "scale" ? item.id : undefined}
            data-soundfont={id === "soundfont" ? item.id : undefined}
            className={selected === item.id ? "active" : ""}
          >
            {visible[index - 1]?.group !== item.group && (
              <div className="px-3 py-2 text-xs text-muted-foreground">{item.group}</div>
            )}
            <OptionButton
              type="button"
              aria-pressed={selected === item.id}
              onClick={() => onSelect(item.id)}
            >
              {item.name}
            </OptionButton>
          </li>
        ))}
      </ul>
    </>
  );
}
